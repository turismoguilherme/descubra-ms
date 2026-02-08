import React from 'react';
import UniversalNavbar from './UniversalNavbar';
import UniversalFooter from './UniversalFooter';
import CookieConsentBanner from '@/components/cookies/CookieConsentBanner';

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
      <UniversalFooter />
      <CookieConsentBanner platform="descubra_ms" />
    </div>
  );
};

export default UniversalLayout;