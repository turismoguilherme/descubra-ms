import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Removido manualChunks para evitar problemas de ordem de inicialização no Vercel
    // O Vite gerenciará automaticamente o chunking de forma mais segura
    chunkSizeWarningLimit: 1000, // Aumentar limite para 1MB
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react', 'zod', '@hookform/resolvers'],
    // Garantir que zod seja pré-otimizado para evitar problemas de inicialização
  },
}));
