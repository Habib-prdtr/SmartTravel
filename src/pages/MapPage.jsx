import React, { useState } from 'react';
import { Map, MapPin, Navigation, Search, Star, List } from 'lucide-react';

export default function MapPage() {
  const [activeLocation, setActiveLocation] = useState(1);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'map'

  const locations = [
    { id: 1, name: "The Apurva Kempinski", type: "Hotel",       rating: 4.9, time: "Day 1 - 10:30", desc: "Resor mewah bintang 5 dengan pemandangan tebing." },
    { id: 2, name: "Garuda Wisnu Kencana", type: "Sightseeing", rating: 4.7, time: "Day 1 - 15:00", desc: "Taman budaya dengan patung tertinggi di Indonesia." },
    { id: 3, name: "Naughty Nuri's",       type: "Dining",      rating: 4.8, time: "Day 1 - 12:00", desc: "Iga bakar legendaris yang wajib dicoba." },
    { id: 4, name: "Pantai Melasti",       type: "Nature",      rating: 4.8, time: "Day 2 - 10:00", desc: "Pantai pasir putih tersembunyi dengan tebing kapur." },
    { id: 5, name: "CATCH Beach Club",     type: "Dining",      rating: 4.6, time: "Day 2 - 14:30", desc: "Klub bersantai pinggir pantai yang populer." },
  ];

  const activeItem = locations.find(l => l.id === activeLocation);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 5rem)', overflow: 'hidden' }}>

      {/* ── Mobile Tab Switcher (hanya di ≤768px) ── */}
      <div className="map-tab-switcher" style={{
        display: 'none', /* dioverride CSS di bawah */
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--surface)',
      }}>
        <button
          onClick={() => setMobileView('list')}
          style={{
            flex: 1, padding: '0.85rem', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
            backgroundColor: mobileView === 'list' ? 'var(--primary-soft)' : 'transparent',
            color: mobileView === 'list' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: mobileView === 'list' ? '2px solid var(--primary)' : '2px solid transparent',
            transition: 'all 0.2s',
          }}
        >
          <List size={17} /> Daftar Lokasi
        </button>
        <button
          onClick={() => setMobileView('map')}
          style={{
            flex: 1, padding: '0.85rem', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
            backgroundColor: mobileView === 'map' ? 'var(--primary-soft)' : 'transparent',
            color: mobileView === 'map' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: mobileView === 'map' ? '2px solid var(--primary)' : '2px solid transparent',
            transition: 'all 0.2s',
          }}
        >
          <Map size={17} /> Lihat Peta
        </button>
      </div>

      {/* ── Badan Utama: Sidebar + Peta ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar (Locations) */}
        <div className={`map-sidebar ${mobileView === 'map' ? 'map-sidebar--hidden' : ''}`} style={{
          width: '360px',
          flexShrink: 0,
          backgroundColor: 'var(--surface)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'hidden',
        }}>
          {/* Header + Search */}
          <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
              <Map size={22} color="var(--primary)" /> Destinasi Rute
            </h2>
            <div style={{
              display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-color)',
              padding: '0.65rem 1rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)'
            }}>
              <Search size={16} color="var(--text-muted)" style={{ marginRight: '0.5rem', flexShrink: 0 }} />
              <input type="text" placeholder="Cari lokasi..."
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem' }} />
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
            {locations.map(loc => (
              <div
                key={loc.id}
                onClick={() => { setActiveLocation(loc.id); setMobileView('map'); }}
                style={{
                  padding: '1rem', marginBottom: '0.75rem', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  border: activeLocation === loc.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  backgroundColor: activeLocation === loc.id ? 'var(--primary-soft)' : 'var(--surface)',
                  transition: 'all 0.2s',
                  boxShadow: activeLocation === loc.id ? 'var(--shadow-sm)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.3px' }}>{loc.time}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.8rem', fontWeight: 700 }}>
                    <Star size={13} fill="#f59e0b" color="#f59e0b" /> {loc.rating}
                  </span>
                </div>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem', color: 'var(--text-main)' }}>{loc.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.85rem', lineHeight: 1.4 }}>{loc.desc}</p>
                <button className="btn btn-primary"
                  style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
                  <Navigation size={14} /> Arahkan Rute
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Peta */}
        <div className={`map-area ${mobileView === 'list' ? 'map-area--hidden' : ''}`} style={{
          flex: 1, backgroundColor: '#e2e8f0', position: 'relative', overflow: 'hidden',
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px',
        }}>
          {/* Overlay tengah */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
            <div style={{
              width: '70px', height: '70px', borderRadius: '50%', backgroundColor: 'rgba(59,130,246,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', animation: 'pulse 2s infinite'
            }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--primary)', border: '3px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}></div>
            </div>
            <div style={{
              marginTop: '0.85rem', backgroundColor: 'rgba(255,255,255,0.92)', padding: '0.6rem 1.25rem',
              borderRadius: 'var(--radius-full)', boxShadow: 'var(--shadow-md)', fontWeight: 600,
              fontSize: '0.9rem', color: 'var(--text-main)', backdropFilter: 'blur(6px)'
            }}>
              Peta akan dimuat dari API
            </div>
          </div>

          {/* Info Card lokasi aktif — tampil di mobile ketika view=map */}
          {activeItem && (
            <div className="map-active-card" style={{
              position: 'absolute', bottom: '5rem', left: '50%', transform: 'translateX(-50%)',
              backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem',
              boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)',
              display: 'none', /* dioverride CSS di bawah untuk mobile */
              width: 'calc(100% - 2rem)', maxWidth: '340px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>{activeItem.time}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Star size={13} fill="#f59e0b" color="#f59e0b" /> {activeItem.rating}
                </span>
              </div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>{activeItem.name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{activeItem.desc}</p>
              <button onClick={() => setMobileView('list')} className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.45rem', fontSize: '0.85rem' }}>
                <List size={14} /> Kembali ke Daftar
              </button>
            </div>
          )}

          {/* Kontrol zoom */}
          <div style={{ position: 'absolute', right: '1.25rem', bottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {['+', '−'].map((s, i) => (
              <button key={i} style={{
                width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface)',
                border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--shadow-md)', cursor: 'pointer', fontSize: '1.3rem', fontWeight: 700, lineHeight: 1
              }}>{s}</button>
            ))}
            <button style={{
              width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary)',
              color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-md)', cursor: 'pointer', marginTop: '0.25rem'
            }}>
              <Navigation size={19} />
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59,130,246,0.7); }
          70%  { transform: scale(1);    box-shadow: 0 0 0 18px rgba(59,130,246,0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59,130,246,0); }
        }

        /* ── Desktop: semua tampil side‑by‑side ── */
        @media (min-width: 769px) {
          .map-tab-switcher  { display: none !important; }
          .map-sidebar       { display: flex !important; }
          .map-area          { display: block !important; }
          .map-active-card   { display: none !important; }
        }

        /* ── Mobile: tab switcher + hide/show berdasar state ── */
        @media (max-width: 768px) {
          .map-tab-switcher  { display: flex !important; }
          .map-sidebar       { width: 100% !important; flex-shrink: unset; border-right: none !important; }
          .map-sidebar--hidden { display: none !important; }
          .map-area--hidden  { display: none !important; }
          .map-active-card   { display: block !important; }
        }
      `}} />
    </div>
  );
}
