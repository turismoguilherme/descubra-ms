# Configuração da Logo FlowTrip

## 📋 **Instruções para Adicionar a Logo**

### **1. Substituir o Placeholder**

O arquivo `public/flowtrip-logo.png` é um placeholder. Substitua-o pela imagem real da logo FlowTrip.

### **2. Especificações Recomendadas**

- **Formato**: PNG
- **Dimensões**: 200x80px (ou proporção similar)
- **Fundo**: Transparente (preferível) ou azul escuro
- **Qualidade**: Alta resolução (72-150 DPI)

### **3. Como Substituir**

1. **Baixe a imagem da logo** que você anexou
2. **Renomeie** para `flowtrip-logo.png`
3. **Substitua** o arquivo em `public/flowtrip-logo.png`
4. **Reinicie** o servidor de desenvolvimento

### **4. Verificação**

Após substituir, a logo deve aparecer:
- ✅ No menu principal (FlowTrip SaaS)
- ✅ No menu do estado (MS)
- ✅ Com hover effect (escala 105%)
- ✅ Com fallback para texto "FlowTrip"

### **5. Fallback**

Se a logo não carregar, o sistema mostrará automaticamente o texto "FlowTrip" em azul.

## 🎨 **Cores da Logo**

Baseado nas imagens que você anexou:
- **Laranja**: Seta principal
- **Azul claro**: Formas fluidas
- **Branco**: Avião e contorno
- **Azul escuro**: Fundo (opcional)

## 📱 **Responsividade**

A logo é responsiva e se adapta a:
- ✅ Desktop (altura: 48px)
- ✅ Tablet (altura: 48px)
- ✅ Mobile (altura: 48px)

## 🔧 **Personalização**

Se precisar ajustar:
- **Tamanho**: Modifique `h-12` no componente
- **Posição**: Ajuste as classes de flexbox
- **Efeitos**: Modifique as classes de transição

---

**Status**: ✅ Placeholder criado  
**Próximo passo**: Substitua pela logo real! 🚀 