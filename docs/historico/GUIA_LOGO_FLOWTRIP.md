# 🎨 Guia de Configuração da Logo FlowTrip

## 📋 **Visão Geral**

Este guia explica como configurar e personalizar a logo FlowTrip na plataforma.

---

## 🖼️ **Especificações da Logo**

### **Dimensões Recomendadas**
- **Largura**: 200px
- **Altura**: 80px
- **Proporção**: 2.5:1 (horizontal)

### **Formato**
- **Tipo**: PNG
- **Fundo**: Transparente (preferível)
- **Qualidade**: Alta resolução (72-150 DPI)

### **Cores da Logo**
Baseado nas imagens fornecidas:
- **Laranja**: #f97316 (seta principal)
- **Azul claro**: #60a5fa (formas fluidas)
- **Branco**: #ffffff (avião e texto)
- **Azul escuro**: #1e3a8a (fundo opcional)

---

## 🔧 **Como Substituir a Logo**

### **Passo 1: Preparar a Imagem**
1. **Baixe** a imagem da logo FlowTrip
2. **Redimensione** para 200x80px
3. **Salve** como PNG com fundo transparente
4. **Renomeie** para `flowtrip-logo.png`

### **Passo 2: Substituir o Arquivo**
```bash
# Localização do arquivo
public/flowtrip-logo.png

# Substitua o placeholder pela imagem real
```

### **Passo 3: Verificar**
1. **Reinicie** o servidor: `npm run dev`
2. **Verifique** se a logo aparece no menu
3. **Teste** o hover effect (escala 105%)

---

## 🎯 **Componente FlowTripLogo**

### **Localização**
```typescript
src/components/layout/FlowTripLogo.tsx
```

### **Funcionalidades**
- ✅ **Carregamento automático** da imagem
- ✅ **Fallback visual** quando imagem falha
- ✅ **Símbolos coloridos** como backup
- ✅ **Responsivo** em todos os dispositivos
- ✅ **Hover effects** (escala 105%)

### **Fallback Visual**
Quando a imagem não carrega, mostra:
- **Texto**: "FlowTrip" em azul
- **Símbolos**: Círculos coloridos representando a logo
- **Cores**: Laranja, azul claro, branco

---

## 🎨 **Personalização**

### **Alterar Tamanho**
```typescript
// No componente FlowTripLogo.tsx
className="h-12 w-auto" // Altura 48px (padrão)
className="h-16 w-auto" // Altura 64px (maior)
className="h-8 w-auto"  // Altura 32px (menor)
```

### **Alterar Cores do Fallback**
```typescript
// Cores dos símbolos
<div className="w-6 h-6 bg-orange-500"> // Laranja
<div className="w-4 h-4 bg-blue-400">   // Azul claro
<div className="w-3 h-3 bg-blue-300">   // Azul mais claro
```

### **Alterar Efeitos**
```typescript
// Hover effect
className="hover:scale-105" // Escala 105% (padrão)
className="hover:scale-110" // Escala 110% (maior)
className="hover:scale-100" // Sem escala
```

---

## 📱 **Responsividade**

### **Desktop (>768px)**
- **Altura**: 48px (h-12)
- **Posição**: Esquerda
- **Efeitos**: Hover completo

### **Mobile (<768px)**
- **Altura**: 48px (h-12)
- **Posição**: Centralizada
- **Efeitos**: Touch-friendly

### **Tablet (768px-1024px)**
- **Altura**: 48px (h-12)
- **Posição**: Adaptativa
- **Efeitos**: Hover completo

---

## 🔍 **Troubleshooting**

### **Problema: Logo não aparece**
**Solução**:
1. Verifique se o arquivo existe em `public/flowtrip-logo.png`
2. Confirme que é uma imagem PNG válida
3. Reinicie o servidor: `npm run dev`
4. Limpe o cache do navegador

### **Problema: Logo distorcida**
**Solução**:
1. Verifique as dimensões (200x80px recomendado)
2. Confirme que a proporção está correta
3. Use `object-contain` para manter proporção

### **Problema: Fallback não funciona**
**Solução**:
1. Verifique o console para erros
2. Confirme que o componente está importado
3. Teste com imagem inválida

---

## 🎯 **Exemplos de Implementação**

### **Logo Padrão**
```typescript
<FlowTripLogo isFlowTrip={true} />
```

### **Logo com Tamanho Personalizado**
```typescript
<img 
  src="/flowtrip-logo.png"
  className="h-16 w-auto" // Altura 64px
  alt="FlowTrip"
/>
```

### **Logo com Efeitos Personalizados**
```typescript
<img 
  src="/flowtrip-logo.png"
  className="h-12 w-auto hover:scale-110 transition-transform duration-300"
  alt="FlowTrip"
/>
```

---

## 📊 **Testes Recomendados**

### **Funcionalidade**
- [ ] Logo carrega corretamente
- [ ] Fallback funciona quando imagem falha
- [ ] Hover effects funcionam
- [ ] Responsividade em todos os dispositivos

### **Performance**
- [ ] Carregamento rápido (<1s)
- [ ] Sem erros de console
- [ ] Otimização de imagem
- [ ] Cache funcionando

### **Acessibilidade**
- [ ] Alt text presente
- [ ] Contraste adequado
- [ ] Navegação por teclado
- [ ] Screen reader friendly

---

## 🚀 **Próximos Passos**

### **Imediato**
1. **Substituir** placeholder pela logo real
2. **Testar** em diferentes dispositivos
3. **Verificar** performance

### **Futuro**
1. **SVG version** para melhor qualidade
2. **Dark mode** support
3. **Animações** avançadas
4. **Lazy loading** otimizado

---

## 📞 **Suporte**

Se precisar de ajuda:
1. **Verifique** este guia
2. **Consulte** a documentação completa
3. **Abra** uma issue no GitHub
4. **Contate** o desenvolvedor

---

**✅ Logo FlowTrip configurada com sucesso!** 