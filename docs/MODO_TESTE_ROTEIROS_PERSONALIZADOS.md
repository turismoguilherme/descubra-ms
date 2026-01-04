# 🧪 Modo de Teste - Roteiros Personalizados

## 📋 Visão Geral

O sistema de Roteiros Personalizados possui um **modo de teste** que permite usar a funcionalidade sem necessidade de pagamento, ideal para desenvolvimento e testes.

## ✅ Como Funciona

O modo de teste é ativado automaticamente quando:

1. **Ambiente de Desenvolvimento** (`localhost` ou `127.0.0.1`) **E** uma das condições:
   - Usuário é **admin/tech/master_admin**
   - Email do usuário está na lista de emails permitidos para teste

2. **Usuário Admin em Qualquer Ambiente**
   - Se o usuário tiver role `admin`, `tech` ou `master_admin`, terá acesso em qualquer ambiente

## 🔧 Configuração

### Variável de Ambiente (Opcional)

Para permitir acesso de teste para emails específicos, adicione no arquivo `.env`:

```env
VITE_IA_ROUTES_TEST_EMAILS=seu-email@exemplo.com,outro-email@exemplo.com
```

**Formato:** Lista de emails separados por vírgula (sem espaços)

### Exemplo Completo

```env
# Emails permitidos para teste de Roteiros Personalizados
VITE_IA_ROUTES_TEST_EMAILS=dev@exemplo.com,teste@exemplo.com
```

## 🎯 Verificação de Acesso

O sistema verifica acesso na seguinte ordem:

1. **Modo de Teste** (se aplicável)
   - Ambiente de desenvolvimento + (admin OU email na lista)
   - OU admin em qualquer ambiente

2. **Pagamento Real**
   - `user_metadata.ia_route_paid === true`
   - OU registro na tabela `user_feature_payments` com `status = 'paid'`

## 🎨 Indicadores Visuais

Quando o modo de teste está ativo, você verá:

- ✅ **Badge "Acesso Premium Ativo"** (verde)
- 🧪 **Badge "Modo de Teste Ativo"** (amarelo)

Ambos os badges aparecem na página de Roteiros Personalizados quando você tem acesso.

## 📝 Logs

O sistema registra no console quando o modo de teste é ativado:

```
🧪 Modo de teste ativado para Roteiros Personalizados: {
  isDev: true,
  isAdmin: true,
  userRole: 'admin',
  email: 'seu-email@exemplo.com',
  isTestEmail: false
}
```

## 🔒 Segurança

- O modo de teste **não funciona em produção** para usuários não-admin
- Apenas admins têm acesso garantido em qualquer ambiente
- Emails de teste só funcionam em ambiente de desenvolvimento

## 🚀 Uso

Uma vez ativado o modo de teste, você pode:

- ✅ Gerar roteiros personalizados ilimitados
- ✅ Testar todas as funcionalidades
- ✅ Desenvolver e melhorar a funcionalidade
- ✅ Não precisa fazer pagamento real

## ⚠️ Importante

- O modo de teste é apenas para **desenvolvimento e testes**
- Em produção, usuários normais precisam pagar para acessar
- Admins sempre têm acesso, mesmo sem pagamento














