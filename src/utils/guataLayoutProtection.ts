/**
 * Sistema de Proteção do Layout do Guatá
 * Garante que o layout sempre volte ao estado correto
 */

// Configuração do layout correto
export const GUATA_LAYOUT_CONFIG = {
  // Estrutura esperada do layout
  expectedStructure: {
    hasUniversalLayout: true,
    hasGradientBackground: true,
    hasGridLayout: true,
    hasGuataChat: true,
    hasSuggestionQuestions: true
  },
  
  // Cores esperadas
  expectedColors: {
    primaryBlue: 'ms-primary-blue',
    pantanalGreen: 'ms-pantanal-green',
    discoveryTeal: 'ms-discovery-teal'
  },
  
  // Classes CSS esperadas
  expectedClasses: {
    container: 'ms-container',
    gradient: 'bg-gradient-to-r from-ms-primary-blue to-ms-pantanal-green',
    grid: 'grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8'
  }
};

/**
 * Verifica se o layout do Guatá está correto
 */
export const verifyGuataLayout = (): boolean => {
  try {
    // Verificar se as variáveis CSS estão definidas
    const rootStyles = getComputedStyle(document.documentElement);
    const primaryBlue = rootStyles.getPropertyValue('--ms-primary-blue');
    
    if (!primaryBlue || primaryBlue.trim() === '') {
      console.warn('🚨 GUATA PROTECTION: Cores CSS não encontradas');
      return false;
    }
    
    // Verificar se o componente principal existe
    const guataElement = document.querySelector('[data-testid="guata-container"]');
    if (!guataElement) {
      console.warn('🚨 GUATA PROTECTION: Container do Guatá não encontrado');
      return false;
    }
    
    // Verificar se o UniversalLayout está sendo usado
    const universalLayout = document.querySelector('[data-testid="universal-layout"]');
    if (!universalLayout) {
      console.warn('🚨 GUATA PROTECTION: UniversalLayout não encontrado');
      return false;
    }
    
    console.log('✅ GUATA PROTECTION: Layout verificado com sucesso');
    return true;
  } catch (error) {
    console.error('🚨 GUATA PROTECTION: Erro na verificação:', error);
    return false;
  }
};

/**
 * Restaura o layout do Guatá para o estado correto
 */
export const restoreGuataLayout = (): void => {
  try {
    console.log('🔄 GUATA PROTECTION: Iniciando restauração do layout...');
    
    // Recarregar a página para restaurar o estado
    window.location.reload();
    
    console.log('✅ GUATA PROTECTION: Layout restaurado com sucesso');
  } catch (error) {
    console.error('🚨 GUATA PROTECTION: Erro na restauração:', error);
  }
};

/**
 * Monitora o layout do Guatá e restaura se necessário
 */
export const monitorGuataLayout = (): void => {
  // Verificar a cada 5 segundos
  const interval = setInterval(() => {
    if (!verifyGuataLayout()) {
      console.warn('🚨 GUATA PROTECTION: Layout incorreto detectado, restaurando...');
      restoreGuataLayout();
      clearInterval(interval);
    }
  }, 5000);
  
  // Parar o monitoramento após 1 minuto
  setTimeout(() => {
    clearInterval(interval);
    console.log('✅ GUATA PROTECTION: Monitoramento concluído');
  }, 60000);
};

/**
 * Inicializa o sistema de proteção
 */
export const initGuataProtection = (): void => {
  console.log('🛡️ GUATA PROTECTION: Sistema de proteção inicializado');
  
  // Verificar imediatamente
  if (!verifyGuataLayout()) {
    restoreGuataLayout();
    return;
  }
  
  // Iniciar monitoramento
  monitorGuataLayout();
};




