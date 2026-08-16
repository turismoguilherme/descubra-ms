# Auditoria de segurança: dados pessoais e proteção contra invasões

## O que a verificação encontrou (confirmado no banco agora)

1. **Crítico — parceiro pode ser assumido por quem tiver o mesmo e-mail**
   As funções `is_partner_owner` e `partner_row_is_mine` (usadas nas políticas de preços, reservas, disponibilidade, notificações, transações, políticas de cancelamento, aceites de termos, mensagens de reserva, `institutional_partners` e imagens de parceiro) ainda comparam o `contact_email` do parceiro com o e-mail do usuário logado. Como e-mail comercial é público, qualquer pessoa que se cadastre com aquele e-mail passaria a ser tratada como dona do parceiro.
   Verificado: hoje existe 1 parceiro institucional e **nenhum** registro com `created_by` nulo — ou seja, o atalho por e-mail não é mais necessário e pode ser removido sem quebrar nada.

2. **Cache do chat Guatá legível por qualquer visitante**
   Em `guata_response_cache` a política de leitura é `USING (true)`, inclusive para linhas `cache_type = 'individual'`, que guardam conversa vinculada a `session_id`/`user_id`. Alguém que adivinhe/enumere um `session_id` lê a conversa de outra pessoa.

3. **Registro de tentativas de código pode ser falsificado**
   Em `checkpoint_code_attempts` o INSERT só exige `auth.uid() IS NOT NULL`, sem checar `user_id = auth.uid()`. Um usuário logado pode gravar tentativas no nome de outro, sujando os dados antiabuso (e podendo provocar bloqueio de outra pessoa).

4. **Avisos do linter Supabase (nível aviso)**
   Funções `SECURITY DEFINER` executáveis por `anon`/`authenticated`. Serão revisadas uma a uma: as que não precisam ser chamadas do cliente perdem o `EXECUTE`; as que são legitimamente públicas (ex.: leitura de conteúdo público) ficam documentadas na memória de segurança.

## O que já está correto (não será mexido)

- Todas as tabelas do schema `public` têm RLS habilitado (verificado: nenhuma sem RLS).
- Nenhuma tabela de dados pessoais de usuário (perfis, passaporte, reservas) tem leitura pública. As únicas leituras `USING (true)` com campo de contato são `destination_details` e `guata_tourist_attractions`, que são dados turísticos públicos de estabelecimentos.
- Nenhum achado de dependências vulneráveis, conectores ou MCP.

## Correções propostas

**A. Remover o atalho por e-mail na posse de parceiro**
- Reescrever `is_partner_owner` e `partner_row_is_mine` para exigir apenas `created_by = auth.uid()`.
- Garantir no cadastro de parceiro que `created_by` seja sempre preenchido com `auth.uid()` (e conferir o registro existente).

**B. Restringir o cache individual do Guatá**
- Substituir a política de leitura por: linhas `shared` liberadas; linhas `individual` só para o dono (`user_id = auth.uid()`), seguindo o mesmo padrão já usado em `koda_response_cache`. Ajustar UPDATE/DELETE na mesma lógica.
- Conferir se o chat anônimo continua funcionando (leitura de cache compartilhado permanece).

**C. Corrigir a política de tentativas de check-in**
- `WITH CHECK (user_id = auth.uid() OR user_id IS NULL)` no INSERT de `checkpoint_code_attempts`.

**D. Endurecer funções SECURITY DEFINER**
- Revogar `EXECUTE` de `anon`/`authenticated` nas funções internas que não devem ser chamadas do cliente; manter e documentar as públicas legítimas.

**E. Atualizar a memória de segurança**
- Registrar as decisões (o que foi corrigido e o que é exposição pública intencional) para o scanner não reabrir os mesmos pontos.

## Detalhes técnicos

- Tudo em A–D é feito por migração SQL (funções + políticas), sem alterar contratos de front-end, exceto garantir `created_by` no cadastro de parceiro.
- Após a migração: rodar novo scan de segurança e testar os fluxos afetados (login/painel do parceiro, chat Guatá anônimo e logado, check-in por código no passaporte).
