// Script para criar usuários do setor público
// Execute este script no console do navegador (F12)

console.log('🚀 Iniciando criação de usuários do setor público...');

// Função para criar usuário
async function createPublicSectorUser(email, password, companyName, contactPerson, role) {
  try {
    console.log(`📝 Criando usuário: ${email}`);
    
    // Importar Supabase client
    const { createClient } = window.supabase;
    const supabase = createClient(
      'https://hvtrpkbjgbuypkskqcqm.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2dHJwa2JqZ2J1eXBrc2txY3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NzQ4NzQsImV4cCI6MjA1MTA1MDg3NH0.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq'
    );
    
    // Criar usuário
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          company_name: companyName,
          contact_person: contactPerson,
          role: role
        }
      }
    });
    
    if (error) {
      console.error(`❌ Erro ao criar ${email}:`, error);
      return false;
    }
    
    console.log(`✅ Usuário ${email} criado com sucesso!`);
    
    // Criar perfil na tabela overflow_one_users
    if (data.user) {
      const { error: profileError } = await supabase
        .from('overflow_one_users')
        .insert({
          user_id: data.user.id,
          company_name: companyName,
          contact_person: contactPerson,
          role: role,
          subscription_plan: 'basic',
          subscription_status: 'active'
        });
      
      if (profileError) {
        console.error(`❌ Erro ao criar perfil para ${email}:`, profileError);
      } else {
        console.log(`✅ Perfil criado para ${email}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Erro geral ao criar ${email}:`, error);
    return false;
  }
}

// Lista de usuários para criar
const users = [
  {
    email: 'atendente@ms.gov.br',
    password: 'atendente123',
    companyName: 'CAT Mato Grosso do Sul',
    contactPerson: 'Atendente Teste',
    role: 'atendente'
  },
  {
    email: 'gestor.municipal@ms.gov.br',
    password: 'gestor123',
    companyName: 'Prefeitura Municipal',
    contactPerson: 'Gestor Municipal Teste',
    role: 'gestor_municipal'
  },
  {
    email: 'gestor.regional@ms.gov.br',
    password: 'regional123',
    companyName: 'Governo Regional',
    contactPerson: 'Gestor Regional Teste',
    role: 'gestor_regional'
  },
  {
    email: 'admin@ms.gov.br',
    password: 'admin123',
    companyName: 'Governo do Estado MS',
    contactPerson: 'Administrador Teste',
    role: 'admin'
  }
];

// Função principal
async function createAllUsers() {
  console.log('🎯 Iniciando criação de todos os usuários...');
  
  for (const user of users) {
    await createPublicSectorUser(
      user.email,
      user.password,
      user.companyName,
      user.contactPerson,
      user.role
    );
    
    // Aguardar um pouco entre criações
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('🎉 Criação de usuários concluída!');
  console.log('📋 Credenciais disponíveis:');
  users.forEach(user => {
    console.log(`   ${user.email} / ${user.password} (${user.role})`);
  });
}

// Executar
createAllUsers();
