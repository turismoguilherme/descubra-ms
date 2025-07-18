
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import NotificationSystem from '@/components/flowtrip/NotificationSystem';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <NotificationSystem />
    </div>
  );
};

export default Layout;
