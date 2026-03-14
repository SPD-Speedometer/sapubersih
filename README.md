# Sapu Bersih (Svelte)

Frontend customer Svelte untuk `Sapu Bersih`.

## Stack
- Svelte 4
- Vite 5
- Fetch API (tanpa dependency tambahan)

## Setup
```bash
cd fe-sampah
cp .env.example .env
npm install
npm run dev
```

Akses local: `http://localhost:5173`

## Konfigurasi
- `VITE_API_BASE_URL`: backend API `Sapu Bersih`
- Token captcha Turnstile dapat diisi via field UI `X-Turnstile-Token`.

## Fitur yang Diimplementasi (Sesuai Route Aktif Backend)

### 1. Auth
- Register `POST /auth/register`
- Verify OTP `POST /auth/verify-phone`
- Resend OTP `POST /auth/resend-otp`
- Login `POST /auth/login`
- Refresh token otomatis `POST /auth/refresh`
- Logout `POST /auth/logout`

### 2. Profile
- Ambil profil `GET /me`
- Update profil `PATCH /me`
- Ganti password `PATCH /me/password`

### 3. Master Data (Publik)
- Kategori sampah `GET /waste-categories`
- Aturan harga `GET /pricing-rules`
- Area layanan `GET /service-areas`
- Depo `GET /depots`

### 4. Address (Protected)
- List `GET /addresses`
- Detail `GET /addresses/{id}` (tercover saat edit melalui list)
- Create `POST /addresses`
- Update `PATCH /addresses/{id}`
- Delete `DELETE /addresses/{id}`
- Set default `POST /addresses/{id}/set-default`

## Struktur Singkat
```text
fe-sampah/
  src/
    lib/
      api.js        # HTTP client + auto refresh token
      session.js    # Store sesi + localStorage
      format.js     # Formatter util
    App.svelte      # Root app
    app.css         # Entry stylesheet
    main.js
```
