import React from 'react';

interface CardBoxProps {
  children: React.ReactNode;
  className?: string;
}

const CardBox: React.FC<CardBoxProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow ${className}`}>
      {children}
    </div>
  );
};

export default CardBox;


