import React from 'react';

export default function Card({ 
  children, 
  className = '', 
  noPadding = false,
  onClick,
  ...props 
}) {
  return (
    <div 
      className={`card ${className}`} 
      style={{ 
        padding: noPadding ? '0' : undefined,
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
