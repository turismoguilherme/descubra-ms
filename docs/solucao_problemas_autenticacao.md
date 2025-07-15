# Solução de Problemas de Autenticação Supabase

Este documento detalha os passos para diagnosticar e resolver problemas comuns de autenticação com Supabase, especialmente em cenários de login social (OAuth) onde o perfil do usuário não persiste ou os dados do perfil (`profileData`) retornam `null`.

## 1. Verificação e Configuração de URLs de Redirecionamento OAuth no Supabase

Um dos erros mais comuns em logins sociais é a configuração incorreta das URLs de redirecionamento no painel do Supabase. O Supabase precisa saber *exatamente* para onde redirecionar o usuário após a autenticação.

### 1.1. Padronizar a Porta de Desenvolvimento do Vite

Para garantir que a URL de desenvolvimento seja consistente (e, portanto, possa ser cadastrada de forma fixa no Supabase), você deve configurar o Vite para sempre iniciar na mesma porta.

1.  **Abra o arquivo `vite.config.ts` (ou `vite.config.js`)** na raiz do seu projeto.
2.  **Adicione ou modifique a seção `server`** para definir uma porta fixa, como `3000`:

    ```typescript
    // vite.config.ts
    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';

    export default defineConfig({
      plugins: [react()],
      server: {
        port: 3000, // Porta fixa para desenvolvimento
      },
    });
    ```

    Se você já tem uma seção `server`, apenas adicione ou ajuste a linha `port: 3000`.

### 1.2. Configurar as URLs de Redirecionamento no Supabase

Após padronizar a porta de desenvolvimento, você deve cadastrar as URLs corretas no seu projeto Supabase.

1.  **Acesse o Painel do Supabase:** Faça login no seu painel Supabase.
2.  **Navegue para Autenticação > Configurações (Authentication > Settings).**
3.  **Localize a seção "Redirect URLs"** (ou "URLs de Redirecionamento").
4.  **Adicione as seguintes URLs:**
    *   `http://localhost:3000`
    *   `http://localhost:3000/*` (para capturar qualquer caminho após o domínio)

    Se você tiver um ambiente de produção ou staging, adicione também as URLs correspondentes (ex: `https://seusite.com` e `https://seusite.com/*`).

    Exemplo de como deve ficar:
    ```
    http://localhost:3000
    http://localhost:3000/*
    https://seusiteproducao.com
    https://seusiteproducao.com/*
    ```

5.  **Salve as alterações.**

## 2. Verificação de Políticas de Row Level Security (RLS)

Políticas RLS incorretas podem impedir que seu aplicativo leia ou escreva dados nas tabelas, mesmo que o usuário esteja autenticado. O problema comum é a RLS da tabela `user_profiles` não estar configurada para usar a coluna `user_id` (que liga ao `auth.users.id`).

### 2.1. Script SQL para a Tabela `user_profiles`

Você deve garantir que as políticas RLS na tabela `public.user_profiles` permitam que um usuário leia e atualize *seu próprio* perfil com base no `user_id`.

Execute o seguinte script no **SQL Editor** do seu painel Supabase:

```sql
-- Habilitar RLS para user_profiles (se ainda não estiver habilitado)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir SELECT (leitura) de perfil pelo próprio usuário
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir INSERT (criação) de perfil pelo próprio usuário
CREATE POLICY "Users can create their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para permitir UPDATE (atualização) de perfil pelo próprio usuário
CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);
```

**Importante:** Verifique se não há políticas duplicadas ou conflitantes. Se houver, remova as políticas antigas ou incorretas antes de aplicar essas.

## 3. Depuração do Código Frontend

Apesar das correções de RLS e URLs, é crucial que o código frontend esteja configurado corretamente para interagir com o Supabase e gerenciar o estado do usuário.

### 3.1. Cliente Supabase (`src/integrations/supabase/client.ts`)

O cliente Supabase deve ser configurado para persistir a sessão e, em alguns casos, desabilitar a detecção automática da sessão na URL para evitar conflitos com redirecionamentos OAuth.

```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false, // Desabilitar para mitigar problemas de persistência pós-OAuth
    },
  }
);
```

### 3.2. Provedor de Autenticação (`src/hooks/auth/AuthProvider.tsx`)

O `AuthProvider` é responsável por gerenciar o estado do usuário e buscar os dados do perfil e do papel. É vital que ele lide com a criação e atualização do perfil básico para novos usuários (especialmente via login social).

Certifique-se de que a função `fetchAndSetUserProfile` (ou equivalente) inclua um `upsert` que cria um registro básico em `user_profiles` se ele não existir, usando `user_id`.

```typescript
// src/hooks/auth/AuthProvider.tsx - Dentro de fetchAndSetUserProfile
const fetchAndSetUserProfile = useCallback(async (user: User | null) => {
  // ... código existente ...

  try {
    // 1. Garantir que um perfil básico exista para o usuário autenticado.
    // Isso lida com casos onde usuários se cadastram via provedores sociais e um perfil ainda não foi criado.
    const initialProfileData = {
      user_id: user.id,
      full_name: user.user_metadata?.full_name || user.email || 'Novo Usuário',
    };

    const { data: upsertedProfile, error: upsertError } = await supabase
      .from('user_profiles')
      .upsert(initialProfileData, { onConflict: 'user_id' })
      .select('full_name, id, created_at, updated_at') // Selecionar campos necessários para o retorno
      .single();

    if (upsertError) {
      console.error("❌ AUTH: Erro no upsert inicial do perfil:", upsertError);
      throw upsertError;
    }

    console.log("✅ AUTH: Perfil básico upserted/existente:", upsertedProfile);

    // 2. Buscar o perfil completo do usuário (incluindo o ID do perfil da tabela user_profiles)
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('full_name, id') // Selecione apenas o que está em user_profiles
      .eq('user_id', user.id) // Correção: Usar user_id para vincular ao auth.users.id
      .maybeSingle();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error("❌ AUTH: Erro ao buscar profileData:", profileError);
      throw profileError;
    }

    // ... restante do código para buscar roleData e combinar ...
  } catch (error) {
    // ... tratamento de erro ...
  }
});
```

### 3.3. Página de Completar Perfil (`src/pages/CompleteProfileNew.tsx`)

O componente `CompleteProfileNew.tsx` deve garantir que o `upsert` de perfil use `user_id` e `onConflict: 'user_id'` para evitar a criação de múltiplos perfis para o mesmo usuário.

```typescript
// src/pages/CompleteProfileNew.tsx - Dentro de handleSubmit
const handleSubmit = async (e: React.FormEvent) => {
  // ... código existente ...

  try {
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id, // Correção: Usar user_id para vincular ao auth.users.id
        full_name: formData.fullName,
        city_id: formData.city,
        region_id: formData.region,
        // ... outros campos ...
      }, { onConflict: 'user_id' }); // Adicionar onConflict para evitar duplicatas

    if (error) {
      console.error("❌ COMPLETE_PROFILE: Erro ao salvar perfil:", error);
      toast.error(`Erro ao completar perfil: ${error.message}`);
      setIsSubmitting(false);
      return;
    }

    // ... restante do código ...
  } catch (error) {
    // ... tratamento de erro ...
  }
};
```

## 4. O Problema "Session as retrieved from URL was issued in the future"

Este aviso indica que o relógio do seu dispositivo pode estar dessincronizado com o servidor Supabase. Isso pode invalidar tokens de sessão.

### Solução:

Certifique-se de que a data e hora do seu sistema operacional estejam sincronizadas com a internet. No Windows, você pode fazer isso em `Configurações > Hora e Idioma > Data e Hora` e ativar `Definir hora automaticamente` e clicar em `Sincronizar agora`.

## Próximos Passos

Após seguir e aplicar todas as instruções deste documento:

1.  **Reinicie seu servidor de desenvolvimento (`npm run dev`).**
2.  **Faça um "hard refresh" no seu navegador** (`Ctrl + Shift + R` ou `Cmd + Shift + R`).
3.  **Limpe o cache e os dados do site** no seu navegador (em Ferramentas de Desenvolvedor > Aplicativo > Armazenamento > Limpar dados do site).
4.  **Tente o login social novamente.**
5.  **Forneça os logs do console** após tentar o login, prestando atenção às mensagens que começam com `🔄 AUTH:`, `✅ AUTH:`, `❌ AUTH:`, `🔗 SOCIAL LOGIN:` e `👤 REGISTER:`. 