import React from 'react';
import UniversalNavbar from './UniversalNavbar';
import Footer from './Footer';

interface UniversalLayoutProps {
  children: React.ReactNode;
}

const UniversalLayout = ({ children }: UniversalLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <UniversalNavbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default UniversalLayout;