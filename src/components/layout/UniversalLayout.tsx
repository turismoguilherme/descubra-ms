import React, { useEffect } from 'react';
import UniversalNavbar from './UniversalNavbar';
import UniversalFooter from './UniversalFooter';
import CookieConsentBanner from '@/components/cookies/CookieConsentBanner';

const enableDebugLogs = import.meta.env.VITE_DEBUG_LOGS === 'true';
const safeLog = (payload: unknown) => {
  if (!enableDebugLogs) return;
  fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,timestamp:Date.now(),sessionId:'debug-session',runId:payload?.runId||'run1'})}).catch(()=>{});
};

interface UniversalLayoutProps {
  children: React.ReactNode;
}

const UniversalLayout = ({ children }: UniversalLayoutProps) => {
  console.log("🏗️ UNIVERSAL LAYOUT: Renderizando layout universal");
  safeLog({location:'UniversalLayout.tsx:9',message:'UniversalLayout iniciando renderização',data:{timestamp:Date.now()},hypothesisId:'E'});
  
  // #region agent log
  useEffect(() => {
    const logLayoutDimensions = () => {
      const mainElement = document.querySelector('main.flex-grow') as HTMLElement;
      if (mainElement) {
        const rect = mainElement.getBoundingClientRect();
        fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UniversalLayout.tsx:20',message:'Dimensões do main container',data:{width:rect.width,height:rect.height,top:rect.top,left:rect.left,computedWidth:window.getComputedStyle(mainElement).width,computedHeight:window.getComputedStyle(mainElement).height,viewportWidth:window.innerWidth,viewportHeight:window.innerHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      }
    };
    logLayoutDimensions();
    window.addEventListener('resize', logLayoutDimensions);
    return () => window.removeEventListener('resize', logLayoutDimensions);
  }, []);
  // #endregion
  
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