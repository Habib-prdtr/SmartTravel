import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { History as HistoryIcon, ChevronRight, X, MapPin, Wallet, Calendar } from "lucide-react";
import { getTripHistory, getTrips, getItineraryDays, getItineraryItems, getBudget, getExpenses } from "../lib/api";
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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFetchingPage, setIsFetchingPage] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const openDetails = async (trip) => {
    setDetailsModalOpen(true);
    setIsLoadingDetails(true);
    try {
      const [days, budget, expenses] = await Promise.all([
        getItineraryDays(trip.id),
        getBudget(trip.id),
        getExpenses(trip.id)
      ]);
      
      const daysWithItems = await Promise.all(
        days.map(async (day) => {
          const items = await getItineraryItems(trip.id, day.id);
          return { ...day, items };
        })
      );
      
      let totalExpense = 0;
      expenses.forEach(exp => {
        totalExpense += Number(exp.amount || 0);
      });

      setSelectedDetails({
        ...trip,
        days: daysWithItems,
        budget: budget ? Number(budget.total_budget || 0) : 0,
        currency: budget ? budget.currency : "IDR",
        totalExpense
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingDetails(false);
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
            <h2 style={{ marginTop: 0, marginBottom: "1rem", fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              History Dihapus <span style={{ backgroundColor: "#fef2f2", color: "#ef4444", padding: "2px 8px", borderRadius: "12px", fontSize: "0.85rem" }}>{historyTrips.length}</span>
            </h2>
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
                    <button type="button" onClick={() => openDetails(trip)} className="btn btn-secondary" style={{ padding: "0.3rem 0.75rem", fontSize: "0.85rem", borderRadius: "20px", display: "inline-block", cursor: "pointer" }}>
                      Lihat Detail
                    </button>
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

      {detailsModalOpen && createPortal(
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div className="animate-fade-in" style={{ width: "100%", maxWidth: "650px", maxHeight: "90vh", display: "flex", flexDirection: "column", backgroundColor: "#ffffff", borderRadius: "24px", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
            
            {/* Header Sticky */}
            <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#ffffff", zIndex: 10 }}>
              <h2 style={{ margin: 0, fontSize: "1.5rem", color: "#0f172a", fontWeight: 700, letterSpacing: "-0.5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {selectedDetails?.name || "Detail Trip"}
              </h2>
              <button 
                type="button" 
                onClick={() => setDetailsModalOpen(false)} 
                style={{ background: "#f8fafc", border: "1px solid #e2e8f0", cursor: "pointer", color: "#64748b", padding: "0.5rem", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease" }}
                onMouseOver={(e) => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.borderColor = "#fecaca"; }}
                onMouseOut={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Body Scrollable */}
            <div style={{ padding: "2rem", overflowY: "auto", backgroundColor: "#f8fafc" }}>
              {isLoadingDetails ? (
                <div style={{ textAlign: "center", padding: "4rem 0", color: "#64748b" }}>
                  <div style={{ display: "inline-block", width: "40px", height: "40px", border: "4px solid #e2e8f0", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                  <p style={{ marginTop: "1rem", fontWeight: 500 }}>Menggali arsip history...</p>
                </div>
              ) : selectedDetails ? (
                <>
                  {/* Overview Cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                    <div style={{ background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", padding: "1.25rem", borderRadius: "16px", border: "1px solid #bfdbfe", boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.05)" }}>
                      <div style={{ color: "#3b82f6", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}><MapPin size={16} /> Destinasi</div>
                      <div style={{ color: "#1e293b", fontWeight: 700, fontSize: "1.1rem" }}>{selectedDetails.destination}</div>
                    </div>
                    
                    <div style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)", padding: "1.25rem", borderRadius: "16px", border: "1px solid #bbf7d0", boxShadow: "0 4px 6px -1px rgba(34, 197, 94, 0.05)" }}>
                      <div style={{ color: "#10b981", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}><Calendar size={16} /> Durasi</div>
                      <div style={{ color: "#1e293b", fontWeight: 700, fontSize: "1.1rem" }}>{selectedDetails.days.length} Hari</div>
                    </div>

                    <div style={{ background: "linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)", padding: "1.25rem", borderRadius: "16px", border: "1px solid #fde68a", boxShadow: "0 4px 6px -1px rgba(245, 158, 11, 0.05)" }}>
                      <div style={{ color: "#f59e0b", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}><Wallet size={16} /> Pengeluaran</div>
                      <div style={{ color: "#1e293b", fontWeight: 700, fontSize: "1.1rem" }}>{selectedDetails.currency} {selectedDetails.totalExpense.toLocaleString("id-ID")}</div>
                      <div style={{ color: "#64748b", fontSize: "0.8rem", marginTop: "0.25rem" }}>dari {selectedDetails.budget.toLocaleString("id-ID")}</div>
                    </div>
                  </div>
                  
                  {/* Itinerary Timeline */}
                  <div style={{ backgroundColor: "#ffffff", padding: "1.5rem", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.02)" }}>
                    <h3 style={{ fontSize: "1.1rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "1rem", marginBottom: "1.5rem", color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ backgroundColor: "#3b82f6", width: "4px", height: "18px", borderRadius: "2px" }}></span> Ringkasan Itinerary
                    </h3>
                    
                    {selectedDetails.days.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8", backgroundColor: "#f8fafc", borderRadius: "12px" }}>
                        Tidak ada aktivitas yang tercatat.
                      </div>
                    ) : (
                      <div style={{ position: "relative", paddingLeft: "1rem" }}>
                        <div style={{ position: "absolute", left: "1.45rem", top: "0.5rem", bottom: "0.5rem", width: "2px", backgroundColor: "#e2e8f0" }}></div>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                          {selectedDetails.days.map((day) => (
                            <div key={day.id} style={{ position: "relative" }}>
                              <div style={{ position: "absolute", left: "0.25rem", top: "0.3rem", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#3b82f6", border: "2px solid #ffffff", boxShadow: "0 0 0 2px #bfdbfe" }}></div>
                              <div style={{ marginLeft: "2rem" }}>
                                <strong style={{ display: "inline-block", color: "#0f172a", marginBottom: "0.75rem", fontSize: "1rem", backgroundColor: "#f1f5f9", padding: "0.25rem 0.75rem", borderRadius: "20px" }}>
                                  Hari {day.day_number} <span style={{ color: "#64748b", fontWeight: "normal", fontSize: "0.85rem", marginLeft: "0.25rem" }}>• {formatDate(day.date)}</span>
                                </strong>
                                
                                {day.items.length === 0 ? (
                                  <p style={{ margin: 0, paddingLeft: "0.5rem", color: "#94a3b8", fontSize: "0.9rem", fontStyle: "italic" }}>Waktu luang / kosong</p>
                                ) : (
                                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
                                    {day.items.map(item => (
                                      <div key={item.id} style={{ display: "flex", gap: "1rem", alignItems: "flex-start", backgroundColor: "#ffffff", border: "1px solid #f1f5f9", padding: "0.75rem 1rem", borderRadius: "12px", boxShadow: "0 1px 3px 0 rgba(0,0,0,0.02)" }}>
                                        <div style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 600, minWidth: "45px", paddingTop: "0.1rem" }}>
                                          {item.start_time ? String(item.start_time).slice(0, 5) : "--:--"}
                                        </div>
                                        <div>
                                          <div style={{ color: "#1e293b", fontWeight: 600, fontSize: "0.95rem" }}>{item.title}</div>
                                          {item.location_name && <div style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.1rem", display: "flex", alignItems: "center", gap: "4px" }}><MapPin size={12}/> {item.location_name}</div>}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
            {/* Footer Modal */}
            <div style={{ padding: "1.25rem 2rem", borderTop: "1px solid #f1f5f9", backgroundColor: "#ffffff", textAlign: "right" }}>
              <button 
                onClick={() => setDetailsModalOpen(false)}
                style={{ backgroundColor: "#0f172a", color: "white", padding: "0.6rem 1.5rem", borderRadius: "12px", fontSize: "0.95rem", fontWeight: 500, cursor: "pointer", border: "none" }}
              >
                Tutup Arsip
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
