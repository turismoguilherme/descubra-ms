import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import EnhancedDigitalPassport from '@/components/passport/EnhancedDigitalPassport';

const EnhancedDigitalPassportPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <Navbar />
      <main className="flex-grow py-8">
        <EnhancedDigitalPassport />
      </main>
      <Footer />
    </div>
  );
};

export default EnhancedDigitalPassportPage;