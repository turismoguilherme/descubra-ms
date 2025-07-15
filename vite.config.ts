import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente com o prefixo VITE_ e outras sem prefixo
  const env = loadEnv(mode, process.cwd(), '');
  
  // Adicionando logs de depuração para o terminal
  console.log("DEBUG (Vite Config): Modo atual:", mode);
  console.log("DEBUG (Vite Config): Diretório de trabalho atual (process.cwd()):", process.cwd());
  console.log("DEBUG (Vite Config): Variáveis de ambiente carregadas (env object):", env);

  return {
    server: {
      host: "::",
      port: 8080, // Porta fixa para desenvolvimento
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Expor as variáveis de ambiente para o código do cliente
    define: {
      'process.env': JSON.stringify(env),
    },
  };
});
