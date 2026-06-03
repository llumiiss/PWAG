import { reactive, computed } from 'vue'
import { products as seed } from '../data/products.js'
import { db, isFirebaseConfigured } from '../firebase/config.js'
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  writeBatch,
  addDoc,
  increment,
  serverTimestamp,
} from 'firebase/firestore'

const PRODUCTS = 'products'
const ORDERS = 'orders'

// Reaktywny stan współdzielony między sklepem, koszykiem i panelem admina.
// Przy skonfigurowanym Firebase produkty i ich stany trzymane są w Firestore
// i synchronizowane na żywo (onSnapshot). Bez konfiguracji działa tryb lokalny.
export const state = reactive({
  products: [],
  cart: [],
  loading: true,
  error: null,
  backend: isFirebaseConfigured ? 'firebase' : 'local',
})

let unsubscribe = null

// --- Inicjalizacja / połączenie z backendem ---

export async function initShop() {
  if (!isFirebaseConfigured) {
    // Tryb lokalny – dane w pamięci (resetują się po odświeżeniu).
    state.products = seed.map((p) => ({ ...p }))
    state.loading = false
    return
  }

  // Zabezpieczenie: jeśli w 15 s nic nie wróci z Firestore, pokaż błąd zamiast
  // ładować w nieskończoność.
  const timeout = setTimeout(() => {
    if (state.loading) {
      state.loading = false
      state.error =
        'Przekroczono czas połączenia z Firestore. Sprawdź konfigurację .env, ' +
        'reguły bazy oraz czy adblocker nie blokuje firestore.googleapis.com.'
    }
  }, 15000)

  try {
    const colRef = collection(db, PRODUCTS)

    // Subskrypcja na żywo – zmiany admina i zamówień widoczne natychmiast.
    unsubscribe = onSnapshot(
      colRef,
      async (snap) => {
        // Pierwsze uruchomienie: zasiej bazę danymi startowymi.
        if (snap.empty && state.products.length === 0) {
          try {
            const batch = writeBatch(db)
            for (const product of seed) {
              batch.set(doc(db, PRODUCTS, String(product.id)), product)
            }
            await batch.commit()
          } catch (seedErr) {
            console.error('[warzywniak] Błąd zasiewania bazy:', seedErr)
            state.error = seedErr.message
            state.loading = false
            clearTimeout(timeout)
            return
          }
          return
        }

        const list = snap.docs.map((d) => d.data())
        list.sort((a, b) => a.id - b.id)
        state.products = list
        trimCartToStock()
        state.loading = false
        clearTimeout(timeout)
      },
      (err) => {
        console.error('[warzywniak] Błąd Firestore:', err)
        state.error = err.message
        state.loading = false
        clearTimeout(timeout)
      },
    )
  } catch (err) {
    console.error('[warzywniak] Błąd inicjalizacji:', err)
    state.error = err.message
    state.loading = false
    clearTimeout(timeout)
  }
}

export function stopShop() {
  if (unsubscribe) {
    unsubscribe()
    unsubscribe = null
  }
}

// --- Odczyt / pomocnicze ---

export function getProduct(id) {
  return state.products.find((p) => p.id === id)
}

export function quantityInCart(id) {
  const item = state.cart.find((i) => i.id === id)
  return item ? item.quantity : 0
}

// Ile sztuk można jeszcze dodać do koszyka (stan magazynu minus to, co już w koszyku).
export function availableStock(id) {
  const product = getProduct(id)
  if (!product) return 0
  return product.stock - quantityInCart(id)
}

// Po zmianie stanów (np. przez admina) przytnij koszyk do dostępnych ilości.
function trimCartToStock() {
  for (const item of [...state.cart]) {
    const product = getProduct(item.id)
    if (!product || product.stock <= 0) {
      state.cart = state.cart.filter((i) => i.id !== item.id)
    } else if (item.quantity > product.stock) {
      item.quantity = product.stock
    }
  }
}

// --- Koszyk (trzymany lokalnie do momentu złożenia zamówienia) ---

export function addToCart(product) {
  if (availableStock(product.id) <= 0) return
  const item = state.cart.find((i) => i.id === product.id)
  if (item) {
    item.quantity++
  } else {
    state.cart.push({ id: product.id, quantity: 1 })
  }
}

export function removeFromCart(product) {
  const item = state.cart.find((i) => i.id === product.id)
  if (!item) return
  item.quantity--
  if (item.quantity <= 0) {
    state.cart = state.cart.filter((i) => i.id !== product.id)
  }
}

export function clearCart() {
  state.cart = []
}

export const cartDetailed = computed(() =>
  state.cart
    .map((item) => {
      const product = getProduct(item.id)
      if (!product) return null
      return {
        ...product,
        quantity: item.quantity,
        lineTotal: product.price * item.quantity,
      }
    })
    .filter(Boolean),
)

export const cartCount = computed(() => state.cart.reduce((sum, i) => sum + i.quantity, 0))

export const cartTotal = computed(() =>
  cartDetailed.value.reduce((sum, i) => sum + i.lineTotal, 0),
)

// --- Zapis do backendu ---

// Złożenie zamówienia: wyczerpuje stan magazynu i zapisuje zamówienie.
export async function placeOrder(customer) {
  if (state.cart.length === 0) return

  if (!isFirebaseConfigured) {
    for (const item of state.cart) {
      const product = getProduct(item.id)
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity)
      }
    }
    clearCart()
    return
  }

  const orderItems = state.cart.map((item) => {
    const product = getProduct(item.id)
    return {
      id: item.id,
      name: product?.name ?? '',
      price: product?.price ?? 0,
      quantity: item.quantity,
    }
  })
  const orderTotal = cartTotal.value

  // Atomowe zmniejszenie stanów magazynowych.
  const batch = writeBatch(db)
  for (const item of state.cart) {
    batch.update(doc(db, PRODUCTS, String(item.id)), {
      stock: increment(-item.quantity),
    })
  }
  await batch.commit()

  // Zapis zamówienia (dane z formularza) do osobnej kolekcji.
  await addDoc(collection(db, ORDERS), {
    customer,
    items: orderItems,
    total: orderTotal,
    createdAt: serverTimestamp(),
  })

  clearCart()
}

// Aktualizacja produktu przez admina (data dostawy, stan magazynu).
export async function updateProduct(id, changes) {
  if (!isFirebaseConfigured) {
    const product = getProduct(id)
    if (product) {
      Object.assign(product, changes)
    }
    trimCartToStock()
    return
  }

  await updateDoc(doc(db, PRODUCTS, String(id)), changes)
  // Lokalny stan i przycięcie koszyka zaktualizuje subskrypcja onSnapshot.
}
