
# Plano: Página Standalone de Eventos (estilo ChatGuata)

## Objetivo

Criar uma página dedicada de eventos em tela cheia no Descubra Mato Grosso do Sul, seguindo o mesmo padrão do `/chatguata` - ou seja, uma experiência imersiva sem navbar/footer.

## Arquitetura Atual

### Página ChatGuata (`/chatguata`)
- Tela cheia sem `UniversalLayout`
- Background gradiente: `bg-gradient-to-r from-ms-primary-blue to-ms-pantanal-green`
- Interface dedicada ao chat
- Rota: `/chatguata` e `/descubrams/chatguata`

### Página EventosMS Atual (`/descubrams/eventos`)
- Usa `UniversalLayout` (navbar + footer)
- Componente `EventCalendar` para exibir eventos
- Filtros por região, categoria e busca

## Implementação Proposta

### 1. Criar Nova Página: `EventosFullscreen.tsx`

**Arquivo:** `src/pages/ms/EventosFullscreen.tsx`

```text
Estrutura:
+------------------------------------------+
|  Logo MS (pequeno)      [Voltar ao Site] |
+------------------------------------------+
|                                          |
|          EVENTOS EM                      |
|       MATO GROSSO DO SUL                 |
|                                          |
|  [Campo de Busca]                        |
|  [Filtros: Região | Categoria]           |
|                                          |
+------------------------------------------+
|                                          |
|    Grid de Cards de Eventos              |
|    (Patrocinados em destaque)            |
|                                          |
+------------------------------------------+
```

**Características:**
- Sem navbar/footer padrão
- Background gradiente MS (cores da marca)
- Componente EventCalendar integrado
- Botão para voltar ao site principal
- Logo pequeno do Descubra MS no canto

### 2. Adicionar Rota no App.tsx

**Rotas a adicionar:**
- `/eventos` (acesso direto - estilo totem)
- `/descubrams/eventos-standalone` (acesso via Descubra MS)

### 3. Componentes Reutilizados

| Componente | Origem | Uso |
|------------|--------|-----|
| `EventCalendar` | `src/components/events/EventCalendar.tsx` | Grid de eventos com filtros |
| `EventDetailModal` | `src/components/events/EventDetailModal.tsx` | Modal ao clicar no evento |

## Fluxo de Navegação

```text
/descubrams (Home) 
    → Banner/Botão "Ver Todos os Eventos"
        → /eventos (Tela cheia)

/descubrams/eventos (com layout)
    → Continua funcionando normalmente

/eventos (Acesso direto - Totem/Kiosk)
    → Experiência standalone
```

## Detalhes Técnicos

### Arquivo: `src/pages/ms/EventosFullscreen.tsx`

Novo componente com:
1. Background gradiente MS
2. Header minimalista com logo + botão voltar
3. Título centralizado
4. EventCalendar sem wrapper de layout
5. Responsivo (mobile/tablet/desktop)

### Alterações no App.tsx

Adicionar imports e rotas:
- Import do novo componente `EventosFullscreen`
- Rota `/eventos` (global)
- Rota `/descubrams/eventos-standalone`

## Resultado Esperado

- **URL `/eventos`**: Página fullscreen de eventos (estilo totem)
- **URL `/descubrams/eventos`**: Mantém funcionamento atual (com layout)
- Visual consistente com marca Descubra MS
- Experiência imersiva para explorar eventos

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `src/pages/ms/EventosFullscreen.tsx` | CRIAR |
| `src/App.tsx` | MODIFICAR (adicionar rotas) |

## Estimativa

- 1 arquivo novo
- 1 arquivo modificado
- Sem alterações no banco de dados
