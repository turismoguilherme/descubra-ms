/**
 * Script de Teste Automatizado - Checklist Completo
 * Verifica cada item do checklist de pré-deploy
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const results = {
  passed: [],
  failed: [],
  warnings: []
};

function checkFileExists(filePath, description) {
  const fullPath = path.join(__dirname, filePath);
  const exists = fs.existsSync(fullPath);
  if (exists) {
    results.passed.push(`✅ ${description}: Arquivo existe`);
    return true;
  } else {
    results.failed.push(`❌ ${description}: Arquivo não encontrado (${filePath})`);
    return false;
  }
}

function checkFileContent(filePath, searchString, description) {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    results.failed.push(`❌ ${description}: Arquivo não encontrado`);
    return false;
  }
  
  const content = fs.readFileSync(fullPath, 'utf-8');
  if (content.includes(searchString)) {
    results.passed.push(`✅ ${description}: Encontrado no código`);
    return true;
  } else {
    results.failed.push(`❌ ${description}: Não encontrado no código`);
    return false;
  }
}

function checkExport(filePath, exportName, description) {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    results.failed.push(`❌ ${description}: Arquivo não encontrado`);
    return false;
  }
  
  const content = fs.readFileSync(fullPath, 'utf-8');
  // Verificar export default, export const, export class, ou export { ... }
  const exportPatterns = [
    new RegExp(`export\\s+default\\s+${exportName}`, 'm'),
    new RegExp(`export\\s+const\\s+${exportName}`, 'm'),
    new RegExp(`export\\s+class\\s+${exportName}`, 'm'),
    new RegExp(`export\\s*{\\s*[^}]*${exportName}`, 'm'),
    new RegExp(`export\\s*{\\s*${exportName}\\s*[,}]`, 'm')
  ];
  
  const found = exportPatterns.some(pattern => pattern.test(content));
  
  if (found || content.includes(`export const ${exportName}`) || content.includes(`export class ${exportName}`)) {
    results.passed.push(`✅ ${description}: Export encontrado`);
    return true;
  } else {
    results.failed.push(`❌ ${description}: Export não encontrado`);
    return false;
  }
}

console.log('🧪 INICIANDO TESTES AUTOMATIZADOS DO CHECKLIST\n');
console.log('='.repeat(60));

// 1. AUTENTICAÇÃO E PERFIS
console.log('\n📋 1. AUTENTICAÇÃO E PERFIS');
checkFileExists('src/hooks/useAuth.tsx', 'Hook useAuth');
checkFileContent('src/components/private/SettingsModal.tsx', 'handleChangePassword', 'Função de alteração de senha');
checkFileContent('src/components/private/SettingsModal.tsx', 'handleForgotPassword', 'Função de recuperação de senha');
checkFileContent('src/components/private/SettingsModal.tsx', 'handleChangeEmail', 'Função de alteração de email');
checkFileContent('src/components/private/SettingsModal.tsx', 'currentPassword', 'Validação de senha atual');

// 2. DASHBOARD PRIVADO
console.log('\n📋 2. DASHBOARD PRIVADO');
checkFileExists('src/pages/PrivateDashboard.tsx', 'Componente PrivateDashboard');
checkFileContent('src/pages/PrivateDashboard.tsx', 'Nível de Maturidade', 'Indicador de Maturidade');
checkFileContent('src/pages/PrivateDashboard.tsx', 'activeSection', 'Navegação entre seções');

// 3. DIAGNÓSTICO INTELIGENTE
console.log('\n📋 3. DIAGNÓSTICO INTELIGENTE');
checkFileExists('src/components/private/DiagnosticModal.tsx', 'Componente DiagnosticModal');
checkFileExists('src/components/diagnostic/DiagnosticQuestionnaire.tsx', 'Componente DiagnosticQuestionnaire');
checkFileContent('src/components/diagnostic/DiagnosticQuestionnaire.tsx', 'handleNext', 'Navegação entre perguntas');
checkFileContent('src/components/diagnostic/DiagnosticQuestionnaire.tsx', 'handleAnswer', 'Captura de respostas');
checkFileExists('src/services/diagnostic/analysisService.ts', 'Serviço de análise');
checkExport('src/components/private/DiagnosticModal.tsx', 'DiagnosticModal', 'Export do DiagnosticModal');

// 4. METAS E ACOMPANHAMENTO
console.log('\n📋 4. METAS E ACOMPANHAMENTO');
checkFileExists('src/components/private/GoalsTracking.tsx', 'Componente GoalsTracking');
checkFileExists('src/services/private/goalsTrackingService.ts', 'Serviço GoalsTrackingService');
checkFileExists('src/services/private/goalsAlertsService.ts', 'Serviço GoalsAlertsService');
checkExport('src/components/private/GoalsTracking.tsx', 'GoalsTracking', 'Export do GoalsTracking');
checkExport('src/services/private/goalsTrackingService.ts', 'goalsTrackingService', 'Export do goalsTrackingService');
checkFileContent('src/components/private/GoalsTracking.tsx', 'handleCreateGoal', 'Função de criar meta');
checkFileContent('src/components/private/GoalsTracking.tsx', 'handleUpdateProgress', 'Função de atualizar progresso');
checkFileContent('src/components/private/GoalsTracking.tsx', 'BarChart', 'Gráfico de barras');
checkFileContent('src/components/private/GoalsTracking.tsx', 'PieChart', 'Gráfico de pizza');
checkFileContent('src/services/private/goalsTrackingService.ts', 'getGoalProgress', 'Cálculo de progresso');
checkFileContent('src/services/private/goalsAlertsService.ts', 'checkGoalAlerts', 'Verificação de alertas');

// 5. UPLOAD DE DOCUMENTOS
console.log('\n📋 5. UPLOAD DE DOCUMENTOS');
checkFileExists('src/components/private/DocumentUpload.tsx', 'Componente DocumentUpload');
checkFileExists('src/services/viajar/documentService.ts', 'Serviço de documentos');
checkFileContent('src/components/private/DocumentUpload.tsx', 'handleUpload', 'Função de upload');
checkFileContent('src/components/private/DocumentUpload.tsx', 'handleDelete', 'Função de exclusão');

// 6. RELATÓRIOS
console.log('\n📋 6. RELATÓRIOS');
checkFileExists('src/components/private/ReportsSection.tsx', 'Componente ReportsSection');
checkFileExists('src/services/private/reportGenerationService.ts', 'Serviço de geração de relatórios');
checkFileExists('src/services/private/completeBusinessReportService.ts', 'Serviço de relatório completo');
checkFileContent('src/components/private/ReportsSection.tsx', 'handleGenerateReport', 'Função de gerar relatório');
checkFileContent('src/services/private/reportGenerationService.ts', 'generatePDF', 'Geração de PDF');
checkFileContent('src/services/private/reportGenerationService.ts', 'generateExcel', 'Geração de Excel');

// 7. IA CONVERSACIONAL
console.log('\n📋 7. IA CONVERSACIONAL');
checkFileExists('src/components/private/PrivateAIConversation.tsx', 'Componente PrivateAIConversation');
checkFileExists('src/services/cat/aiConversationService.ts', 'Serviço de IA conversacional');
checkFileContent('src/components/private/PrivateAIConversation.tsx', 'sendMessage', 'Função de enviar mensagem');
checkFileContent('src/components/private/PrivateAIConversation.tsx', 'businessType', 'Contexto do negócio');

// 8. INTELIGÊNCIA DE NEGÓCIO
console.log('\n📋 8. INTELIGÊNCIA DE NEGÓCIO');
checkFileExists('src/pages/ViaJARIntelligence.tsx', 'Página ViaJARIntelligence');
checkFileExists('src/components/private/RevenueOptimizerWidget.tsx', 'Widget Revenue Optimizer');
checkFileExists('src/components/private/MarketIntelligenceWidget.tsx', 'Widget Market Intelligence');
checkFileExists('src/components/private/CompetitiveBenchmarkWidget.tsx', 'Widget Competitive Benchmark');

// 9. HISTÓRICO DE EVOLUÇÃO
console.log('\n📋 9. HISTÓRICO DE EVOLUÇÃO');
checkFileExists('src/components/private/EvolutionHistory.tsx', 'Componente EvolutionHistory');
checkFileExists('src/services/private/evolutionHistoryService.ts', 'Serviço de histórico');

// 10. NOTIFICAÇÕES PROATIVAS
console.log('\n📋 10. NOTIFICAÇÕES PROATIVAS');
checkFileExists('src/components/private/ProactiveNotifications.tsx', 'Componente ProactiveNotifications');

// 11. CONFIGURAÇÕES
console.log('\n📋 11. CONFIGURAÇÕES');
checkFileExists('src/components/private/SettingsModal.tsx', 'Componente SettingsModal');
checkFileContent('src/components/private/SettingsModal.tsx', 'activeTab', 'Sistema de abas');
checkFileContent('src/components/private/SettingsModal.tsx', 'profile', 'Aba de perfil');
checkFileContent('src/components/private/SettingsModal.tsx', 'security', 'Aba de segurança');
checkFileContent('src/components/private/SettingsModal.tsx', 'plan', 'Aba de plano');

// 12. NAVEGAÇÃO E UI
console.log('\n📋 12. NAVEGAÇÃO E UI');
checkFileExists('src/components/layout/ViaJARNavbar.tsx', 'Componente Navbar');
checkFileContent('src/pages/PrivateDashboard.tsx', 'setActiveSection', 'Navegação entre seções');

// 13. INTEGRAÇÃO COM SUPABASE
console.log('\n📋 13. INTEGRAÇÃO COM SUPABASE');
checkFileExists('src/integrations/supabase/client.ts', 'Cliente Supabase');
checkFileContent('src/integrations/supabase/client.ts', 'createClient', 'Criação do cliente Supabase');

// 14. TESTES
console.log('\n📋 14. TESTES');
checkFileExists('vitest.config.js', 'Configuração do Vitest');
checkFileExists('src/tests/setup.ts', 'Setup de testes');
checkFileExists('src/tests/private/goalsTracking.test.ts', 'Testes de Metas');
checkFileExists('src/tests/private/diagnostic.test.ts', 'Testes de Diagnóstico');
checkFileExists('src/tests/private/settings.test.ts', 'Testes de Configurações');

// 15. DOCUMENTAÇÃO
console.log('\n📋 15. DOCUMENTAÇÃO');
checkFileExists('TESTE_COMPLETO_PRE_DEPLOY.md', 'Checklist de testes');
checkFileExists('RESUMO_TESTES_PRE_DEPLOY.md', 'Resumo de testes');

// RESULTADOS
console.log('\n' + '='.repeat(60));
console.log('\n📊 RESULTADOS DOS TESTES\n');

console.log(`✅ PASSARAM: ${results.passed.length}`);
results.passed.forEach(item => console.log(`   ${item}`));

console.log(`\n❌ FALHARAM: ${results.failed.length}`);
results.failed.forEach(item => console.log(`   ${item}`));

if (results.warnings.length > 0) {
  console.log(`\n⚠️  AVISOS: ${results.warnings.length}`);
  results.warnings.forEach(item => console.log(`   ${item}`));
}

const total = results.passed.length + results.failed.length;
const successRate = ((results.passed.length / total) * 100).toFixed(1);

console.log('\n' + '='.repeat(60));
console.log(`\n📈 TAXA DE SUCESSO: ${successRate}%`);
console.log(`📊 TOTAL DE VERIFICAÇÕES: ${total}`);
console.log(`✅ PASSOU: ${results.passed.length}`);
console.log(`❌ FALHOU: ${results.failed.length}`);

if (results.failed.length === 0) {
  console.log('\n🎉 TODOS OS TESTES PASSARAM!');
} else {
  console.log('\n⚠️  ALGUNS TESTES FALHARAM. Revise os itens acima.');
}

console.log('\n' + '='.repeat(60));

// Salvar relatório
const report = {
  timestamp: new Date().toISOString(),
  total,
  passed: results.passed.length,
  failed: results.failed.length,
  successRate: `${successRate}%`,
  results: {
    passed: results.passed,
    failed: results.failed,
    warnings: results.warnings
  }
};

fs.writeFileSync(
  path.join(__dirname, 'test_report.json'),
  JSON.stringify(report, null, 2)
);

console.log('\n📄 Relatório salvo em: test_report.json\n');

