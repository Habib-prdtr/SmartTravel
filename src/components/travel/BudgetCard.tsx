import React from 'react';
import { TrendingUp } from 'lucide-react';

export default function BudgetCard({ 
  title = "Alokasi", 
  amount, 
  total, 
  color = "#10b981", 
  icon 
}) {
  const percentage = Math.min(Math.round((amount / total) * 100), 100);
  
  const formatRp = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: `3px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {icon && <span style={{ color }}>{icon}</span>}
          <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: 0 }}>{title}</h3>
        </div>
        <TrendingUp size={16} color={color} />
      </div>
      
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
          {formatRp(amount)}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
          dari {formatRp(total)}
        </div>
      </div>
      
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 600 }}>
          <span style={{ color: 'var(--text-muted)' }}>Terpakai</span>
          <span style={{ color }}>{percentage}%</span>
        </div>
        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: color, borderRadius: 'var(--radius-full)' }}></div>
        </div>
      </div>
    </div>
  );
}
