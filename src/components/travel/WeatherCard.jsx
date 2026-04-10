import React from 'react';
import { Sun, Cloud, CloudRain } from 'lucide-react';

export default function WeatherCard({ 
  location, 
  temp, 
  condition = 'sunny',
  date
}) {
  const getIcon = () => {
    switch (condition) {
      case 'rainy': return <CloudRain size={28} color="#3b82f6" />;
      case 'cloudy': return <Cloud size={28} color="#94a3b8" />;
      default: return <Sun size={28} color="#f59e0b" />;
    }
  };

  const getGradient = () => {
    switch (condition) {
      case 'rainy': return 'linear-gradient(to bottom right, #eff6ff, #dbeafe)';
      case 'cloudy': return 'linear-gradient(to bottom right, #f8fafc, #e2e8f0)';
      default: return 'linear-gradient(to bottom right, #fffbeb, #fef3c7)';
    }
  };

  return (
    <div style={{
      background: getGradient(),
      borderRadius: 'var(--radius-md)',
      padding: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      border: '1px solid rgba(0,0,0,0.05)'
    }}>
      <div style={{
        width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)'
      }}>
        {getIcon()}
      </div>
      <div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{date || 'Hari Ini'}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>{temp}°C</span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500, textTransform: 'capitalize' }}>{location}</span>
        </div>
      </div>
    </div>
  );
}
