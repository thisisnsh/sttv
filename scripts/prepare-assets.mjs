import sharp from 'sharp';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const images = path.join(root, 'src/assets/images');
await mkdir(images, { recursive: true });
for (const [name, source, width] of [
  ['hero', 'design-assets/hero.png', 2000],
  ['family-concept', 'design-assets/family-concept.png', 1400],
  ['city', 'design-assets/city.jpg', 1200],
  ['studio', 'design-assets/studio.jpg', 1200],
  ['store-campaign', 'design-assets/store-campaign.jpg', 1200],
  ['nerf', 'design-assets/nerf.jpg', 1280]
]) {
  await sharp(path.join(root, source)).resize({ width, withoutEnlargement: true }).webp({ quality: 84 }).toFile(path.join(images, `${name}.webp`));
}
const favicon = await readFile(path.join(root, 'src/assets/favicon.svg'));
for (const [name, size] of [['favicon-32', 32], ['apple-touch-icon', 180], ['icon-192', 192], ['icon-512', 512]]) {
  await sharp(favicon).resize(size, size).png().toFile(path.join(root, `src/assets/${name}.png`));
}
const hero = await sharp(path.join(images, 'hero.webp')).resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 90 }).toBuffer();
const social = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630">
<image width="1200" height="630" href="data:image/jpeg;base64,${hero.toString('base64')}"/>
<rect width="1200" height="630" fill="#111" fill-opacity=".28"/>
<text x="65" y="100" fill="#eeeae2" font-family="Arial,sans-serif" font-size="18" letter-spacing="3">INDEPENDENT TV &amp; FILM CONTENT STUDIO</text>
<text x="60" y="275" fill="#eeeae2" font-family="Arial,sans-serif" font-weight="900" font-size="120" letter-spacing="-7">STOLEN TRIBE</text>
<text x="65" y="390" fill="#eeeae2" font-family="Georgia,serif" font-style="italic" font-size="68">Stories without borders.</text>
<path d="M67 511h14v50H67zM89 518h14v36H89zM111 511h14v50h-14z" fill="#e7542c"/>
<text x="1050" y="558" fill="#eeeae2" font-family="Arial,sans-serif" font-size="18" text-anchor="end">stolentribe.tv</text></svg>`;
await sharp(Buffer.from(social)).jpeg({ quality: 88 }).toFile(path.join(images, 'social.jpg'));
console.log('Optimized images, social card and favicon sizes generated.');
