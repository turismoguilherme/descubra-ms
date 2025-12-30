import React from 'react';
import UniversalNavbar from './UniversalNavbar';
import UniversalFooter from './UniversalFooter';
import WhatsAppFloatingButton from './WhatsAppFloatingButton';

const enableDebugLogs = import.meta.env.VITE_DEBUG_LOGS === 'true';
const safeLog = (payload: any) => {
  if (!enableDebugLogs) return;
  fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,timestamp:Date.now(),sessionId:'debug-session',runId:payload?.runId||'run1'})}).catch(()=>{});
};

interface UniversalLayoutProps {
  children: React.ReactNode;
}

const UniversalLayout = ({ children }: UniversalLayoutProps) => {
  console.log("🏗️ UNIVERSAL LAYOUT: Renderizando layout universal");
  safeLog({location:'UniversalLayout.tsx:9',message:'UniversalLayout iniciando renderização',data:{timestamp:Date.now()},hypothesisId:'E'});
  
  return (
    <div className="min-h-screen flex flex-col">
      <UniversalNavbar />
      <main className="flex-grow">
        {children}
      </main>
      <UniversalFooter />
      <WhatsAppFloatingButton />
    </div>
  );
};

export default UniversalLayout;