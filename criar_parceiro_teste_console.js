/**
 * Script para criar parceiro de teste - Execute no Console do Navegador
 * 
 * INSTRUÇÕES:
 * 1. Abra a aplicação no navegador
 * 2. Abra o Console (F12)
 * 3. Cole e execute este código completo
 */

(async function criarParceiroTeste() {
  console.log('🚀 Iniciando criação de parceiro de teste...\n');
  
  // Importar cliente Supabase
  const { supabase } = await import('./src/integrations/supabase/client');
  
  const PARTNER_EMAIL = 'parceiro.teste@descubrams.com.br';
  const PARTNER_PASSWORD = 'ParceiroTeste2025!';
  
  try {
    // Passo 1: Criar parceiro na tabela institutional_partners
    console.log('📝 Passo 1: Criando registro do parceiro...');
    const { data: partnerData, error: partnerError } = await supabase
      .from('institutional_partners')
      .insert({
        name: 'Parceiro de Teste',
        description: 'Parceiro criado para testes do sistema de login',
        contact_email: PARTNER_EMAIL,
        contact_phone: '(67) 99999-9999',
        is_active: true,
        partner_type: 'general'
      })
      .select()
      .single();
    
    if (partnerError) {
      if (partnerError.code === '23505') { // Violação de constraint única
        console.log('⚠️  Parceiro já existe na tabela. Continuando...');
      } else {
        console.error('❌ Erro ao criar parceiro:', partnerError);
        return;
      }
    } else {
      console.log('✅ Parceiro criado na tabela:', partnerData.id);
    }
    
    // Passo 2: Criar usuário de autenticação
    console.log('\n🔐 Passo 2: Criando usuário de autenticação...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: PARTNER_EMAIL,
      password: PARTNER_PASSWORD,
      options: {
        emailRedirectTo: `${window.location.origin}/partner/dashboard`,
        data: {
          full_name: 'Parceiro de Teste',
          user_type: 'partner'
        }
      }
    });
    
    if (authError) {
      if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
        console.log('⚠️  Usuário já existe. Tentando fazer login para verificar...');
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: PARTNER_EMAIL,
          password: PARTNER_PASSWORD
        });
        
        if (signInError) {
          console.error('❌ Erro ao fazer login:', signInError.message);
          console.log('\n💡 O usuário pode existir com senha diferente.');
          console.log('   Você pode resetar a senha no painel do Supabase.');
          return;
        }
        
        console.log('✅ Login realizado com sucesso!');
        console.log(`👤 User ID: ${signInData.user.id}`);
      } else {
        console.error('❌ Erro ao criar usuário:', authError.message);
        return;
      }
    } else if (authData.user) {
      console.log('✅ Usuário criado com sucesso!');
      console.log(`👤 User ID: ${authData.user.id}`);
      
      if (!authData.session) {
        console.log('⚠️  Usuário criado, mas precisa confirmar email.');
        console.log('   Em desenvolvimento, confirme manualmente no painel do Supabase.');
      } else {
        console.log('✅ Usuário criado e logado automaticamente!');
      }
    }
    
    // Resumo final
    console.log('\n' + '='.repeat(50));
    console.log('✨ PARCEIRO DE TESTE CRIADO COM SUCESSO!');
    console.log('='.repeat(50));
    console.log('\n📋 Credenciais de Login:');
    console.log(`   Email: ${PARTNER_EMAIL}`);
    console.log(`   Senha: ${PARTNER_PASSWORD}`);
    console.log('\n🔗 URLs de Login:');
    console.log(`   - ${window.location.origin}/partner/login`);
    console.log(`   - ${window.location.origin}/descubramatogrossodosul/partner/login`);
    console.log('\n✅ Pronto para testar!');
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
})();
















