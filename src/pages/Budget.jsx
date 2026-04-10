import React from 'react';
import { Wallet, TrendingUp, PieChart, Info, Plane, Home, Utensils, Camera, CreditCard, ArrowRight } from 'lucide-react';

export default function Budget() {
  const categories = [
    { name: "Penerbangan", amount: 3500000, total: 3500000, icon: <Plane size={18} />, color: "#6366f1", bg: "#eef2ff" },
    { name: "Penginapan", amount: 4800000, total: 5000000, icon: <Home size={18} />, color: "#3b82f6", bg: "#eff6ff" },
    { name: "Makanan", amount: 1250000, total: 2000000, icon: <Utensils size={18} />, color: "#f97316", bg: "#fff7ed" },
    { name: "Aktivitas Wisata", amount: 800000, total: 1500000, icon: <Camera size={18} />, color: "#10b981", bg: "#ecfdf5" }
  ];

  const recentTransactions = [
    { id: 1, title: "Tiket Garuda Indonesia", desc: "CGK - DPS PP", amount: 3500000, date: "10 Agu", category: "Penerbangan" },
    { id: 2, title: "Deposit The Apurva", desc: "Malam pertama", amount: 2400000, date: "11 Agu", category: "Penginapan" },
    { id: 3, title: "Naughty Nuri's Seminyak", desc: "Makan Siang", amount: 450000, date: "12 Agu", category: "Makanan" },
    { id: 4, title: "Tiket GWK Park", desc: "Promo 2 Orang", amount: 250000, date: "12 Agu", category: "Aktivitas" }
  ];

  // Helper untuk format rupiah
  const formatRp = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const totalPengeluaran = categories.reduce((sum, cat) => sum + cat.amount, 0);
  const totalAnggaran = categories.reduce((sum, cat) => sum + cat.total, 0);
  const persentase = Math.round((totalPengeluaran / totalAnggaran) * 100);

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div style={{
          width: '60px', height: '60px', borderRadius: 'var(--radius-lg)', 
          background: 'linear-gradient(135deg, #10b981, #34d399)',
          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)'
        }}>
          <Wallet size={30} />
        </div>
        <div>
          <h2 style={{ fontSize: '2.25rem', marginBottom: '0.25rem', letterSpacing: '-0.5px', color: 'var(--text-main)' }}>Dasbor Keuangan</h2>
          <p className="text-muted">Pantau anggaran dan catat pengeluaran liburanmu dengan cermat.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* Total Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', borderTop: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-muted)' }}>Total Pengeluaran Saat Ini</h3>
            <span style={{ backgroundColor: '#ecfdf5', color: '#10b981', padding: '4px 8px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
              <TrendingUp size={16} /> Aktif
            </span>
          </div>
          <div>
            <div style={{ fontSize: '2.75rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-1px' }}>
              {formatRp(totalPengeluaran)}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
              dari total anggaran <strong>{formatRp(totalAnggaran)}</strong>
            </div>
          </div>
          
          {/* Progress Bar Label */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
              <span>Daya serap anggaran</span>
              <span>{persentase}%</span>
            </div>
            {/* Progress Bar Container */}
            <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--border-color)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{ width: `${persentase}%`, height: '100%', backgroundColor: '#10b981', borderRadius: 'var(--radius-full)' }}></div>
            </div>
          </div>
        </div>
        
        {/* Allocation Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>Rincian Alokasi Dana</h3>
            <button style={{ border: 'none', background: 'transparent', color: 'var(--primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              Lihat Detail <ArrowRight size={16} />
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {categories.map((cat, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: cat.bg, color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cat.icon}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>{cat.name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatRp(cat.amount)}</span>
                  </div>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.round((cat.amount / cat.total) * 100)}%`, height: '100%', backgroundColor: cat.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={20} color="var(--primary)" /> Pengeluaran Terakhir
            </h3>
            <button className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>+ Tambah Manual</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recentTransactions.map(trx => (
              <div key={trx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 0', borderBottom: trx.id !== recentTransactions.length ? '1px solid var(--surface-hover)' : 'none' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {trx.date.split(' ')[0]}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>{trx.title}</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{trx.category} • {trx.desc}</span>
                  </div>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {formatRp(trx.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
