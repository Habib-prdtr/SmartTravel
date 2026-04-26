import React, { useEffect, useState } from "react";
import { MapPin, CalendarDays, Wallet, Sparkles, History } from "lucide-react";
import TripForm from "../components/travel/TripForm";
import { getTripHistory, getTrips } from "../lib/api";
import "./Home.css";

function formatDate(dateValue) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", { dateStyle: "medium" });
}

export default function Home() {
  const [activeTrips, setActiveTrips] = useState([]);
  const [historyTrips, setHistoryTrips] = useState([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadTripOverview() {
      setIsLoadingTrips(true);
      setErrorMessage("");
      try {
        const [activeRows, historyRows] = await Promise.all([getTrips(), getTripHistory()]);
        if (!isMounted) return;
        setActiveTrips(activeRows);
        setHistoryTrips(historyRows);
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(error.message || "Gagal memuat riwayat trip");
      } finally {
        if (isMounted) setIsLoadingTrips(false);
      }
    }

    loadTripOverview();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-background" />
        <div className="container hero-container">
          <div className="hero-content">
            <span className="badge">AI-Powered Travel Planner</span>
            <h1 className="hero-title">Rencanakan Liburan Impianmu Secara Otomatis</h1>
            <p className="hero-subtitle">
              SmartTravel membantu menyusun itinerary harian, mencari tempat wisata, dan mengestimasi biaya dengan
              cerdas. Cukup masukkan tujuan dan budgetmu!
            </p>

            <TripForm />
          </div>
        </div>
      </section>

      <section className="features-section container">
        <div className="section-header">
          <span className="badge text-primary" style={{ backgroundColor: "var(--primary-soft)", border: "none", marginBottom: "1rem" }}>
            Fitur Utama
          </span>
          <h2>Mengapa Memilih SmartTravel?</h2>
          <p className="text-muted">Desain cerdas untuk perjalanan yang lebih mudah, efisien, dan terarah.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card card">
            <div className="feature-icon-wrapper" style={{ backgroundColor: "#eff6ff", color: "#3b82f6" }}>
              <Sparkles size={28} />
            </div>
            <h3>Itinerary Otomatis</h3>
            <p>Jadwal harian per jam yang disusun cerdas berdasarkan durasi dan preferensi perjalanan kamu.</p>
          </div>
          <div className="feature-card card">
            <div className="feature-icon-wrapper" style={{ backgroundColor: "#f0fdf4", color: "#22c55e" }}>
              <Wallet size={28} />
            </div>
            <h3>Estimasi Biaya</h3>
            <p>Perhitungkan budget dengan proaktif dan akurat, memastikan tidak ada pengeluaran tak terduga.</p>
          </div>
          <div className="feature-card card">
            <div className="feature-icon-wrapper" style={{ backgroundColor: "#fef2f2", color: "#ef4444" }}>
              <MapPin size={28} />
            </div>
            <h3>Peta Interaktif</h3>
            <p>Navigasi rute optimal wisata kamu dengan peta visual interaktif yang terhubung langsung.</p>
          </div>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: "6rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.2rem" }}>
          <History size={20} color="var(--primary)" />
          <h2 style={{ margin: 0, fontSize: "1.6rem" }}>History Planner</h2>
        </div>

        {errorMessage && (
          <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: "0.9rem" }}>
            {errorMessage}
          </div>
        )}

        {isLoadingTrips ? (
          <p className="text-muted">Memuat history planner...</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
            <div className="card">
              <h3 style={{ marginTop: 0, marginBottom: "0.75rem", fontSize: "1.1rem" }}>Planner Aktif ({activeTrips.length})</h3>
              {activeTrips.length === 0 ? (
                <p className="text-muted" style={{ margin: 0 }}>
                  Belum ada planner aktif.
                </p>
              ) : (
                activeTrips.slice(0, 5).map((trip) => (
                  <div key={trip.id} style={{ padding: "0.6rem 0", borderTop: "1px solid var(--border-color)" }}>
                    <strong style={{ display: "block", marginBottom: "0.2rem" }}>{trip.name}</strong>
                    <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                      {trip.destination}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="card">
              <h3 style={{ marginTop: 0, marginBottom: "0.75rem", fontSize: "1.1rem" }}>History Dihapus ({historyTrips.length})</h3>
              {historyTrips.length === 0 ? (
                <p className="text-muted" style={{ margin: 0 }}>
                  Belum ada planner di history.
                </p>
              ) : (
                historyTrips.slice(0, 8).map((trip) => (
                  <div key={trip.id} style={{ padding: "0.6rem 0", borderTop: "1px solid var(--border-color)" }}>
                    <strong style={{ display: "block", marginBottom: "0.2rem" }}>{trip.name}</strong>
                    <span className="text-muted" style={{ display: "block", fontSize: "0.85rem" }}>{trip.destination}</span>
                    <span className="text-muted" style={{ fontSize: "0.8rem" }}>
                      Dihapus: {formatDate(trip.deleted_at)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
