import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import { createApp, createSSRApp, nextTick } from 'vue';
import App from './App.vue';
import { makeRouter } from './router';
import './styles.css';

const router = makeRouter();
type StoredScrollPosition = { x: number; y: number };

const scrollStoragePrefix = 'nivor:scroll:';
const scrollStorageKey = () => `${scrollStoragePrefix}${window.location.pathname}${window.location.search}${window.location.hash}`;
const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
const shouldRestoreAfterReload = navigationEntry?.type === 'reload';

function readStoredScrollPosition(): StoredScrollPosition | null {
  if (!shouldRestoreAfterReload) return null;

  try {
    const stored = sessionStorage.getItem(scrollStorageKey());
    if (!stored) return null;
    const parsed = JSON.parse(stored) as Partial<StoredScrollPosition>;
    if (!Number.isFinite(parsed.x) || !Number.isFinite(parsed.y)) return null;
    return { x: Number(parsed.x), y: Number(parsed.y) };
  } catch {
    return null;
  }
}

function saveScrollPosition() {
  try {
    sessionStorage.setItem(scrollStorageKey(), JSON.stringify({ x: window.scrollX, y: window.scrollY }));
  } catch {
    // Browsing can continue normally when session storage is unavailable.
  }
}

const reloadScrollPosition = readStoredScrollPosition();

if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
window.addEventListener('pagehide', saveScrollPosition);
window.addEventListener('beforeunload', saveScrollPosition);

const app = (document.querySelector('#app')?.querySelector('main') ? createSSRApp : createApp)(App).use(router);
await router.isReady();
app.mount('#app');
document.documentElement.classList.remove('no-js');

void router.isReady().then(async () => {
  if (!reloadScrollPosition) return;

  await nextTick();
  await document.fonts.ready;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.scrollTo({ left: reloadScrollPosition.x, top: reloadScrollPosition.y, behavior: 'instant' });
  }));
});
