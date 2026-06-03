<script setup>
import { reactive, ref, computed } from 'vue'
import { state, updateProduct } from '../store/shop.js'

// Maksymalna dozwolona data dostawy = dzisiaj (nie można ustawić daty z przyszłości).
const today = computed(() => {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  return new Date(now.getTime() - offset * 60 * 1000).toISOString().slice(0, 10)
})

// Lokalne wersje robocze pól edytowanych przez admina.
const drafts = reactive({})
for (const p of state.products) {
  drafts[p.id] = { deliveryDate: p.deliveryDate, stock: p.stock }
}

const savedId = ref(null)
const savingId = ref(null)
const errorMsg = ref('')

function isDirty(product) {
  const d = drafts[product.id]
  return d.deliveryDate !== product.deliveryDate || Number(d.stock) !== product.stock
}

async function save(product) {
  const d = drafts[product.id]

  // Blokada daty z przyszłości.
  if (d.deliveryDate > today.value) {
    errorMsg.value = `Data dostawy dla "${product.name}" nie może być z przyszłości.`
    return
  }

  const newStock = Math.max(0, Math.floor(Number(d.stock) || 0))
  savingId.value = product.id
  errorMsg.value = ''
  try {
    await updateProduct(product.id, {
      deliveryDate: d.deliveryDate,
      stock: newStock,
    })
    drafts[product.id].stock = newStock
    savedId.value = product.id
    setTimeout(() => {
      if (savedId.value === product.id) savedId.value = null
    }, 1500)
  } catch (err) {
    errorMsg.value = `Nie udało się zapisać "${product.name}": ${err.message}`
  } finally {
    savingId.value = null
  }
}

function reset(product) {
  drafts[product.id].deliveryDate = product.deliveryDate
  drafts[product.id].stock = product.stock
}

function adjustStock(product, delta) {
  const current = Number(drafts[product.id].stock) || 0
  drafts[product.id].stock = Math.max(0, current + delta)
}
</script>

<template>
  <section>
    <div class="admin-head">
      <h1>⚙️ Panel administratora</h1>
      <p>Zarządzaj datą dostawy (świeżością) oraz stanem magazynowym produktów.</p>
    </div>

    <p v-if="errorMsg" class="admin-error">{{ errorMsg }}</p>

    <div class="table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th class="col-prod">Produkt</th>
            <th>Typ</th>
            <th>Data dostawy</th>
            <th>Stan magazynu</th>
            <th class="col-actions">Akcje</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in state.products" :key="product.id" :class="{ low: product.stock <= 5 }">
            <td class="col-prod">
              <span class="prod-emoji">{{ product.emoji }}</span>
              <span class="prod-name">{{ product.name }}</span>
            </td>
            <td>
              <span class="badge" :class="product.type">
                {{ product.type === 'owoc' ? 'Owoc' : 'Warzywo' }}
              </span>
            </td>
            <td>
              <input
                v-model="drafts[product.id].deliveryDate"
                type="date"
                :max="today"
                class="date-input"
              />
            </td>
            <td>
              <div class="stock-edit">
                <button class="step-btn" @click="adjustStock(product, -1)">−</button>
                <input
                  v-model.number="drafts[product.id].stock"
                  type="number"
                  min="0"
                  class="stock-input"
                />
                <button class="step-btn" @click="adjustStock(product, 1)">+</button>
                <span class="unit">{{ product.unit }}</span>
              </div>
            </td>
            <td class="col-actions">
              <button
                class="save-btn"
                :disabled="!isDirty(product) || savingId === product.id"
                @click="save(product)"
              >
                {{ savingId === product.id ? 'Zapisywanie…' : 'Zapisz' }}
              </button>
              <button
                v-if="isDirty(product)"
                class="reset-btn"
                title="Cofnij zmiany"
                @click="reset(product)"
              >
                ↺
              </button>
              <span v-if="savedId === product.id" class="saved">✓ zapisano</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.admin-head {
  margin-bottom: 1.2rem;
}

.admin-head h1 {
  font-size: 1.6rem;
  margin-bottom: 0.3rem;
}

.admin-head p {
  color: var(--muted);
}

.admin-error {
  background: #fff5f5;
  border: 1px solid #f3c4c4;
  color: var(--danger);
  padding: 0.6rem 0.9rem;
  border-radius: 10px;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.table-wrap {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: var(--shadow);
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 720px;
}

.admin-table th,
.admin-table td {
  padding: 0.8rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}

.admin-table thead th {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted);
  background: var(--green-soft);
}

.admin-table tbody tr:last-child td {
  border-bottom: none;
}

.admin-table tbody tr.low {
  background: #fff8f0;
}

.col-prod {
  min-width: 200px;
}

.prod-emoji {
  font-size: 1.4rem;
  margin-right: 0.5rem;
}

.prod-name {
  font-weight: 600;
}

.badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  text-transform: uppercase;
}

.badge.warzywo {
  background: var(--green-soft);
  color: var(--green-dark);
}

.badge.owoc {
  background: #fff3e0;
  color: var(--orange);
}

.date-input {
  padding: 0.45rem 0.55rem;
  border: 1px solid var(--border);
  border-radius: 9px;
  outline: none;
}

.date-input:focus,
.stock-input:focus {
  border-color: var(--green);
  box-shadow: 0 0 0 3px var(--green-soft);
}

.stock-edit {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.step-btn {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  background: var(--green-soft);
  color: var(--green-dark);
  font-size: 1.1rem;
  font-weight: 700;
}

.step-btn:hover {
  background: var(--green);
  color: #fff;
}

.stock-input {
  width: 70px;
  padding: 0.45rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: 9px;
  outline: none;
  text-align: center;
}

.unit {
  font-size: 0.8rem;
  color: var(--muted);
}

.col-actions {
  white-space: nowrap;
}

.save-btn {
  background: var(--green);
  color: #fff;
  padding: 0.45rem 0.9rem;
  border-radius: 9px;
  font-weight: 600;
}

.save-btn:hover {
  background: var(--green-dark);
}

.save-btn:disabled {
  background: #c8d2c6;
  cursor: not-allowed;
}

.reset-btn {
  margin-left: 0.4rem;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 9px;
  width: 32px;
  height: 32px;
  font-size: 1rem;
  color: var(--muted);
}

.reset-btn:hover {
  border-color: var(--green);
  color: var(--green-dark);
}

.saved {
  margin-left: 0.6rem;
  color: var(--green);
  font-size: 0.82rem;
  font-weight: 600;
}
</style>
