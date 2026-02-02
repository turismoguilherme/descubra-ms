
# Plano: Melhorias no Sistema de Eventos e Banner de Roteiros Personalizados

## Resumo das Solicitações
1. **Qualidade das imagens de eventos** - Corrigir a qualidade baixa das imagens quando alguém cadastra um evento (ex: Luan Santana)
2. **Toggle para Banner de Roteiros Personalizados** - Adicionar opção no admin para ativar/desativar o banner
3. **Duas opções de contato no Banner** - Além do WhatsApp, ter opção de redirecionar para outro site

---

## Análise Técnica

### 1. Problema de Qualidade das Imagens

**Causa Raiz Identificada:**
O arquivo `src/utils/imageOptimization.ts` está construindo URLs incorretas para transformação de imagens do Supabase.

```text
URL ATUAL (incorreta):
https://hvtrpkbjgbuypkskqcqm.supabase.co/storage/v1/object/public/event-images/image.jpg?width=1920&quality=95

URL CORRETA (para transformação):
https://hvtrpkbjgbuypkskqcqm.supabase.co/storage/v1/render/image/public/event-images/image.jpg?width=1920&quality=95
```

O Supabase Storage exige que a URL use `/render/image/` em vez de `/object/` para aplicar transformações de imagem (redimensionamento e qualidade).

**Solução:**
Corrigir a função `optimizeSupabaseImage()` para:
- Substituir `/object/public/` por `/render/image/public/` nas URLs
- Manter a qualidade em 95% para exibição nítida
- Adicionar tratamento de fallback se a transformação falhar

### 2. Toggle para Ativar/Desativar Banner

**Implementação:**
- Adicionar nova configuração `ms_roteiro_banner_enabled` na tabela `site_settings`
- Adicionar campo toggle no painel admin (SimpleTextEditor)
- Modificar o componente `RoteiroPersonalizadoBanner` para verificar essa configuração

### 3. Duas Opções de Contato no Banner

**Implementação:**
- Adicionar novas configurações:
  - `ms_roteiro_contact_type` = 'whatsapp' | 'link' | 'both'
  - `ms_roteiro_external_link` = URL do site externo
  - `ms_roteiro_external_link_text` = Texto do botão para link externo
- Modificar o banner para exibir um ou dois botões conforme configuração

---

## Plano de Implementação

### Fase 1: Correção da Qualidade das Imagens

**Arquivo: `src/utils/imageOptimization.ts`**
- Corrigir a função `optimizeSupabaseImage()` para usar `/render/image/` 
- Adicionar tratamento para URLs já otimizadas
- Manter fallback para URL original se a transformação não funcionar

### Fase 2: Toggle do Banner no Admin

**Arquivo: `src/components/admin/platform/SimpleTextEditor.tsx`**
- Adicionar novo campo na seção "Hero Universal" para toggle do banner de roteiros

**Nova Configuração no Banco:**
```sql
INSERT INTO site_settings (platform, setting_key, setting_value, description)
VALUES ('ms', 'ms_roteiro_banner_enabled', 'true', 'Ativar/desativar o banner de roteiros personalizados');
```

### Fase 3: Opções de Contato no Banner

**Arquivo: `src/components/admin/platform/SimpleTextEditor.tsx`**
- Adicionar campos para:
  - Tipo de contato (WhatsApp / Link Externo / Ambos)
  - URL do link externo
  - Texto do botão do link externo

**Arquivo: `src/components/home/RoteiroPersonalizadoBanner.tsx`**
- Carregar as novas configurações
- Renderizar botões conforme configuração:
  - WhatsApp apenas
  - Link externo apenas
  - Ambos os botões

**Novas Configurações no Banco:**
```sql
INSERT INTO site_settings (platform, setting_key, setting_value, description)
VALUES 
  ('ms', 'ms_roteiro_contact_type', 'whatsapp', 'Tipo de contato: whatsapp, link, ou both'),
  ('ms', 'ms_roteiro_external_link', '', 'URL do site externo para contato'),
  ('ms', 'ms_roteiro_external_link_text', 'Acessar Site', 'Texto do botão para link externo');
```

---

## Arquivos a Modificar

| Arquivo | Modificação |
|---------|-------------|
| `src/utils/imageOptimization.ts` | Corrigir URL para usar `/render/image/` |
| `src/components/admin/platform/SimpleTextEditor.tsx` | Adicionar campos de configuração do banner |
| `src/components/home/RoteiroPersonalizadoBanner.tsx` | Implementar toggle e opções de contato |
| Migração SQL | Criar novas configurações no banco |

---

## Resultado Esperado

1. **Imagens de eventos** serão exibidas com alta qualidade (1920px, 95% qualidade)
2. **Admin** terá controle total sobre o banner de roteiros:
   - Ativar/desativar completamente
   - Escolher tipo de contato (WhatsApp, Link ou Ambos)
   - Configurar URL e texto do link externo
3. **Usuários** verão opções de contato conforme configurado pelo admin
