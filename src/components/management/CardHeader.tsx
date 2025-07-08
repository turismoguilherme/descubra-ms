
import * as React from "react";

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

// This is a simple wrapper component to maintain consistency with the original code
const CardHeader: React.FC<CardHeaderProps> = ({ className, children }) => {
  return <div className={`pb-2 ${className || ''}`}>{children}</div>;
};

export default CardHeader;
