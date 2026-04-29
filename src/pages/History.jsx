import React, { useEffect, useState } from "react";
import { History as HistoryIcon, ChevronRight } from "lucide-react";
import { getTripHistory, getTrips } from "../lib/api";
import { Link } from "react-router-dom";

function formatDate(dateValue) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", { dateStyle: "medium" });
}

export default function History() {
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
    <div className="container" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
        <Link to="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Home</Link> <ChevronRight size={14} /> <span style={{ color: "var(--primary)", fontWeight: 500 }}>History</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "2rem" }}>
        <HistoryIcon size={28} color="var(--primary)" />
        <h1 style={{ margin: 0, fontSize: "2rem", letterSpacing: "-0.5px" }}>History Planner</h1>
      </div>

      {errorMessage && (
        <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: "0.9rem" }}>
          {errorMessage}
        </div>
      )}

      {isLoadingTrips ? (
        <p className="text-muted">Memuat history planner...</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
          <div className="card" style={{ padding: "1.5rem" }}>
            <h2 style={{ marginTop: 0, marginBottom: "1rem", fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              Planner Aktif <span style={{ backgroundColor: "var(--primary-soft)", color: "var(--primary)", padding: "2px 8px", borderRadius: "12px", fontSize: "0.85rem" }}>{activeTrips.length}</span>
            </h2>
            {activeTrips.length === 0 ? (
              <p className="text-muted" style={{ margin: 0 }}>
                Belum ada planner aktif.
              </p>
            ) : (
              activeTrips.map((trip) => (
                <div key={trip.id} style={{ padding: "1rem 0", borderTop: "1px solid var(--border-color)" }}>
                  <strong style={{ display: "block", marginBottom: "0.3rem", fontSize: "1.05rem" }}>{trip.name}</strong>
                  <span className="text-muted" style={{ display: "block", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                    {trip.destination}
                  </span>
                  <Link to="/planner" state={{ trip: { id: trip.id } }} className="btn btn-secondary" style={{ padding: "0.3rem 0.75rem", fontSize: "0.85rem", borderRadius: "20px", display: "inline-block", textDecoration: "none" }}>
                    Buka Planner
                  </Link>
                </div>
              ))
            )}
          </div>

          <div className="card" style={{ padding: "1.5rem" }}>
            <h2 style={{ marginTop: 0, marginBottom: "1rem", fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              History Dihapus <span style={{ backgroundColor: "#fef2f2", color: "#ef4444", padding: "2px 8px", borderRadius: "12px", fontSize: "0.85rem" }}>{historyTrips.length}</span>
            </h2>
            {historyTrips.length === 0 ? (
              <p className="text-muted" style={{ margin: 0 }}>
                Belum ada planner di history.
              </p>
            ) : (
              historyTrips.map((trip) => (
                <div key={trip.id} style={{ padding: "1rem 0", borderTop: "1px solid var(--border-color)" }}>
                  <strong style={{ display: "block", marginBottom: "0.3rem", fontSize: "1.05rem", color: "var(--text-muted)" }}>{trip.name}</strong>
                  <span className="text-muted" style={{ display: "block", fontSize: "0.9rem" }}>{trip.destination}</span>
                  <span style={{ display: "inline-block", marginTop: "0.5rem", fontSize: "0.8rem", color: "#ef4444", backgroundColor: "#fef2f2", padding: "2px 8px", borderRadius: "4px" }}>
                    Dihapus: {formatDate(trip.deleted_at)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
