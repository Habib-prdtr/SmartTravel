# SmartTravel Planner 🌍

Aplikasi cerdas untuk merencanakan perjalanan dan liburan Anda, lengkap dengan fitur manajemen pengeluaran (budget), integrasi peta geografis, rekomendasi destinasi berbasis AI, dan *Offline Mode*.

Proyek ini dibangun menggunakan **React (Vite), TypeScript, Tailwind CSS**, dan **Express.js (MySQL)**, serta mendukung ekspor ke aplikasi **Android native** menggunakan **Capacitor**.

---

## 🛠️ Persyaratan Sistem (Prerequisites)
Sebelum menjalankan proyek ini, pastikan komputer/laptop Anda telah terinstal:
1. **Node.js** (Minimal versi 18.x)
2. **MySQL Server** (XAMPP/MAMP atau MySQL terpisah)
3. **Android Studio** (Hanya diperlukan jika Anda ingin mem-build/menjalankan aplikasi di emulator Android atau perangkat HP fisik)

---

## 🚀 Cara Menjalankan Aplikasi (Lokal/Web)

Aplikasi ini terdiri dari dua bagian: **Backend (Server)** dan **Frontend (Client)**. Keduanya harus dijalankan secara bersamaan.

### 1. Menjalankan Backend (Server)
1. Buka terminal baru dan masuk ke folder `server`:
   ```bash
   cd server
   ```
2. Instal semua dependensi:
   ```bash
   npm install
   ```
3. Konfigurasi Database:
   - Buat database baru di MySQL Anda dengan nama `smarttravel_db` (atau nama lain sesuai selera).
   - *Duplikat* file `.env.example` menjadi `.env`.
   - Buka file `.env` dan sesuaikan kredensial MySQL Anda (User, Password, dan Nama Database).
4. Jalankan Server API:
   ```bash
   npm run dev
   ```
   *Backend sekarang berjalan di `http://localhost:5000`.*

### 2. Menjalankan Frontend (Web App)
1. Buka terminal baru (jangan tutup terminal backend) dan pastikan berada di folder utama proyek (`SmartTravel`):
   ```bash
   npm install
   ```
2. Jalankan aplikasi web (Vite Development Server):
   ```bash
   npm run dev
   ```
3. Buka *browser* Anda dan kunjungi URL yang muncul di terminal (biasanya `http://localhost:5173`).

---

## 📱 Cara Menjalankan di Platform Android

Proyek web ini telah terintegrasi dengan Capacitor sehingga bisa di-*compile* menjadi aplikasi Android sungguhan (.APK).

1. Pastikan Anda sudah menjalankan perintah `npm install` di folder utama proyek (langkah Frontend di atas).
2. Lakukan proses *build* aplikasi React Anda:
   ```bash
   npm run build
   ```
3. Sinkronisasikan hasil *build* web ke platform Android:
   ```bash
   npx cap sync android
   ```
4. Buka proyek Android menggunakan Android Studio:
   ```bash
   npx cap open android
   ```
5. Di dalam Android Studio, tunggu proses sinkronisasi Gradle (biasanya butuh beberapa menit pada run pertama).
6. Tekan tombol **Play (▶ Run)** di Android Studio untuk menjalankan aplikasi SmartTravel di Emulator atau HP Android yang terhubung via kabel USB.

---

## 📝 Fitur Utama

### Fungsional
* **Autentikasi:** Sistem Login & Register aman dengan JWT.
* **Itinerary Planner:** Susun rencana perjalanan dari hari ke hari.
* **Budgeting:** Pantau pengeluaran liburan agar tidak *over-budget*.
* **Map Explorer:** Navigasi peta interaktif.
* **AI Recommendations:** Dapatkan saran jadwal liburan otomatis.
* **Offline Mode (PWA):** Akses aplikasi web tanpa internet.

### Non-Fungsional (Kualitas Sistem)
* Didesain dengan **Tailwind CSS** yang responsif.
* Performa tinggi dan perpindahan halaman mulus berkat **SPA (Single Page Application)**.
* Keamanan terjamin dengan **Password Hashing (Bcrypt), JWT Auth, Input Validation (Zod)**, dan **Rate Limiter**.
* Anti-Crash berkat implementasi **React Error Boundary**.
