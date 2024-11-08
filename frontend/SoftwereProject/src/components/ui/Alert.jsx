// src/components/ui/Alert.jsx
import React from 'react';

// Define a separate AlertDescription component
export function AlertDescription({ children }) {
  return <p className="text-sm">{children}</p>;
}

// Main Alert component
export function Alert({ type = 'info', title, children }) {
  const typeStyles = {
    info: 'bg-blue-100 text-blue-700 border-blue-300',
    success: 'bg-green-100 text-green-700 border-green-300',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    danger: 'bg-red-100 text-red-700 border-red-300',
  };

  const iconStyles = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    danger: '❌',
  };

  return (
    <div className={`border-l-4 p-4 mb-4 rounded ${typeStyles[type]}`}>
      <div className="flex items-center">
        <span className="mr-2">{iconStyles[type]}</span>
        <div>
          <strong className="block font-semibold">{title}</strong>
          {children}
        </div>
      </div>
    </div>
  );
}
