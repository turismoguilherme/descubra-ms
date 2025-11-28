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
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            // React e React DOM - deve ser carregado primeiro
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            // Zod - separar em chunk próprio para evitar problemas de inicialização
            if (id.includes('zod')) {
              return 'vendor-zod';
            }
            // Supabase
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            // UI Components (Radix UI)
            if (id.includes('@radix-ui')) {
              return 'vendor-ui';
            }
            // Charts
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            // PDF/Excel generation
            if (id.includes('jspdf') || id.includes('xlsx')) {
              return 'vendor-reports';
            }
            // AI/ML libraries
            if (id.includes('@google/generative-ai')) {
              return 'vendor-ai';
            }
            // Date utilities
            if (id.includes('date-fns')) {
              return 'vendor-dates';
            }
            // React Hook Form e resolvers - importante para formulários
            if (id.includes('react-hook-form') || id.includes('@hookform')) {
              return 'vendor-forms';
            }
            // Other vendor libraries
            return 'vendor-other';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Aumentar limite para 1MB
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
    // xlsx será carregado dinamicamente, não precisa estar aqui
  },
}));
