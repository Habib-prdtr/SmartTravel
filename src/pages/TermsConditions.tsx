import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Scale, ShieldAlert, UserCheck, AlertTriangle, Cpu, Globe } from "lucide-react";

export default function TermsConditions() {
  const navigate = useNavigate();

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div 
      className="terms-page animate-fade-in" 
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
            <Scale size={14} /> Aturan & Ketentuan
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
          <span className="smart" style={{ display: "inline" }}>Syarat & </span>
          <span className="travel" style={{ display: "inline", background: "linear-gradient(135deg, var(--primary), var(--secondary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Ketentuan</span>
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.05rem" }}>
          Terakhir Diperbarui: 15 Juli 2026 • Harap baca ketentuan penggunaan layanan SmartTravel berikut secara seksama.
        </p>
      </header>

      {/* Quick Summary Grid */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.25rem", color: "var(--text-main)" }}>
          Ringkasan Aturan Penggunaan
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
              <UserCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.35rem" }}>Tanggung Jawab Akun</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>
                Anda bertanggung jawab penuh atas keamanan kata sandi Anda dan seluruh aktivitas perjalanan yang dibuat.
              </p>
            </div>
          </div>

          <div className="card" style={{ display: "flex", gap: "1rem", alignItems: "flex-start", padding: "1.25rem" }}>
            <div style={{ padding: "0.6rem", borderRadius: "10px", backgroundColor: "#fff7ed", color: "#f97316", display: "flex" }}>
              <Cpu size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.35rem" }}>Penggunaan AI</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>
                Pembuatan itinerary menggunakan AI (Groq/OpenAI) tunduk pada kuota batas wajar guna menghindari penyalahgunaan.
              </p>
            </div>
          </div>

          <div className="card" style={{ display: "flex", gap: "1rem", alignItems: "flex-start", padding: "1.25rem" }}>
            <div style={{ padding: "0.6rem", borderRadius: "10px", backgroundColor: "#fef2f2", color: "#ef4444", display: "flex" }}>
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.35rem" }}>Batasan Tanggung Jawab</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>
                Hasil rekomendasi AI, cuaca, dan navigasi peta adalah estimasi. Kami tidak bertanggung jawab atas kendala di lapangan.
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
            1. Penerimaan Ketentuan
          </h2>
          <p style={{ color: "var(--text-muted)" }}>
            Dengan mengakses atau menggunakan aplikasi SmartTravel Planner, Anda menyatakan telah membaca, memahami, dan menyetujui untuk terikat dengan seluruh syarat dan ketentuan penggunaan ini. Jika Anda tidak menyetujui sebagian atau seluruh ketentuan ini, Anda tidak diperkenankan menggunakan layanan kami.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "0.75rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
            2. Deskripsi Layanan
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "0.5rem" }}>
            SmartTravel Planner menyediakan platform digital untuk membantu menyusun rencana perjalanan liburan, meliputi:
          </p>
          <ul style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem", color: "var(--text-muted)" }}>
            <li>Pembuatan rencana perjalanan harian otomatis memanfaatkan kecerdasan buatan (AI).</li>
            <li>Peta lokasi interaktif (Leaflet) dan informasi cuaca destinasi (WeatherAPI).</li>
            <li>Pencatatan pengeluaran harian dan pengelolaan anggaran (Budgeting).</li>
            <li>Kemampuan menyimpan data rencana secara offline (PWA) di perangkat Anda.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "0.75rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
            3. Akun Pengguna & Keamanan
          </h2>
          <p style={{ color: "var(--text-muted)" }}>
            Untuk menggunakan fitur perencana, Anda diwajibkan mendaftar akun. Anda berkewajiban menjaga kerahasiaan informasi akun dan kata sandi Anda. Anda menyetujui untuk bertanggung jawab penuh atas segala aktivitas yang terjadi di bawah akun Anda. SmartTravel tidak bertanggung jawab atas kerugian akibat kelalaian Anda menjaga kerahasiaan data kredensial akun.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "0.75rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
            4. Kebijakan Penggunaan Wajar Fitur AI
          </h2>
          <p style={{ color: "var(--text-muted)" }}>
            Fitur penyusun rencana otomatis menggunakan API berbasis kecerdasan buatan (Groq/OpenAI) yang didanai secara mandiri. Kami memberlakukan pembatasan kuota pembuatan rencana harian (Rate Limiter). Pengguna dilarang keras melakukan manipulasi data, melakukan panggilan API berulang secara otomatis menggunakan skrip (bot), atau tindakan apa pun yang bertujuan mengeksploitasi sistem AI kami. Pelanggaran terhadap ketentuan ini akan mengakibatkan pemblokiran akun secara permanen.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "0.75rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
            5. Pelepasan Tanggung Jawab (Disclaimer)
          </h2>
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fee2e2", borderRadius: "10px", padding: "1.25rem", color: "#b91c1c", marginBottom: "1rem", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
            <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: "0.2rem" }} />
            <div style={{ fontSize: "0.95rem", lineHeight: 1.5 }}>
              <strong>Perhatian Penting bagi Pengguna:</strong>
              <br />
              Seluruh rekomendasi jadwal perjalanan, rute wisata pada peta Leaflet, estimasi pengeluaran keuangan, serta prakiraan cuaca dari WeatherAPI adalah hasil kalkulasi dan proyeksi perkiraan (estimasi). SmartTravel tidak menjamin keakuratan 100% dari data-data tersebut di dunia nyata.
            </div>
          </div>
          <p style={{ color: "var(--text-muted)" }}>
            Kami tidak bertanggung jawab atas kerugian fisik, finansial, jadwal yang meleset, kecelakaan, atau ketidaknyamanan apa pun yang dialami oleh pengguna selama melakukan perjalanan nyata dengan mengandalkan data dari aplikasi ini. Pengguna disarankan tetap melakukan validasi mandiri terhadap kondisi lapangan sesungguhnya.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "0.75rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
            6. Hak Kekayaan Intelektual
          </h2>
          <p style={{ color: "var(--text-muted)" }}>
            Seluruh aset visual, desain UI/UX, logo, kode sumber frontend dan backend, serta basis data SmartTravel Planner dilindungi oleh hukum hak cipta. Pengguna dilarang menyalin, mendistribusikan ulang, atau mengomersialkan aset-aset tersebut tanpa persetujuan tertulis dari pengembang SmartTravel Planner.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "0.75rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
            7. Perubahan Syarat dan Hukum
          </h2>
          <p style={{ color: "var(--text-muted)" }}>
            Kami berhak untuk mengubah atau memperbarui Syarat & Ketentuan ini sewaktu-waktu tanpa pemberitahuan tertulis sebelumnya. Perubahan akan berlaku sejak diunggah ke dalam aplikasi. Penggunaan platform secara berkelanjutan setelah perubahan dianggap sebagai persetujuan Anda terhadap ketentuan baru. Syarat & Ketentuan ini diatur dan ditafsirkan sesuai hukum Negara Republik Indonesia.
          </p>
        </section>
      </div>
    </div>
  );
}
