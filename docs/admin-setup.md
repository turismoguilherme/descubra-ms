# Configuração de Administradores

## Papéis de Usuário (Roles)

O sistema foi reestruturado para utilizar os seguintes papéis, alinhados com a organização do turismo no estado:

-   `admin`: Administrador geral com acesso irrestrito ao sistema.
-   `diretor_estadual`: Gestor com visão de todos os dados do estado, mas sem permissões técnicas de `admin`.
-   `gestor_igr`: Gestor de uma Região Turística (IGR), com acesso aos dados de todos os municípios da sua região.
-   `gestor_municipal`: Gestor de um município específico, com acesso apenas aos dados da sua cidade.
-   `atendente`: Funcionário de um Centro de Atendimento ao Turista (CAT), com permissões limitadas para operações específicas, como check-in.
-   `user`: Usuário comum da plataforma.

## Elevando Usuários para Admin

A forma mais segura de gerenciar papéis é através do painel do Supabase. No entanto, para uma configuração rápida de um administrador técnico, as opções abaixo continuam válidas.

### Opção 1: Console do Navegador (Desenvolvimento)
1. Abra o console do navegador (F12)
2. Execute: `elevateToAdmin("email@exemplo.com")`
3. A função está disponível globalmente no ambiente de desenvolvimento.

### Opção 2: Banco de Dados (Recomendado)
Execute no SQL Editor do Supabase para elevar um usuário a `admin`:
```sql
SELECT elevate_to_admin('email@exemplo.com');
```

Para atribuir outros papéis, use um `UPDATE` direto na tabela `user_roles`, especificando a região ou cidade, se aplicável:
```sql
-- Exemplo para Gestor de IGR (substitua os valores)
UPDATE public.user_roles
SET 
  role = 'gestor_igr',
  region_id = (SELECT id FROM public.regions WHERE name = 'Nome da Região')
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'email@exemplo.com');

-- Exemplo para Gestor Municipal (substitua os valores)
UPDATE public.user_roles
SET 
  role = 'gestor_municipal',
  city_id = (SELECT id FROM public.cities WHERE name = 'Nome da Cidade')
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'email@exemplo.com');
```

## Verificando Papéis
Para verificar os papéis e as associações de um usuário:
```sql
SELECT u.email, ur.role, r.name as region_name, c.name as city_name
FROM auth.users u 
LEFT JOIN user_roles ur ON u.id = ur.user_id 
LEFT JOIN public.regions r ON ur.region_id = r.id
LEFT JOIN public.cities c ON ur.city_id = c.id
WHERE u.email = 'email@exemplo.com';
```

## Criando Primeiro Admin
Se não existe nenhum admin no sistema:
1. Acesse a rota `/admin-seed` na aplicação.
2. Preencha o formulário de criação.
3. O primeiro usuário com o papel `admin` será criado.