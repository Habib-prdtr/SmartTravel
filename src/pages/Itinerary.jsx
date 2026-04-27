import React from 'react';
import { Clock, MapPin, Coffee, Utensils, Home, Camera, Plane, CloudRain } from 'lucide-react';

export function ItineraryActivity({ time, title, description, type, duration, weatherAlert }) {
  // Menentukan ikon dan warna berdasarkan tipe aktivitas
  const getIcon = () => {
    switch (type) {
      case 'dining': return <Utensils size={18} />;
      case 'cafe': return <Coffee size={18} />;
      case 'hotel': return <Home size={18} />;
      case 'sightseeing': return <Camera size={18} />;
      case 'flight': return <Plane size={18} />;
      default: return <MapPin size={18} />;
    }
  };

  const getColorClass = () => {
    switch (type) {
      case 'dining': return 'text-orange-500 bg-orange-50 border-orange-200';
      case 'cafe': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'hotel': return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'sightseeing': return 'text-emerald-500 bg-emerald-50 border-emerald-200';
      case 'flight': return 'text-indigo-500 bg-indigo-50 border-indigo-200';
      default: return 'text-primary bg-primary-soft border-blue-200';
    }
  };

  // Mendapatkan pewarnaan inline jika kita tidak menggunakan tailwind util colors
  const getInlineStyles = () => {
    switch (type) {
      case 'dining': return { color: '#f97316', backgroundColor: '#fff7ed' };
      case 'cafe': return { color: '#d97706', backgroundColor: '#fffbeb' };
      case 'hotel': return { color: '#3b82f6', backgroundColor: '#eff6ff' };
      case 'sightseeing': return { color: '#10b981', backgroundColor: '#ecfdf5' };
      case 'flight': return { color: '#6366f1', backgroundColor: '#eef2ff' };
      default: return { color: 'var(--primary)', backgroundColor: 'var(--primary-soft)' };
    }
  };

  return (
    <div style={{ display: 'flex', gap: '1.5rem', position: 'relative', paddingBottom: '2.5rem' }}>
      {/* Garis vertikal timeline */}
      <div style={{
        position: 'absolute', left: '23px', top: '48px', bottom: '0', 
        width: '2px', backgroundColor: 'var(--border-color)', zIndex: 0
      }}></div>
      
      {/* Lingkaran Ikon */}
      <div style={{
        width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
        border: '4px solid white', boxShadow: 'var(--shadow-sm)',
        ...getInlineStyles()
      }}>
        {getIcon()}
      </div>

      {/* Konten Kartu */}
      <div className="card" style={{ flex: 1, padding: '1.5rem', marginTop: '0.2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h4 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-main)' }}>{title}</h4>
          <span style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', 
            color: 'var(--text-muted)', backgroundColor: 'var(--bg-color)', 
            padding: '6px 12px', borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-color)'
          }}>
            <Clock size={14} /> {time}
          </span>
        </div>
        <p className="text-muted" style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>{description}</p>
        
        {duration && (
          <div style={{ marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 500, display: 'inline-block', backgroundColor: 'var(--surface-hover)', padding: '4px 8px', borderRadius: '6px' }}>
            Berlangsung: {duration}
          </div>
        )}

        {weatherAlert && (
          <div style={{ 
            marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: '8px',
            backgroundColor: '#fff7ed', border: '1px solid #fdba74', color: '#c2410c',
            display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem'
          }}>
            <CloudRain size={18} style={{ flexShrink: 0 }} />
            <span><strong>Peringatan Cuaca:</strong> Hujan diprediksi turun di area ini. Pertimbangkan pindah jadwal.</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function ItineraryDay({ dayNumber, date, activities }) {
  return (
    <div style={{ marginBottom: '4rem' }}>
      <div style={{ 
        display: 'flex', flexDirection: 'column',
        marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '2px solid var(--border-color)'
      }}>
        <h3 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Hari {dayNumber}</h3>
        <span style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '4px' }}>{date}</span>
      </div>
      
      <div style={{ paddingTop: '0.5rem' }}>
        {activities.length > 0 ? (
          activities.map((act, index) => (
            <ItineraryActivity
              key={index}
              time={act.time}
              title={act.title}
              description={act.description}
              type={act.type}
              duration={act.duration}
              weatherAlert={act.weatherAlert}
            />
          ))
        ) : (
          <div className="card" style={{ padding: '1.25rem' }}>
            <p className="text-muted" style={{ margin: 0 }}>
              Belum ada aktivitas untuk hari ini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
