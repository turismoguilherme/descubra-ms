/**
 * Gera fontes de ícone/splash a partir do logo oficial e aplica nas plataformas.
 * Uso: node scripts/generate-native-assets.mjs
 * Depois: npx @capacitor/assets generate ...
 */
import sharp from "sharp";
import { mkdir } from "fs/promises";

const src = "public/images/logo-descubra-ms.png";
const bg = { r: 11, g: 61, b: 46, alpha: 1 }; // #0B3D2E
const black = { r: 0, g: 0, b: 0, alpha: 1 };

await mkdir("assets", { recursive: true });

const iconSize = 1024;
const logoPad = Math.round(iconSize * 0.12);
const logoInner = iconSize - logoPad * 2;
const logoBuf = await sharp(src)
  .resize(logoInner, logoInner, { fit: "contain", background: bg })
  .png()
  .toBuffer();

const makeSquare = async (file, background, logo) => {
  await sharp({
    create: { width: iconSize, height: iconSize, channels: 4, background },
  })
    .composite([{ input: logo, gravity: "centre" }])
    .png()
    .toFile(file);
};

await makeSquare("assets/icon-only.png", bg, logoBuf);
await makeSquare("assets/icon-foreground.png", bg, logoBuf);
await sharp({
  create: { width: iconSize, height: iconSize, channels: 4, background: bg },
})
  .png()
  .toFile("assets/icon-background.png");

await sharp("assets/icon-only.png").png().toFile("assets/logo.png");
await sharp("assets/icon-only.png").png().toFile("assets/logo-dark.png");

const splash = 2732;
const splashLogo = Math.round(splash * 0.58);
const splashLogoBuf = await sharp(src)
  .resize(splashLogo, splashLogo, { fit: "contain", background: bg })
  .png()
  .toBuffer();

await sharp({
  create: { width: splash, height: splash, channels: 4, background: bg },
})
  .composite([{ input: splashLogoBuf, gravity: "centre" }])
  .png()
  .toFile("assets/splash.png");

await sharp({
  create: { width: splash, height: splash, channels: 4, background: black },
})
  .composite([
    {
      input: await sharp(src)
        .resize(splashLogo, splashLogo, { fit: "contain", background: black })
        .png()
        .toBuffer(),
      gravity: "centre",
    },
  ])
  .png()
  .toFile("assets/splash-dark.png");

console.log("Native asset sources ready in assets/");
