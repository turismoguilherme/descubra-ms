#!/bin/bash
# Diagnóstico Supabase CLI - Versão Detalhada

echo "🔍 Diagnóstico Abrangente de Conexão Supabase CLI 🔍"
echo "================================================="

# 1. Verificações de Sistema
echo -e "\n📋 Informações do Sistema:"
echo "Node.js Version:"
node --version
echo "NPM Version:"
npm --version
echo "Yarn Version (se instalado):"
yarn --version 2>/dev/null || echo "Yarn não instalado"

# 2. Configurações NPM
echo -e "\n🔧 Configurações NPM:"
npm config list

# 3. Teste de Registro NPM
echo -e "\n🌐 Teste de Conectividade NPM:"
npm config get registry
npm ping

# 4. Limpeza de Cache
echo -e "\n🧹 Limpeza de Cache NPM:"
npm cache clean --force

# 5. Tentativas de Instalação do Supabase CLI (AGORA APENAS VERIFICAÇÃO/ATUALIZAÇÃO)
echo -e "\n✅ Verificação/Atualização de Instalação do CLI:"
which supabase
supabase --version || echo "Supabase CLI não encontrado"

# 6. Teste de Autenticação
echo -e "\n🔐 Teste de Autenticação:"
# Nota: Este script apenas tenta o login. O erro "device_code: Invalid" será tratado manualmente após a execução.
supabase login || echo "Falha no login"

# 7. Diagnóstico de Conexão do Projeto
echo -e "\n🚀 Diagnóstico de Conexão do Projeto:"
# Substitua hvtrpkbjgbuypkskqcqm pelo ID do seu projeto
supabase projects list || echo "Falha ao listar projetos"

# 8. Teste de Conexão do Banco de Dados
echo -e "\n💾 Teste de Conexão do Banco de Dados:"
# Este comando requer parâmetros. Será executado manualmente após o login.
# supabase db remote status || echo "Falha no status remoto do banco de dados"
echo "Para verificar o status remoto do DB, use 'supabase db remote status --linked' após o login."


# 9. Informações de Rede
echo -e "\n🌍 Informações de Rede:"
curl -v https://hvtrpkbjgbuypkskqcqm.supabase.co 2>&1 | grep "Connected to"
# Ping pode falhar sem admin no Windows, curl já confirma conectividade
# ping -c 4 hvtrpkbjgbuypkskqcqm.supabase.co

# 10. Log de Erros Detalhado (Instalação)
echo -e "\n📄 Log de Erros Detalhado (Instalação):"
# Este comando só será útil se tivermos problemas de instalação futuros, por enquanto está desnecessário.
# npm install -g @supabase/cli --loglevel verbose 2>&1 | tee supabase_cli_install_log.txt

# Finalização
echo -e "\n🏁 Diagnóstico Concluído"
echo "Por favor, revise cuidadosamente a saída acima e o arquivo supabase_cli_install_log.txt (se gerado)" 