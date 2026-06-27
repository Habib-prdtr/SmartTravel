import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, MapPin, Wallet, Calendar, X } from "lucide-react";
import { getTripById, getItineraryDays, getItineraryItems, getBudget, getExpenses } from "../lib/api";

function formatDate(dateValue) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", { dateStyle: "medium" });
}

export default function HistoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadDetails() {
      try {
        const trip = await getTripById(id);
        const [days, budget, expenses] = await Promise.all([
          getItineraryDays(id),
          getBudget(id),
          getExpenses(id)
        ]);
        
        const daysWithItems = await Promise.all(
          days.map(async (day) => {
            const items = await getItineraryItems(id, day.id);
            return { ...day, items };
          })
        );
        
        let totalExpense = 0;
        expenses.forEach(exp => {
          totalExpense += Number(exp.amount || 0);
        });

        if (isMounted) {
          setDetails({
            ...trip,
            days: daysWithItems,
            budget: budget ? Number(budget.total_budget || 0) : 0,
            currency: budget ? budget.currency : "IDR",
            totalExpense,
            expensesList: expenses
          });
        }
      } catch (err) {
        if (isMounted) setErrorMessage(err.message || "Gagal memuat detail");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadDetails();
    return () => { isMounted = false; };
  }, [id]);

  if (isLoading) {
    return (
      <div className="container animate-fade-in" style={{ paddingTop: "3rem", paddingBottom: "5rem", textAlign: "center" }}>
        <div style={{ display: "inline-block", width: "40px", height: "40px", border: "4px solid var(--border-color)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite", marginTop: "2rem" }}></div>
        <p className="text-muted" style={{ marginTop: "1rem" }}>Memuat detail trip...</p>
      </div>
    );
  }

  if (errorMessage || !details) {
    return (
      <div className="container animate-fade-in" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
        <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", backgroundColor: "var(--surface)", border: "1px solid #fecaca", color: "#b91c1c" }}>
          {errorMessage || "Detail tidak ditemukan"}
        </div>
        <button onClick={() => navigate("/history")} className="btn btn-secondary">Kembali</button>
      </div>
    );
  }

  return (
    <>
      <div className="container animate-fade-in" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
        <Link to="/history" style={{ color: "var(--text-muted)", textDecoration: "none" }}><ChevronLeft size={16} style={{ display: "inline", verticalAlign: "middle" }}/> Kembali ke History</Link>
      </div>

      <h1 style={{ margin: 0, fontSize: "2.2rem", letterSpacing: "-0.5px", marginBottom: "2rem", color: "var(--text-main)" }}>
        {details.name}
      </h1>

      {/* Overview Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "3rem" }}>
        <div style={{ background: "linear-gradient(135deg, var(--primary-soft) 0%, var(--surface) 100%)", padding: "1.25rem", borderRadius: "16px", border: "1px solid var(--border-color)", boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.05)" }}>
          <div style={{ color: "#3b82f6", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}><MapPin size={16} /> Destinasi</div>
          <div style={{ color: "var(--text-main)", fontWeight: 700, fontSize: "1.1rem" }}>{details.destination}</div>
        </div>
        
        <div style={{ background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, var(--surface) 100%)", padding: "1.25rem", borderRadius: "16px", border: "1px solid var(--border-color)", boxShadow: "0 4px 6px -1px rgba(34, 197, 94, 0.05)" }}>
          <div style={{ color: "#10b981", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}><Calendar size={16} /> Durasi</div>
          <div style={{ color: "var(--text-main)", fontWeight: 700, fontSize: "1.1rem" }}>{details.days.length} Hari</div>
        </div>

        <div 
          onClick={() => setExpenseModalOpen(true)}
          style={{ background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, var(--surface) 100%)", padding: "1.25rem", borderRadius: "16px", border: "1px solid var(--border-color)", boxShadow: "0 8px 15px -3px rgba(245, 158, 11, 0.1)", cursor: "pointer", transition: "transform 0.2s" }}
          onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
          onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
        >
          <div style={{ color: "#f59e0b", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            <Wallet size={16} /> Pengeluaran 
            <span style={{fontSize: "0.7rem", backgroundColor: "rgba(245, 158, 11, 0.2)", padding: "2px 8px", borderRadius: "10px", marginLeft: "auto", color: "#f59e0b"}}>Klik Detail</span>
          </div>
          <div style={{ color: "var(--text-main)", fontWeight: 700, fontSize: "1.1rem" }}>{details.currency} {details.totalExpense.toLocaleString("id-ID")}</div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.25rem" }}>dari {details.budget.toLocaleString("id-ID")}</div>
        </div>
      </div>

      {/* Itinerary Timeline */}
      <div style={{ backgroundColor: "var(--surface)", padding: "2rem", borderRadius: "20px", border: "1px solid var(--border-color)", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.02)" }}>
        <h3 style={{ fontSize: "1.2rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem", marginBottom: "2rem", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ backgroundColor: "#3b82f6", width: "4px", height: "18px", borderRadius: "2px" }}></span> Jadwal Perjalanan
        </h3>
        
        {details.days.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
            Belum ada hari yang direncanakan.
          </div>
        ) : (
          <div style={{ position: "relative", paddingLeft: "1rem" }}>
            <div style={{ position: "absolute", left: "1.45rem", top: "0.5rem", bottom: "0.5rem", width: "2px", backgroundColor: "var(--border-color)" }}></div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
              {details.days.map((day) => (
                <div key={day.id} style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: "0.25rem", top: "0.3rem", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#3b82f6", border: "2px solid var(--surface)", boxShadow: "0 0 0 2px var(--primary-soft)" }}></div>
                  <div style={{ marginLeft: "2.5rem" }}>
                    <strong style={{ display: "inline-block", color: "var(--text-main)", marginBottom: "1rem", fontSize: "1.1rem", backgroundColor: "var(--bg-color)", padding: "0.3rem 1rem", borderRadius: "20px", border: "1px solid var(--border-color)" }}>
                      Hari {day.day_number} <span style={{ color: "var(--text-muted)", fontWeight: "normal", fontSize: "0.9rem", marginLeft: "0.5rem" }}>• {formatDate(day.date)}</span>
                    </strong>
                    
                    {day.items.length === 0 ? (
                      <p style={{ margin: 0, paddingLeft: "0.5rem", color: "var(--text-muted)", fontSize: "0.9rem", fontStyle: "italic" }}>Waktu luang / kosong</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.5rem" }}>
                        {day.items.map(item => (
                          <div key={item.id} style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start", backgroundColor: "var(--surface)", border: "1px solid var(--border-color)", padding: "1rem 1.25rem", borderRadius: "12px", boxShadow: "0 1px 3px 0 rgba(0,0,0,0.02)" }}>
                            <div style={{ color: "var(--primary)", fontSize: "0.95rem", fontWeight: 700, minWidth: "55px", paddingTop: "0.1rem" }}>
                              {item.start_time ? String(item.start_time).slice(0, 5) : "--:--"}
                            </div>
                            <div>
                              <div style={{ color: "var(--text-main)", fontWeight: 600, fontSize: "1.05rem" }}>{item.title}</div>
                              {item.location_name && <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.3rem", display: "flex", alignItems: "center", gap: "4px" }}><MapPin size={14}/> {item.location_name}</div>}
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
      </div>
      
      {expenseModalOpen && createPortal(
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(8px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div className="animate-fade-in" style={{ width: "100%", maxWidth: "500px", maxHeight: "80vh", display: "flex", flexDirection: "column", backgroundColor: "var(--surface)", borderRadius: "24px", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)" }}>
            <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--bg-color)" }}>
              <h3 style={{ margin: 0, fontSize: "1.2rem", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.75rem" }}><Wallet size={22} color="#f59e0b" /> Detail Pengeluaran</h3>
              <button onClick={() => setExpenseModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", padding: "4px" }}><X size={20} /></button>
            </div>
            <div style={{ padding: "1.5rem 2rem", overflowY: "auto", flex: 1, minHeight: 0 }}>
              {details.expensesList && details.expensesList.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {details.expensesList.map(exp => (
                    <div key={exp.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "1rem", borderBottom: "1px dashed var(--border-color)" }}>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text-main)", fontSize: "1.05rem", marginBottom: "0.2rem" }}>{exp.title}</div>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "capitalize", backgroundColor: "var(--bg-color)", padding: "2px 8px", borderRadius: "10px", display: "inline-block" }}>{exp.category}</div>
                      </div>
                      <div style={{ fontWeight: 700, color: "#f59e0b", fontSize: "1.1rem" }}>{details.currency} {Number(exp.amount).toLocaleString("id-ID")}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                  <Wallet size={48} color="var(--border-color)" style={{ marginBottom: "1rem" }} />
                  <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "1.05rem" }}>Belum ada catatan pengeluaran untuk trip ini.</p>
                </div>
              )}
            </div>
            {details.expensesList && details.expensesList.length > 0 && (
              <div style={{ padding: "1.5rem 2rem", borderTop: "1px solid var(--border-color)", backgroundColor: "var(--bg-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 700, color: "var(--text-main)", fontSize: "1.1rem" }}>Total Pengeluaran</div>
                <div style={{ fontWeight: 800, color: "#ef4444", fontSize: "1.2rem" }}>{details.currency} {details.totalExpense.toLocaleString("id-ID")}</div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
