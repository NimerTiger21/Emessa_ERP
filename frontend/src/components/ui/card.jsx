import React from "react";

export const Card = ({ children, className }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 border ${className}`}>
      {children}
    </div>
  );
};

export const CardContent = ({ children, className }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 border ${className}`}>
      {children}
    </div>
  );
};
