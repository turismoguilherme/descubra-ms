# Firebase / Push do app Descubra MS (FCM HTTP v1)

## Não use a API legada
Use **Firebase Cloud Messaging (V1)** + conta de serviço.

## 1. google-services.json
Já em `android/app/google-services.json` (package `com.descubrams.app`).

## 2. Conta de serviço (chave JSON)
1. Firebase → Configurações do projeto → **Cloud Messaging**
2. Em **API Firebase Cloud Messaging (V1)** → **Gerenciar contas de serviço**
3. Abra a conta `firebase-adminsdk-...@descubra-mato-grosso-do-b491e.iam.gserviceaccount.com`
4. Aba **Chaves** → **Adicionar chave** → **Criar nova chave** → **JSON** → baixe o arquivo
5. Abra o JSON baixado e copie **todo** o conteúdo

## 3. Secrets no Supabase
- `FCM_SERVICE_ACCOUNT_JSON` = conteúdo inteiro do JSON da conta de serviço
- `FCM_PROJECT_ID` = `descubra-mato-grosso-do-b491e`
- `PUSH_DISPATCH_SECRET` = senha forte qualquer
- `SITE_ORIGIN` = `https://descubrams.com`
- `PUSH_MAX_PER_WEEK` = `3` (opcional)

## 4. Deploy
```
npx supabase db push
npx supabase functions deploy register-app-push-token
npx supabase functions deploy dispatch-event-push
npm run build:apk
```
