import { execSync } from 'node:child_process';

const brand = process.env.SITE_BRAND?.trim() || 'descubrams';
const allowed = new Set(['descubrams', 'guata-labs']);

if (!allowed.has(brand)) {
  console.error(`SITE_BRAND inválido: "${brand}". Use descubrams ou guata-labs.`);
  process.exit(1);
}

console.log(`[vercel-build] SITE_BRAND=${brand}`);
execSync(`npm run build:${brand}`, { stdio: 'inherit' });
