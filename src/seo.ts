import { PRODUCT_COLORS, PRODUCT_MODELS, type ProductModel } from './cart';
import { faqs } from './content';

// The existing footer identifies this project as a design concept. Commercial
// offers are opt-in so demo prices/reviews never masquerade as real inventory.
export const isStore = import.meta.env.VITE_SITE_MODE === 'store';
export const siteUrl = new URL(import.meta.env.VITE_SITE_URL || 'https://nivor.arcode-dev.ru/');
if (siteUrl.protocol !== 'https:' || siteUrl.search || siteUrl.hash) throw new Error('VITE_SITE_URL must be a clean HTTPS URL');
siteUrl.pathname = siteUrl.pathname.replace(/\/?$/, '/');
export const absoluteUrl = (path = '') => new URL(path.replace(/^\//, ''), siteUrl).href;
export const productPath = (id: string) => `/headphones/${id}/`;
export const indexablePaths = ['/', ...PRODUCT_MODELS.map((model) => productPath(model.id))];
export const staticPaths = [...indexablePaths, '/cart/', '/checkout/', '/404.html'];

type JsonLd = Record<string, unknown>;
export type PageSeo = { title: string; description: string; canonical: string; robots: string; image: string; graph: JsonLd[] };
const brand = { '@type': 'Brand', '@id': absoluteUrl('#brand'), name: 'NIVØR' };
const store = { '@type': 'OnlineStore', '@id': absoluteUrl('#organization'), name: 'NIVØR', url: absoluteUrl(), logo: absoluteUrl('nivor-mark.svg') };
const website = { '@type': 'WebSite', '@id': absoluteUrl('#website'), name: 'NIVØR', alternateName: 'NIVOR', url: absoluteUrl(), inLanguage: 'ru-RU', ...(isStore ? { publisher: { '@id': store['@id'] } } : {}) };
const qualifier = isStore ? '' : ' Дизайн-концепт магазина наушников.';
const modelTitles = {
  one: 'Наушники NIVØR ONE с ANC — характеристики и цвета',
  air: 'Лёгкие наушники NIVØR AIR — характеристики и цвета',
  studio: 'Мониторные наушники NIVØR STUDIO — характеристики и цвета',
};

function productGraph(model: ProductModel): JsonLd {
  const url = absoluteUrl(productPath(model.id));
  return {
    '@type': 'ProductGroup', '@id': `${url}#product`, name: model.name,
    description: model.description + qualifier, url, brand: { '@id': brand['@id'] },
    productGroupID: `nivor-${model.id}`, variesBy: ['https://schema.org/color'],
    category: model.category,
    hasVariant: PRODUCT_COLORS.map((color) => ({
      '@type': 'Product', '@id': `${url}#${color.id}`, name: `${model.name} — ${color.name}`,
      description: model.description + qualifier, color: color.name,
      image: absoluteUrl(`media/${model.images[color.id].replace(/\.png$/, '')}.webp`),
      url: `${url}?color=${color.id}`, brand: { '@id': brand['@id'] },
      ...(isStore ? { offers: { '@type': 'Offer', url: `${url}?color=${color.id}`, price: model.price, priceCurrency: 'RUB', itemCondition: 'https://schema.org/NewCondition', seller: { '@id': store['@id'] } } } : {}),
    })),
  };
}

export function getPageSeo(pathname: string): PageSeo {
  const path = pathname.replace(/\/+$/, '') || '/';
  const model = PRODUCT_MODELS.find((item) => path === productPath(item.id).replace(/\/$/, ''));
  const home = path === '/';
  const indexable = home || Boolean(model);
  const canonical = absoluteUrl(home ? '' : model ? productPath(model.id) : `${path.replace(/^\//, '')}${path.endsWith('.html') ? '' : '/'}`);
  const title = model ? modelTitles[model.id] : home ? 'Наушники NIVØR ONE, AIR и STUDIO — модели и характеристики' : path === '/cart' ? 'Корзина — NIVØR' : path === '/checkout' ? 'Оформление заказа — NIVØR' : 'Страница не найдена — NIVØR';
  const description = model ? `${model.description} Пять цветов. Характеристики и выбор модели.${qualifier}` : home ? `Наушники NIVØR: ONE с адаптивным ANC, лёгкие AIR и мониторные STUDIO. Сравните характеристики трёх моделей и выберите один из пяти цветов.${qualifier}` : path === '/cart' ? 'Выбранные модели NIVØR, цвета, количество и сумма заказа.' : path === '/checkout' ? 'Контактные данные и выбор доставки для заказа NIVØR.' : 'Такой страницы нет. Перейдите к моделям наушников NIVØR.';
  const page: JsonLd = { '@type': home ? 'CollectionPage' : 'WebPage', '@id': `${canonical}#webpage`, url: canonical, name: title, description, inLanguage: 'ru-RU', isPartOf: { '@id': website['@id'] } };
  const graph: JsonLd[] = indexable ? [website, brand, ...(isStore ? [store] : []), page] : [];
  if (home) {
    page.mainEntity = { '@id': absoluteUrl('#models-list') };
    graph.push({ '@type': 'ItemList', '@id': absoluteUrl('#models-list'), name: 'Модели наушников NIVØR', numberOfItems: PRODUCT_MODELS.length, itemListElement: PRODUCT_MODELS.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, url: absoluteUrl(productPath(item.id)) })) });
    // Semantic FAQ markup; this is not a promise of a Google FAQ rich result.
    graph.push({ '@type': 'FAQPage', '@id': absoluteUrl('#faq'), isPartOf: { '@id': `${canonical}#webpage` }, mainEntity: faqs.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) });
  }
  if (model) {
    page.mainEntity = { '@id': `${canonical}#product` };
    page.breadcrumb = { '@id': `${canonical}#breadcrumbs` };
    graph.push(productGraph(model), { '@type': 'BreadcrumbList', '@id': `${canonical}#breadcrumbs`, itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Наушники NIVØR', item: absoluteUrl() }, { '@type': 'ListItem', position: 2, name: model.name, item: canonical }] });
  }
  return { title, description, canonical, robots: indexable ? 'index, follow, max-image-preview:large' : 'noindex, follow', image: absoluteUrl(model ? `social/${model.id}.jpg` : 'social/nivor.jpg'), graph };
}

export const serializeJsonLd = (graph: JsonLd[]) => JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));

export function renderSeoHead(seo: PageSeo) {
  const tags = [
    ['name', 'description', seo.description], ['name', 'robots', seo.robots],
    ['property', 'og:title', seo.title], ['property', 'og:description', seo.description],
    ['property', 'og:url', seo.canonical], ['property', 'og:type', 'website'],
    ['property', 'og:site_name', 'NIVØR'], ['property', 'og:locale', 'ru_RU'],
    ['property', 'og:image', seo.image], ['property', 'og:image:width', '1200'],
    ['property', 'og:image:height', '630'], ['property', 'og:image:type', 'image/jpeg'],
    ['property', 'og:image:alt', 'Наушники NIVØR'], ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:title', seo.title], ['name', 'twitter:description', seo.description],
    ['name', 'twitter:image', seo.image], ['name', 'twitter:image:alt', 'Наушники NIVØR'],
  ];
  if (import.meta.env.VITE_GOOGLE_SITE_VERIFICATION) tags.push(['name', 'google-site-verification', import.meta.env.VITE_GOOGLE_SITE_VERIFICATION]);
  if (import.meta.env.VITE_YANDEX_VERIFICATION) tags.push(['name', 'yandex-verification', import.meta.env.VITE_YANDEX_VERIFICATION]);
  return `<title data-seo>${escapeHtml(seo.title)}</title>\n<link data-seo rel="canonical" href="${escapeHtml(seo.canonical)}">\n` + tags.map(([attr, key, value]) => `<meta data-seo ${attr}="${key}" content="${escapeHtml(value)}">`).join('\n') + (seo.graph.length ? `\n<script data-seo type="application/ld+json">${serializeJsonLd(seo.graph)}</script>` : '');
}

export function updateSeo(path: string) {
  document.head.querySelectorAll('[data-seo]').forEach((node) => node.remove());
  document.head.insertAdjacentHTML('beforeend', renderSeoHead(getPageSeo(path)));
}
