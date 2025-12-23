import React from 'react';
import UniversalNavbar from './UniversalNavbar';
import UniversalFooter from './UniversalFooter';

interface UniversalLayoutProps {
  children: React.ReactNode;
}

const UniversalLayout = ({ children }: UniversalLayoutProps) => {
  console.log("🏗️ UNIVERSAL LAYOUT: Renderizando layout universal");
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UniversalLayout.tsx:9',message:'UniversalLayout iniciando renderização',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  
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