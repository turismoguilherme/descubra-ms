
# Plano Completo: Tradução Dinâmica em Toda a Plataforma Descubra MS

## Diagnóstico Atual

### O que funciona ✅
- **i18next** traduz textos estáticos (UI, botões, títulos fixos) corretamente
- **DestinoDetalhes.tsx** já usa tradução dinâmica para exibir destinos traduzidos
- **Serviços de tradução** (LibreTranslate com fallback) estão configurados
- **Tabela `content_translations`** existe no banco

### O que NÃO funciona ❌
1. **Tabela `destination_translations`** não existe - erro ao tentar traduzir destinos
2. **Tabela `content_translations`** está vazia (0 traduções)
3. **Páginas de listagem** (Destinos, Eventos, Roteiros) não buscam/exibem traduções
4. **Hook `useTouristRegions`** retorna dados em português sem opção de tradução
5. **Nenhuma tradução automática** está sendo gerada quando conteúdo é salvo

---

## Plano de Implementação (4 Fases)

### Fase 1: Criar Tabelas de Tradução Faltantes

**1.1 Criar tabela `destination_translations`**
```sql
CREATE TABLE IF NOT EXISTS destination_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  name TEXT,
  description TEXT,
  promotional_text TEXT,
  highlights TEXT[],
  how_to_get_there TEXT,
  best_time_to_visit TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(destination_id, language_code)
);
```

**1.2 Criar tabela `event_translations`**
```sql
CREATE TABLE IF NOT EXISTS event_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  name TEXT,
  title TEXT,
  description TEXT,
  short_description TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(event_id, language_code)
);
```

**1.3 Criar tabela `route_translations`**
```sql
CREATE TABLE IF NOT EXISTS route_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  name TEXT,
  title TEXT,
  description TEXT,
  overview TEXT,
  highlights TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(route_id, language_code)
);
```

**1.4 Criar tabela `region_translations`**
```sql
CREATE TABLE IF NOT EXISTS region_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  region_id UUID NOT NULL REFERENCES tourist_regions(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  name TEXT,
  description TEXT,
  highlights TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(region_id, language_code)
);
```

---

### Fase 2: Criar Hook Universal de Tradução Dinâmica

**Arquivo: `src/hooks/useTranslatedContent.ts`**

Hook reutilizável que:
1. Recebe dados originais em português
2. Verifica idioma atual
3. Busca traduções no banco (se existirem)
4. Gera tradução via API se não existir (lazy translation)
5. Retorna dados traduzidos ou originais

```typescript
export function useTranslatedContent<T>({
  data: T,
  translationTable: string,
  idField: string,
  translatableFields: string[]
}) {
  const { language } = useLanguage();
  const [translatedData, setTranslatedData] = useState<T>(data);
  const [isTranslating, setIsTranslating] = useState(false);
  
  useEffect(() => {
    if (language === 'pt-BR') {
      setTranslatedData(data);
      return;
    }
    
    // Buscar tradução ou gerar via lazy translation
    fetchOrGenerateTranslation();
  }, [data, language]);
  
  return { translatedData, isTranslating };
}
```

---

### Fase 3: Integrar Traduções nas Páginas de Listagem

**3.1 Modificar `useTouristRegions.ts`**
- Adicionar parâmetro `language` 
- Buscar traduções quando idioma ≠ pt-BR
- Retornar dados com campos traduzidos

**3.2 Modificar `Destinos.tsx`**
- Usar `useLanguage()` para obter idioma atual
- Exibir `regiao.name` / `regiao.description` traduzidos

**3.3 Modificar páginas de Eventos e Roteiros**
- Mesmo padrão: buscar traduções e exibir dados no idioma correto

---

### Fase 4: Gerar Traduções Automaticamente

**4.1 Criar função no admin para gerar traduções em massa**
```typescript
// Botão: "Gerar todas as traduções"
async function generateAllTranslations() {
  // Buscar todos os destinos
  // Para cada destino, gerar traduções para 4 idiomas
  // Salvar no banco
}
```

**4.2 Integrar tradução automática ao salvar conteúdo**
- Quando admin salva destino → Chamar `autoTranslateDestination()`
- Quando admin aprova evento → Chamar `autoTranslateEvent()`
- Quando admin salva roteiro → Chamar `autoTranslateRoute()`

**4.3 Criar página de status de traduções no admin**
- Mostrar quantos itens têm tradução
- Permitir regenerar traduções manualmente

---

## Arquivos a Criar/Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| Migração SQL | Criar | 4 tabelas de tradução |
| `src/hooks/useTranslatedContent.ts` | Criar | Hook universal de tradução |
| `src/hooks/useTouristRegions.ts` | Modificar | Adicionar busca de traduções |
| `src/pages/Destinos.tsx` | Modificar | Exibir nomes/descrições traduzidos |
| `src/pages/ms/EventosMS.tsx` | Modificar | Exibir dados traduzidos |
| `src/pages/ms/RoteirosMS.tsx` | Modificar | Exibir dados traduzidos |
| `src/services/translation/RegionTranslationService.ts` | Criar | Serviço para tradução de regiões |
| `src/components/admin/TranslationStatusPanel.tsx` | Criar | Painel para gerar/verificar traduções |

---

## Fluxo Final Esperado

```text
┌─────────────────────┐
│ Usuário muda idioma │
│    para "en-US"     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Hook detecta idioma │
│    useLanguage()    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────┐
│ Busca tradução no banco         │
│ SELECT * FROM destination_      │
│ translations WHERE language=en  │
└──────────┬──────────────────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌───────┐    ┌────────────────────┐
│Existe │    │ Não existe         │
│       │    │ → Gerar via API    │
│       │    │ → Salvar no banco  │
└───┬───┘    └─────────┬──────────┘
    │                  │
    └────────┬─────────┘
             │
             ▼
┌─────────────────────┐
│  Exibir dados       │
│  traduzidos na UI   │
└─────────────────────┘
```

---

## Resultado Esperado

Após implementação completa:

1. ✅ **Usuário seleciona idioma** → Toda UI estática traduz via i18next
2. ✅ **Nomes de destinos** → Traduzidos automaticamente
3. ✅ **Descrições de regiões** → Traduzidas automaticamente  
4. ✅ **Eventos e roteiros** → Títulos e descrições traduzidos
5. ✅ **Conteúdo editável do CMS** → Traduzido via tabela content_translations
6. ✅ **Admin pode regenerar traduções** → Painel de controle

---

## Prioridade de Implementação

1. **Alta**: Criar tabelas `destination_translations` e `region_translations`
2. **Alta**: Modificar `useTouristRegions` para buscar traduções
3. **Média**: Modificar páginas de listagem para exibir dados traduzidos
4. **Média**: Criar painel admin para gerar traduções em massa
5. **Baixa**: Refinar serviços de tradução automática

