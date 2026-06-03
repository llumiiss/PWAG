<script setup>
import { computed } from 'vue'

const props = defineProps({
  product: { type: Object, required: true },
  quantityInCart: { type: Number, default: 0 },
})

const emit = defineEmits(['add', 'remove'])

const typeLabel = computed(() => (props.product.type === 'owoc' ? 'Owoc' : 'Warzywo'))

// Liczba dni od dostawy => prosty wskaźnik świeżości.
const daysSinceDelivery = computed(() => {
  const delivered = new Date(props.product.deliveryDate)
  const now = new Date()
  const diff = Math.floor((now - delivered) / (1000 * 60 * 60 * 24))
  return diff < 0 ? 0 : diff
})

const freshnessLabel = computed(() => {
  const d = daysSinceDelivery.value
  if (d <= 1) return 'Świeże dzisiaj'
  if (d <= 3) return `Dostawa ${d} dni temu`
  return `Dostawa ${d} dni temu`
})

const freshnessClass = computed(() => {
  const d = daysSinceDelivery.value
  if (d <= 1) return 'fresh-top'
  if (d <= 3) return 'fresh-mid'
  return 'fresh-low'
})

const formattedDate = computed(() => {
  const date = new Date(props.product.deliveryDate)
  return date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' })
})
</script>

<template>
  <article class="card">
    <div class="emoji">{{ product.emoji }}</div>

    <span class="badge" :class="product.type">{{ typeLabel }}</span>

    <h3 class="name">{{ product.name }}</h3>

    <div class="freshness" :class="freshnessClass">
      <span class="dot"></span>
      {{ freshnessLabel }}
    </div>
    <p class="delivery">Dostawa: {{ formattedDate }}</p>

    <div class="price-row">
      <span class="price">{{ product.price.toFixed(2) }} zł</span>
      <span class="unit">/ {{ product.unit }}</span>
    </div>

    <div v-if="quantityInCart === 0" class="actions">
      <button class="add-btn" @click="emit('add', product)">Dodaj do koszyka</button>
    </div>
    <div v-else class="qty">
      <button class="qty-btn" @click="emit('remove', product)">−</button>
      <span class="qty-value">{{ quantityInCart }}</span>
      <button class="qty-btn" @click="emit('add', product)">+</button>
    </div>
  </article>
</template>

<style scoped>
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.1rem;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  position: relative;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.1);
}

.emoji {
  font-size: 3.2rem;
  text-align: center;
  line-height: 1.2;
}

.badge {
  position: absolute;
  top: 0.9rem;
  left: 0.9rem;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.badge.warzywo {
  background: var(--green-soft);
  color: var(--green-dark);
}

.badge.owoc {
  background: #fff3e0;
  color: var(--orange);
}

.name {
  font-size: 1.1rem;
  margin-top: 0.4rem;
}

.freshness {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  margin-top: 0.5rem;
  font-weight: 600;
}

.freshness .dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.fresh-top {
  color: var(--green);
}
.fresh-top .dot {
  background: var(--green);
}
.fresh-mid {
  color: #f9a825;
}
.fresh-mid .dot {
  background: #f9a825;
}
.fresh-low {
  color: var(--muted);
}
.fresh-low .dot {
  background: var(--muted);
}

.delivery {
  font-size: 0.78rem;
  color: var(--muted);
  margin-top: 0.15rem;
}

.price-row {
  margin-top: 0.7rem;
  margin-bottom: 0.9rem;
}

.price {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text);
}

.unit {
  font-size: 0.85rem;
  color: var(--muted);
}

.actions {
  margin-top: auto;
}

.add-btn {
  width: 100%;
  background: var(--green);
  color: #fff;
  padding: 0.6rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  transition: background 0.15s ease;
}

.add-btn:hover {
  background: var(--green-dark);
}

.qty {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--green-soft);
  border-radius: 10px;
  padding: 0.25rem;
}

.qty-btn {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: #fff;
  color: var(--green-dark);
  font-size: 1.3rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-btn:hover {
  background: var(--green);
  color: #fff;
}

.qty-value {
  font-weight: 700;
  font-size: 1.05rem;
}
</style>
