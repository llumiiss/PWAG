<script setup>
import { ref, computed } from 'vue'
import ProductCard from './ProductCard.vue'
import { state, addToCart, removeFromCart, quantityInCart, availableStock } from '../store/shop.js'

const search = ref('')
const activeFilter = ref('all') // all | warzywo | owoc
const sortBy = ref('default') // default | fresh | price-asc | price-desc

const filters = [
  { value: 'all', label: 'Wszystko', emoji: '🧺' },
  { value: 'warzywo', label: 'Warzywa', emoji: '🥕' },
  { value: 'owoc', label: 'Owoce', emoji: '🍎' },
]

const visibleProducts = computed(() => {
  let list = state.products.slice()

  if (activeFilter.value !== 'all') {
    list = list.filter((p) => p.type === activeFilter.value)
  }

  const query = search.value.trim().toLowerCase()
  if (query) {
    list = list.filter((p) => p.name.toLowerCase().includes(query))
  }

  if (sortBy.value === 'fresh') {
    list.sort((a, b) => new Date(b.deliveryDate) - new Date(a.deliveryDate))
  } else if (sortBy.value === 'price-asc') {
    list.sort((a, b) => a.price - b.price)
  } else if (sortBy.value === 'price-desc') {
    list.sort((a, b) => b.price - a.price)
  }

  return list
})
</script>

<template>
  <section>
    <div class="hero">
      <h1>🥬 Świeże prosto od rolnika</h1>
      <p>Warzywa i owoce z codzienną dostawą. Wybierz, dodaj do koszyka i zamów online.</p>
    </div>

    <div class="toolbar">
      <div class="search">
        <span class="search-icon">🔍</span>
        <input v-model="search" type="text" placeholder="Szukaj produktu..." />
        <button v-if="search" class="clear" @click="search = ''" aria-label="Wyczyść">×</button>
      </div>

      <div class="filters">
        <button
          v-for="f in filters"
          :key="f.value"
          class="filter-btn"
          :class="{ active: activeFilter === f.value }"
          @click="activeFilter = f.value"
        >
          {{ f.emoji }} {{ f.label }}
        </button>
      </div>

      <div class="sort">
        <label for="sort">Sortuj:</label>
        <select id="sort" v-model="sortBy">
          <option value="default">Domyślnie</option>
          <option value="fresh">Najświeższe</option>
          <option value="price-asc">Cena: rosnąco</option>
          <option value="price-desc">Cena: malejąco</option>
        </select>
      </div>
    </div>

    <p class="result-count">
      Znaleziono <strong>{{ visibleProducts.length }}</strong> produktów
    </p>

    <div v-if="visibleProducts.length" class="grid">
      <ProductCard
        v-for="product in visibleProducts"
        :key="product.id"
        :product="product"
        :quantity-in-cart="quantityInCart(product.id)"
        :available-stock="availableStock(product.id)"
        @add="addToCart"
        @remove="removeFromCart"
      />
    </div>

    <div v-else class="empty">
      <div class="empty-emoji">🤷</div>
      <p>Brak produktów spełniających kryteria.</p>
      <button class="reset-btn" @click="(search = ''), (activeFilter = 'all')">
        Wyczyść filtry
      </button>
    </div>
  </section>
</template>

<style scoped>
.hero {
  background: linear-gradient(135deg, var(--green) 0%, var(--green-dark) 100%);
  color: #fff;
  padding: 2rem;
  border-radius: 18px;
  margin-bottom: 1.5rem;
}

.hero h1 {
  font-size: 1.8rem;
  margin-bottom: 0.4rem;
}

.hero p {
  opacity: 0.92;
  max-width: 520px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.search {
  position: relative;
  flex: 1 1 240px;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  pointer-events: none;
}

.search input {
  width: 100%;
  padding: 0.65rem 2.2rem;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: #fff;
  outline: none;
}

.search input:focus {
  border-color: var(--green);
  box-shadow: 0 0 0 3px var(--green-soft);
}

.clear {
  position: absolute;
  right: 0.6rem;
  background: transparent;
  font-size: 1.3rem;
  color: var(--muted);
  line-height: 1;
}

.filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.55rem 0.9rem;
  border-radius: 999px;
  background: #fff;
  border: 1px solid var(--border);
  font-weight: 600;
  color: var(--muted);
  transition: all 0.15s ease;
}

.filter-btn:hover {
  border-color: var(--green);
  color: var(--green-dark);
}

.filter-btn.active {
  background: var(--green);
  color: #fff;
  border-color: var(--green);
}

.sort {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--muted);
}

.sort select {
  padding: 0.55rem 0.7rem;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: #fff;
}

.sort select:focus {
  outline: none;
  border-color: var(--green);
}

.result-count {
  font-size: 0.85rem;
  color: var(--muted);
  margin-bottom: 1rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.1rem;
}

.empty {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--muted);
}

.empty-emoji {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.reset-btn {
  margin-top: 1rem;
  background: var(--green);
  color: #fff;
  padding: 0.55rem 1.2rem;
  border-radius: 10px;
  font-weight: 600;
}
</style>
