import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { History as HistoryIcon, ChevronRight, Trash2 } from "lucide-react";
import { getTripHistory, getTrips, deleteTripPermanent, clearAllHistory } from "../lib/api";
import { Link, useNavigate } from "react-router-dom";

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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFetchingPage, setIsFetchingPage] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, tripId: null, tripName: "" });
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const openDetails = (trip) => {
    navigate(`/history/${trip.id}`);
  };

  const confirmDelete = (tripId, tripName) => {
    setDeleteConfirm({ show: true, tripId, tripName });
  };

  const executeDelete = async () => {
    if (!deleteConfirm.tripId) return;
    setIsDeleting(true);
    try {
      if (deleteConfirm.tripId === 'ALL') {
        await clearAllHistory();
        setPage(1);
      } else {
        await deleteTripPermanent(deleteConfirm.tripId);
      }
      setDeleteConfirm({ show: false, tripId: null, tripName: "" });
      fetchHistoryPage(deleteConfirm.tripId === 'ALL' ? 1 : page);
    } catch (error) {
      setErrorMessage(error.message || "Gagal menghapus history");
      setDeleteConfirm({ show: false, tripId: null, tripName: "" });
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadTripOverview() {
      setIsLoadingTrips(true);
      setErrorMessage("");
      try {
        const [activeRows, historyResponse] = await Promise.all([getTrips(), getTripHistory(1)]);
        if (!isMounted) return;
        setActiveTrips(activeRows);
        setHistoryTrips(historyResponse.data || []);
        setTotalPages(historyResponse.meta?.totalPages || 1);
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

  const fetchHistoryPage = async (newPage) => {
    setIsFetchingPage(true);
    try {
      const historyResponse = await getTripHistory(newPage);
      setHistoryTrips(historyResponse.data || []);
      setPage(newPage);
      setTotalPages(historyResponse.meta?.totalPages || 1);
    } catch (error) {
      setErrorMessage(error.message || "Gagal memuat halaman history");
    } finally {
      setIsFetchingPage(false);
    }
  };

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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                History <span style={{ backgroundColor: "#fef2f2", color: "#ef4444", padding: "2px 8px", borderRadius: "12px", fontSize: "0.85rem" }}>{historyTrips.length}</span>
              </h2>
              {historyTrips.length > 0 && (
                <button type="button" onClick={() => confirmDelete('ALL', 'Semua History')} className="btn btn-secondary" style={{ padding: "0.4rem 0.9rem", fontSize: "0.85rem", borderRadius: "20px", cursor: "pointer", backgroundColor: "#fee2e2", color: "#ef4444", border: "1px solid #fca5a5", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Trash2 size={16} /> Bersihkan
                </button>
              )}
            </div>
            {historyTrips.length === 0 ? (
              <p className="text-muted" style={{ margin: 0 }}>
                Belum ada planner di history.
              </p>
            ) : (
              <>
                {historyTrips.map((trip) => (
                  <div key={trip.id} style={{ padding: "1rem 0", borderTop: "1px solid var(--border-color)", opacity: isFetchingPage ? 0.5 : 1 }}>
                    <strong style={{ display: "block", marginBottom: "0.3rem", fontSize: "1.05rem", color: "var(--text-muted)" }}>{trip.name}</strong>
                    <span className="text-muted" style={{ display: "block", fontSize: "0.9rem", marginBottom: "0.5rem" }}>{trip.destination}</span>
                    <span style={{ display: "inline-block", fontSize: "0.8rem", color: "#ef4444", backgroundColor: "#fef2f2", padding: "2px 8px", borderRadius: "4px", marginBottom: "0.75rem" }}>
                      Dihapus: {formatDate(trip.deleted_at)}
                    </span>
                    <br />
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button type="button" onClick={() => openDetails(trip)} className="btn btn-secondary" style={{ padding: "0.3rem 0.75rem", fontSize: "0.85rem", borderRadius: "20px", cursor: "pointer", flex: 1 }}>
                        Lihat Detail
                      </button>
                      <button type="button" onClick={() => confirmDelete(trip.id, trip.name)} className="btn btn-secondary" style={{ padding: "0.3rem 0.75rem", fontSize: "0.85rem", borderRadius: "20px", cursor: "pointer", backgroundColor: "#fee2e2", color: "#ef4444", border: "1px solid #fca5a5" }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {totalPages > 1 && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}>
                    <button 
                      onClick={() => fetchHistoryPage(page - 1)} 
                      disabled={page === 1 || isFetchingPage}
                      className="btn btn-secondary" 
                      style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? "not-allowed" : "pointer" }}
                    >
                      Sebelumnya
                    </button>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      Hal {page} dari {totalPages}
                    </span>
                    <button 
                      onClick={() => fetchHistoryPage(page + 1)} 
                      disabled={page === totalPages || isFetchingPage}
                      className="btn btn-secondary" 
                      style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", opacity: page === totalPages ? 0.5 : 1, cursor: page === totalPages ? "not-allowed" : "pointer" }}
                    >
                      Selanjutnya
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {deleteConfirm.show && createPortal(
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" }}>
          <div className="card" style={{ padding: "2rem", maxWidth: "400px", width: "100%", borderRadius: "var(--radius-lg)" }}>
            <h3 style={{ marginTop: 0, marginBottom: "1rem", color: "#ef4444", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Trash2 size={20} /> Konfirmasi Hapus
            </h3>
            <p style={{ margin: "0 0 1.5rem 0", color: "var(--text-color)", lineHeight: "1.5" }}>
              Yakin ingin menghapus secara permanen history untuk <strong>"{deleteConfirm.tripName}"</strong>? Data ini tidak dapat dikembalikan.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setDeleteConfirm({ show: false, tripId: null, tripName: "" })}
                disabled={isDeleting}
              >
                Batal
              </button>
              <button 
                className="btn btn-primary" 
                style={{ backgroundColor: "#ef4444", borderColor: "#ef4444" }}
                onClick={executeDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Menghapus..." : "Hapus Permanen"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
