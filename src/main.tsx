
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import '@/utils/elevateToAdmin'

const root = createRoot(document.getElementById('root')!)

root.render(
  // Removendo React.StrictMode temporariamente para depuração
  <App />
)
