// Peta interaktif sudah dikerjakan penuh di src/pages/MapPage.jsx.
// Komponen ini mengekspor container tampilan peta statis tanpa sidebar
// sehingga bisa dirender ulang (reusable) di halaman lain atau widget.
import React from 'react';

export default function MapView({ height = '400px', label = 'Peta' }) {
  return (
    <div style={{ 
      width: '100%', height: height, backgroundColor: '#e2e8f0', position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-lg)',
      backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px', border: '1px solid var(--border-color)'
    }}>
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center'
      }}>
        <div style={{
          width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', animation: 'pulse 2s infinite'
        }}>
          <div style={{
            width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'var(--primary)',
            border: '2px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
          }}></div>
        </div>
        <div style={{ 
          marginTop: '0.75rem', backgroundColor: 'rgba(255,255,255,0.9)', padding: '0.5rem 1rem', 
          borderRadius: 'var(--radius-full)', boxShadow: 'var(--shadow-sm)', fontSize: '0.85rem', fontWeight: 600,
          backdropFilter: 'blur(4px)'
        }}>
          {label}
        </div>
      </div>
    </div>
  );
}
