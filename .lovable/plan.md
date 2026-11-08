# Plano: Recompensas com QR Code, Refazer Rota, Compartilhar do Ranking e Foto de Perfil

## Escolhas recomendadas (você pediu a melhor opção)
- **Aba Recompensas:** duas partes — "Meus vouchers" (prontos para usar, usados, vencidos) e "Para desbloquear" (prêmios das rotas que faltam). É o padrão de apps de fidelidade (iFood, Starbucks): mostra o que tem e incentiva a explorar mais.
- **QR Code:** janela em destaque (tela cheia no celular), QR grande, código em letras grandes e botão copiar. Mais fácil para o parceiro ler no balcão.
- **Compartilhar do Ranking:** um único botão "Compartilhar" com menu: WhatsApp, Copiar link, Baixar imagem para Story, Ver página pública. No celular, abre também o compartilhar do próprio aparelho.
- **Foto de perfil:** ao enviar foto nova, ela passa a ser usada na hora (sua escolha).

## Fases
1. **Refazer Rota:** liberar no banco a permissão da função de reiniciar rota para usuários logados (erro "permission denied"). Continua só podendo reiniciar a própria rota; vouchers ganhos são mantidos.
2. **Aba Recompensas na página do Passaporte:** nova aba ao lado de "Roteiros" e "Ranking", com a lista de vouchers e a janela do QR Code.
3. **Ranking:** trocar os 5 botões por 1 botão com menu.
4. **Foto de perfil:** a foto nova aparece na hora no perfil, no menu e no ranking (sem ficar presa a foto antiga do navegador).
5. **Testes:** abrir a aba Recompensas, abrir o QR, refazer rota, compartilhar e trocar foto.

## Detalhes técnicos
- Migração: `GRANT EXECUTE ON FUNCTION public.reset_user_route_progress(uuid, uuid) TO authenticated;` (função já valida `p_user_id = auth.uid()`).
- `src/pages/ms/PassaporteLista.tsx`: terceira aba `rewards`.
- Novo `src/components/passport/PassportAllRewardsView.tsx`: busca `user_rewards` + `passport_rewards` do usuário; vitrine com `passport_rewards` de rotas não concluídas.
- Novo `src/components/passport/VoucherModal.tsx`: reaproveita `VoucherQRCode`.
- `RankingShareCard.tsx`: DropdownMenu com as ações existentes (sem duplicar lógica).
- `uploadProfilePhoto.ts`: URL com `?t=Date.now()` e `cacheControl` baixo; `ProfilePageFixed.tsx` já define `avatar_display_mode='photo'`, o hook `useUserAvatar` atualiza via Realtime.
