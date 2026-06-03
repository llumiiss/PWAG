import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { initShop } from './store/shop.js'

createApp(App).mount('#app')

// Połącz z backendem (Firestore) i załaduj produkty.
initShop()
