/**
 * Gera fontes de ícone/splash + favicons web a partir do logo oficial.
 * Uso: node scripts/generate-native-assets.mjs
 * Depois: npx @capacitor/assets generate ... && node scripts/finalize-native-assets.mjs
 */
import sharp from "sharp";
import { mkdir, writeFile } from "fs/promises";

const src = "public/images/logo-descubra-ms.png";
const bg = { r: 11, g: 61, b: 46, alpha: 1 }; // #0B3D2E
const black = { r: 0, g: 0, b: 0, alpha: 1 };

await mkdir("assets", { recursive: true });
await mkdir("public/branding", { recursive: true });
await mkdir("public/icons", { recursive: true });

/** Troca fundo preto do PNG do logo pela cor da marca (ou transparente). */
async function logoBuffer(size, { transparentBlack = false } = {}) {
  const { data, info } = await sharp(src)
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: transparentBlack ? 0 : 1 },
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r < 28 && g < 28 && b < 28) {
      if (transparentBlack) {
        data[i + 3] = 0;
      } else {
        data[i] = bg.r;
        data[i + 1] = bg.g;
        data[i + 2] = bg.b;
        data[i + 3] = 255;
      }
    }
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

const makeFullBleed = async (file, size, padRatio) => {
  const inner = Math.round(size * (1 - padRatio * 2));
  const logo = await logoBuffer(inner, { transparentBlack: false });
  await sharp({
    create: { width: size, height: size, channels: 4, background: bg },
  })
    .composite([{ input: logo, gravity: "centre" }])
    .png()
    .toFile(file);
};

const iconSize = 1024;
/** Margem pequena: logo cobre quase todo o ícone (safe zone Android). */
const iconPad = 0.06;

await makeFullBleed("assets/icon-only.png", iconSize, iconPad);

/** Foreground adaptativo: logo maior em fundo transparente (fundo sólido no XML). */
{
  const inner = Math.round(iconSize * (1 - iconPad * 2));
  const logo = await logoBuffer(inner, { transparentBlack: true });
  await sharp({
    create: {
      width: iconSize,
      height: iconSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: logo, gravity: "centre" }])
    .png()
    .toFile("assets/icon-foreground.png");
}

await sharp({
  create: { width: iconSize, height: iconSize, channels: 4, background: bg },
})
  .png()
  .toFile("assets/icon-background.png");

await sharp("assets/icon-only.png").png().toFile("assets/logo.png");
await sharp("assets/icon-only.png").png().toFile("assets/logo-dark.png");

const splash = 2732;
const splashPad = 0.12;
await makeFullBleed("assets/splash.png", splash, splashPad);

{
  const inner = Math.round(splash * (1 - splashPad * 2));
  const logo = await logoBuffer(inner, { transparentBlack: false });
  // Splash dark: fundo preto + logo (preto do PNG vira transparente depois trocamos? use flatten on black)
  const logoOnBlack = await logoBuffer(inner, { transparentBlack: true });
  await sharp({
    create: { width: splash, height: splash, channels: 4, background: black },
  })
    .composite([{ input: logoOnBlack, gravity: "centre" }])
    .png()
    .toFile("assets/splash-dark.png");
  void logo;
}

// --- Favicons / marca web (substitui mark corrompido + coração Lovable) ---
await makeFullBleed("public/branding/descubra-ms-mark.png", 512, 0.08);
await makeFullBleed("public/favicon-32.png", 32, 0.06);
await makeFullBleed("public/favicon-48.png", 48, 0.06);
await makeFullBleed("public/apple-touch-icon.png", 180, 0.06);

for (const size of [48, 72, 96, 128, 192, 256, 512]) {
  await makeFullBleed(`public/icons/icon-${size}.webp`, size, 0.06);
}

/** ICO mínimo (PNG embutido) — 16 + 32 */
async function writeFaviconIco(pathOut, pngBuffers) {
  const images = [];
  for (const png of pngBuffers) {
    const meta = await sharp(png).metadata();
    images.push({
      png,
      width: meta.width || 32,
      height: meta.height || 32,
    });
  }

  const headerSize = 6;
  const entrySize = 16;
  const offset0 = headerSize + entrySize * images.length;
  let offset = offset0;
  const entries = images.map((img) => {
    const entry = {
      width: img.width >= 256 ? 0 : img.width,
      height: img.height >= 256 ? 0 : img.height,
      size: img.png.length,
      offset,
    };
    offset += img.png.length;
    return entry;
  });

  const buf = Buffer.alloc(offset);
  buf.writeUInt16LE(0, 0);
  buf.writeUInt16LE(1, 2);
  buf.writeUInt16LE(images.length, 4);
  let entryAt = 6;
  for (const e of entries) {
    buf.writeUInt8(e.width, entryAt);
    buf.writeUInt8(e.height, entryAt + 1);
    buf.writeUInt8(0, entryAt + 2);
    buf.writeUInt8(0, entryAt + 3);
    buf.writeUInt16LE(1, entryAt + 4);
    buf.writeUInt16LE(32, entryAt + 6);
    buf.writeUInt32LE(e.size, entryAt + 8);
    buf.writeUInt32LE(e.offset, entryAt + 12);
    entryAt += 16;
  }
  let dataAt = offset0;
  for (const img of images) {
    img.png.copy(buf, dataAt);
    dataAt += img.png.length;
  }
  await writeFile(pathOut, buf);
}

const png16 = await sharp(await logoBuffer(16, { transparentBlack: false }))
  .resize(16, 16)
  .png()
  .toBuffer();
// 16x16 full bleed
const ico16 = await sharp({
  create: { width: 16, height: 16, channels: 4, background: bg },
})
  .composite([
    {
      input: await logoBuffer(14, { transparentBlack: false }),
      gravity: "centre",
    },
  ])
  .png()
  .toBuffer();
const ico32 = await sharp("public/favicon-32.png").png().toBuffer();
await writeFaviconIco("public/favicon.ico", [ico16, ico32]);
void png16;

console.log("Native + web icon sources ready (assets/, branding/, favicon.ico).");
