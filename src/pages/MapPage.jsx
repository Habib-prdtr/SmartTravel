import React, { useState } from 'react';
import { Map, MapPin, Navigation, Search, Star, MoveRight } from 'lucide-react';

export default function MapPage() {
  const [activeLocation, setActiveLocation] = useState(1);

  const locations = [
    { id: 1, name: "The Apurva Kempinski", type: "Hotel", rating: 4.9, time: "Day 1 - 10:30", desc: "Resor mewah bintang 5 dengan pemandangan tebing." },
    { id: 2, name: "Garuda Wisnu Kencana", type: "Sightseeing", rating: 4.7, time: "Day 1 - 15:00", desc: "Taman budaya dengan patung tertinggi di Indonesia." },
    { id: 3, name: "Naughty Nuri's", type: "Dining", rating: 4.8, time: "Day 1 - 12:00", desc: "Iga bakar legendaris yang wajib dicoba." },
    { id: 4, name: "Pantai Melasti", type: "Nature", rating: 4.8, time: "Day 2 - 10:00", desc: "Pantai pasir putih tersembunyi dengan tebing kapur." },
    { id: 5, name: "CATCH Beach Club", type: "Dining", rating: 4.6, time: "Day 2 - 14:30", desc: "Klub bersantai pinggir pantai yang populer." }
  ];

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 5rem)', overflow: 'hidden' }}>
      {/* Sidebar Panel (Locations) */}
      <div style={{ 
        width: '100%', maxWidth: '400px', backgroundColor: 'var(--surface)', 
        borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column',
        zIndex: 10
      }}>
        {/* Search & Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Map size={24} color="var(--primary)" /> Peta Interaktif
          </h2>
          <div style={{ 
            display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-color)', 
            padding: '0.75rem 1rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' 
          }}>
            <Search size={18} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
            <input 
              type="text" 
              placeholder="Cari lokasi di sekitar..." 
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }}
            />
          </div>
        </div>

        {/* Location List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {locations.map(loc => (
            <div 
              key={loc.id}
              onClick={() => setActiveLocation(loc.id)}
              style={{
                padding: '1.25rem', marginBottom: '1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                border: activeLocation === loc.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                backgroundColor: activeLocation === loc.id ? 'var(--primary-soft)' : 'var(--surface)',
                transition: 'all 0.2s', boxShadow: activeLocation === loc.id ? 'var(--shadow-md)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>{loc.time}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                  <Star size={14} fill="#f59e0b" color="#f59e0b" /> {loc.rating}
                </span>
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{loc.name}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{loc.desc}</p>
              
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.5rem', fontSize: '0.9rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Navigation size={16} /> Arahkan Rute
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Map Area Placeholder */}
      <div style={{ 
        flex: 1, backgroundColor: '#e2e8f0', position: 'relative', overflow: 'hidden',
        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px'
      }}>
        {/* Mock Map UI Overlay */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
            animation: 'pulse 2s infinite'
          }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--primary)',
              border: '3px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
            }}></div>
          </div>
          <div style={{ 
            marginTop: '1rem', backgroundColor: 'rgba(255,255,255,0.9)', padding: '0.75rem 1.5rem', 
            borderRadius: 'var(--radius-full)', boxShadow: 'var(--shadow-md)', fontWeight: 600, color: 'var(--text-main)',
            backdropFilter: 'blur(4px)'
          }}>
            Peta Utama akan dimuat dari API
          </div>
        </div>
        
        {/* Floating Controls */}
        <div style={{ position: 'absolute', right: '2rem', bottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)', cursor: 'pointer' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>+</span>
          </button>
          <button style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)', cursor: 'pointer' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>-</span>
          </button>
          <button style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)', cursor: 'pointer', marginTop: '0.5rem' }}>
            <Navigation size={20} />
          </button>
        </div>
      </div>
      
      {/* Inline styles for pulse animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(59, 130, 246, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        @media (max-width: 768px) {
          /* Mobile style overrides could go here, e.g. hiding the list or making it a bottom sheet */
        }
      `}} />
    </div>
  );
}
