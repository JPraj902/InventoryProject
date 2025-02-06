import React from 'react';

export const Button = ({ children, className = '', variant = 'default', size = 'default', ...props }) => {
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    ghost: 'text-gray-600 hover:bg-gray-100'
  };

  const sizes = {
    default: 'px-4 py-2',
    icon: 'p-2'
  };

  return (
    <button
      className={`rounded-lg disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};