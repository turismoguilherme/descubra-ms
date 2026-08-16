
import * as React from "react";

interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
}

// This is a simple wrapper component to maintain consistency with the original code
const CardTitle: React.FC<CardTitleProps> = ({ className, children }) => {
  return <div className={`text-lg ${className || ''}`}>{children}</div>;
};

export default CardTitle;
