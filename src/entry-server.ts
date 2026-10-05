import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import App from './App.vue';
import { makeRouter } from './router';
import { getPageSeo, renderSeoHead } from './seo';

export { staticPaths, indexablePaths, absoluteUrl } from './seo';
export { PRODUCT_MODELS } from './cart';

export async function render(path: string) {
  const router = makeRouter(true);
  const app = createSSRApp(App).use(router);
  await router.push(path);
  await router.isReady();
  return { body: await renderToString(app), head: renderSeoHead(getPageSeo(path)) };
}
