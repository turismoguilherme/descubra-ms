# Usuários de Teste - Sistema Descubra MS

Para testar o sistema, você deve criar os usuários manualmente no Supabase Auth e depois executar uma função para criar os perfis correspondentes.

## Credenciais de Teste

### Administrador
- **Email:** admin-teste@ms.gov.br
- **Senha:** AdminTeste2024!
- **Papel:** admin

### Diretor Estadual
- **Email:** diretor-teste@ms.gov.br
- **Senha:** DiretorTeste2024!
- **Papel:** diretor_estadual

### Gestor IGR
- **Email:** gestor-igr-teste@ms.gov.br
- **Senha:** GestorIgrTeste2024!
- **Papel:** gestor_igr

### Gestor Municipal
- **Email:** gestor-municipal-teste@ms.gov.br
- **Senha:** GestorMunicipalTeste2024!
- **Papel:** gestor_municipal

### Atendente
- **Email:** atendente-teste@ms.gov.br
- **Senha:** AtendenteTeste2024!
- **Papel:** atendente

### Usuário Comum
- **Email:** usuario-teste@ms.gov.br
- **Senha:** UsuarioTeste2024!
- **Papel:** user

## Como Criar os Usuários

### Passo 1: Criar Usuários no Supabase Auth
1. Acesse o painel do Supabase
2. Vá em Authentication > Users
3. Clique em "Add user" para cada email acima
4. Use as senhas fornecidas
5. Marque "Auto Confirm User" para pular a confirmação de email

### Passo 2: Criar Perfis e Papéis
Após criar todos os usuários no Auth, execute esta função SQL no Supabase:

```sql
SELECT * FROM public.create_test_user_profiles();
```

Esta função criará automaticamente:
- Perfis de usuário na tabela `user_profiles`
- Papéis na tabela `user_roles` (exceto para usuários comuns)
- Logs de auditoria

## Notas Importantes

- **IMPORTANTE:** Os usuários devem ser criados primeiro no Supabase Auth antes de executar a função
- Todos os usuários têm senhas que atendem aos critérios de segurança
- O sistema está configurado para confirmação automática de email em desenvolvimento
- Para testar diferentes funcionalidades, use os diferentes tipos de usuário
- Os UUIDs dos usuários serão gerados automaticamente pela função

## Solução de Problemas

Se houver problemas com login:
1. Verifique se o usuário foi criado no Supabase Auth
2. Verifique se a função `create_test_user_profiles()` foi executada
3. Confirme que o Site URL e Redirect URLs estão configurados corretamente no Supabase
4. Use as credenciais exatas fornecidas acima

### Passo 2: Corrigir a Política RLS no Supabase

Você precisará executar o seguinte script SQL no **SQL Editor** do seu painel do Supabase:

1.  **Acesse o painel do Supabase** do seu projeto.
2.  Vá para **SQL Editor**.
3.  **Remova a política antiga (se existir):**
    Primeiro, para evitar conflitos, vamos remover a política existente que tenta permitir o acesso do usuário ao seu perfil. Se você já tem uma política com esse nome, esta linha vai garantir que ela seja removida antes de criarmos a nova.

    ```sql
    DROP POLICY IF EXISTS "Enable read access for users on their own profile and for admins" ON public.user_profiles;
    ```

4.  **Crie/Atualize a nova política para `user_profiles`:**
    Este script criará uma nova política (ou recriará se a anterior foi removida) que permitirá que um usuário leia seu próprio perfil, verificando `auth.uid() = user_id`, e também permitirá que `admins` leiam todos os perfis.

    ```sql
    -- Nova política de segurança para a tabela `user_profiles`.
    -- Garante que os usuários possam LER (SELECT) seus próprios perfis
    -- (verificando 'user_id' com 'auth.uid()') e que os 'admins' possam ler todos os perfis.
    CREATE POLICY "Enable read access for users on their own profile and for admins"
    ON public.user_profiles
    FOR SELECT
    USING (
      (auth.uid() = user_id) OR (public.get_current_user_role() = 'admin')
    );
    ```

5.  **Execute o script:** Clique no botão "RUN" no SQL Editor.

### Passo 3: Sincronize o Relógio do Seu Dispositivo

É **crucial** que você verifique as configurações de data e hora do seu sistema operacional e se certifique de que estão sincronizadas automaticamente com um servidor de horário na internet. O aviso `Session as retrieved from URL was issued in the future? Check the device clock for skew` continua aparecendo e pode causar falhas na validação da sessão do Supabase.

### Próximos Passos (Após as correções):

Depois de executar o script SQL no Supabase e verificar a sincronização do seu relógio:

1.  Faça um **"hard refresh"** no seu navegador (`Ctrl + Shift + R` ou `Cmd + Shift + R`).
2.  **Limpe o console** do navegador.
3.  **Reproduza o problema**: Tente fazer o login com o Google novamente.
4.  **Copie todos os novos logs** do console e cole-os aqui.

Estou confiante de que a combinação da correção do código e da política RLS resolverá o problema principal de carregamento do perfil e, consequentemente, a persistência do login.

Os logs que você compartilhou continuam a mostrar o mesmo problema: `profileData` para `user_profiles` ainda é `null`, mesmo com o `roleData` sendo encontrado e o login social parecendo bem-sucedido. Isso significa que, por algum motivo, o perfil do usuário na tabela `user_profiles` não está sendo recuperado (ou criado) corretamente após o login social.

A persistência do aviso "Session as retrieved from URL was issued in the future" também é um fator crítico, pois um desvio no relógio pode invalidar tokens de sessão, mesmo que o código pareça correto.

Com base nos logs e na pesquisa na web que realizei, a causa mais provável é uma combinação de:

1.  **Políticas de Row Level Security (RLS) incorretas ou conflitantes** na tabela `user_profiles` no Supabase, que estão impedindo o usuário de ler ou criar seu próprio perfil.
2.  **Problemas na inicialização ou persistência da sessão do cliente Supabase** no frontend, fazendo com que as consultas sejam realizadas sem o contexto do usuário autenticado, apesar do `user.id` estar presente nos logs.
3.  **O desvio de horário do relógio** do seu sistema, que pode estar causando problemas na validação dos tokens de sessão pelo Supabase.

Para resolver isso, vamos tentar uma abordagem mais robusta para garantir que as políticas RLS estejam configuradas corretamente e que o fluxo de sessão seja o mais estável possível.

### Nova Abordagem: Reiniciar e Padronizar as Políticas RLS do Supabase

Vamos aplicar um script SQL abrangente que garante que as políticas RLS para `user_profiles` e `user_roles` estejam configuradas corretamente, usando `user_id` para permissões de usuário e garantindo o acesso de `admin`.

#### Passo 1: Execute este script SQL no Supabase

1.  Acesse o painel do Supabase do seu projeto.
2.  Vá para **SQL Editor**.
3.  **Copie e cole o script completo abaixo.** Este script primeiro remove quaisquer políticas RLS existentes com nomes comuns para `user_profiles` e `user_roles` para evitar conflitos, e então as recria com a lógica correta.

    ```sql
    -- Re-criação da função auxiliar para obter o papel (role) do usuário logado, se necessário.
    -- Esta função é segura e permite que as políticas de segurança verifiquem
    -- a permissão do usuário de forma eficiente.
    CREATE OR REPLACE FUNCTION public.get_current_user_role()
    RETURNS text
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
    BEGIN
      -- Se o usuário não estiver logado, ele é um 'anônimo'.
      IF auth.uid() IS NULL THEN
        RETURN 'anon';
      END IF;

      -- Busca o papel (role) na tabela user_roles.
      -- Se não encontrar, retorna 'user' como padrão.
      RETURN COALESCE(
        (SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1),
        'user'
      );
    END;
    $$;


    -- REMOVER POLÍTICAS ANTIGAS DE user_profiles (para evitar conflitos)
    DROP POLICY IF EXISTS "Enable read access for users on their own profile and for admins" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

    -- NOVA POLÍTICA DE SEGURANÇA PARA SELECT NA TABELA `user_profiles`.
    -- Garante que os usuários possam LER (SELECT) seus próprios perfis
    -- (verificando 'user_id' com 'auth.uid()') e que os 'admins' possam ler todos os perfis.
    CREATE POLICY "Enable read access for users on their own profile and for admins"
    ON public.user_profiles
    FOR SELECT
    USING (
      (auth.uid() = user_id) OR (public.get_current_user_role() = 'admin')
    );

    -- NOVA POLÍTICA DE SEGURANÇA PARA INSERT NA TABELA `user_profiles`.
    -- Permite que usuários insiram seu próprio perfil.
    CREATE POLICY "Users can insert own profile"
    ON public.user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

    -- NOVA POLÍTICA DE SEGURANÇA PARA UPDATE NA TABELA `user_profiles`.
    -- Permite que usuários atualizem seu próprio perfil.
    CREATE POLICY "Users can update own profile"
    ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = user_id);


    -- REMOVER POLÍTICAS ANTIGAS DE user_roles (para evitar conflitos)
    DROP POLICY IF EXISTS "Enable read access for users on their own role and for admins" ON public.user_roles;
    DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
    DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

    -- NOVA POLÍTICA DE SEGURANÇA PARA SELECT NA TABELA `user_roles`.
    -- Garante que os usuários possam LER (SELECT) seus próprios papéis
    -- e que os 'admins' possam ler todos os papéis.
    CREATE POLICY "Enable read access for users on their own role and for admins"
    ON public.user_roles
    FOR SELECT
    USING (
      (auth.uid() = user_id) OR (public.get_current_user_role() = 'admin')
    );

    -- NOVA POLÍTICA DE SEGURANÇA PARA INSERT NA TABELA `user_roles`.
    -- Permite que administradores insiram novos papéis e usuários que se registram.
    CREATE POLICY "Admins and self-register can insert roles"
    ON public.user_roles
    FOR INSERT
    WITH CHECK (
      (public.get_current_user_role() = 'admin') OR (auth.uid() = user_id)
    );

    -- NOVA POLÍTICA DE SEGURANÇA PARA UPDATE NA TABELA `user_roles`.
    -- Permite que administradores atualizem papéis e usuários o seu próprio (se necessário para algum fluxo).
    CREATE POLICY "Admins and self-update can update roles"
    ON public.user_roles
    FOR UPDATE
    USING (
      (public.get_current_user_role() = 'admin') OR (auth.uid() = user_id)
    );
    ```

4.  Clique no botão **"RUN"** para executar o script.

#### Passo 2: Sincronize o Relógio do Seu Dispositivo

O aviso `Session as retrieved from URL was issued in the future? Check the device clock for skew` continua aparecendo. Isso pode causar a invalidação prematura de tokens de sessão. Por favor, siga os passos novamente para **sincronizar o relógio do seu computador com um servidor de horário na internet**.

#### Próximos Passos (Após as correções):

Depois de executar o script SQL no Supabase e verificar/sincronizar o seu relógio:

1.  **Reinicie completamente o servidor de desenvolvimento** (`npm run dev`).
2.  Faça um **"hard refresh"** no seu navegador (`Ctrl + Shift + R` ou `Cmd + Shift + R`).
3.  **Limpe o console** do navegador.
4.  **Reproduza o problema**: Tente fazer o login com o Google novamente.
5.  **Copie todos os novos logs** do console e cole-os aqui.

Essa abordagem deve resolver quaisquer problemas persistentes de RLS ou criação de perfil. Se o problema continuar, teremos que investigar mais a fundo a inicialização do cliente Supabase e o ciclo de vida dos componentes React.