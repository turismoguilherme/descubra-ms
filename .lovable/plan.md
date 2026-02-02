
# Plano: Melhorias no Sistema de Eventos e Banner de Roteiros Personalizados

## ✅ IMPLEMENTADO

### Fase 1: Correção da Qualidade das Imagens ✅
- Corrigido `src/utils/imageOptimization.ts` para usar `/render/image/` em vez de `/object/`
- Agora as imagens do Supabase Storage são transformadas corretamente com width e quality

### Fase 2: Toggle do Banner no Admin ✅
- Adicionadas configurações no banco: `ms_roteiro_banner_enabled`
- Adicionados campos no admin SimpleTextEditor na seção "Banner Roteiro Personalizado"

### Fase 3: Opções de Contato no Banner ✅
- Adicionadas configurações: `ms_roteiro_contact_type`, `ms_roteiro_external_link`, `ms_roteiro_external_link_text`
- Atualizado `RoteiroPersonalizadoBanner.tsx` para suportar:
  - WhatsApp apenas
  - Link externo apenas
  - Ambos os botões

## Como Usar

### No Admin:
1. Acesse o painel admin do Descubra MS
2. Vá para o editor de conteúdo
3. Na seção "Banner Roteiro Personalizado":
   - **Exibir Banner**: `true` ou `false`
   - **Tipo de Contato**: `whatsapp`, `link` ou `both`
   - **Link Externo**: URL do site (ex: https://exemplo.com)
   - **Texto do Botão**: Texto exibido no botão de link externo

