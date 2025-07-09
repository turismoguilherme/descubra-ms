# Configuração de Administradores

## Problema dos Roles

O sistema foi corrigido para aceitar os seguintes roles:
- `admin`: Administrador geral do sistema
- `tech`: Administrador técnico  
- `municipal`: Usuário municipal
- `municipal_manager`: Gerente municipal
- `gestor`: Gestor/gerente
- `atendente`: Atendente CAT
- `user`: Usuário comum

## Elevando Usuários para Admin

### Opção 1: Interface Gráfica
1. Acesse a página de configuração inicial do sistema
2. Use o componente "Elevar Usuário para Admin"
3. Digite o email do usuário a ser elevado
4. Clique em "Elevar para Admin"

### Opção 2: Console do Navegador
1. Abra o console do navegador (F12)
2. Execute: `elevateToAdmin("email@exemplo.com")`
3. A função está disponível globalmente

### Opção 3: Banco de Dados
Execute no SQL Editor do Supabase:
```sql
SELECT elevate_to_admin('email@exemplo.com');
```

## Verificando Roles
Para verificar os roles de um usuário:
```sql
SELECT u.email, ur.role 
FROM auth.users u 
LEFT JOIN user_roles ur ON u.id = ur.user_id 
WHERE u.email = 'email@exemplo.com';
```

## Criando Primeiro Admin
Se não existe nenhum admin no sistema:
1. Acesse `/admin-seed`
2. Preencha o formulário de criação
3. O primeiro admin será criado automaticamente