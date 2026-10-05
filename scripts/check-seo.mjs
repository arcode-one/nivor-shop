import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import sharp from 'sharp';
import { staticPaths, indexablePaths, absoluteUrl, PRODUCT_MODELS } from '../work/ssr/entry-server.js';

const root = new URL('../dist/', import.meta.url);
const titles = new Set();
const descriptions = new Set();
const decode = (text) => text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const pageFile = (path) => path === '/' ? 'index.html' : path.endsWith('.html') ? path.slice(1) : `${path.slice(1)}index.html`;
const attr = (html, selector, attribute) => {
  const tag = html.match(selector)?.[0];
  assert.ok(tag, `Missing tag: ${selector}`);
  const value = tag.match(new RegExp(`${attribute}="([^"]*)"`))?.[1];
  assert.ok(value, `Missing ${attribute} on ${tag}`);
  return decode(value);
};

for (const path of staticPaths) {
  const html = await readFile(new URL(pageFile(path), root), 'utf8');
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${path}: exactly one H1`);
  assert.equal((html.match(/<title(?:\s|>)/g) || []).length, 1, `${path}: exactly one title`);
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1, `${path}: exactly one canonical`);
  assert.ok(!html.includes('<!--app-html-->') && !html.includes('<!--seo-head-->'), `${path}: unresolved prerender placeholders`);
  assert.ok(!/\?{4,}|\ufffd/.test(html), `${path}: corrupted text encoding`);
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/)?.[1];
  assert.ok(title && !titles.has(title), `${path}: missing/duplicate title`);
  titles.add(title);
  const description = attr(html, /<meta[^>]*name="description"[^>]*>/, 'content');
  assert.ok(!descriptions.has(description), `${path}: duplicate description`);
  descriptions.add(description);
  const canonical = attr(html, /<link[^>]*rel="canonical"[^>]*>/, 'href');
  assert.equal(canonical, absoluteUrl(path), `${path}: wrong canonical`);
  assert.equal(attr(html, /<meta[^>]*property="og:url"[^>]*>/, 'content'), canonical);
  assert.equal(attr(html, /<meta[^>]*name="twitter:card"[^>]*>/, 'content'), 'summary_large_image');
  const robots = attr(html, /<meta[^>]*name="robots"[^>]*>/, 'content');
  assert.equal(robots.startsWith('index,'), indexablePaths.includes(path), `${path}: wrong indexing policy`);
  const imageUrl = attr(html, /<meta[^>]*property="og:image"[^>]*>/, 'content');
  const image = new URL(imageUrl.slice(absoluteUrl().length), root);
  const metadata = await sharp(await readFile(image)).metadata();
  assert.equal(metadata.width, 1200);
  assert.equal(metadata.height, 630);
  const scripts = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)];
  assert.equal(scripts.length, indexablePaths.includes(path) ? 1 : 0, `${path}: unexpected JSON-LD`);
  if (scripts.length) {
    const schema = JSON.parse(scripts[0][1]);
    assert.equal(schema['@context'], 'https://schema.org');
    assert.ok(schema['@graph'].some((node) => node['@type'] === 'WebSite'));
    const model = PRODUCT_MODELS.find((model) => path.includes(`/headphones/${model.id}/`));
    if (model) {
      const product = schema['@graph'].find((node) => node['@type'] === 'ProductGroup');
      assert.equal(product.name, model.name);
      assert.equal(product.hasVariant.length, 5);
      assert.ok(schema['@graph'].some((node) => node['@type'] === 'BreadcrumbList'));
      for (const variant of product.hasVariant) {
        await access(new URL(variant.image.slice(absoluteUrl().length), root));
        assert.ok(html.includes(variant.color), `${path}: schema color is not in page content`);
        assert.ok(variant.url.startsWith(canonical + '?color='));
        if (variant.offers) {
          assert.equal(variant.offers.price, model.price);
          assert.equal(variant.offers.priceCurrency, 'RUB');
        }
        assert.ok(!variant.aggregateRating && !variant.review, 'Do not publish unverified reviews');
      }
    } else {
      const faq = schema['@graph'].find((node) => node['@type'] === 'FAQPage');
      assert.ok(faq.mainEntity.length > 0);
      for (const entry of faq.mainEntity) {
        assert.ok(decode(html).includes(entry.name), 'FAQ question missing from visible content');
        assert.ok(decode(html).includes(entry.acceptedAnswer.text), 'FAQ answer missing from page');
      }
    }
  }
  console.log(`PASS ${path}: HTML, metadata, indexability, social image and schema`);
}
const sitemap = await readFile(new URL('sitemap.xml', root), 'utf8');
const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => decode(match[1]));
assert.deepEqual(locations, indexablePaths.map(absoluteUrl));
const robots = await readFile(new URL('robots.txt', root), 'utf8');
assert.ok(robots.includes(`Sitemap: ${absoluteUrl('sitemap.xml')}`));
assert.ok(!/Disallow:\s*\//.test(robots), 'Crawlers need to read noindex and static assets');
console.log('PASS sitemap.xml and robots.txt');
