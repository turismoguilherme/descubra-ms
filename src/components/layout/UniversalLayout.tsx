import React from 'react';
import UniversalNavbar from './UniversalNavbar';
import UniversalFooter from './UniversalFooter';
import CookieConsentBanner from '@/components/cookies/CookieConsentBanner';
import GlobalSearchCommand from '@/components/search/GlobalSearchCommand';

interface UniversalLayoutProps {
  children: React.ReactNode;
}

const UniversalLayout = ({ children }: UniversalLayoutProps) => {

  return (
    <div className="min-h-screen flex flex-col">
      <UniversalNavbar />
      <GlobalSearchCommand />
      <main className="flex-grow">
        {children}
      </main>
      <UniversalFooter />
      <CookieConsentBanner platform="descubra_ms" />
    </div>
  );
};

export default UniversalLayout;