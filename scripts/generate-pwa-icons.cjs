/**
 * Genera iconos PWA en varios tamaños desde public/ralogo.png.
 * Usa fit: 'contain' para que el logo "RA" se vea completo (sin recortes).
 * Ejecutar: node scripts/generate-pwa-icons.cjs
 */
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const src = path.join(__dirname, '..', 'public', 'ralogo.png');
const outDir = path.join(__dirname, '..', 'public', 'icons');

if (!fs.existsSync(src)) {
  console.warn('No se encontró public/ralogo.png. Crea los iconos manualmente o coloca el logo.');
  process.exit(0);
}

(async () => {
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.warn('Instala sharp: npm install -D sharp');
    process.exit(1);
  }

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const buffer = fs.readFileSync(src);
  for (const size of sizes) {
    await sharp(buffer)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(outDir, `icon-${size}.png`));
    console.log(`Generado: icons/icon-${size}.png`);
  }
  console.log('Iconos PWA generados.');
})();
