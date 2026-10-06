# Usuários do Descubra MS mais claros + WhatsApp do perfil simplificado

## 1. Tela de Usuários (aba Descubra MS)
- Nova coluna/etiqueta de tipo com cores distintas:
  - Turista (perfil normal da plataforma)
  - Parceiro — mostra também o nome do negócio quando existir
  - Atendente / Administrador (destaque de equipe)
- Filtro rápido no topo da aba: **Todos | Turistas | Parceiros | Equipe**, cada um com a contagem.
- A busca passa a encontrar também pelo nome do negócio do parceiro.

## 2. Perfil do visitante (Descubra MS)
- O cartão "WhatsApp do Guatá" vira um campo simples "Seu WhatsApp (para avisos das reservas)", sem a instrução de digitar "vincular".
- Explicar em uma linha que os avisos de mensagens do anfitrião chegam por ali; o chat em si continua na aba **Reservas**, botão "Conversar com o anfitrião".

## 3. Painel Guatá Labs
- Conferir se ainda sobrou algum menu, atalho ou arquivo de Monitoramento/Auditoria e remover o que restar.

## Detalhes técnicos
- `admin-users` (ação `list`): incluir `partner_name` e `is_partner` cruzando `institutional_partners` por `user_id`/`contact_email`; o tipo prioriza parceiro > equipe > turista.
- `UsersManagement.tsx`: estado de filtro por tipo; `UsersTable.tsx`: badge por tipo + subtítulo com nome do negócio.
- Perfil: ajustar o componente do cartão de WhatsApp mantendo o mesmo campo de telefone já salvo.
- Remover arquivos `src/components/admin/system/AuditLogs.tsx` e `SystemMonitoring.tsx` se ainda existirem, e referências em `adminModulesConfig.ts`/`ViaJARAdminPanel.tsx`.
- Reimplantar a função `admin-users` e validar no navegador.
