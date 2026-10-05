import { mkdir, readdir, stat, readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const root = new URL('../public/', import.meta.url);
await mkdir(new URL('media/', root), { recursive: true });
await mkdir(new URL('social/', root), { recursive: true });
for (const file of await readdir(root)) {
  if (!file.endsWith('.png')) continue;
  const input = new URL(file, root);
  const output = new URL(`media/${file.replace(/\.png$/, '')}.webp`, root);
  const cached = await stat(output).catch(() => null);
  if (cached && cached.mtimeMs >= (await stat(input)).mtimeMs) continue;
  await sharp(await readFile(input))
    .resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82, effort: 5 }).toFile(fileURLToPath(output));
}
for (const [name, file] of Object.entries({ nivor: 'nivor-hero-family-v5.png', one: 'nivor-one-graphite-centered.png', air: 'nivor-air-sand.png', studio: 'nivor-studio-silver.png' })) {
  const output = await sharp(await readFile(new URL(file, root))).resize(1200, 630, { fit: 'contain', background: '#f3f1ec' }).flatten({ background: '#f3f1ec' }).jpeg({ quality: 88 }).toBuffer();
  await writeFile(new URL(`social/${name}.jpg`, root), output);
}
console.log('Optimized images and 1200x630 social previews are ready.');
