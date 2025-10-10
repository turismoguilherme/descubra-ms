import React from 'react';
import UniversalNavbar from './UniversalNavbar';
import UniversalFooter from './UniversalFooter';

interface UniversalLayoutProps {
  children: React.ReactNode;
}

const UniversalLayout = ({ children }: UniversalLayoutProps) => {
  console.log("🏗️ UNIVERSAL LAYOUT: Renderizando layout universal");
  
  return (
    <div className="min-h-screen flex flex-col">
      <UniversalNavbar />
      <main className="flex-grow">
        {children}
      </main>
      <UniversalFooter />
    </div>
  );
};

export default UniversalLayout;