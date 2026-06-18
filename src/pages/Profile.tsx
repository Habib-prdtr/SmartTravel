import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Calendar, Map, Activity, Edit2, X, CheckCircle2 } from "lucide-react";
import { getMe, getTrips, updateProfile } from "../lib/api";
import { clearSession, saveSession } from "../lib/session";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: "", email: "" });
  const [editError, setEditError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

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

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  };

  const handleEditClick = () => {
    setEditData({ name: user.name, email: user.email });
    setEditError("");
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!editData.name || !editData.email) {
      setEditError("Nama dan email tidak boleh kosong.");
      return;
    }
    try {
      setIsSaving(true);
      setEditError("");
      const res = await updateProfile(editData);
      
      setUser({ ...user, ...res.user });
      saveSession({ token: res.token, user: res.user });
      window.dispatchEvent(new Event("storage"));
      
      setIsEditing(false);
      setSuccessMsg("Profil berhasil diperbarui!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setEditError(err.message || "Gagal memperbarui profil");
    } finally {
      setIsSaving(false);
    }
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
          <button className="btn btn-secondary" onClick={() => navigate("/auth")}>Kembali ke Login</button>
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
              <h1 style={{ fontSize: "1.5rem", margin: 0, color: "var(--text-main)" }}>{user.name}</h1>
              <button className="btn btn-secondary" onClick={handleEditClick} style={{ padding: "0.4rem 0.75rem", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem" }}>
                <Edit2 size={14} /> Edit
              </button>
            </div>
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
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem", animation: "fadeIn 0.2s ease-out" }}>
          <div className="card" style={{ width: "100%", maxWidth: "500px", padding: "1.5rem", animation: "slideUp 0.2s ease-out" }}>
            <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>Edit Profil</h3>
            
            {editError && <div style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.9rem" }}>{editError}</div>}
            
            <div style={{ display: "grid", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.4rem" }}>Nama Pengguna</label>
                <input type="text" value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} style={{ padding: "0.6rem", borderRadius: "8px", border: "1px solid var(--border-color)", width: "100%" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.4rem" }}>Alamat Email</label>
                <input type="email" value={editData.email} onChange={(e) => setEditData({...editData, email: e.target.value})} style={{ padding: "0.6rem", borderRadius: "8px", border: "1px solid var(--border-color)", width: "100%" }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem", justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)} disabled={isSaving}>Batal</button>
              <button type="button" className="btn btn-primary" onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sukses */}
      {successMsg && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem", animation: "fadeIn 0.2s ease-out" }}>
          <div className="card" style={{ width: "100%", maxWidth: "350px", padding: "2.5rem 1.5rem", animation: "slideUp 0.2s ease-out", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#d1fae5", color: "#10b981", marginBottom: "1rem" }}>
              <CheckCircle2 size={36} />
            </div>
            <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--text-main)", fontSize: "1.25rem" }}>Berhasil!</h3>
            <p className="text-muted" style={{ margin: 0, fontSize: "1rem" }}>{successMsg}</p>
          </div>
        </div>
      )}
    </div>
  );
}
