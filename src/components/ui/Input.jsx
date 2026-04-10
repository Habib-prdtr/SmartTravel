import React from 'react';

export default function Input({ 
  label, 
  icon, 
  id, 
  className = '', 
  wrapperClassName = '',
  ...props 
}) {
  return (
    <div className={`input-group ${wrapperClassName}`}>
      {icon && (
        <span className="input-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </span>
      )}
      <div className="input-field-wrapper" style={{ width: '100%' }}>
        {label && <label htmlFor={id} style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</label>}
        <input 
          id={id}
          className={`form-input ${className}`}
          style={{ 
            width: '100%', 
            border: 'none', 
            background: 'transparent', 
            outline: 'none', 
            fontSize: '1rem',
            color: 'var(--text-main)',
            padding: '0.25rem 0'
          }}
          {...props} 
        />
      </div>
    </div>
  );
}
