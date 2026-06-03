# 🥬 Warzywniak — sklep z warzywami i owocami (Vue 3 + Firebase)

Projekt zaliczeniowy: prosty sklep internetowy z warzywami i owocami napisany w Vue 3 (Vite),
z backendem na Firebase Firestore.

## Funkcje

- **Strona sklepu** — lista produktów, dodawanie/usuwanie z koszyka, licznik ilości.
- **Filtry** — Wszystko / Warzywa / Owoce.
- **Wyszukiwarka** — po nazwie produktu.
- **Sortowanie** — po świeżości (dacie dostawy) oraz po cenie.
- **Typ i świeżość** — każdy produkt ma typ (warzywo/owoc) i datę dostawy.
- **Stan magazynowy** — każdy produkt ma stan, który wyczerpuje się przy zamówieniach;
  nie można dodać do koszyka więcej niż jest dostępne.
- **Koszyk + formularz** — imię, nazwisko, telefon, adres dostawy, walidacja pól
  i przycisk „Zamów" z komunikatami o błędach.
- **Panel admina** — edycja daty dostawy i stanu magazynowego produktów.
- **Backend Firebase** — produkty, stany magazynowe i zamówienia trwają po odświeżeniu,
  z synchronizacją na żywo (onSnapshot).

## Uruchomienie

```sh
npm install
npm run dev
```

Bez konfiguracji Firebase aplikacja uruchomi się w **trybie lokalnym** (dane w pamięci,
resetują się po odświeżeniu) — przydatne do szybkiego podglądu.

## Konfiguracja Firebase (trwały backend)

1. Wejdź na [Firebase Console](https://console.firebase.google.com/) i utwórz projekt.
2. W projekcie włącz **Firestore Database** (Build → Firestore Database → Create database).
   Na potrzeby projektu możesz wystartować w trybie testowym (test mode).
3. Dodaj aplikację webową (Project settings → Your apps → ikona `</>`) i skopiuj dane
   konfiguracyjne (`apiKey`, `authDomain`, `projectId`, itd.).
4. Skopiuj plik `.env.example` do `.env` i uzupełnij wartościami:

```sh
cp .env.example .env
```

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

5. Uruchom `npm run dev`. Przy pierwszym starcie kolekcja `products` zostanie
   automatycznie zasiana danymi startowymi.

### Kolekcje w Firestore

- `products` — produkty (id dokumentu = id produktu): `name`, `type`, `price`, `unit`,
  `emoji`, `deliveryDate`, `stock`.
- `orders` — złożone zamówienia: dane klienta z formularza, pozycje, suma, znacznik czasu.

### Reguły bezpieczeństwa (tryb deweloperski)

Do celów projektu zaliczeniowego wystarczą reguły testowe (otwarte). Przykład w Firestore:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

> Uwaga: to reguły wyłącznie do dewelopmentu/prezentacji. W produkcji należy je ograniczyć
> (np. zapis do `products` tylko dla zalogowanego admina przez Firebase Authentication).

## Struktura

```
src/
  data/products.js        # dane startowe (seed) do zasiania bazy
  firebase/config.js      # inicjalizacja Firebase z .env
  store/shop.js           # reaktywny store + integracja z Firestore
  components/
    ProductCard.vue       # karta produktu (stan magazynu, świeżość)
    ShopView.vue          # sklep: filtry, wyszukiwarka, sortowanie
    CartView.vue          # koszyk + formularz zamówienia z walidacją
    AdminView.vue         # panel admina (edycja daty dostawy i stanu)
  App.vue                 # nawigacja, stany ładowania/błędu
```
