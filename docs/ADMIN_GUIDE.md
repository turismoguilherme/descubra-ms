# Guia do Administrador - Sistema Descubra MS

## 📋 Resumo do Plano Implementado

### ✅ **Fase 1: Sistema de Gestão de Usuários**
- **Interface de gestão completa** em `/admin/users`
- **Usuários de teste criados** para todos os papéis
- **Atualização segura de papéis** via função SQL

### ✅ **Fase 2: Migração Delinha → Guatá**
- **95 referências atualizadas** de "Delinha" para "Guatá"
- **Imagem do Guatá implementada** em todos os componentes
- **Rotas atualizadas**: `/guata` e `/guata-ai` (mantendo compatibilidade)

### ✅ **Fase 3: Proteção contra Falhas**
- **Error Boundary implementado** com recuperação automática
- **Logs estruturados** para debugging
- **Fallbacks elegantes** para tela branca

## 🔑 Credenciais de Teste

| Papel | Email | Senha |
|-------|-------|-------|
| **Admin** | admin-teste@ms.gov.br | AdminTeste2024! |
| **Diretor** | diretor-teste@ms.gov.br | DiretorTeste2024! |
| **Gestor IGR** | gestor-igr-teste@ms.gov.br | GestorIgrTeste2024! |
| **Gestor Municipal** | gestor-municipal-teste@ms.gov.br | GestorMunicipalTeste2024! |
| **Atendente** | atendente-teste@ms.gov.br | AtendenteTeste2024! |
| **Usuário** | usuario-teste@ms.gov.br | UsuarioTeste2024! |

## 🛠️ Como Usar

### Criar Usuários de Teste
1. Acesse `/admin/users`
2. Clique em "Criar Usuários de Teste"
3. Confirme a criação
4. Use as credenciais mostradas para login

### Gerenciar Papéis
1. Acesse a seção "Atualizar Papel do Usuário"
2. Selecione o usuário e novo papel
3. Clique em "Atualizar Papel"

### Recuperação de Tela Branca
1. **Ctrl+Shift+R** para hard refresh
2. Limpar cache do navegador
3. Verificar console para erros específicos
4. ID do erro aparecerá na tela para suporte

## 🚨 Emergência
- **ID dos erros** são únicos para cada falha
- **Logs salvos** no localStorage do navegador
- **Procedimentos automáticos** de recuperação ativados