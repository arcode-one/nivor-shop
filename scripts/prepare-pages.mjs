import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { render, staticPaths, indexablePaths, absoluteUrl, PRODUCT_MODELS } from '../work/ssr/entry-server.js';

const output = new URL('../dist/', import.meta.url);
const template = await readFile(new URL('index.html', output), 'utf8');
if (!template.includes('<!--seo-head-->') || !template.includes('<!--app-html-->')) throw new Error('Prerender placeholders are missing');
for (const path of staticPaths) {
  const { body, head } = await render(path);
  const file = path === '/' ? 'index.html' : path.endsWith('.html') ? path.slice(1) : `${path.slice(1)}index.html`;
  const target = new URL(file, output);
  await mkdir(new URL('.', target), { recursive: true });
  await writeFile(target, template.replace('<!--seo-head-->', () => head).replace('<!--app-html-->', () => body));
}
const xml = (value) => value.replace(/[<>&"']/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[char]));
const urls = indexablePaths.map((path) => {
  const model = PRODUCT_MODELS.find((model) => path.includes(`/headphones/${model.id}/`));
  const images = model ? Object.values(model.images).map((file) => absoluteUrl(`media/${file.replace(/\.png$/, '')}.webp`)) : [absoluteUrl('social/nivor.jpg')];
  return `  <url><loc>${xml(absoluteUrl(path))}</loc>${images.map((url) => `<image:image><image:loc>${xml(url)}</image:loc></image:image>`).join('')}</url>`;
});
await writeFile(new URL('sitemap.xml', output), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join('\n')}\n</urlset>\n`);
// Private/utility pages must be crawlable for search engines to see noindex.
await writeFile(new URL('robots.txt', output), `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('sitemap.xml')}\n`);
await writeFile(new URL('.nojekyll', output), '');
console.log(`Prerendered ${staticPaths.length} routes; ${indexablePaths.length} indexable URLs in sitemap.xml.`);
