import fs from "fs";
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const sharePath = path.join(root, "public/branding/descubra-ms-share.jpg");
const photoPath = path.join(root, "public/branding/descubra-ms-share-photo.jpg");
const markPath = path.join(root, "public/branding/descubra-ms-mark.png");

const W = 1200;
const H = 630;
/** Painel branco à esquerda (logo não deve ultrapassar esta largura). */
const LEFT_W = 560;
const LOGO_PAD = 56;

async function ensurePhotoStrip() {
  if (fs.existsSync(photoPath)) return;

  const legacy = sharePath;
  const meta = await sharp(legacy).metadata();
  // Recorte só da paisagem (ignora painel branco/verde de versões antigas do banner).
  const cropLeft = Math.round(meta.width * 0.58);
  await sharp(legacy)
    .extract({
      left: cropLeft,
      top: 0,
      width: meta.width - cropLeft,
      height: meta.height,
    })
    .jpeg({ quality: 92 })
    .toFile(photoPath);
}

await ensurePhotoStrip();

const rightPart = await sharp(photoPath)
  .resize(W - LEFT_W, H, { fit: "cover", position: "centre" })
  .toBuffer();

const logoPng = await sharp(markPath).ensureAlpha().png().toBuffer();

const logoSized = await sharp(logoPng)
  .resize(LEFT_W - LOGO_PAD * 2, H - LOGO_PAD * 2, { fit: "inside" })
  .toBuffer();

const leftPanel = await sharp({
  create: {
    width: LEFT_W,
    height: H,
    channels: 3,
    background: { r: 255, g: 255, b: 255 },
  },
})
  .composite([{ input: logoSized, gravity: "center" }])
  .jpeg({ quality: 92 })
  .toBuffer();

await sharp({
  create: { width: W, height: H, channels: 3, background: "#ffffff" },
})
  .composite([
    { input: leftPanel, left: 0, top: 0 },
    { input: rightPart, left: LEFT_W, top: 0 },
  ])
  .jpeg({ quality: 90 })
  .toFile(sharePath + ".tmp");

fs.renameSync(sharePath + ".tmp", sharePath);

console.log("Updated", sharePath);
