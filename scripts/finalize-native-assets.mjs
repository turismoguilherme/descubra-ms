/**
 * Pós-processamento após @capacitor/assets generate:
 * - copia ícones PWA para public/icons (se gerados)
 * - adaptive icon Android sem inset (verde cobre o círculo inteiro)
 * - restaura manifest.webmanifest do Descubra MS
 */
import { copyFile, mkdir, rm, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const iconSizes = [48, 72, 96, 128, 192, 256, 512];

await mkdir("public/icons", { recursive: true });

for (const size of iconSizes) {
  const from = path.join("icons", `icon-${size}.webp`);
  const to = path.join("public/icons", `icon-${size}.webp`);
  if (existsSync(from)) {
    await copyFile(from, to);
  }
}

if (existsSync("icons")) {
  await rm("icons", { recursive: true, force: true });
}

await writeFile(
  "android/app/src/main/res/values/ic_launcher_background.xml",
  `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#0B3D2E</color>
</resources>
`,
  "utf8"
);

const adaptiveIcon = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`;

await writeFile(
  "android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml",
  adaptiveIcon,
  "utf8"
);
await writeFile(
  "android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml",
  adaptiveIcon,
  "utf8"
);

const manifest = {
  name: "Descubra MS",
  short_name: "Descubra MS",
  description:
    "Portal oficial de turismo de Mato Grosso do Sul — destinos, eventos, roteiros e o Guatá.",
  start_url: "/",
  display: "standalone",
  background_color: "#0B3D2E",
  theme_color: "#0B3D2E",
  lang: "pt-BR",
  icons: iconSizes.map((size) => ({
    src: `/icons/icon-${size}.webp`,
    type: "image/webp",
    sizes: `${size}x${size}`,
    purpose: "any",
  })),
};

await writeFile(
  "public/manifest.webmanifest",
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8"
);

console.log(
  "Native assets finalized (adaptive icon full-bleed + public/icons + manifest)."
);
