# SmartTravel Planner 🌍

Aplikasi cerdas untuk merencanakan perjalanan dan liburan Anda, lengkap dengan fitur manajemen pengeluaran (budget), integrasi peta geografis, rekomendasi destinasi berbasis AI, pemantauan cuaca _real-time_, dan _Offline Mode_.

Proyek ini dibangun menggunakan **React (Vite), TypeScript**, dan **Express.js (MySQL)**, serta mendukung ekspor ke aplikasi **Android native** menggunakan **Capacitor**.

---

## 📝 Fitur Utama

### Fungsional

- **Autentikasi Aman:** Sistem Login & Register dengan JWT.
- **AI Packing List & Itinerary:** Asisten AI (_powered by Groq/OpenAI_) untuk menyusun rencana perjalanan harian dan daftar bawaan otomatis.
- **Real-time Weather:** Pantauan cuaca cerdas untuk destinasi wisata terintegrasi dengan **WeatherAPI**.
- **Budgeting & Expense Tracker:** Pantau pengeluaran liburan (akomodasi, makanan, dll) agar tidak _over-budget_.
- **Map Explorer:** Navigasi peta geografis interaktif dengan **Leaflet**.
- **Offline Mode (PWA):** Akses rencana perjalanan Anda kapan saja tanpa koneksi internet.

### Kualitas Sistem (Non-Fungsional)

- **UI/UX Premium:** Antarmuka responsif dengan _glassmorphism_, gradien modern, dan animasi interaktif.
- **Performa Tinggi:** Waktu pemuatan cepat berkat **Compression** (gzip) dan arsitektur _Single Page Application_ (SPA).
- **Keamanan Kelas Enterprise:**
  - **Helmet:** Perlindungan _HTTP Headers_ (anti-XSS & Clickjacking).
  - **CORS Ketat:** Mencegah akses API dari domain yang tidak diizinkan.
  - **Rate Limiter (Anti-DDoS & Brute Force):** Membatasi _request_ ke server untuk melindungi kuota AI dan _endpoint_ autentikasi.
  - **Zod Validation & Sanitization:** Filter ketat untuk setiap data yang masuk dari pengguna.
  - **Password Hashing:** Enkripsi kata sandi menggunakan `bcryptjs`.

---

## 🛠️ Persyaratan Sistem (Prerequisites)

Sebelum menjalankan proyek ini, pastikan komputer/laptop Anda telah terinstal:

1. **Node.js** (Minimal versi 18.x)
2. **MySQL Server** (XAMPP/MAMP atau MySQL terpisah)
3. **Android Studio** (Hanya diperlukan jika ingin mem-build aplikasi ke HP fisik/Emulator)

---

## 🚀 Cara Menjalankan Aplikasi Lokal

Aplikasi ini menggunakan sistem Client-Server (Frontend dan Backend terpisah).

### 1. Menjalankan Backend (Server)

1. Buka terminal baru dan masuk ke folder `server`:
   ```bash
   cd server
   ```
2. Instal semua dependensi:
   ```bash
   npm install
   ```
3. Konfigurasi Lingkungan (_Environment_):
   - Buat file `.env` di dalam folder `server` (Anda bisa menyalin dari `.env.example` jika ada).
   - Isi kredensial berikut:
     ```env
     PORT=5000
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=
     DB_NAME=smarttravel_db
     JWT_SECRET=rahasia_jwt_super_aman
     GROQ_API_KEY=api_key_groq_anda_di_sini
     ```
4. Jalankan Server API:
   ```bash
   npm run dev
   ```
   _Backend sekarang berjalan di `http://localhost:5000`._

### 2. Menjalankan Frontend (Web App)

1. Buka terminal baru dan pastikan berada di folder utama proyek (`SmartTravel`):
   ```bash
   npm install
   ```
2. Konfigurasi Lingkungan (_Environment_):
   - Buat file `.env` di dalam folder utama.
   - Tambahkan kunci WeatherAPI:
     ```env
     VITE_WEATHER_API_KEY=api_key_cuaca_anda
     ```
3. Jalankan aplikasi web:
   ```bash
   npm run dev
   ```
4. Buka browser dan kunjungi `http://localhost:5173`.

---

## 📱 Build Menjadi Aplikasi Android

Proyek ini telah terintegrasi dengan Capacitor untuk dikompilasi menjadi .APK.

1. Jalankan perintah _build_ di folder utama:
   ```bash
   npm run build
   ```
2. Sinkronisasikan hasil web ke Android:
   ```bash
   npx cap sync android
   ```
3. Buka proyek di Android Studio:
   ```bash
   npx cap open android
   ```
4. Tekan tombol **Play (▶ Run)** di Android Studio untuk menjalankan di Emulator atau _Device_ Anda.
