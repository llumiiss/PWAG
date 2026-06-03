<script setup>
import { ref } from 'vue'
import ShopView from './components/ShopView.vue'
import CartView from './components/CartView.vue'
import AdminView from './components/AdminView.vue'
import AdminLogin from './components/AdminLogin.vue'
import { cartCount, state } from './store/shop.js'

const currentView = ref('shop') // shop | cart | admin
const isAdminAuthed = ref(false)
const showAdminLogin = ref(false)

function openAdmin() {
  if (isAdminAuthed.value) {
    currentView.value = 'admin'
  } else {
    showAdminLogin.value = true
  }
}

function onAdminLoginSuccess() {
  isAdminAuthed.value = true
  showAdminLogin.value = false
  currentView.value = 'admin'
}

function logoutAdmin() {
  isAdminAuthed.value = false
  currentView.value = 'shop'
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
          class="nav-link"
          :class="{ active: currentView === 'admin' }"
          @click="openAdmin"
        >
          ⚙️ Admin
        </button>
        <button v-if="isAdminAuthed" class="nav-link logout" @click="logoutAdmin">
          Wyloguj
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

    <div v-if="state.backend === 'local'" class="banner local">
      ⚠️ Tryb lokalny — Firebase nie jest skonfigurowany, zmiany nie przetrwają odświeżenia.
      Uzupełnij plik <code>.env</code> wg <code>.env.example</code>.
    </div>

    <main>
      <div v-if="state.loading" class="status">
        <span class="spinner"></span> Ładowanie produktów…
      </div>
      <div v-else-if="state.error" class="status error">
        ❌ Błąd połączenia z Firebase: {{ state.error }}
      </div>
      <template v-else>
        <ShopView v-if="currentView === 'shop'" />
        <AdminView v-else-if="currentView === 'admin' && isAdminAuthed" />
        <CartView v-else @back="currentView = 'shop'" />
      </template>
    </main>

    <AdminLogin
      v-if="showAdminLogin"
      @success="onAdminLoginSuccess"
      @close="showAdminLogin = false"
    />

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

.nav-link.logout {
  color: var(--danger);
}

.nav-link.logout:hover {
  background: #fdecec;
  color: var(--danger);
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

.banner {
  border-radius: 12px;
  padding: 0.7rem 1rem;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.banner.local {
  background: #fff8e1;
  border: 1px solid #ffe082;
  color: #8d6e00;
}

.banner code {
  background: rgba(0, 0, 0, 0.06);
  padding: 0.05rem 0.3rem;
  border-radius: 5px;
  font-size: 0.82rem;
}

main {
  flex: 1;
}

.status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 4rem 1rem;
  color: var(--muted);
  font-size: 1rem;
}

.status.error {
  color: var(--danger);
}

.spinner {
  width: 22px;
  height: 22px;
  border: 3px solid var(--green-soft);
  border-top-color: var(--green);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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
