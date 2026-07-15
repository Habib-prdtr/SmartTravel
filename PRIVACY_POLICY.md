# Kebijakan Privasi (Privacy Policy) - SmartTravel Planner 🌍

**Terakhir Diperbarui:** 15 Juli 2026

SmartTravel Planner berkomitmen untuk melindungi dan menghormati privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi Anda saat Anda menggunakan aplikasi SmartTravel Planner, baik versi Web (PWA) maupun versi Android.

Dengan menggunakan SmartTravel Planner, Anda menyetujui pengumpulan dan penggunaan informasi sesuai dengan kebijakan ini.

---

## 1. Informasi yang Kami Kumpulkan

Kami mengumpulkan beberapa jenis informasi untuk menyediakan dan meningkatkan layanan kami kepada Anda:

### A. Informasi Pribadi yang Anda Berikan
* **Informasi Pendaftaran Akun:** Ketika Anda membuat akun di SmartTravel, kami mengumpulkan alamat email, nama pengguna (username), dan kata sandi Anda. Kata sandi Anda disimpan dalam bentuk terenkripsi menggunakan algoritma hashing satu arah (`bcryptjs`) di server kami dan tidak dapat dibaca oleh siapa pun.
* **Informasi Profil:** Detail opsional yang Anda tambahkan ke profil pengguna Anda.

### B. Data Perjalanan & Rencana Liburan
* **Itinerary & Rencana Perjalanan:** Destinasi wisata, tanggal keberangkatan/kepulangan, dan rincian aktivitas harian yang Anda buat.
* **Daftar Bawaan (Packing List):** Barang-barang yang Anda masukkan untuk dibawa selama liburan.
* **Manajemen Anggaran (Budgeting & Expenses):** Data alokasi anggaran dan catatan pengeluaran harian Anda (seperti biaya akomodasi, makanan, transportasi, tiket masuk, dll.).

### C. Data Teknis & Penggunaan
* **Data Log & Perangkat:** Kami mengumpulkan informasi dasar perangkat (seperti jenis sistem operasi, resolusi layar, tipe browser) untuk membantu mengoptimalkan performa aplikasi.
* **Data Lokasi & Pencarian:** Ketika Anda mencari lokasi di peta interaktif (Leaflet) atau mencari prakiraan cuaca, kami memproses nama destinasi atau koordinat geografis yang Anda masukkan.

---

## 2. Bagaimana Kami Menggunakan Data Anda

Kami menggunakan data yang dikumpulkan untuk tujuan berikut:
1. **Penyediaan Layanan:** Mengelola akun Anda, menyinkronkan itinerary antara perangkat Anda dengan server, dan menampilkan peta interaktif serta anggaran perjalanan Anda.
2. **Rekomendasi AI (Artificial Intelligence):** Mengirimkan deskripsi destinasi dan durasi liburan Anda ke API AI pihak ketiga (seperti Groq atau OpenAI) untuk menghasilkan rancangan jadwal perjalanan dan daftar bawaan secara otomatis.
3. **Penyediaan Informasi Cuaca:** Mengirimkan nama destinasi ke **WeatherAPI** untuk menampilkan perkiraan cuaca real-time agar Anda dapat mempersiapkan perjalanan dengan lebih baik.
4. **Mode Offline (PWA):** Menyimpan cache data rencana perjalanan Anda di browser/perangkat Anda agar tetap dapat diakses saat tidak ada koneksi internet.
5. **Keamanan:** Mencegah aktivitas mencurigakan, serangan brute-force, dan akses tidak sah dengan memanfaatkan JWT, Rate Limiting, Helmet, dan validasi Zod.

---

## 3. Pembagian Data dengan Pihak Ketiga

Kami menghargai privasi Anda dan **tidak akan pernah menjual** data pribadi Anda ke pihak luar. Namun, untuk menjalankan fitur tertentu, kami mengintegrasikan layanan pihak ketiga berikut:

* **WeatherAPI:** Untuk mengambil informasi cuaca berdasarkan kota/negara tujuan perjalanan Anda.
* **Groq / OpenAI API:** Untuk menghasilkan itinerary cerdas dan packing list otomatis berdasarkan input destinasi Anda. Data yang dikirimkan hanya berupa informasi tujuan dan lama perjalanan, **bukan** informasi identitas pribadi (seperti email atau kata sandi Anda).
* **Leaflet / OpenStreetMap:** Untuk menampilkan peta interaktif di perangkat Anda tanpa membagikan data identitas pribadi.

---

## 4. Penyimpanan dan Keamanan Data

* **Keamanan Server:** Server backend kami dilindungi oleh sistem keamanan standard industri termasuk CORS ketat, Rate Limiting, Helmet security headers, serta enkripsi kata sandi yang kuat.
* **Keamanan Transmisi:** Komunikasi data antara perangkat Anda dan server dilakukan melalui enkripsi API.
* **Penyimpanan Lokal:** Jika Anda menggunakan aplikasi dalam mode offline, data tertentu akan disimpan secara lokal di perangkat Anda menggunakan penyimpanan web (Local Storage / Cache Storage) dan akan disinkronkan kembali saat Anda terhubung ke internet.

---

## 5. Hak Pengguna Atas Data

Anda memiliki kontrol penuh atas data Anda sendiri:
* **Mengedit Data:** Anda dapat mengubah detail profil, rencana perjalanan, dan anggaran kapan saja melalui antarmuka aplikasi.
* **Menghapus Akun:** Anda berhak meminta penghapusan akun beserta seluruh data perjalanan Anda dari database kami dengan menghubungi tim pengembang atau melalui fitur yang tersedia di dalam aplikasi.

---

## 6. Perubahan pada Kebijakan Privasi Ini

Kami dapat memperbarui Kebijakan Privasi kami dari waktu ke waktu. Kami akan memberi tahu Anda tentang perubahan apa pun dengan mengunggah Kebijakan Privasi baru di halaman ini atau mengirimkan notifikasi di dalam aplikasi. Anda disarankan untuk meninjau Kebijakan Privasi ini secara berkala untuk mengetahui perubahan apa pun.

---

## 7. Hubungi Kami

Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi pengembang aplikasi SmartTravel Planner melalui:
* **Email:** support@smarttravel.com (atau email administrasi proyek Anda)
* **GitHub Repository:** [Habib-prdtr/SmartTravel](https://github.com/Habib-prdtr/SmartTravel)
