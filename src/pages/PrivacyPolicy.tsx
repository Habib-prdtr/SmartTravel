import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Eye, Database, Mail, Globe, Sparkles } from "lucide-react";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div 
      className="privacy-page animate-fade-in" 
      style={{ 
        padding: "3rem 1.5rem 5rem 1.5rem", 
        maxWidth: "900px", 
        margin: "0 auto" 
      }}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          color: "var(--text-muted)",
          fontWeight: 600,
          fontSize: "0.95rem",
          marginBottom: "2rem",
          padding: "0.5rem 1rem",
          borderRadius: "var(--radius-full)",
          border: "1px solid var(--border-color)",
          backgroundColor: "var(--surface)",
          transition: "var(--transition)",
          boxShadow: "var(--shadow-sm)"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--primary)";
          e.currentTarget.style.borderColor = "var(--primary-light)";
          e.currentTarget.style.transform = "translateX(-4px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--text-muted)";
          e.currentTarget.style.borderColor = "var(--border-color)";
          e.currentTarget.style.transform = "translateX(0)";
        }}
      >
        <ArrowLeft size={16} /> Kembali
      </button>

      {/* Header */}
      <header style={{ marginBottom: "3rem", textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <span 
            className="badge" 
            style={{ 
              backgroundColor: "var(--primary-soft)", 
              color: "var(--primary)", 
              borderColor: "rgba(59, 130, 246, 0.2)",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.35rem 0.75rem",
              borderRadius: "var(--radius-full)",
              fontSize: "0.85rem",
              fontWeight: 600,
              border: "1px solid"
            }}
          >
            <Shield size={14} /> Dokumen Legal
          </span>
        </div>
        <h1 
          className="brand-text-styled" 
          style={{ 
            fontSize: "2.5rem", 
            fontWeight: 800, 
            lineHeight: 1.1,
            display: "block",
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: "-0.02em",
            marginBottom: "1rem"
          }}
        >
          <span className="smart" style={{ display: "inline" }}>Kebijakan </span>
          <span className="travel" style={{ display: "inline", background: "linear-gradient(135deg, var(--primary), var(--secondary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Privasi</span>
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.05rem" }}>
          Terakhir Diperbarui: 15 Juli 2026 • Kebijakan ini menjelaskan bagaimana SmartTravel mengamankan data Anda.
        </p>
      </header>

      {/* Quick Summary Grid */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.25rem", color: "var(--text-main)" }}>
          Pilar Keamanan & Privasi Kami
        </h2>
        <div 
          style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
            gap: "1.5rem" 
          }}
        >
          <div className="card" style={{ display: "flex", gap: "1rem", alignItems: "flex-start", padding: "1.25rem" }}>
            <div style={{ padding: "0.6rem", borderRadius: "10px", backgroundColor: "#eff6ff", color: "#3b82f6", display: "flex" }}>
              <Lock size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.35rem" }}>Data Terenkripsi</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>
                Password Anda dienkripsi satu arah dengan `bcryptjs` dan sesi diamankan menggunakan token JWT.
              </p>
            </div>
          </div>

          <div className="card" style={{ display: "flex", gap: "1rem", alignItems: "flex-start", padding: "1.25rem" }}>
            <div style={{ padding: "0.6rem", borderRadius: "10px", backgroundColor: "#ecfdf5", color: "#10b981", display: "flex" }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.35rem" }}>AI Tanpa Identitas</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>
                Rekomendasi itinerary dibuat oleh AI tanpa mengirimkan email atau data identitas pribadi Anda.
              </p>
            </div>
          </div>

          <div className="card" style={{ display: "flex", gap: "1rem", alignItems: "flex-start", padding: "1.25rem" }}>
            <div style={{ padding: "0.6rem", borderRadius: "10px", backgroundColor: "#fff7ed", color: "#f97316", display: "flex" }}>
              <Database size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.35rem" }}>Kontrol Penuh</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>
                Anda memiliki kendali mutlak untuk mengubah rencana perjalanan atau menghapus akun Anda kapan saja.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Box */}
      <div 
        className="card" 
        style={{ 
          padding: "2.5rem", 
          lineHeight: "1.7", 
          color: "var(--text-main)", 
          fontSize: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "2rem"
        }}
      >
        <section>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "0.75rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
            1. Informasi yang Kami Kumpulkan
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
            Untuk memberikan layanan perencana perjalanan terbaik, kami mengumpulkan beberapa data berikut:
          </p>
          <ul style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem", color: "var(--text-muted)" }}>
            <li>
              <strong>Informasi Pendaftaran Akun:</strong> Alamat email, nama pengguna, dan kata sandi yang dienkripsi secara aman saat registrasi.
            </li>
            <li>
              <strong>Data Perjalanan & Rencana:</strong> Detail destinasi liburan, rentang tanggal, jadwal harian, dan barang-barang bawaan yang Anda susun.
            </li>
            <li>
              <strong>Keuangan Perjalanan:</strong> Anggaran utama dan pencatatan pengeluaran liburan (akomodasi, makanan, transportasi, dll).
            </li>
            <li>
              <strong>Data Teknis:</strong> Detail browser, sistem operasi perangkat, dan data destinasi pencarian untuk memproses peta geografis serta prakiraan cuaca.
            </li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "0.75rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
            2. Bagaimana Kami Menggunakan Data Anda
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
            Kami memproses informasi Anda dengan tujuan utama untuk menjalankan aplikasi SmartTravel secara optimal:
          </p>
          <ul style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem", color: "var(--text-muted)" }}>
            <li>Menyinkronkan data rencana liburan Anda antara server database (MySQL) dan perangkat Anda.</li>
            <li>Mengirim informasi destinasi ke mesin kecerdasan buatan (Groq/OpenAI) guna menyusun itinerary liburan secara otomatis.</li>
            <li>Mengirim kota/negara tujuan Anda ke <strong>WeatherAPI</strong> untuk menyajikan prakiraan cuaca secara langsung.</li>
            <li>Menyimpan cache rencana perjalanan Anda di dalam memori perangkat melalui teknologi PWA (Service Workers) agar dapat dibuka saat tanpa internet.</li>
            <li>Mendeteksi serta mencegah aktivitas mencurigakan atau penyalahgunaan kuota API (Rate Limiter).</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "0.75rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
            3. Integrasi & Pembagian Data Pihak Ketiga
          </h2>
          <p style={{ color: "var(--text-muted)" }}>
            Kami berkomitmen penuh untuk tidak pernah menjual data pribadi Anda. Namun, demi menunjang fitur cerdas di aplikasi, kami terhubung dengan penyedia pihak ketiga:
          </p>
          <ul style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
            <li>
              <strong>WeatherAPI:</strong> Kami mengirimkan nama kota/negara tujuan untuk menarik data perkiraan cuaca lokal secara real-time.
            </li>
            <li>
              <strong>Groq / OpenAI API:</strong> Kami mengirimkan detail perjalanan (tanpa informasi identitas sensitif seperti nama atau email) untuk menghasilkan rekomendasi itinerary dan barang bawaan liburan Anda.
            </li>
            <li>
              <strong>Leaflet / OpenStreetMap:</strong> Menyajikan visualisasi peta wisata secara statis dan dinamis langsung di sisi client (browser).
            </li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "0.75rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
            4. Keamanan dan Penyimpanan Data
          </h2>
          <p style={{ color: "var(--text-muted)" }}>
            Data Anda disimpan di server backend yang terlindungi dengan standar keamanan tinggi (CORS, Helmet, Rate Limiter) serta dienkripsi saat transit. Seluruh kata sandi dilindungi menggunakan hash satu arah (`bcryptjs`).
          </p>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
            Selain di server database, data rencana Anda tersimpan secara lokal menggunakan Local Storage dan Cache Storage pada browser Anda guna mendukung fitur akses offline.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "0.75rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
            5. Hak Pengguna atas Data
          </h2>
          <p style={{ color: "var(--text-muted)" }}>
            Anda memiliki kontrol penuh atas akun Anda. Anda berhak memperbarui, mengedit, atau menghapus seluruh catatan liburan, daftar budget, hingga akun pengguna Anda sepenuhnya dari database kami kapan saja melalui menu pengaturan profil yang telah disediakan.
          </p>
        </section>

        <section style={{ backgroundColor: "var(--primary-soft)", border: "1px solid rgba(59, 130, 246, 0.15)", padding: "1.25rem", borderRadius: "var(--radius-md)", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
          <div style={{ color: "var(--primary)", marginTop: "0.2rem" }}>
            <Mail size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "0.25rem" }}>
              Hubungi Tim Pengembang
            </h4>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: 0, lineHeight: "1.5" }}>
              Apabila memiliki pertanyaan, masukan, atau permintaan penghapusan akun secara manual, silakan hubungi kami via email di <strong>support@smarttravel.id</strong> atau kunjungi laman repositori resmi proyek di GitHub [Habib-prdtr/SmartTravel](https://github.com/Habib-prdtr/SmartTravel).
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
