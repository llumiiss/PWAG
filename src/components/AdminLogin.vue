<script setup>
import { ref } from 'vue'

const emit = defineEmits(['success', 'close'])

// Proste dane logowania admina (dla potrzeb projektu zaliczeniowego).
const ADMIN_LOGIN = 'admin'
const ADMIN_PASSWORD = 'admin'

const login = ref('')
const password = ref('')
const error = ref('')

function submit() {
  if (login.value.trim() === ADMIN_LOGIN && password.value === ADMIN_PASSWORD) {
    error.value = ''
    emit('success')
  } else {
    error.value = 'Nieprawidłowy login lub hasło.'
  }
}
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="modal" role="dialog" aria-modal="true" aria-label="Logowanie admina">
      <button class="close-x" aria-label="Zamknij" @click="emit('close')">×</button>

      <div class="icon">🔒</div>
      <h2>Panel administratora</h2>
      <p class="hint">Zaloguj się, aby zarządzać produktami.</p>

      <form novalidate @submit.prevent="submit">
        <div class="field">
          <label for="admin-login">Login</label>
          <input
            id="admin-login"
            v-model="login"
            type="text"
            autocomplete="username"
            placeholder="admin"
          />
        </div>

        <div class="field">
          <label for="admin-password">Hasło</label>
          <input
            id="admin-password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            placeholder="••••"
          />
        </div>

        <p v-if="error" class="error">{{ error }}</p>

        <button type="submit" class="login-btn">Zaloguj</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(20, 30, 20, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 100;
}

.modal {
  background: var(--card);
  border-radius: 18px;
  padding: 1.8rem;
  width: 100%;
  max-width: 360px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
  position: relative;
  text-align: center;
}

.close-x {
  position: absolute;
  top: 0.7rem;
  right: 0.9rem;
  background: transparent;
  font-size: 1.6rem;
  line-height: 1;
  color: var(--muted);
}

.icon {
  font-size: 2.5rem;
}

.modal h2 {
  font-size: 1.3rem;
  margin-top: 0.4rem;
  color: var(--green-dark);
}

.hint {
  color: var(--muted);
  font-size: 0.88rem;
  margin-bottom: 1.2rem;
}

.field {
  text-align: left;
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

.error {
  color: var(--danger);
  font-size: 0.82rem;
  margin-bottom: 0.8rem;
}

.login-btn {
  width: 100%;
  background: var(--green);
  color: #fff;
  padding: 0.7rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  transition: background 0.15s ease;
}

.login-btn:hover {
  background: var(--green-dark);
}
</style>
