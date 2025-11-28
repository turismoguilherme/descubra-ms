
import React from 'react'
import { createRoot } from 'react-dom/client'
// IMPORTANTE: Carregar zod primeiro para evitar erros de inicialização
import 'zod'
import App from './App.tsx'
import './index.css'
import '@/utils/elevateToAdmin'

const root = createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
