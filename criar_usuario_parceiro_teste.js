/**
 * Script para criar usuário de autenticação para parceiro de teste
 * 
 * OPÇÃO 1: Execute no console do navegador (mais fácil)
 * 1. Abra o console do navegador (F12)
 * 2. Cole e execute o código abaixo
 * 
 * OPÇÃO 2: Execute via Node.js
 * node criar_usuario_parceiro_teste.js
 */

// Configurações do parceiro de teste
const PARTNER_EMAIL = 'parceiro.teste@descubrams.com.br';
const PARTNER_PASSWORD = 'ParceiroTeste2025!';

// Para usar no navegador, você precisa ter o supabase client disponível
// Se estiver usando no console do navegador, use: window.supabase ou importe do seu projeto

async function criarUsuarioParceiroTeste() {
  console.log('🔐 Criando usuário de teste para parceiro...');
  console.log(`📧 Email: ${PARTNER_EMAIL}`);
  
  // Obter cliente Supabase
  // Se estiver no navegador, use: const supabase = window.supabase || (await import('./src/integrations/supabase/client')).supabase;
  // Se estiver em Node.js, importe createClient do @supabase/supabase-js
  
  // Para este exemplo, vamos assumir que você está no navegador
  // e o supabase está disponível globalmente ou você importou
  
  try {
    // IMPORTANTE: Substitua esta linha pelo seu cliente Supabase
    // const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    // OU se estiver no navegador:
    // const { supabase } = await import('./src/integrations/supabase/client');
    
    console.log('⚠️  Por favor, configure o cliente Supabase antes de executar.');
    console.log('   Exemplo para navegador:');
    console.log('   const { supabase } = await import("./src/integrations/supabase/client");');
    console.log('');
    console.log('   Depois execute:');
    console.log('   criarUsuarioParceiroTesteComSupabase(supabase);');
    
    return;
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// Versão que aceita o cliente Supabase como parâmetro
async function criarUsuarioParceiroTesteComSupabase(supabase) {
  console.log('🔐 Criando usuário de teste para parceiro...');
  console.log(`📧 Email: ${PARTNER_EMAIL}`);
  
  try {
    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: PARTNER_EMAIL,
      password: PARTNER_PASSWORD,
      options: {
        emailRedirectTo: `${window?.location?.origin || 'http://localhost:5173'}/partner/dashboard`,
        data: {
          full_name: 'Parceiro de Teste',
          user_type: 'partner'
        }
      }
    });

    if (authError) {
      // Se o usuário já existe, tentar fazer login para verificar
      if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
        console.log('⚠️  Usuário já existe. Tentando fazer login...');
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: PARTNER_EMAIL,
          password: PARTNER_PASSWORD
        });

        if (signInError) {
          console.error('❌ Erro ao fazer login:', signInError.message);
          console.log('\n💡 Dica: O usuário pode já existir com uma senha diferente.');
          console.log('   Você pode resetar a senha no painel do Supabase ou usar outro email.');
          return;
        }

        console.log('✅ Login realizado com sucesso!');
        console.log(`👤 User ID: ${signInData.user.id}`);
        console.log('\n📋 Credenciais de teste:');
        console.log(`   Email: ${PARTNER_EMAIL}`);
        console.log(`   Senha: ${PARTNER_PASSWORD}`);
        return;
      }

      console.error('❌ Erro ao criar usuário:', authError.message);
      return;
    }

    if (authData.user) {
      console.log('✅ Usuário criado com sucesso!');
      console.log(`👤 User ID: ${authData.user.id}`);
      
      if (!authData.session) {
        console.log('⚠️  Usuário criado, mas precisa confirmar email.');
        console.log('   Em ambiente de desenvolvimento, você pode confirmar manualmente no painel do Supabase.');
      } else {
        console.log('✅ Usuário criado e logado automaticamente!');
      }

      console.log('\n📋 Credenciais de teste:');
      console.log(`   Email: ${PARTNER_EMAIL}`);
      console.log(`   Senha: ${PARTNER_PASSWORD}`);
      console.log('\n🔗 URL de login: /partner/login ou /descubramatogrossodosul/partner/login');
    }
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Exportar para uso
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { criarUsuarioParceiroTesteComSupabase, PARTNER_EMAIL, PARTNER_PASSWORD };
}

// Se executado diretamente
if (typeof window === 'undefined') {
  criarUsuarioParceiroTeste();
}
















