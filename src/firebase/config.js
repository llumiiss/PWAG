import { initializeApp } from 'firebase/app'
import { initializeFirestore } from 'firebase/firestore'

// Dane konfiguracyjne pobierane są ze zmiennych środowiskowych Vite (.env).
// Skopiuj plik .env.example do .env i uzupełnij wartościami z konsoli Firebase:
// Firebase Console -> Project settings -> Your apps -> SDK setup and configuration.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Czy Firebase jest skonfigurowany? Jeśli nie – aplikacja działa w trybie
// lokalnym (dane w pamięci), więc da się ją uruchomić jeszcze przed konfiguracją.
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

export const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null

// experimentalAutoDetectLongPolling rozwiązuje "wieczne ładowanie", gdy domyślny
// transport Firestore (WebChannel) jest blokowany przez sieć/rozszerzenia przeglądarki.
export const db = app
  ? initializeFirestore(app, { experimentalAutoDetectLongPolling: true })
  : null
