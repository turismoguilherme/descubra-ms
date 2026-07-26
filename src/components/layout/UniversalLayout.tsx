import React from 'react';
import UniversalNavbar from './UniversalNavbar';
import UniversalFooter from './UniversalFooter';
import CookieConsentBanner from '@/components/cookies/CookieConsentBanner';
import GlobalSearchCommand from '@/components/search/GlobalSearchCommand';
import { GuataPushOptIn } from '@/components/guata/GuataPushOptIn';
import { GuataPushDeepLinkListener } from '@/components/guata/GuataPushDeepLinkListener';

interface UniversalLayoutProps {
  children: React.ReactNode;
}

const UniversalLayout = ({ children }: UniversalLayoutProps) => {

  return (
    <div className="min-h-screen flex flex-col">
      <GuataPushDeepLinkListener />
      <UniversalNavbar />
      <GlobalSearchCommand />
      <main className="flex-grow">
        {children}
      </main>
      <UniversalFooter />
      <CookieConsentBanner platform="descubra_ms" />
      <GuataPushOptIn />
    </div>
  );
};

export default UniversalLayout;