import React from 'react';

const Card = ({ title, children, className }) => {
  return (
    <div className={`bg-white shadow-md rounded-lg p-6 ${className}`}>
      {title && <h3 className="text-xl font-semibold text-primary mb-4">{title}</h3>}
      {children}
    </div>
  );
};

export default Card;