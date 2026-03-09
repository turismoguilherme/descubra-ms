
# Correção: Menu Invisível + Robô Invisível + Melhorar Parallax

## Problemas Identificados

1. **Menu Invisível**: 
   - Navbar usa `text-white/70` quando `bg-transparent` 
   - Se Hero não carregar fundo escuro, links ficam invisíveis sobre fundo claro
   - Dropdown do Soluções tem cores mistas (branco/muted)

2. **Robô Invisível**:
   - Import do `travel-tech-robot.png` pode estar falhando
   - Imagem existe em `src/assets/` mas pode ter problema de resolução do alias `@/assets`

3. **Parallax do Mouse**:
   - Está implementado mas pode não funcionar se robô não aparecer
   - Precisa melhorar responsividade do efeito

## Soluções

### 1. Corrigir Menu - Gradual Visibility
**Arquivo**: `ViaJARNavbar.tsx`

- **Problema atual**: `bg-transparent` + `text-white/70` = invisível
- **Solução**: Navbar sempre com fundo semi-transparente sutil
- **Mudanças**:
  ```typescript
  // ANTES:
  bg-transparent
  
  // DEPOIS: 
  bg-slate-900/20 backdrop-blur-sm border-b border-white/5
  
  // Quando scrolled: bg-slate-950/90 (atual está correto)
  ```

- **Links**: Melhorar contraste para sempre visível
  ```typescript
  // ANTES: text-white/70
  // DEPOIS: text-white/90 hover:text-cyan-300
  ```

- **Dropdown Soluções**: Padronizar cores dark em todos os itens (remover `text-muted-foreground`)

### 2. Corrigir Robô - Asset Loading
**Arquivo**: `TravelTechRobot.tsx`

- **Testar import direto**: Substituir `@/assets/travel-tech-robot.png` por caminho absoluto
- **Adicionar fallback**: SVG inline caso imagem não carregue  
- **Error handling**: `onError` na `<img>` para debug

**Mudanças**:
```typescript
// Tentar caminhos alternativos:
import robotImg from '../../../assets/travel-tech-robot.png';
// ou
import robotImg from '/src/assets/travel-tech-robot.png';

// Adicionar fallback SVG se imagem falhar
const [imageError, setImageError] = useState(false);
```

### 3. Melhorar Parallax - Responsividade
**Arquivo**: `TravelTechHero.tsx` + `TravelTechRobot.tsx`

- **Reduzir intensidade mobile**: Parallax muito forte em tela pequena causa tontura
- **Smooth transitions**: Melhorar suavidade do retorno ao centro
- **Bounds checking**: Limitar rotação máxima

**Mudanças**:
```typescript
// Mobile: rotação reduzida
const isMobile = window.innerWidth < 768;
const rotateY = deltaX * (isMobile ? 4 : 8); // 4° mobile, 8° desktop
const rotateX = -deltaY * (isMobile ? 2 : 5); // 2° mobile, 5° desktop
```

### 4. Debug Visual - Loading States
- **Navbar**: Indicador visual quando menu está carregando
- **Robô**: Loading placeholder enquanto imagem não carrega  
- **Console logs**: Para debug de assets

## Sequência de Implementação

1. **Corrigir Navbar** - Fundo sempre visível + cores consistentes
2. **Corrigir import do Robô** - Testar caminhos + fallback
3. **Melhorar Parallax** - Responsivo + suave
4. **Testar no browser** - Verificar visibilidade em diferentes telas

## Arquivos a Modificar

1. `src/components/layout/ViaJARNavbar.tsx` - Fundo + cores
2. `src/components/home/TravelTechRobot.tsx` - Import + fallback  
3. `src/components/home/TravelTechHero.tsx` - Parallax responsivo

**Resultado esperado**: Menu sempre visível, robô carregando com parallax suave que segue o mouse.
