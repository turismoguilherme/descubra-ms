// Utilitário de diagnóstico para identificar problemas na aplicação

export const runDiagnostics = () => {
  console.log("🔍 Iniciando diagnóstico da aplicação...");
  
  // Verificar variáveis de ambiente
  console.log("📋 Variáveis de ambiente:");
  console.log("- VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL);
  console.log("- VITE_SUPABASE_KEY:", import.meta.env.VITE_SUPABASE_KEY ? "Configurada" : "Não configurada");
  console.log("- NODE_ENV:", import.meta.env.NODE_ENV);
  console.log("- DEV:", import.meta.env.DEV);
  
  // Verificar se o DOM está disponível
  console.log("🌐 DOM disponível:", typeof document !== "undefined");
  console.log("🔧 Window disponível:", typeof window !== "undefined");
  
// Verificar se React está disponível
  console.log("⚛️ React disponível:", typeof window !== "undefined" && "React" in window);
  
  // Verificar se o elemento root existe
  const rootElement = document.getElementById('root');
  console.log("🎯 Elemento root encontrado:", !!rootElement);
  
  // Verificar se há erros no console
  const originalError = console.error;
  const originalWarn = console.warn;
  
  const errors: string[] = [];
  const warnings: string[] = [];
  
  console.error = (...args) => {
    errors.push(args.join(' '));
    originalError.apply(console, args);
  };
  
  console.warn = (...args) => {
    warnings.push(args.join(' '));
    originalWarn.apply(console, args);
  };
  
  // Retornar função para obter resultados
  return {
    getResults: () => ({
      errors,
      warnings,
      environment: {
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        supabaseKey: import.meta.env.VITE_SUPABASE_KEY ? "Configurada" : "Não configurada",
        nodeEnv: import.meta.env.NODE_ENV,
        dev: import.meta.env.DEV
      },
      dom: {
        available: typeof document !== "undefined",
        rootElement: !!rootElement
      }
    }),
    restore: () => {
      console.error = originalError;
      console.warn = originalWarn;
    }
  };
};

// Função para verificar se a aplicação está funcionando
export const checkAppHealth = () => {
  const diagnostics = runDiagnostics();
  
  setTimeout(() => {
    const results = diagnostics.getResults();
    diagnostics.restore();
    
    console.log("🏥 Resultados do diagnóstico:", results);
    
    if (results.errors.length > 0) {
      console.error("❌ Erros encontrados:", results.errors);
    }
    
    if (results.warnings.length > 0) {
      console.warn("⚠️ Avisos encontrados:", results.warnings);
    }
    
    if (!results.environment.supabaseKey) {
      console.error("❌ VITE_SUPABASE_KEY não está configurada!");
      console.log("📝 Crie um arquivo .env na raiz do projeto com:");
      console.log("VITE_SUPABASE_URL=https://hvtrpkbjgbuypkskqcqm.supabase.co");
      console.log("VITE_SUPABASE_KEY=sua_chave_anonima_aqui");
    }
  }, 1000);
}; 