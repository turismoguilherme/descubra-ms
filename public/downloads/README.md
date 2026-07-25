# APK do app Descubra MS (Android)

## Forma fácil (sem UI do Android Studio)

No terminal do projeto:

```bash
npm run build:apk
```

Isso gera o APK e copia para `public/downloads/descubra-ms.apk`.

## Forma manual (Android Studio)

1. Abra a pasta `android/` no Android Studio.
2. **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
3. Copie o arquivo gerado para `public/downloads/descubra-ms.apk`.

Opcional no `.env`:

```
VITE_ANDROID_APK_URL=/downloads/descubra-ms.apk
VITE_ANDROID_APK_VERSION=1.0.0
```

Não versionar o `.apk` no Git se o arquivo for grande — publique no deploy/CDN.
