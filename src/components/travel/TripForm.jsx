// Form ini merupakan abstraksi dari form pencarian yang ada di halaman utama (Hero section)
import React from 'react';
import { MapPin, CalendarDays, Wallet, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TripForm() {
  const navigate = useNavigate();

  const handleGenerate = (e) => {
    e.preventDefault();
    // Mengarahkan ke halaman hasil planner setelah form di submit
    navigate('/planner');
  };

  return (
    <form onSubmit={handleGenerate} className="hero-search-box card" style={{ padding: '0.5rem', width: '100%' }}>
      <div className="search-inputs" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
        
        <div className="input-group" style={{ flex: '1 1 200px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <MapPin className="input-icon" size={22} color="var(--primary)" />
          <div className="input-field-wrapper" style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Tujuan</label>
            <input type="text" placeholder="Mau ke mana?" required style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '1rem' }} />
          </div>
        </div>
        
        <div className="divider" style={{ width: '1px', height: '50px', backgroundColor: 'var(--border-color)', display: 'block' }}></div>
        
        <div className="input-group" style={{ flex: '1 1 200px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <CalendarDays className="input-icon" size={22} color="var(--primary)" />
          <div className="input-field-wrapper" style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Tanggal keberangkatan</label>
            <input type="date" required style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '1rem', color: 'var(--text-main)', fontFamily: 'inherit' }} />
          </div>
        </div>
        
        <div className="divider" style={{ width: '1px', height: '50px', backgroundColor: 'var(--border-color)', display: 'block' }}></div>
        
        <div className="input-group" style={{ flex: '1 1 200px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Wallet className="input-icon" size={22} color="var(--primary)" />
          <div className="input-field-wrapper" style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Budget Maksimal</label>
            <input type="number" placeholder="Rp 0" style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '1rem' }} />
          </div>
        </div>
        
      </div>
      <button type="submit" className="btn btn-primary search-btn" style={{ height: '100%', minHeight: '60px', padding: '0 2rem', borderRadius: 'var(--radius-md)' }}>
        <Sparkles size={18} /> Generate Itinerary
      </button>
    </form>
  );
}
