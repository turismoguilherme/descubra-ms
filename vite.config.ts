import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
  server: {
    host: "::",
    port: 8080,
    // Middleware para normalizar barras invertidas em URLs
    middlewareMode: false,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    // Plugin para normalizar barras invertidas em desenvolvimento
    mode === 'development' && {
      name: 'normalize-backslash',
      configureServer(server: any) {
        server.middlewares.use((req: any, res: any, next: any) => {
          if (req.url && req.url.includes('\\')) {
            const normalizedUrl = req.url.replace(/\\/g, '/');
            req.url = normalizedUrl;
          }
          next();
        });
      }
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ['react', 'react-dom'],
  },
  build: {
    // Removido manualChunks para evitar problemas de ordem de inicialização no Vercel
    // O Vite gerenciará automaticamente o chunking de forma mais segura
    chunkSizeWarningLimit: 1000, // Aumentar limite para 1MB
    rollupOptions: {
      output: {
        // Garantir nomes de arquivo consistentes
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Evitar problemas de carregamento dinâmico
        manualChunks: undefined,
      },
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    // Garantir que os assets sejam servidos corretamente
    assetsInlineLimit: 4096,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react', 'zod', '@hookform/resolvers', 'i18next', 'react-i18next', 'i18next-browser-languagedetector', '@tanstack/react-query'],
    // Garantir que zod seja pré-otimizado para evitar problemas de inicialização
    // Adicionar i18next e dependências ao optimizeDeps para forçar pré-otimização
    // Adicionar @tanstack/react-query para garantir resolução correta do React
  },
}});
