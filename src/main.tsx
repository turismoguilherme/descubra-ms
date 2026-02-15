// IMPORTANTE: Definir NODE_ENV para Vercel (pode não estar definido automaticamente)
if (typeof process !== 'undefined' && !process.env.NODE_ENV) {
  process.env.NODE_ENV = import.meta.env.MODE === 'production' ? 'production' : 'development';
}

import React from 'react'
import { createRoot } from 'react-dom/client'
// IMPORTANTE: Carregar zod primeiro para evitar erros de inicialização
import 'zod'
import App from './App.tsx'
import './index.css'
import '@/utils/elevateToAdmin'

// #region agent log - Error handlers globais
window.addEventListener('error', (event) => {
  fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:error',message:'Erro global capturado',data:{message:event.message,filename:event.filename,lineno:event.lineno,colno:event.colno,error:event.error?.toString(),pathname:window.location.pathname,hasBackslash:window.location.pathname.includes('\\')},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{});
});
window.addEventListener('unhandledrejection', (event) => {
  fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:unhandledrejection',message:'Promise rejeitada não tratada',data:{reason:event.reason?.toString(),pathname:window.location.pathname,hasBackslash:window.location.pathname.includes('\\')},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{});
});
// Log inicial da URL
fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:init',message:'Aplicação inicializando',data:{href:window.location.href,pathname:window.location.pathname,hasBackslash:window.location.pathname.includes('\\'),search:window.location.search},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
// #endregion

const root = createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)