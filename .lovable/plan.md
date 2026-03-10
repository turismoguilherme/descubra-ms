

# Relatório: Passaporte Digital -- O que Funciona vs Codigo Morto

## Veredicto: O sistema do Passaporte Digital esta 85% funcional

Ao contrario do que parecia, a maior parte do codigo do passaporte esta VIVA e conectada ao banco de dados real.

---

## O QUE ESTA FUNCIONANDO (Codigo Vivo)

### 1. Banco de Dados -- TODAS as tabelas existem e tem dados
| Tabela | Registros | Status |
|--------|-----------|--------|
| `routes` | 2 rotas ativas | Funcional |
| `route_checkpoints` | 3 checkpoints (com lat/lon reais) | Funcional |
| `passport_stamps` | 3 stamps registrados | Funcional |
| `user_passports` | 0 (nenhum turista usou ainda) | Funcional |
| `passport_configurations` | Existe | Funcional |
| `passport_rewards` | Existe | Funcional |
| `stamp_themes` | Existe | Funcional |

### 2. Funcoes SQL no Supabase -- TODAS existem
- `validate_and_stamp_checkpoint` -- validacao server-side com Haversine
- `check_geofence` -- verifica se usuario esta dentro do raio
- `calculate_distance` -- calculo de distancia
- `generate_passport_number` -- gera numero do passaporte
- `check_checkin_rate_limit` -- previne spam de check-ins

### 3. Servicos Frontend -- TODOS conectam ao Supabase real
| Servico | Arquivo | Usado por | Status |
|---------|---------|-----------|--------|
| `passportService` | `src/services/passport/passportService.ts` | PassportRouteView, CheckpointCheckin | VIVO |
| `geolocationService` | `src/services/passport/geolocationService.ts` | CheckpointCheckin | VIVO |
| `rewardsService` | `src/services/passport/rewardsService.ts` | PassportRouteView, VoucherValidator, RouteCompletionModal | VIVO |
| `partnerCodeService` | `src/services/passport/partnerCodeService.ts` | PartnerCodesManager, PartnerCodeInput | VIVO |

### 4. Admin do Passaporte -- FUNCIONAL
- `PassportAdmin.tsx` -- pagina principal com 8 abas
- Acessivel via `/viajar/admin/descubra-ms/passport`
- Registrada no `ViaJARAdminPanel.tsx`
- Usa `LocationPicker` que funciona com **Nominatim/OpenStreetMap** (NAO depende de Mapbox)

### 5. Dados reais no banco (exemplo)
A rota de teste "Campo Grande dos Ipes" tem 3 checkpoints com coordenadas reais:
- COZINHA: lat -20.491, lon -54.674, raio 1000m, modo `geofence`
- SALA: lat -20.492, lon -54.674, raio 22m, modo `mixed`
- QUARTO: lat -20.492, lon -54.674, raio 300m, modo `geofence`

---

## CODIGO MORTO ENCONTRADO

### 1. `offlineSyncService.ts` -- MORTO
- **255 linhas** de codigo
- Usa IndexedDB para check-ins offline
- **Nenhum componente importa este arquivo**
- Acao: PODE SER DELETADO

### 2. Dummy Mapbox Token -- NAO AFETA o passaporte
- O `LocationPicker` usa **Nominatim** (gratis, sem token)
- O token falso em `environment.ts` so afeta o mapa de calor da home (`RegionHeatMapSection`)
- O passaporte NAO depende de Mapbox

---

## VULNERABILIDADES REAIS

### 1. Client-side antes de server-side
O `CheckpointCheckin.tsx` faz validacao client-side primeiro (`geolocationService.validateProximity`) e depois chama a funcao SQL. Isso esta correto como UX (feedback rapido), mas a validacao real acontece no `validate_and_stamp_checkpoint` que e SECURITY DEFINER -- ou seja, seguro.

### 2. Fallback local no passportService
Se as tabelas nao existem, o servico cria um "passaporte local" em memoria. Isso e um fallback defensivo, nao uma vulnerabilidade -- mas os passaportes locais nao persistem.

### 3. Rate limiting funciona
A funcao `check_checkin_rate_limit` existe no banco e previne multiplos check-ins no mesmo checkpoint.

---

## PLANO DE ACAO

| Prioridade | Acao | Arquivo |
|------------|------|---------|
| ALTA | Deletar `offlineSyncService.ts` (codigo morto, 0 imports) | `src/services/passport/offlineSyncService.ts` |
| MEDIA | Remover console.logs excessivos do `passportService.ts` (50+ linhas de debug) | `src/services/passport/passportService.ts` |
| MEDIA | Remover `@ts-nocheck` de `rewardsService.ts` e `partnerCodeService.ts` | 2 arquivos |
| BAIXA | Substituir dummy Mapbox token por logica que pede o token real quando necessario | `src/config/environment.ts` |

### Detalhes tecnicos

**Arquivo a deletar:**
- `src/services/passport/offlineSyncService.ts` -- 255 linhas, zero importacoes encontradas em todo o projeto

**Arquivos a limpar (remover logs de debug):**
- `src/services/passport/passportService.ts` -- tem 50+ linhas de `console.log` com prefixos como `🔵`, `🔍`, `✅`, `❌`

**Arquivos a corrigir TypeScript:**
- `src/services/passport/rewardsService.ts` -- tem `@ts-nocheck`
- `src/services/passport/partnerCodeService.ts` -- tem `@ts-nocheck`

