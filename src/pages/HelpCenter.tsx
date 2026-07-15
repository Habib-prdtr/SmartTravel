import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp, Search, Calendar, Wallet, WifiOff, FileText, User } from "lucide-react";

export default function HelpCenter() {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const toggleFaq = (index) => {
    if (activeFaq === index) {
      setActiveFaq(null);
    } else {
      setActiveFaq(index);
    }
  };

  const faqs = [
    {
      category: "Perencanaan & AI",
      icon: <Calendar size={18} />,
      question: "Bagaimana cara kerja penyusunan itinerary otomatis dengan AI?",
      answer: "Kami menghubungkan aplikasi dengan mesin kecerdasan buatan (Groq/OpenAI). Saat Anda membuat rencana perjalanan baru, AI akan memproses destinasi dan durasi liburan Anda untuk merumuskan jadwal harian per jam yang optimal beserta daftar bawaan (packing list) yang relevan secara otomatis."
    },
    {
      category: "Akses Offline",
      icon: <WifiOff size={18} />,
      question: "Apakah aplikasi ini bisa digunakan saat tidak ada koneksi internet (offline)?",
      answer: "Ya! SmartTravel Planner didesain menggunakan teknologi Progressive Web App (PWA). Ketika Anda terhubung ke internet, rencana perjalanan akan disinkronkan ke database server. Saat offline, Service Worker kami akan memuat data cache lokal sehingga Anda tetap dapat melihat jadwal perjalanan, peta dasar, dan daftar anggaran."
    },
    {
      category: "Manajemen Keuangan",
      icon: <Wallet size={18} />,
      question: "Bagaimana cara kerja kalkulator anggaran dan pelacak pengeluaran?",
      answer: "Di dasbor 'Budget', Anda dapat memasukkan anggaran utama perjalanan Anda. Setiap kali melakukan pengeluaran selama liburan (seperti makan, tiket, atau hotel), Anda bisa menambahkannya sebagai pos pengeluaran. Sistem akan otomatis menghitung sisa dana Anda serta memvisualisasikan persentase pemakaian dalam grafik persentase."
    },
    {
      category: "Fitur Cetak & Ekspor",
      icon: <FileText size={18} />,
      question: "Bagaimana cara mencetak rencana perjalanan saya ke kertas atau dokumen PDF?",
      answer: "Kami telah menyertakan CSS media cetak khusus di aplikasi. Saat berada di halaman detail rencana perjalanan Anda, gunakan tombol cetak bawaan browser Anda (misalnya menekan tombol Ctrl + P di keyboard Anda pada Windows). Tampilan cetak akan otomatis merapikan tata letak, menyembunyikan navigasi, tombol edit, dan menghasilkan dokumen cetak yang bersih untuk dibawa berlibur."
    },
    {
      category: "Akun & Keamanan",
      icon: <User size={18} />,
      question: "Apakah kata sandi dan email saya aman di platform ini?",
      answer: "Tentu saja. Kami mengutamakan keamanan dengan mengenkripsi kata sandi menggunakan hash satu arah (`bcryptjs`) di server database MySQL. Sesi masuk Anda dilindungi secara kriptografis menggunakan token JWT (JSON Web Token), dan server kami dilengkapi pengaman Helmet dan pembatasan frekuensi akses (Rate Limiter)."
    },
    {
      category: "Akun & Keamanan",
      icon: <User size={18} />,
      question: "Bagaimana cara menghapus akun dan seluruh data liburan saya?",
      answer: "Anda dapat menghapus seluruh rencana perjalanan langsung dari dasbor riwayat. Jika ingin menghapus akun beserta seluruh database data pribadi Anda secara permanen, Anda dapat mengeklik opsi 'Hapus Akun' pada tab Profil Anda, atau hubungi tim bantuan kami melalui email support@smarttravel.id."
    }
  ];

  // Filter FAQs based on search query
  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className="help-page animate-fade-in" 
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
            <HelpCircle size={14} /> Pusat Bantuan FAQ
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
          <span className="smart" style={{ display: "inline" }}>Ada yang Bisa </span>
          <span className="travel" style={{ display: "inline", background: "linear-gradient(135deg, var(--primary), var(--secondary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Kami Bantu?</span>
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.05rem" }}>
          Temukan jawaban atas pertanyaan umum terkait penggunaan fitur SmartTravel Planner di bawah ini.
        </p>
      </header>

      {/* FAQ Search Bar */}
      <section style={{ marginBottom: "2.5rem" }}>
        <div style={{ position: "relative", width: "100%" }}>
          <Search 
            size={20} 
            style={{ 
              position: "absolute", 
              left: "1.25rem", 
              top: "50%", 
              transform: "translateY(-50%)", 
              color: "var(--text-light)" 
            }} 
          />
          <input
            type="text"
            placeholder="Cari solusi atau pertanyaan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "1rem 1.25rem 1rem 3.25rem",
              borderRadius: "var(--radius-lg)",
              border: "1.5px solid var(--border-color)",
              backgroundColor: "var(--surface)",
              color: "var(--text-main)",
              fontSize: "1.05rem",
              boxShadow: "var(--shadow-sm)"
            }}
          />
        </div>
      </section>

      {/* FAQ Accordion List */}
      <section style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div 
                key={index} 
                className="card" 
                style={{ 
                  padding: 0, 
                  overflow: "hidden",
                  border: isOpen ? "1px solid rgba(59, 130, 246, 0.25)" : "1px solid var(--border-color)",
                  boxShadow: isOpen ? "var(--shadow-soft)" : "var(--shadow-sm)",
                  transition: "var(--transition)"
                }}
              >
                {/* Header/Question tab */}
                <button
                  onClick={() => toggleFaq(index)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                    backgroundColor: "transparent",
                    color: "var(--text-main)",
                    cursor: "pointer"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div 
                      style={{ 
                        color: isOpen ? "var(--primary)" : "var(--text-muted)", 
                        display: "flex", 
                        flexShrink: 0 
                      }}
                    >
                      {faq.icon}
                    </div>
                    <span 
                      style={{ 
                        fontWeight: 600, 
                        fontSize: "1.05rem",
                        color: isOpen ? "var(--primary)" : "var(--text-main)"
                      }}
                    >
                      {faq.question}
                    </span>
                  </div>
                  <div style={{ color: "var(--text-light)" }}>
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>

                {/* Answer Box */}
                {isOpen && (
                  <div 
                    style={{ 
                      padding: "0 1.5rem 1.5rem 3rem", 
                      fontSize: "0.95rem", 
                      color: "var(--text-muted)", 
                      lineHeight: "1.6",
                      borderTop: "1px solid var(--border-color)",
                      paddingTop: "1.25rem",
                      backgroundColor: "var(--glass-pill-bg)"
                    }}
                  >
                    <span 
                      style={{ 
                        fontSize: "0.75rem", 
                        textTransform: "uppercase", 
                        fontWeight: 700, 
                        letterSpacing: "1px", 
                        color: "var(--primary)",
                        display: "block",
                        marginBottom: "0.5rem"
                      }}
                    >
                      Kategori: {faq.category}
                    </span>
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div 
            className="card" 
            style={{ 
              textAlign: "center", 
              padding: "3rem 1.5rem", 
              color: "var(--text-muted)" 
            }}
          >
            <HelpCircle size={40} style={{ margin: "0 auto 1rem", color: "var(--text-light)" }} />
            <h3 style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: "0.35rem" }}>Hasil Tidak Ditemukan</h3>
            <p style={{ fontSize: "0.9rem", margin: 0 }}>
              Coba cari dengan kata kunci lain (seperti "AI", "offline", atau "PDF").
            </p>
          </div>
        )}
      </section>

      {/* Footer Support Info */}
      <section 
        className="card" 
        style={{ 
          marginTop: "3rem", 
          padding: "2rem", 
          textAlign: "center",
          background: "linear-gradient(180deg, var(--surface) 0%, var(--primary-soft) 100%)",
          border: "1px solid rgba(59, 130, 246, 0.1)"
        }}
      >
        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem", color: "var(--text-main)" }}>
          Masih memerlukan bantuan?
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "1.25rem" }}>
          Tim dukungan pengembang kami siap membantu menjawab kendala teknis Anda.
        </p>
        <a 
          href="mailto:support@smarttravel.id"
          className="btn btn-primary"
          style={{ textDecoration: "none" }}
        >
          Hubungi Kami Via Email
        </a>
      </section>
    </div>
  );
}
