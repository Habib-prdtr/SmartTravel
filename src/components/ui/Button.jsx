import React from 'react';

export default function Button({ 
  children, 
  variant = 'primary', 
  className = '', 
  icon, 
  iconPosition = 'left',
  ...props 
}) {
  const getVariantClass = () => {
    if (variant === 'primary') return 'btn-primary';
    if (variant === 'secondary') return 'btn-secondary';
    return '';
  };

  return (
    <button 
      className={`btn ${getVariantClass()} ${className}`} 
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="btn-icon">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="btn-icon">{icon}</span>}
    </button>
  );
}
