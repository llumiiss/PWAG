<script setup>
import { ref, computed } from 'vue'
import ShopView from './components/ShopView.vue'
import CartView from './components/CartView.vue'

const currentView = ref('shop') // shop | cart
const cart = ref([])

const cartCount = computed(() => cart.value.reduce((sum, item) => sum + item.quantity, 0))

function addToCart(product) {
  const existing = cart.value.find((i) => i.id === product.id)
  if (existing) {
    existing.quantity++
  } else {
    cart.value.push({ ...product, quantity: 1 })
  }
}

function removeFromCart(product) {
  const existing = cart.value.find((i) => i.id === product.id)
  if (!existing) return
  existing.quantity--
  if (existing.quantity <= 0) {
    cart.value = cart.value.filter((i) => i.id !== product.id)
  }
}

function clearCart() {
  cart.value = []
}
</script>

<template>
  <div class="app-shell">
    <nav class="navbar">
      <button class="brand" @click="currentView = 'shop'">
        <span class="brand-emoji">🥦</span>
        <span class="brand-name">Warzywniak</span>
      </button>

      <div class="nav-actions">
        <button
          class="nav-link"
          :class="{ active: currentView === 'shop' }"
          @click="currentView = 'shop'"
        >
          Sklep
        </button>
        <button
          class="cart-btn"
          :class="{ active: currentView === 'cart' }"
          @click="currentView = 'cart'"
        >
          🛒 Koszyk
          <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
        </button>
      </div>
    </nav>

    <main>
      <ShopView
        v-if="currentView === 'shop'"
        :cart="cart"
        @add="addToCart"
        @remove="removeFromCart"
      />
      <CartView
        v-else
        :cart="cart"
        @add="addToCart"
        @remove="removeFromCart"
        @clear="clearCart"
        @back="currentView = 'shop'"
      />
    </main>

    <footer class="footer">
      <p>🥬 Warzywniak — projekt zaliczeniowy Vue.js · {{ new Date().getFullYear() }}</p>
    </footer>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 0;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
}

.brand-emoji {
  font-size: 1.8rem;
}

.brand-name {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--green-dark);
  letter-spacing: -0.02em;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.nav-link {
  background: transparent;
  padding: 0.55rem 0.9rem;
  border-radius: 10px;
  font-weight: 600;
  color: var(--muted);
}

.nav-link:hover,
.nav-link.active {
  background: var(--green-soft);
  color: var(--green-dark);
}

.cart-btn {
  position: relative;
  background: var(--green);
  color: #fff;
  padding: 0.55rem 1rem;
  border-radius: 10px;
  font-weight: 600;
}

.cart-btn:hover,
.cart-btn.active {
  background: var(--green-dark);
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--orange);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  min-width: 20px;
  height: 20px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
}

main {
  flex: 1;
}

.footer {
  margin-top: 2.5rem;
  padding: 1.2rem 0;
  border-top: 1px solid var(--border);
  text-align: center;
  font-size: 0.82rem;
  color: var(--muted);
}
</style>
