import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Calendar, LogOut, Map, Activity } from "lucide-react";
import { getMe, getTrips } from "../lib/api";
import { clearSession } from "../lib/session";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        // Fetch user data and trips concurrently
        const [userData, tripsData] = await Promise.all([
          getMe(),
          getTrips()
        ]);
        
        if (isMounted) {
          setUser(userData);
          setTrips(tripsData);
        }
      } catch (err) {
        if (isMounted) {
          setError("Gagal memuat profil: " + err.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    if (window.confirm("Apakah kamu yakin ingin keluar?")) {
      clearSession();
      // Dispatch storage event to notify Navbar and other components
      window.dispatchEvent(new Event("storage"));
      navigate("/auth");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="container" style={{ paddingTop: "4rem", textAlign: "center" }}>
        <p className="text-muted" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
          <Activity size={20} className="animate-pulse" style={{ animation: "spin 2s linear infinite" }} />
          Memuat data profil...
        </p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container" style={{ paddingTop: "4rem" }}>
        <div className="card" style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: "#b91c1c", marginBottom: "1rem" }}>{error || "Data user tidak ditemukan."}</p>
          <button className="btn btn-secondary" onClick={handleLogout}>Kembali ke Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        
        {/* Header Profile */}
        <div className="card" style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1.5rem", padding: "2rem" }}>
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%",
            backgroundColor: "var(--primary-soft)", color: "var(--primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "2rem", fontWeight: "bold", border: "2px solid var(--primary-light)"
          }}>
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem", color: "var(--text-main)" }}>{user.name}</h1>
            <p style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", marginBottom: "0.25rem" }}>
              <Mail size={16} /> {user.email}
            </p>
            <p style={{ color: "var(--text-light)", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}>
              <Calendar size={15} /> Bergabung sejak {formatDate(user.created_at)}
            </p>
          </div>
        </div>

        {/* Statistics / Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
          <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "var(--radius-md)", backgroundColor: "var(--primary-soft)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Map size={24} />
            </div>
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", marginBottom: "0.15rem" }}>Total Trip</p>
              <h2 style={{ fontSize: "1.5rem", margin: 0, color: "var(--text-main)", lineHeight: 1 }}>{trips.length}</h2>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "var(--text-main)" }}>Pengaturan Akun</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            Klik tombol di bawah ini jika kamu ingin keluar dari sesi aplikasi saat ini.
          </p>
          <button 
            className="btn" 
            onClick={handleLogout}
            style={{ 
              width: "100%", 
              backgroundColor: "#fee2e2", 
              color: "#b91c1c", 
              border: "1px solid #fca5a5",
              justifyContent: "center"
            }}
          >
            <LogOut size={18} /> Keluar (Logout)
          </button>
        </div>

      </div>
    </div>
  );
}
