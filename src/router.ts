import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router';
import HomeView from './views/HomeView.vue';
import CartView from './views/CartView.vue';
import CheckoutView from './views/CheckoutView.vue';
import ProductView from './views/ProductView.vue';
import NotFoundView from './views/NotFoundView.vue';
import { updateSeo } from './seo';

export function makeRouter(server = false) {
  const navigationEntry = !server ? performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined : undefined;
  let preserveInitialReloadPosition = navigationEntry?.type === 'reload';
  const router = createRouter({
    history: server ? createMemoryHistory(import.meta.env.BASE_URL) : createWebHistory(import.meta.env.BASE_URL),
    routes: [
      { path: '/', name: 'home', component: HomeView },
      { path: '/headphones/:modelId(one|air|studio)/', name: 'product', component: ProductView },
      { path: '/cart/', name: 'cart', component: CartView },
      { path: '/checkout/', name: 'checkout', component: CheckoutView },
      { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView },
    ],
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) return savedPosition;
      if (to.path === from.path && to.hash === from.hash) return false;
      if (to.hash) return { el: to.hash, behavior: 'smooth' };
      if (preserveInitialReloadPosition) { preserveInitialReloadPosition = false; return false; }
      return { top: 0 };
    },
  });
  if (!server) router.afterEach((to) => updateSeo(to.path));
  return router;
}
