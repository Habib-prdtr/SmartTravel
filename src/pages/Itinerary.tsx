import React from 'react';
import { Clock, MapPin, Coffee, Utensils, Home, Camera, Plane, CloudRain, Pencil, Trash2, Calendar, Map } from 'lucide-react';

export function ItineraryActivity({ id, time, title, description, type, duration, weatherData, onEdit, onDelete, onMapClick }) {
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
      <div className="card activity-card" style={{ 
        flex: 1, padding: '1.5rem', marginTop: '0.2rem', 
        borderLeftColor: getInlineStyles().color,
        backgroundColor: getInlineStyles().backgroundColor 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
             <span style={{ 
               fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', 
               letterSpacing: '0.75px', color: getInlineStyles().color 
             }}>
               {(type || 'other').charAt(0).toUpperCase() + (type || 'other').slice(1)}
             </span>
             <h4 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 700, letterSpacing: '-0.3px' }}>{title}</h4>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', 
              fontWeight: 600, color: 'var(--text-main)', backgroundColor: 'white', 
              padding: '6px 14px', borderRadius: 'var(--radius-full)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <Clock size={14} color={getInlineStyles().color} /> {time}
            </span>
            {onMapClick && (
              <button onClick={() => onMapClick(id)} style={{ background: 'white', border: 'none', cursor: 'pointer', color: 'var(--primary)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'all 0.2s' }} title="Buka di Peta">
                <Map size={15} />
              </button>
            )}
            {onEdit && (
              <button onClick={() => onEdit(id)} style={{ background: 'white', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'all 0.2s' }} title="Edit Aktivitas">
                <Pencil size={15} />
              </button>
            )}
            {onDelete && (
              <button onClick={() => onDelete(id)} style={{ background: 'white', border: 'none', cursor: 'pointer', color: '#ef4444', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'all 0.2s' }} title="Hapus Aktivitas">
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '1rem' }}>
           <MapPin size={16} color={getInlineStyles().color} style={{ marginTop: '3px', flexShrink: 0, opacity: 0.8 }} />
           <p className="text-muted" style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.6' }}>{description}</p>
        </div>
        
        {duration && (
          <div style={{ marginTop: '1.25rem', fontSize: '0.85rem', color: getInlineStyles().color, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'white', padding: '6px 12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Clock size={14} /> Berlangsung: {duration}
          </div>
        )}

        {weatherData && (
          <div style={{ 
            marginTop: '1.25rem', padding: '0.85rem 1.25rem', borderRadius: '12px',
            backgroundColor: weatherData.isRainy ? '#fff1f2' : '#f0fdf4',
            borderLeft: `4px solid ${weatherData.isRainy ? '#e11d48' : '#16a34a'}`,
            color: 'var(--text-main)',
            display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            {weatherData.icon ? (
              <img src={`https:${weatherData.icon}`} alt={weatherData.text} style={{ width: '40px', height: '40px', flexShrink: 0 }} />
            ) : (
              <CloudRain size={24} color={weatherData.isRainy ? '#e11d48' : '#16a34a'} style={{ flexShrink: 0 }} />
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 600 }}>Cuaca: {weatherData.text} ({weatherData.tempC}°C)</span>
              {weatherData.isRainy && (
                <span style={{ fontSize: '0.8rem', color: '#e11d48' }}>Hujan diprediksi turun. Pertimbangkan pindah jadwal.</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ItineraryDay({ dayNumber, date, activities, onEditActivity, onDeleteActivity, onMapActivity }) {
  return (
    <div style={{ marginBottom: '4rem' }}>
      <div style={{ 
        display: 'flex', alignItems: 'center', gap: '1.25rem',
        marginBottom: '2.5rem', position: 'relative'
      }}>
        <div style={{
          backgroundColor: 'var(--primary)', color: 'white',
          padding: '0.6rem 1.2rem', borderRadius: '14px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          boxShadow: '0 6px 16px -4px rgba(59, 130, 246, 0.4)'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9, marginBottom: '2px' }}>Hari</span>
          <span style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>{dayNumber}</span>
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-main)' }}>Jadwal Perjalanan</h3>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <Calendar size={14} /> {date}
          </span>
        </div>
        <div style={{ flex: 1, height: '2px', backgroundColor: 'var(--border-color)', marginLeft: '1rem', borderRadius: '2px' }}></div>
      </div>
      
      <div style={{ paddingTop: '0.5rem' }}>
        {activities.length > 0 ? (
          activities.map((act, index) => (
            <ItineraryActivity
              key={index}
              id={act.id}
              time={act.time}
              title={act.title}
              description={act.description}
              type={act.type}
              duration={act.duration}
              weatherData={act.weatherData}
              onEdit={onEditActivity}
              onDelete={onDeleteActivity}
              onMapClick={onMapActivity}
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
