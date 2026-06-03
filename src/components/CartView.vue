<script setup>
import { ref, reactive } from 'vue'
import {
  cartDetailed,
  cartCount,
  cartTotal,
  addToCart,
  removeFromCart,
  availableStock,
  placeOrder,
} from '../store/shop.js'

const emit = defineEmits(['back'])

const form = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  address: '',
})

const errors = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  address: '',
})

const orderPlaced = ref(false)
const submitting = ref(false)
const submitError = ref('')

function validate() {
  errors.firstName = ''
  errors.lastName = ''
  errors.phone = ''
  errors.address = ''

  let ok = true

  if (!form.firstName.trim()) {
    errors.firstName = 'Podaj imię.'
    ok = false
  } else if (form.firstName.trim().length < 2) {
    errors.firstName = 'Imię jest za krótkie.'
    ok = false
  }

  if (!form.lastName.trim()) {
    errors.lastName = 'Podaj nazwisko.'
    ok = false
  } else if (form.lastName.trim().length < 2) {
    errors.lastName = 'Nazwisko jest za krótkie.'
    ok = false
  }

  const phoneDigits = form.phone.replace(/[\s-]/g, '')
  if (!form.phone.trim()) {
    errors.phone = 'Podaj numer telefonu.'
    ok = false
  } else if (!/^\+?\d{9,12}$/.test(phoneDigits)) {
    errors.phone = 'Nieprawidłowy numer telefonu (9–12 cyfr).'
    ok = false
  }

  if (!form.address.trim()) {
    errors.address = 'Podaj adres dostawy.'
    ok = false
  } else if (form.address.trim().length < 5) {
    errors.address = 'Adres jest za krótki.'
    ok = false
  }

  return ok
}

async function submitOrder() {
  if (cartDetailed.value.length === 0) return
  if (!validate()) return

  submitting.value = true
  submitError.value = ''
  try {
    await placeOrder({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
    })
    orderPlaced.value = true
  } catch (err) {
    submitError.value = 'Nie udało się złożyć zamówienia: ' + err.message
  } finally {
    submitting.value = false
  }
}

function newOrder() {
  orderPlaced.value = false
  submitError.value = ''
  form.firstName = ''
  form.lastName = ''
  form.phone = ''
  form.address = ''
  emit('back')
}
</script>

<template>
  <section>
    <button class="back-link" @click="emit('back')">← Wróć do sklepu</button>
    <h1 class="title">🛒 Twój koszyk</h1>

    <!-- Potwierdzenie zamówienia -->
    <div v-if="orderPlaced" class="confirmation">
      <div class="check">✅</div>
      <h2>Zamówienie przyjęte!</h2>
      <p>Dziękujemy za zakupy. Stan magazynu został zaktualizowany, a my skontaktujemy się telefonicznie w sprawie dostawy.</p>
      <button class="primary-btn" @click="newOrder">Złóż kolejne zamówienie</button>
    </div>

    <!-- Pusty koszyk -->
    <div v-else-if="cartDetailed.length === 0" class="empty">
      <div class="empty-emoji">🧺</div>
      <p>Twój koszyk jest pusty.</p>
      <button class="primary-btn" @click="emit('back')">Przejdź do sklepu</button>
    </div>

    <!-- Koszyk + formularz -->
    <div v-else class="layout">
      <div class="items">
        <div v-for="item in cartDetailed" :key="item.id" class="item">
          <span class="item-emoji">{{ item.emoji }}</span>
          <div class="item-info">
            <strong>{{ item.name }}</strong>
            <span class="item-price">{{ item.price.toFixed(2) }} zł / {{ item.unit }}</span>
          </div>
          <div class="item-qty">
            <button class="qty-btn" @click="removeFromCart(item)">−</button>
            <span>{{ item.quantity }}</span>
            <button
              class="qty-btn"
              :disabled="availableStock(item.id) <= 0"
              @click="addToCart(item)"
            >
              +
            </button>
          </div>
          <span class="item-sum">{{ item.lineTotal.toFixed(2) }} zł</span>
        </div>

        <div class="summary">
          <span>Razem ({{ cartCount }} szt.)</span>
          <strong>{{ cartTotal.toFixed(2) }} zł</strong>
        </div>
      </div>

      <form class="order-form" novalidate @submit.prevent="submitOrder">
        <h2>Dane do dostawy</h2>

        <div class="field">
          <label for="firstName">Imię</label>
          <input
            id="firstName"
            v-model="form.firstName"
            type="text"
            :class="{ invalid: errors.firstName }"
            placeholder="Jan"
          />
          <span v-if="errors.firstName" class="error">{{ errors.firstName }}</span>
        </div>

        <div class="field">
          <label for="lastName">Nazwisko</label>
          <input
            id="lastName"
            v-model="form.lastName"
            type="text"
            :class="{ invalid: errors.lastName }"
            placeholder="Kowalski"
          />
          <span v-if="errors.lastName" class="error">{{ errors.lastName }}</span>
        </div>

        <div class="field">
          <label for="phone">Numer telefonu</label>
          <input
            id="phone"
            v-model="form.phone"
            type="tel"
            :class="{ invalid: errors.phone }"
            placeholder="123 456 789"
          />
          <span v-if="errors.phone" class="error">{{ errors.phone }}</span>
        </div>

        <div class="field">
          <label for="address">Adres dostawy</label>
          <input
            id="address"
            v-model="form.address"
            type="text"
            :class="{ invalid: errors.address }"
            placeholder="ul. Warzywna 12, 00-001 Warszawa"
          />
          <span v-if="errors.address" class="error">{{ errors.address }}</span>
        </div>

        <p v-if="submitError" class="error submit-error">{{ submitError }}</p>

        <button type="submit" class="order-btn" :disabled="submitting">
          {{ submitting ? 'Składanie zamówienia…' : `Zamów (${cartTotal.toFixed(2)} zł)` }}
        </button>
      </form>
    </div>
  </section>
</template>

<style scoped>
.back-link {
  background: transparent;
  color: var(--green-dark);
  font-weight: 600;
  margin-bottom: 0.5rem;
  padding: 0.3rem 0;
}

.title {
  font-size: 1.6rem;
  margin-bottom: 1.2rem;
}

.layout {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 1.5rem;
  align-items: start;
}

.items {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1rem;
  box-shadow: var(--shadow);
}

.item {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: 0.8rem;
  padding: 0.7rem 0;
  border-bottom: 1px solid var(--border);
}

.item:last-of-type {
  border-bottom: none;
}

.item-emoji {
  font-size: 1.8rem;
}

.item-info {
  display: flex;
  flex-direction: column;
}

.item-price {
  font-size: 0.8rem;
  color: var(--muted);
}

.item-qty {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.qty-btn {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  background: var(--green-soft);
  color: var(--green-dark);
  font-size: 1.1rem;
  font-weight: 700;
}

.qty-btn:hover {
  background: var(--green);
  color: #fff;
}

.qty-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: var(--green-soft);
  color: var(--muted);
}

.item-sum {
  font-weight: 700;
  min-width: 70px;
  text-align: right;
}

.summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid var(--border);
  font-size: 1.15rem;
}

.summary strong {
  color: var(--green-dark);
  font-size: 1.4rem;
}

.order-form {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.3rem;
  box-shadow: var(--shadow);
}

.order-form h2 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.field {
  margin-bottom: 0.9rem;
  display: flex;
  flex-direction: column;
}

.field label {
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.field input {
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  outline: none;
}

.field input:focus {
  border-color: var(--green);
  box-shadow: 0 0 0 3px var(--green-soft);
}

.field input.invalid {
  border-color: var(--danger);
  background: #fff5f5;
}

.error {
  color: var(--danger);
  font-size: 0.78rem;
  margin-top: 0.25rem;
}

.order-btn {
  width: 100%;
  background: var(--green);
  color: #fff;
  padding: 0.8rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  margin-top: 0.5rem;
  transition: background 0.15s ease;
}

.order-btn:hover {
  background: var(--green-dark);
}

.order-btn:disabled {
  background: #c8d2c6;
  cursor: not-allowed;
}

.submit-error {
  margin-bottom: 0.6rem;
}

.empty,
.confirmation {
  text-align: center;
  padding: 3rem 1rem;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: var(--shadow);
}

.empty-emoji,
.check {
  font-size: 3.5rem;
  margin-bottom: 0.6rem;
}

.confirmation h2 {
  color: var(--green-dark);
  margin-bottom: 0.5rem;
}

.confirmation p {
  color: var(--muted);
  max-width: 360px;
  margin: 0 auto 1.2rem;
}

.primary-btn {
  margin-top: 1.2rem;
  background: var(--green);
  color: #fff;
  padding: 0.7rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
}

.primary-btn:hover {
  background: var(--green-dark);
}

@media (max-width: 760px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
