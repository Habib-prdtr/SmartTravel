import React, { useEffect, useMemo, useState } from "react";
import { Wallet, TrendingUp, Plane, Home, Utensils, Camera, CreditCard, BusFront } from "lucide-react";
import { createExpense, getBudget, getExpenses, getTrips } from "../lib/api";
import { Link } from "react-router-dom";

const CATEGORY_META = {
  transport: { label: "Transport", icon: <BusFront size={18} />, color: "#6366f1", bg: "#eef2ff" },
  hotel: { label: "Penginapan", icon: <Home size={18} />, color: "#3b82f6", bg: "#eff6ff" },
  food: { label: "Makanan", icon: <Utensils size={18} />, color: "#f97316", bg: "#fff7ed" },
  ticket: { label: "Tiket/Wisata", icon: <Plane size={18} />, color: "#10b981", bg: "#ecfdf5" },
  other: { label: "Lainnya", icon: <Camera size={18} />, color: "#64748b", bg: "#f1f5f9" }
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
      <div className="container" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
        <p className="text-muted">Memuat data budget...</p>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="container" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
        <div className="card" style={{ maxWidth: "640px", margin: "0 auto", padding: "2rem", textAlign: "center" }}>
          <h2 style={{ marginBottom: "0.75rem" }}>Belum Ada Trip</h2>
          <p className="text-muted" style={{ marginBottom: "1.25rem" }}>
            Kamu belum punya data budget karena belum membuat trip.
          </p>
          <Link to="/" className="btn btn-primary">
            Buat Trip Dulu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "var(--radius-lg)",
            background: "linear-gradient(135deg, #10b981, #34d399)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 15px rgba(16, 185, 129, 0.35)"
          }}
        >
          <Wallet size={30} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: "2.25rem", marginBottom: "0.25rem", letterSpacing: "-0.5px", color: "var(--text-main)" }}>
            Dasbor Keuangan
          </h2>
          <p className="text-muted">
            Anggaran diambil otomatis dari form Generate Itinerary di halaman Home.
          </p>
        </div>
        <select
          value={selectedTripId || ""}
          onChange={(e) => setSelectedTripId(Number(e.target.value))}
          style={{ minWidth: "240px", padding: "0.65rem 0.85rem", borderRadius: "10px", border: "1px solid var(--border-color)" }}
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
        <div className="card" style={{ marginBottom: "1.5rem", borderLeft: "4px solid #f59e0b" }}>
          <p style={{ margin: 0, color: "var(--text-main)" }}>
            Anggaran untuk trip ini belum diatur dari halaman Home. Buat trip baru lewat Generate Itinerary dan isi budget.
          </p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", borderTop: "4px solid #10b981" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "1.15rem", color: "var(--text-muted)" }}>Total Pengeluaran Saat Ini</h3>
            <span style={{ backgroundColor: "#ecfdf5", color: "#10b981", padding: "4px 8px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.85rem", fontWeight: 600 }}>
              <TrendingUp size={16} /> Live
            </span>
          </div>
          <div>
            <div style={{ fontSize: "2.75rem", fontWeight: "800", color: "var(--text-main)", letterSpacing: "-1px" }}>
              {formatCurrency(totalPengeluaran, budget?.currency || "IDR")}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "0.5rem" }}>
              dari total anggaran <strong>{formatCurrency(totalAnggaran, budget?.currency || "IDR")}</strong>
            </div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>
              <span>Daya serap anggaran</span>
              <span>{persentase}%</span>
            </div>
            <div style={{ width: "100%", height: "10px", backgroundColor: "var(--border-color)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
              <div style={{ width: `${persentase}%`, height: "100%", backgroundColor: "#10b981", borderRadius: "var(--radius-full)" }} />
            </div>
          </div>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 style={{ fontSize: "1.15rem" }}>Tambah Pengeluaran</h3>
          <form onSubmit={handleSaveExpense} style={{ display: "grid", gap: "0.75rem" }}>
            <select
              value={expenseForm.category}
              onChange={(e) => setExpenseForm((prev) => ({ ...prev, category: e.target.value }))}
              style={{ padding: "0.6rem 0.75rem", borderRadius: "10px", border: "1px solid var(--border-color)" }}
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
              style={{ padding: "0.6rem 0.75rem", borderRadius: "10px", border: "1px solid var(--border-color)" }}
            />
            <input
              type="number"
              placeholder="Nominal"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm((prev) => ({ ...prev, amount: e.target.value }))}
              style={{ padding: "0.6rem 0.75rem", borderRadius: "10px", border: "1px solid var(--border-color)" }}
            />
            <input
              type="date"
              value={expenseForm.expenseDate}
              onChange={(e) => setExpenseForm((prev) => ({ ...prev, expenseDate: e.target.value }))}
              style={{ padding: "0.6rem 0.75rem", borderRadius: "10px", border: "1px solid var(--border-color)" }}
            />
            <input
              type="text"
              placeholder="Catatan (opsional)"
              value={expenseForm.notes}
              onChange={(e) => setExpenseForm((prev) => ({ ...prev, notes: e.target.value }))}
              style={{ padding: "0.6rem 0.75rem", borderRadius: "10px", border: "1px solid var(--border-color)" }}
            />
            <button type="submit" className="btn btn-secondary" disabled={isSavingExpense}>
              {isSavingExpense ? "Menyimpan..." : "+ Tambah Pengeluaran"}
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
          <p className="text-muted" style={{ margin: 0 }}>
            Belum ada pengeluaran. Tambahkan transaksi pertama kamu.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {expenses.slice(0, 10).map((trx) => {
              const meta = CATEGORY_META[trx.category] || CATEGORY_META.other;
              const dateLabel = trx.expense_date
                ? new Date(trx.expense_date).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })
                : "-";

              return (
                <div key={trx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 0", borderBottom: "1px solid var(--surface-hover)", gap: "1rem" }}>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <div style={{ width: "45px", height: "45px", borderRadius: "50%", backgroundColor: meta.bg, color: meta.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {meta.icon}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 600, color: "var(--text-main)" }}>{trx.title}</h4>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        {meta.label} - {dateLabel}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)" }}>
                    {formatCurrency(Number(trx.amount || 0), budget?.currency || "IDR")}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: "2rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>Rincian Alokasi Kategori</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          {categories.map((cat) => (
            <div key={cat.key} style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "10px", backgroundColor: cat.bg, color: cat.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {cat.icon}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600 }}>{cat.label}</h4>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{formatCurrency(cat.amount, budget?.currency || "IDR")}</span>
                </div>
              </div>
              <div style={{ width: "100%", height: "6px", backgroundColor: "var(--surface-hover)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${totalPengeluaran > 0 ? Math.max(3, Math.round((cat.amount / totalPengeluaran) * 100)) : 0}%`,
                    height: "100%",
                    backgroundColor: cat.color
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
