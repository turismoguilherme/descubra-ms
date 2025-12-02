# 🪣 Guia: Criar Bucket `event-images` no Supabase Storage

## ⚠️ Problema
O bucket `event-images` não existe no Supabase Storage, causando erro ao fazer upload de banners de eventos.

## ✅ Solução Rápida (2 minutos)

### Passo 1: Acessar Supabase Dashboard
1. Acesse: https://app.supabase.com
2. Faça login
3. Selecione o projeto: **hvtrpkbjgbuypkskqcqm**

### Passo 2: Criar o Bucket
1. No menu lateral, clique em **Storage**
2. Clique no botão **New bucket** (ou **Criar bucket**)
3. Preencha:
   - **Name**: `event-images`
   - **Public bucket**: ✅ **MARQUE ESTA OPÇÃO** (importante para permitir leitura pública das imagens)
4. Clique em **Create bucket**

### Passo 3: Configurar Políticas (Opcional mas Recomendado)

**Opção A: Via SQL Editor (Mais Fácil)**
1. No Supabase Dashboard, vá em **SQL Editor**
2. Clique em **New Query**
3. Abra o arquivo: `supabase/storage_policies_event_images.sql`
4. Copie TODO o conteúdo e cole no SQL Editor
5. Clique em **RUN** (ou Ctrl+Enter)

**Opção B: Via Policies do Bucket**
1. Clique no bucket `event-images` que acabou de criar
2. Vá na aba **Policies**
3. Clique em **New Policy**
4. Selecione **For full customization**
5. Abra o arquivo: `supabase/storage_policies_event_images.sql`
6. Copie e cole o SQL (sem os comentários se preferir)
7. Clique em **Review** e depois **Save policy**

## ✅ Pronto!

Agora o upload de banners deve funcionar. Teste novamente cadastrando um evento com banner.

---

## 🔧 Alternativa: Usar URL de Imagem

Se não quiser criar o bucket agora, você pode:
1. Fazer upload da imagem em outro serviço (Imgur, Cloudinary, etc.)
2. Usar a URL da imagem no campo "URL da Imagem" do formulário
3. O evento será enviado normalmente com a URL fornecida

