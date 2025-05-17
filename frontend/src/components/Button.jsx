import React from 'react';

const Button = ({ 
  bgColor, 
  color, 
  size, 
  text, 
  borderRadius, 
  width, 
  icon, 
  onClick,
  type = "button"
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      style={{ 
        backgroundColor: bgColor, 
        color, 
        borderRadius,
        width: width === 'full' ? '100%' : 'auto'
      }}
      className={`text-${size} p-3 hover:drop-shadow-xl flex items-center justify-center gap-2`}
    >
      {icon && <span>{icon}</span>}
      {text}
    </button>
  );
};

export default Button;