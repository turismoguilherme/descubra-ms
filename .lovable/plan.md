

# Plano: Atualizar Cases + Sistema de Newsletter Separado

## 1. Pagina Cases -- Atualizar Layout (sem icones flutuantes)

A pagina `CasosSucesso.tsx` usa um hero generico com dots e gradient orbs. Vou atualizar para usar o `TechBackground` (grid neural + particulas + orbs animados) **sem** o `FloatingTechElements` (que sao os icones flutuantes que voce nao gostou).

**Mudancas:**
- Substituir o hero manual (linhas 111-137) por `TechBackground variant="hero"` como fundo
- Manter os cards de cases e CTA como estao
- Aplicar `TechBackground` tambem na secao CTA para consistencia
- **Nao usar** FloatingTechElements em nenhum lugar

## 2. Sistema de Newsletter -- Separado por Plataforma

Criar tabela `newsletter_subscribers` com coluna `platform` para separar assinantes do **Descubra MS** e da **ViaJARTur**.

**Banco de dados:**
```sql
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('descubra_ms', 'viajar')),
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE (email, platform)
);
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
-- Politica: qualquer pessoa pode se inscrever, admins podem ler
CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can read" ON newsletter_subscribers FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));
```

**Frontend:**
- `UniversalFooter.tsx` -- Conectar o formulario existente ao Supabase com `platform: 'descubra_ms'`
- `ViaJARFooter.tsx` -- Adicionar campo de newsletter com `platform: 'viajar'`
- Ambos fazem `INSERT` real na tabela em vez do `setTimeout` fake atual

## 3. Limpeza

- Remover `console.log` de debug do `ViaJARFooter.tsx` (linha 12)

## Arquivos Afetados

| Arquivo | Acao |
|---------|------|
| `src/pages/CasosSucesso.tsx` | Trocar hero por TechBackground (sem FloatingTechElements) |
| `src/components/layout/UniversalFooter.tsx` | Conectar newsletter ao Supabase (platform: descubra_ms) |
| `src/components/layout/ViaJARFooter.tsx` | Adicionar newsletter + conectar ao Supabase (platform: viajar) |
| SQL Migration | Criar tabela `newsletter_subscribers` |

