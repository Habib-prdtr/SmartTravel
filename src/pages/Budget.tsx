import React, { useEffect, useMemo, useState } from "react";
import { Wallet, TrendingUp, Plane, Home, Utensils, Camera, CreditCard, BusFront } from "lucide-react";
import { createExpense, getBudget, getExpenses, getTrips } from "../lib/api";
import { Link } from "react-router-dom";

const CATEGORY_META = {
  transport: { label: "Transport", icon: <BusFront size={18} />, color: "#6366f1", bg: "rgba(99, 102, 241, 0.12)" },
  hotel: { label: "Penginapan", icon: <Home size={18} />, color: "#3b82f6", bg: "rgba(59, 130, 246, 0.12)" },
  food: { label: "Makanan", icon: <Utensils size={18} />, color: "#f97316", bg: "rgba(249, 115, 22, 0.12)" },
  ticket: { label: "Tiket/Wisata", icon: <Plane size={18} />, color: "#10b981", bg: "rgba(16, 185, 129, 0.12)" },
  other: { label: "Lainnya", icon: <Camera size={18} />, color: "#64748b", bg: "rgba(100, 116, 139, 0.12)" }
};

export default function Budget() {
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [budget, setBudget] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [expenseForm, setExpenseForm] = useState({
    category: "food",
    title: "",
    amount: "",
    expenseDate: "",
    notes: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingExpense, setIsSavingExpense] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const formatCurrency = (value, currency = "IDR") =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency, minimumFractionDigits: 0 }).format(value || 0);

  useEffect(() => {
    let isMounted = true;

    async function loadTrips() {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const tripRows = await getTrips();
        if (!isMounted) return;
        setTrips(tripRows);
        setSelectedTripId(tripRows.length > 0 ? tripRows[0].id : null);
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(error.message || "Gagal memuat trips");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadTrips();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedTripId) {
      setBudget(null);
      setExpenses([]);
      return;
    }

    let isMounted = true;

    async function loadBudgetData() {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const [budgetData, expenseRows] = await Promise.all([getBudget(selectedTripId), getExpenses(selectedTripId)]);
        if (!isMounted) return;
        setBudget(budgetData);
        setExpenses(expenseRows);
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(error.message || "Gagal memuat data budget");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadBudgetData();
    return () => {
      isMounted = false;
    };
  }, [selectedTripId]);

  const totalPengeluaran = useMemo(
    () => expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
    [expenses]
  );
  const totalAnggaran = Number(budget?.total_budget || 0);
  const persentase = totalAnggaran > 0 ? Math.min(100, Math.round((totalPengeluaran / totalAnggaran) * 100)) : 0;

  const categories = useMemo(() => {
    const grouped = expenses.reduce((acc, expense) => {
      const key = expense.category || "other";
      acc[key] = (acc[key] || 0) + Number(expense.amount || 0);
      return acc;
    }, {});

    return Object.entries(CATEGORY_META).map(([key, meta]) => ({
      key,
      ...meta,
      amount: grouped[key] || 0
    }));
  }, [expenses]);

  const handleSaveExpense = async (e) => {
    e.preventDefault();
    if (!selectedTripId) return;

    const amount = Number(expenseForm.amount);
    if (!Number.isFinite(amount) || amount < 0) {
      setErrorMessage("Nominal pengeluaran tidak valid");
      return;
    }
    if (!expenseForm.title.trim()) {
      setErrorMessage("Judul pengeluaran wajib diisi");
      return;
    }

    setIsSavingExpense(true);
    setErrorMessage("");
    try {
      const createdExpense = await createExpense(selectedTripId, {
        category: expenseForm.category,
        title: expenseForm.title.trim(),
        amount,
        expenseDate: expenseForm.expenseDate || null,
        notes: expenseForm.notes.trim() || null
      });

      setExpenses((prev) => [
        {
          id: createdExpense.id,
          trip_id: selectedTripId,
          category: createdExpense.category,
          title: createdExpense.title,
          amount: createdExpense.amount,
          expense_date: createdExpense.expenseDate,
          notes: createdExpense.notes,
          created_at: new Date().toISOString()
        },
        ...prev
      ]);
      setExpenseForm({ category: "food", title: "", amount: "", expenseDate: "", notes: "" });
    } catch (error) {
      setErrorMessage(error.message || "Gagal menyimpan pengeluaran");
    } finally {
      setIsSavingExpense(false);
    }
  };

  if (isLoading && trips.length === 0) {
    return (
      <div className="container animate-fade-in" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
        <p className="text-muted">Memuat data budget...</p>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="container animate-fade-in" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
        <div className="card" style={{ maxWidth: "540px", margin: "0 auto", padding: "3rem 2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <img src="/budget_empty.png" alt="Empty Budget" style={{ width: "220px", marginBottom: "1.5rem", opacity: 0.9 }} />
          <h2 style={{ marginBottom: "0.75rem", fontSize: "1.75rem" }}>Belum Ada Keuangan</h2>
          <p className="text-muted" style={{ marginBottom: "2rem", lineHeight: 1.6 }}>
            Kamu belum punya data budget karena belum membuat trip. Mulai perjalananmu sekarang!
          </p>
          <Link to="/" className="btn btn-primary" style={{ padding: "0.75rem 2rem", fontSize: "1.05rem", backgroundColor: "#10b981", borderColor: "#10b981" }}>
            Buat Trip Dulu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
      <div style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, var(--surface) 40%, rgba(16, 185, 129, 0.05) 100%)", padding: "clamp(1.5rem, 5vw, 3rem)", borderRadius: "24px", boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.1)", marginBottom: "3rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "2rem", border: "1px solid var(--border-color)", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap", flex: "1 1 min-content", minWidth: "300px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 20px rgba(16, 185, 129, 0.3)"
            }}
          >
            <Wallet size={32} />
          </div>
          <div>
            <h2 style={{ fontSize: "2.25rem", marginBottom: "0.25rem", letterSpacing: "-0.5px", color: "var(--text-main)", fontWeight: 800 }}>
              Dasbor Keuangan
            </h2>
            <p className="text-muted" style={{ margin: 0, fontSize: "1.05rem" }}>
              Kelola dan pantau anggaran perjalananmu dengan mudah.
            </p>
          </div>
        </div>
        <select
          value={selectedTripId || ""}
          onChange={(e) => setSelectedTripId(Number(e.target.value))}
          style={{ minWidth: "240px", padding: "0.65rem 0.85rem", borderRadius: "10px", border: "1px solid #10b981", backgroundColor: "var(--surface)", color: "var(--text-main)", fontWeight: 600, boxShadow: "0 2px 8px rgba(16,185,129,0.1)" }}
        >
          {trips.map((trip) => (
            <option key={trip.id} value={trip.id}>
              {trip.name}
            </option>
          ))}
        </select>
      </div>

      {errorMessage && (
        <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: "0.9rem" }}>
          {errorMessage}
        </div>
      )}

      {!budget && (
        <div className="card" style={{ marginBottom: "1.5rem", borderLeft: "4px solid var(--accent)" }}>
          <p style={{ margin: 0, color: "var(--text-main)" }}>
            Anggaran untuk trip ini belum diatur dari halaman Home. Buat trip baru lewat Generate Itinerary dan isi budget.
          </p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", background: "linear-gradient(135deg, #064e3b 0%, #059669 100%)", color: "white", borderRadius: "20px", boxShadow: "0 12px 24px -8px rgba(5, 150, 105, 0.5)", border: "none", position: "relative", overflow: "hidden", padding: "clamp(1.5rem, 5vw, 2rem)" }}>
          {/* Decorative shapes */}
          <div style={{ position: "absolute", top: "-20%", right: "-10%", width: "150px", height: "150px", borderRadius: "50%", background: "rgba(255,255,255,0.1)" }}></div>
          <div style={{ position: "absolute", bottom: "-10%", left: "-10%", width: "100px", height: "100px", borderRadius: "50%", background: "rgba(255,255,255,0.05)" }}></div>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
            <h3 style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.8)", margin: 0, fontWeight: 500 }}>Total Pengeluaran</h3>
            <span style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white", padding: "4px 10px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", fontWeight: 600, backdropFilter: "blur(4px)" }}>
              <TrendingUp size={14} /> Live
            </span>
          </div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: "2.75rem", fontWeight: "800", color: "white", letterSpacing: "-1px", textShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
              {formatCurrency(totalPengeluaran, budget?.currency || "IDR")}
            </div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
              dari pagu anggaran <strong style={{ color: "white" }}>{formatCurrency(totalAnggaran, budget?.currency || "IDR")}</strong>
            </div>
          </div>
          <div style={{ marginTop: "0.5rem", position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem", fontSize: "0.9rem", fontWeight: 500, color: "rgba(255,255,255,0.9)" }}>
              <span>Daya serap anggaran</span>
              <span>{persentase}%</span>
            </div>
            <div style={{ width: "100%", height: "8px", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
              <div style={{ width: `${persentase}%`, height: "100%", backgroundColor: "white", borderRadius: "var(--radius-full)", boxShadow: "0 0 10px rgba(255,255,255,0.5)" }} />
            </div>
          </div>
        </div>

        <div style={{ padding: "clamp(1.5rem, 5vw, 2rem)", borderRadius: "20px", backgroundColor: "rgba(248, 250, 252, 0.5)", border: "2px dashed #cbd5e1" }}>
          <h3 style={{ fontSize: "1.15rem", marginBottom: "1.25rem", color: "var(--primary-dark)", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ display: "inline-flex", width: "24px", height: "24px", backgroundColor: "var(--primary-soft)", color: "var(--primary)", borderRadius: "50%", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", fontWeight: "bold" }}>+</span>
            Catat Pengeluaran Baru
          </h3>
          <form onSubmit={handleSaveExpense} style={{ display: "grid", gap: "0.85rem" }}>
            <select
              value={expenseForm.category}
              onChange={(e) => setExpenseForm((prev) => ({ ...prev, category: e.target.value }))}
              style={{ padding: "0.7rem 0.85rem", borderRadius: "10px", border: "1px solid var(--primary)", backgroundColor: "var(--surface)", color: "var(--text-main)" }}
            >
              {Object.entries(CATEGORY_META).map(([value, meta]) => (
                <option key={value} value={value}>
                  {meta.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Judul pengeluaran"
              value={expenseForm.title}
              onChange={(e) => setExpenseForm((prev) => ({ ...prev, title: e.target.value }))}
              style={{ padding: "0.7rem 0.85rem", borderRadius: "10px", border: "1px solid var(--primary)", backgroundColor: "var(--surface)", color: "var(--text-main)" }}
            />
            <input
              type="number"
              placeholder="Nominal"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm((prev) => ({ ...prev, amount: e.target.value }))}
              style={{ padding: "0.7rem 0.85rem", borderRadius: "10px", border: "1px solid var(--primary)", backgroundColor: "var(--surface)", color: "var(--text-main)" }}
            />
            <input
              type="date"
              value={expenseForm.expenseDate}
              onChange={(e) => setExpenseForm((prev) => ({ ...prev, expenseDate: e.target.value }))}
              style={{ padding: "0.7rem 0.85rem", borderRadius: "10px", border: "1px solid var(--primary)", backgroundColor: "var(--surface)", color: "var(--text-main)" }}
            />
            <input
              type="text"
              placeholder="Catatan (opsional)"
              value={expenseForm.notes}
              onChange={(e) => setExpenseForm((prev) => ({ ...prev, notes: e.target.value }))}
              style={{ padding: "0.7rem 0.85rem", borderRadius: "10px", border: "1px solid var(--primary)", backgroundColor: "var(--surface)", color: "var(--text-main)" }}
            />
            <button type="submit" className="btn btn-primary" disabled={isSavingExpense} style={{ marginTop: "0.5rem", padding: "0.8rem", fontSize: "1.05rem", fontWeight: "bold" }}>
              {isSavingExpense ? "Menyimpan..." : "Tambah Pengeluaran"}
            </button>
          </form>
        </div>
      </div>

      <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
          <h3 style={{ fontSize: "1.25rem", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CreditCard size={20} color="var(--primary)" /> Pengeluaran Terakhir
          </h3>
        </div>

        {expenses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", border: "1px dashed #cbd5e1", borderRadius: "16px", backgroundColor: "rgba(248,250,252,0.5)" }}>
            <img src="/budget_empty.png" alt="No expenses" style={{ width: "120px", marginBottom: "1rem", opacity: 0.8 }} />
            <p className="text-muted" style={{ margin: 0 }}>
              Belum ada pengeluaran. Mulai catat transaksi pertamamu sekarang!
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {expenses.slice(0, 10).map((trx) => {
              const meta = CATEGORY_META[trx.category] || CATEGORY_META.other;
              const dateLabel = trx.expense_date
                ? new Date(trx.expense_date).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })
                : "-";

              return (
                <div key={trx.id} className="expense-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1rem", borderBottom: "1px solid var(--surface-hover)", gap: "1rem", borderRadius: "12px" }}>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "14px", backgroundColor: meta.bg, color: meta.color, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                      {meta.icon}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)" }}>{trx.title}</h4>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}>
                        {meta.label} &bull; {dateLabel}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)", backgroundColor: "var(--bg-color)", padding: "6px 12px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                    {formatCurrency(Number(trx.amount || 0), budget?.currency || "IDR")}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: "2rem", borderTop: "4px solid var(--primary-light)" }}>
        <h3 style={{ marginBottom: "1.5rem", fontSize: "1.25rem" }}>Rincian Alokasi Kategori</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem" }}>
          {categories.map((cat) => (
            <div key={cat.key} style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.25rem", backgroundColor: "var(--surface)", borderRadius: "16px", border: `1px solid ${cat.color}30`, boxShadow: `0 4px 12px ${cat.color}10`, transition: "transform 0.2s" }} className="category-card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", backgroundColor: cat.bg, color: cat.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {cat.icon}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--text-main)" }}>{cat.label}</h4>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>{formatCurrency(cat.amount, budget?.currency || "IDR")}</span>
                </div>
              </div>
              <div style={{ width: "100%", height: "8px", backgroundColor: "var(--surface-hover)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${totalPengeluaran > 0 ? Math.max(3, Math.round((cat.amount / totalPengeluaran) * 100)) : 0}%`,
                    height: "100%",
                    backgroundColor: cat.color,
                    borderRadius: "var(--radius-full)"
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
