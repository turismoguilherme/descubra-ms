# 🗺️ Guia: Criar Roteiro de Exemplo - Pantanal MS

Este guia explica como executar a migration que cria um roteiro completo de exemplo para demonstração do passaporte digital.

## 📋 O que será criado

A migration `20250208000000_insert_example_passport_route.sql` cria:

1. **Rota**: "Rota Pantanal: Aventura no Coração do Brasil"
   - 5 checkpoints (Porto da Manga, Passo do Lontra, Mirante do Tuiuiú, Fazenda São Francisco, Base de Pesquisa Onça-Pintada)
   - Configuração de passaporte com tema "Onça-Pintada"
   - 3 recompensas (desconto, brinde e experiência exclusiva)

## 🚀 Como executar

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral)
4. Clique em **New Query**
5. Copie e cole o conteúdo do arquivo:
   ```
   supabase/migrations/20250208000000_insert_example_passport_route.sql
   ```
6. Clique em **Run** (ou pressione `Ctrl+Enter`)

### Opção 2: Via Supabase CLI

```bash
# Se você tem o Supabase CLI instalado
supabase db push
```

### Opção 3: Executar SQL diretamente

1. Abra o arquivo `supabase/migrations/20250208000000_insert_example_passport_route.sql`
2. Copie todo o conteúdo
3. Execute no SQL Editor do Supabase

## ✅ Verificar se funcionou

Após executar a migration, você pode verificar:

1. **Verificar a rota criada:**
   ```sql
   SELECT id, name, region, difficulty, is_active 
   FROM routes 
   WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
   ```

2. **Verificar os checkpoints:**
   ```sql
   SELECT name, order_sequence, stamp_fragment_number 
   FROM route_checkpoints 
   WHERE route_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
   ORDER BY order_sequence;
   ```

3. **Verificar configuração do passaporte:**
   ```sql
   SELECT stamp_theme, stamp_fragments, description 
   FROM passport_configurations 
   WHERE route_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
   ```

4. **Verificar recompensas:**
   ```sql
   SELECT partner_name, reward_type, reward_description 
   FROM passport_rewards 
   WHERE route_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
   ```

## 🎯 Como visualizar no sistema

Após criar o roteiro:

1. Acesse: `/descubramatogrossodosul/passaporte`
2. Você verá a lista de rotas com o novo roteiro "Rota Pantanal"
3. Clique em "Iniciar Rota" para ver o passaporte completo
4. O passaporte mostrará:
   - Informações da rota
   - Mapa interativo com os 5 checkpoints
   - Progresso do selo da Onça-Pintada
   - Recompensas disponíveis

## 🔄 ID da Rota

O ID da rota criada é: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

Você pode usar este ID para:
- Acessar diretamente: `/descubramatogrossodosul/passaporte/a1b2c3d4-e5f6-7890-abcd-ef1234567890`
- Testar funcionalidades do passaporte
- Usar como referência para criar novos roteiros

## ⚠️ Notas Importantes

- A migration usa `ON CONFLICT DO UPDATE`, então pode ser executada múltiplas vezes sem problemas
- Os IDs são fixos para facilitar testes e referências
- A rota está configurada como `is_active = true` por padrão
- Todos os checkpoints têm `is_mandatory = true`

## 🎨 Personalização

Você pode modificar:
- Nomes e descrições dos checkpoints
- Coordenadas (latitude/longitude)
- Tema do selo (onca, tuiuiu, jacare, arara)
- Número de fragmentos necessários
- Recompensas e parceiros

Basta editar o arquivo SQL antes de executar!

