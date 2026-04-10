import React from 'react';
import { MapPin, Star } from 'lucide-react';

export default function DestinationCard({ 
  name, 
  location, 
  rating, 
  imagePlaceholderColor = '#e2e8f0',
  description
}) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Image Placeholder */}
      <div style={{ 
        height: '160px', 
        width: '100%', 
        backgroundColor: imagePlaceholderColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <MapPin size={32} color="rgba(0,0,0,0.2)" />
        {rating && (
          <div style={{
            position: 'absolute', top: '12px', right: '12px', backgroundColor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(4px)', padding: '4px 8px', borderRadius: 'var(--radius-full)',
            display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700
          }}>
            <Star size={14} fill="#f59e0b" color="#f59e0b" /> {rating}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>{name}</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.75rem' }}>
          <MapPin size={14} /> {location}
        </p>
        {description && (
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', marginTop: 'auto' }}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
