// src/components/Common/LoadingSpinner.js

import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  text = '', 
  overlay = false,
  className = '' 
}) => {
  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium', 
    large: 'spinner-large'
  };

  const colorClasses = {
    primary: 'spinner-primary',
    secondary: 'spinner-secondary',
    white: 'spinner-white'
  };

  const spinnerClass = `loading-spinner ${sizeClasses[size]} ${colorClasses[color]} ${className}`;

  const content = (
    <div className={spinnerClass}>
      <div className="spinner">
        <div className="spinner-circle"></div>
      </div>
      {text && <span className="spinner-text">{text}</span>}
    </div>
  );

  if (overlay) {
    return (
      <div className="spinner-overlay">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;