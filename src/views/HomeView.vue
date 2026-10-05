<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, type Ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { faqs } from '../content';
import {
  ArrowDownRight,
  ArrowRight,
  Bluetooth,
  Check,
  ChevronDown,
  ChevronRight,
  Menu as MenuIcon,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Waves,
  X,
} from '@lucide/vue';
import { assetUrl } from '../assets';
import {
  addCartItem,
  cartCount,
  findColor,
  findProduct,
  formatPrice,
  PRODUCT_COLORS as colors,
  PRODUCT_MODELS as models,
  type ProductColorId,
  type ProductModelId,
  readCart,
  saveCart,
} from '../cart';

const features = [
  { number: '01', title: 'CarbonCore 42 мм', text: 'Лёгкая карбоновая мембрана быстро отрабатывает атаку и сохраняет микродетали даже на высокой громкости.', image: 'feature-carboncore-v2.png' },
  { number: '02', title: 'Тишина, которая адаптируется', text: 'Шесть микрофонов анализируют окружение 200 раз в секунду и гасят шум без ощущения давления.', image: 'feature-anc-v2.png' },
  { number: '03', title: '50 часов без розетки', text: 'Слушайте всю рабочую неделю. Десять минут быстрой зарядки дают ещё шесть часов музыки.', image: 'feature-battery-v2.png' },
  { number: '04', title: 'Связь без пауз', text: 'Bluetooth 5.4, multipoint и игровой режим 45 мс — для мгновенного переключения между ноутбуком и телефоном.', image: 'feature-multipoint-v2.png' },
];

const modelCardColors: Record<ProductModelId, ProductColorId> = {
  one: 'coral',
  air: 'sand',
  studio: 'silver',
};

const technicalSpecs = [
  { number: '01', label: 'Кодеки', value: 'LDAC · LC3', detail: 'Также AAC и SBC. Hi-Res Audio по Bluetooth до 24 бит / 96 кГц.' },
  { number: '02', label: 'Диапазон частот', value: '8 Гц — 42 кГц', detail: 'Драйверы CarbonCore 42 мм, коэффициент гармонических искажений менее 0,06%.' },
  { number: '03', label: 'Микрофоны', value: '6 MEMS', detail: 'Четыре микрофона для ANC и два голосовых с направленным формированием луча.' },
  { number: '04', label: 'Зарядка', value: 'USB-C · 2 часа', detail: 'Быстрая зарядка: 10 минут дают до 6 часов воспроизведения.' },
  { number: '05', label: 'Разъёмы', value: 'USB-C · 3,5 мм', detail: 'Цифровое аудио и зарядка по USB-C, проводное прослушивание через mini-jack.' },
  { number: '06', label: 'Совместимость', value: 'iOS · Android', detail: 'Windows, macOS и любые устройства с Bluetooth 5.4; поддержка multipoint.' },
  { number: '07', label: 'Комплектация', value: 'Готовы к поездке', detail: 'Наушники NIVØR ONE, жёсткий кейс, кабели USB-C и 3,5 мм, авиаадаптер и документация.' },
];

const techGroups = [
  { title: 'Акустика', items: ['Драйверы CarbonCore 42 мм', 'Диапазон 8 Гц — 42 кГц', 'Коэффициент искажений < 0,06%', 'Персональный профиль NIVØR ID'] },
  { title: 'Шумоподавление', items: ['Adaptive ANC до 42 дБ', 'Режим прозрачности', 'Защита от шума ветра', 'Автокалибровка посадки'] },
  { title: 'Связь и питание', items: ['Bluetooth 5.4 и multipoint', 'AAC, LC3, LDAC', '50 часов с ANC', 'USB-C · 10 минут = 6 часов'] },
  { title: 'Комфорт', items: ['Вес 272 г', 'Пена с эффектом памяти', 'Холодящий слой амбушюр', 'Складная алюминиевая рама'] },
];



const lifestylePoints = [
  'Мягкая посадка на долгие сессии.',
  'Автопауза, когда снимаете.',
  'Два устройства одновременно.',
  'Кейс, который помещается в рюкзак.',
];

function segmentProgress(progress: number, start: number, end: number) {
  const value = Math.min(1, Math.max(0, (progress - start) / Math.max(0.001, end - start)));
  return value * value * (3 - 2 * value);
}

function useScrollProgress(section: Ref<HTMLElement | null>, mode: 'normal' | 'origin' | 'final', smoothing: number) {
  const progress = ref(0);
  let frame = 0;
  let current = 0;
  let target = 0;

  const measure = () => {
    if (!section.value) return;
    const rect = section.value.getBoundingClientRect();
    const sceneHeight = section.value.firstElementChild?.getBoundingClientRect().height ?? window.innerHeight;
    const available = Math.max(1, rect.height - sceneHeight);
    if (mode === 'origin') {
      const lead = sceneHeight * 0.48;
      target = Math.min(1, Math.max(0, (lead - rect.top) / available));
    } else if (mode === 'final') {
      const lead = sceneHeight * 0.85;
      target = Math.min(1, Math.max(0, (lead - rect.top) / (available + lead)));
    } else {
      target = Math.min(1, Math.max(0, -rect.top / available));
    }
  };

  const animate = () => {
    current += (target - current) * smoothing;
    if (Math.abs(target - current) < 0.0005) current = target;
    progress.value = current;
    frame = current !== target ? requestAnimationFrame(animate) : 0;
  };

  const update = () => {
    measure();
    if (!frame) frame = requestAnimationFrame(animate);
  };

  onMounted(() => {
    measure();
    current = target;
    progress.value = current;
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', update);
    window.removeEventListener('resize', update);
    if (frame) cancelAnimationFrame(frame);
  });

  return progress;
}

const router = useRouter();
const selectedModelId = ref<ProductModelId>('one');
const selectedColorId = ref<ProductColorId>('graphite');
const cartQty = ref(0);
const mobileMenuOpen = ref(false);
const heroRef = ref<HTMLElement | null>(null);
const footerBottomRef = ref<HTMLElement | null>(null);
const websiteCtaBottom = ref(0);
let footerResizeObserver: ResizeObserver | null = null;
const isPastHero = ref(false);
let heroObserver: IntersectionObserver | null = null;
const openFaq = ref<number | null>(0);
const originRef = ref<HTMLElement | null>(null);
const featureRef = ref<HTMLElement | null>(null);
const lifestyleRef = ref<HTMLElement | null>(null);
const finalCtaRef = ref<HTMLElement | null>(null);
let revealObserver: IntersectionObserver | null = null;

const originProgress = useScrollProgress(originRef, 'origin', 0.12);
const featureProgress = useScrollProgress(featureRef, 'normal', 0.14);
const lifestyleProgress = useScrollProgress(lifestyleRef, 'origin', 0.11);
const finalProgress = useScrollProgress(finalCtaRef, 'final', 0.105);

const selectedModel = computed(() => findProduct(selectedModelId.value));
const selectedColor = computed(() => findColor(selectedColorId.value));
const activeFeature = computed(() => Math.min(features.length - 1, Math.floor(featureProgress.value * features.length)));
const easedOriginProgress = computed(() => originProgress.value * originProgress.value * (3 - 2 * originProgress.value));
const originKickerProgress = computed(() => segmentProgress(originProgress.value, 0, 0.08));
const originTitleProgress = computed(() => segmentProgress(originProgress.value, 0.01, 0.22));
const originColumnProgress = computed(() => [segmentProgress(originProgress.value, 0.1, 0.34), segmentProgress(originProgress.value, 0.16, 0.42)]);
const originStatProgress = computed(() => segmentProgress(originProgress.value, 0.3, 0.58));
const originImageTransform = computed(() => `translate3d(calc(${-2 + easedOriginProgress.value * 4} * var(--layout-unit)), calc(${5 - easedOriginProgress.value * 4} * var(--scene-unit)), 0) scale(${1.1 - easedOriginProgress.value * 0.04})`);
const originCopyTransform = computed(() => `translate3d(0, calc(${3.5 - easedOriginProgress.value * 7} * var(--scene-unit)), 0)`);
const easedLifestyleProgress = computed(() => lifestyleProgress.value * lifestyleProgress.value * (3 - 2 * lifestyleProgress.value));
const lifestyleKickerProgress = computed(() => segmentProgress(lifestyleProgress.value, -0.08, 0.03));
const lifestyleTitleProgress = computed(() => [segmentProgress(lifestyleProgress.value, -0.07, 0.075), segmentProgress(lifestyleProgress.value, -0.035, 0.12)]);
const lifestylePointProgress = computed(() => [0.28, 0.4, 0.52, 0.64].map((start) => segmentProgress(lifestyleProgress.value, start, start + 0.2)));
const lifestyleImageTransform = computed(() => `translate3d(calc(${-3.8 * easedLifestyleProgress.value} * var(--layout-unit)), calc(${2.8 + 4.4 * easedLifestyleProgress.value} * var(--scene-unit)), 0) scale(${1.075 + easedLifestyleProgress.value * 0.105})`);
const easedFinalProgress = computed(() => finalProgress.value * finalProgress.value * (3 - 2 * finalProgress.value));
const finalKickerProgress = computed(() => segmentProgress(finalProgress.value, 0.02, 0.2));
const finalTitleProgress = computed(() => segmentProgress(finalProgress.value, 0.05, 0.31));
const finalButtonProgress = computed(() => segmentProgress(finalProgress.value, 0.3, 0.56));
const finalImageTransform = computed(() => `translate3d(0, calc(${1.2 * easedFinalProgress.value} * var(--scene-unit)), 0) scale(${1.04 + easedFinalProgress.value * 0.18})`);

onMounted(() => {
  heroObserver = new IntersectionObserver(([entry]) => {
    if (entry) isPastHero.value = entry.boundingClientRect.bottom <= 0;
  });
  if (heroRef.value) heroObserver.observe(heroRef.value);
  updateWebsiteCtaPosition();
  footerResizeObserver = new ResizeObserver(updateWebsiteCtaPosition);
  footerResizeObserver.observe(document.documentElement);
  if (footerBottomRef.value) footerResizeObserver.observe(footerBottomRef.value);

  const savedCart = readCart();
  cartQty.value = cartCount(savedCart);
  const lastItem = savedCart.items.at(-1);
  if (lastItem) {
    selectedModelId.value = lastItem.modelId;
    selectedColorId.value = lastItem.colorId;
  }

  const elements = document.querySelectorAll<HTMLElement>('[data-reveal], [data-tech-reveal]');
  revealObserver = new IntersectionObserver(
    (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible')),
    { threshold: 0.14 },
  );
  elements.forEach((element) => revealObserver?.observe(element));

  window.addEventListener('keydown', handleMenuKeydown);
  window.addEventListener('resize', handleMenuResize);
  window.addEventListener('scroll', handleMenuScroll, { passive: true });
  window.addEventListener('wheel', handleMenuScrollIntent, { passive: true });
  window.addEventListener('touchmove', handleMenuScrollIntent, { passive: true });
});

onBeforeUnmount(() => {
  heroObserver?.disconnect();
  footerResizeObserver?.disconnect();
  revealObserver?.disconnect();
  window.removeEventListener('keydown', handleMenuKeydown);
  window.removeEventListener('resize', handleMenuResize);
  window.removeEventListener('scroll', handleMenuScroll);
  window.removeEventListener('wheel', handleMenuScrollIntent);
  window.removeEventListener('touchmove', handleMenuScrollIntent);
});

function setMobileMenu(open: boolean) {
  mobileMenuOpen.value = open;
}

function handleMenuKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') setMobileMenu(false);
}

function handleMenuResize() {
  updateWebsiteCtaPosition();
  if (window.innerWidth > 992) setMobileMenu(false);
}

function updateWebsiteCtaPosition() {
  const footerTop = footerBottomRef.value?.getBoundingClientRect().top;
  websiteCtaBottom.value = footerTop === undefined ? 0 : Math.max(0, window.innerHeight - footerTop + 12);
}

function handleMenuScroll() {
  updateWebsiteCtaPosition();
  if (mobileMenuOpen.value) setMobileMenu(false);
}

function handleMenuScrollIntent() {
  if (mobileMenuOpen.value) setMobileMenu(false);
}

function addToCart() {
  const nextCart = addCartItem(readCart(), selectedModelId.value, selectedColorId.value);
  saveCart(nextCart);
  cartQty.value = cartCount(nextCart);
  void router.push('/cart');
}

function openModel(modelId: ProductModelId) {
  selectedModelId.value = modelId;
  requestAnimationFrame(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('colors')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  });
}
</script>

<template>
  <main id="top">
    <header class="site-header" :class="{ 'is-menu-open': mobileMenuOpen }">
      <a class="brand" href="#top" aria-label="NIVØR — к началу страницы">
        <img class="brand-mark" :src="assetUrl('nivor-mark.svg')" alt="" aria-hidden="true" />
        <span>NIVØR</span>
      </a>
      <div class="header-controls">
        <nav class="main-nav" aria-label="Основная навигация">
          <a href="#story">О бренде</a>
          <a href="#features">Технологии</a>
          <a href="#models">Модели</a>
        </nav>
        <RouterLink class="cart-button" to="/cart" :aria-label="`Открыть корзину, товаров: ${cartQty}`">
          <ShoppingBag :size="17" :stroke-width="1.8" />
          <span>Корзина</span>
          <span class="cart-count">{{ cartQty }}</span>
        </RouterLink>
        <a class="buy-button" href="#product">Выбрать модель</a>
        <button class="menu-toggle" type="button" aria-controls="mobile-menu" :aria-expanded="mobileMenuOpen" :aria-label="mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'" @click="setMobileMenu(!mobileMenuOpen)">
          <X v-if="mobileMenuOpen" :size="22" />
          <MenuIcon v-else :size="23" />
        </button>
      </div>
    </header>

    <Transition name="mobile-menu-backdrop">
      <button v-if="mobileMenuOpen" class="mobile-menu-backdrop" type="button" tabindex="-1" aria-label="Закрыть меню" @click="setMobileMenu(false)" />
    </Transition>

    <Transition name="mobile-menu">
      <nav v-if="mobileMenuOpen" id="mobile-menu" class="mobile-menu" aria-label="Мобильная навигация">
        <div class="mobile-menu-inner">
          <div class="mobile-menu-links">
            <a href="#story" @click="setMobileMenu(false)"><small>01</small><span>О бренде</span><ArrowRight /></a>
            <a href="#features" @click="setMobileMenu(false)"><small>02</small><span>Технологии</span><ArrowRight /></a>
            <a href="#models" @click="setMobileMenu(false)"><small>03</small><span>Модели</span><ArrowRight /></a>
          </div>
          <div class="mobile-menu-actions">
            <RouterLink class="mobile-menu-cart" to="/cart" @click="setMobileMenu(false)">
              <span><ShoppingBag :size="18" />Корзина</span><b>{{ cartQty }}</b>
            </RouterLink>
            <a class="mobile-menu-primary" href="#product" @click="setMobileMenu(false)"><span>Выбрать модель</span><ArrowDownRight /></a>
          </div>
        </div>
      </nav>
    </Transition>

    <section id="top" ref="heroRef" class="hero">
      <div class="hero-frame">
        <div class="hero-meta"><span class="dot" />Доставка по России · СНГ · миру</div>
        <ul class="hero-specs">
          <li>ONE · Adaptive ANC до 42 дБ</li>
          <li>AIR · всего 218 граммов</li>
          <li>STUDIO · ReferenceCore 45 мм</li>
          <li>Пять цветов каждой модели</li>
        </ul>
        <div class="hero-title-wrap"><h1>NIVØR<span class="sr-only"> — наушники ONE, AIR и STUDIO</span></h1><p class="hero-series">ONE · AIR · STUDIO</p></div>
        <div class="hero-product">
          <img fetchpriority="high" width="1536" height="1024" class="hero-headphones" :src="assetUrl('nivor-hero-family-v5.png')" alt="Три модели наушников NIVØR лежат на светлой каменной плите в цветах ночной синий, сигнальный коралл и тёплый песок" />
        </div>
        <div class="hero-copy">
          <p>Премиальные беспроводные наушники для чистого звука, спокойных поездок и долгих дней.</p>
          <span>Три формы. Один стандарт звука.</span>
        </div>
        <div class="hero-cta">
          <span>В наличии · доставка от 3 дней</span>
          <button type="button" @click="addToCart"><b>{{ formatPrice(selectedModel.price) }}</b><span>Заказать</span><ArrowDownRight :size="20" /></button>
        </div>
      </div>
    </section>

    <section id="story" ref="originRef" class="origin-section">
      <div class="origin-sticky">
        <div class="origin-visual">
          <img :src="assetUrl('sovra-story-city-v3.png')" alt="Слушатель в наушниках NIVØR среди вечернего городского шума" :style="{ transform: originImageTransform }" />
        </div>
        <div class="origin-copy" :style="{ transform: originCopyTransform }">
          <p class="eyebrow origin-kicker" :style="{ opacity: originKickerProgress, transform: `translate3d(0, ${(1 - originKickerProgress) * 24}px, 0)` }">01 — Наша идея</p>
          <h2 class="origin-title" :style="{ opacity: 0.08 + originTitleProgress * 0.92, transform: `translate3d(0, ${(1 - originTitleProgress) * 58}px, 0)` }">Оставить шум снаружи.<br />Музыку — <em>внутри.</em></h2>
          <div class="origin-columns">
            <p :style="{ opacity: 0.08 + originColumnProgress[0] * 0.92, transform: `translate3d(0, ${(1 - originColumnProgress[0]) * 38}px, 0)` }">NIVØR появился из простой мысли: технологии не должны вставать между вами и музыкой. Они должны исчезать — вместе с шумом, задержкой и усталостью.</p>
            <p :style="{ opacity: 0.08 + originColumnProgress[1] * 0.92, transform: `translate3d(0, ${(1 - originColumnProgress[1]) * 38}px, 0)` }">Три модели решают разные задачи, но сохраняют одно звучание: собранный бас, близкий голос и детали даже на тихой громкости.</p>
          </div>
          <div class="origin-stat" :style="{ opacity: originStatProgress, transform: `translate3d(0, ${(1 - originStatProgress) * 42}px, 0)` }"><strong>14 600</strong><span>часов прослушивания<br />в тестовой лаборатории</span></div>
          <div class="origin-scroll-meter" aria-hidden="true"><span>SCROLL STORY</span><b>{{ String(Math.round(originProgress * 100)).padStart(2, '0') }}</b><i><em :style="{ transform: `scaleX(${originProgress})` }" /></i></div>
        </div>
      </div>
    </section>

    <section id="features" ref="featureRef" class="feature-scroll">
      <div class="feature-sticky">
        <header class="section-heading"><p class="eyebrow">02 — Главное</p><h2>Сделаны, чтобы<br />раскрывать <em>больше.</em></h2></header>
        <div class="feature-product" aria-hidden="true">
          <img v-for="(feature, index) in features" :key="`${feature.number}-image`" class="feature-headphones" :class="{ active: index === activeFeature }" :src="assetUrl(feature.image)" alt="" />
        </div>
        <div class="feature-list">
          <article v-for="(feature, index) in features" :key="feature.title" :class="{ active: index === activeFeature }">
            <span>{{ feature.number }}</span><h3>{{ feature.title }}</h3><p>{{ feature.text }}</p>
          </article>
        </div>
        <div class="progress-rail"><span :style="{ transform: `scaleY(${Math.max(0.03, featureProgress)})` }" /></div>
      </div>
    </section>

    <section id="specifications" class="technical-section">
      <header data-tech-reveal><p class="eyebrow">02 — Технический паспорт</p><h2>Все параметры.<br /><em>Без мелкого шрифта.</em></h2><p>Точные характеристики NIVØR ONE — от сигнального тракта до того, что лежит в коробке.</p></header>
      <div class="technical-grid">
        <article v-for="(spec, index) in technicalSpecs" :key="spec.number" data-tech-reveal :style="{ '--tech-index': index }"><span>{{ spec.number }}</span><div><small>{{ spec.label }}</small><strong>{{ spec.value }}</strong></div><p>{{ spec.detail }}</p></article>
      </div>
    </section>

    <section id="sound" class="spec-section">
      <div class="spec-intro"><div class="spec-sticky"><p class="eyebrow">03 — Инженерия</p><h2>Точность<br />в каждой <em>детали.</em></h2><p>Ни одного компонента «для галочки». Форма чашек, воздушные камеры, обработка сигнала и материалы работают как единая система.</p><div class="spec-orbit" aria-hidden="true"><img class="spec-product-render" :src="assetUrl('sovra-driver-exploded-v2.png')" alt="" /><span>42 mm</span><small>NIVØR ONE · SIDE PROFILE</small></div></div></div>
      <div class="spec-list"><article v-for="(group, groupIndex) in techGroups" :key="group.title" data-reveal><span>0{{ groupIndex + 1 }}</span><h3>{{ group.title }}</h3><ul><li v-for="item in group.items" :key="item"><Check />{{ item }}</li></ul></article></div>
    </section>

    <section id="models" class="model-collection">
      <header data-reveal><p class="eyebrow">04 — Линейка NIVØR</p><h2>Один характер.<br /><em>Три способа слушать.</em></h2><p>Выберите свою посадку и сценарий. Пять фирменных цветов доступны для каждой модели.</p></header>
      <nav class="model-page-links" aria-label="Характеристики моделей"><RouterLink v-for="model in models" :key="model.id" :to="`/headphones/${model.id}/`">{{ model.name }} — характеристики <ArrowRight /></RouterLink></nav>
      <div class="model-cards">
        <button v-for="(model, index) in models" :key="model.id" type="button" class="model-card" :aria-pressed="selectedModelId === model.id" :aria-label="`Выбрать ${model.name} и перейти к цветам`" data-reveal @click="openModel(model.id)">
          <span class="model-card-index">0{{ index + 1 }}</span><img :src="assetUrl(model.images[modelCardColors[model.id]])" :alt="`${model.name}, цвет ${findColor(modelCardColors[model.id]).name}`" loading="lazy" decoding="async" /><span class="model-card-copy"><small>{{ model.category }}</small><strong>{{ model.name }}</strong><em>{{ formatPrice(model.price) }}</em></span><ArrowDownRight />
        </button>
      </div>
    </section>

    <section id="colors" class="color-section">
      <div class="color-art" data-reveal aria-live="polite">
        <img v-for="color in colors" :key="`${selectedModel.id}-${color.id}`" :class="{ 'is-active': selectedColorId === color.id }" :src="assetUrl(selectedModel.images[color.id])" :alt="selectedColorId === color.id ? `${selectedModel.name}, цвет ${color.name}` : ''" :aria-hidden="selectedColorId !== color.id" loading="lazy" decoding="async" />
      </div>
      <div class="color-copy" data-reveal>
        <p class="eyebrow">05 — Цвет и материал · {{ selectedModel.name }}</p><h2>Пять оттенков.<br />Ваш <em>чистый силуэт.</em></h2><p>Каждый оттенок настроен под геометрию модели. Матовый корпус не собирает отпечатки, а амбушюры сохраняют форму после сотен часов.</p>
        <div class="color-picker"><button v-for="color in colors" :key="color.id" type="button" :class="{ selected: selectedColorId === color.id }" :aria-pressed="selectedColorId === color.id" @click="selectedColorId = color.id"><i class="swatch" :class="color.className" /><span>{{ color.name }}</span><Check v-if="selectedColorId === color.id" /></button></div>
      </div>
    </section>

    <section ref="lifestyleRef" class="lifestyle-section">
      <div class="lifestyle-sticky">
        <div class="lifestyle-media" aria-hidden="true"><img class="lifestyle-headphones" :src="assetUrl('sovra-lifestyle-day-v3.png')" alt="" :style="{ transform: lifestyleImageTransform, filter: `brightness(${0.62 + easedLifestyleProgress * 0.18}) saturate(${0.82 + easedLifestyleProgress * 0.18}) contrast(${1.04 + easedLifestyleProgress * 0.07})` }" /></div>
        <div class="lifestyle-overlay">
          <p class="eyebrow" :style="{ opacity: lifestyleKickerProgress, transform: `translate3d(0, ${(1 - lifestyleKickerProgress) * 18}px, 0)` }">06 — Каждый день</p>
          <div class="lifestyle-scroll-meter" aria-hidden="true"><span>SCROLL SEQUENCE</span><b>{{ String(Math.round(lifestyleProgress * 100)).padStart(2, '0') }}</b><i><em :style="{ transform: `scaleY(${lifestyleProgress})` }" /></i></div>
          <h2><span class="lifestyle-title-line" :style="{ opacity: lifestyleTitleProgress[0], transform: `translate3d(0, ${(1 - lifestyleTitleProgress[0]) * 34}px, 0)` }">Для движения.</span><span class="lifestyle-title-line" :style="{ opacity: lifestyleTitleProgress[1], transform: `translate3d(0, ${(1 - lifestyleTitleProgress[1]) * 34}px, 0)` }">Настроены <em>на <span class="lifestyle-comfort-word">комфорт.</span></em></span></h2>
          <div class="lifestyle-points"><p v-for="(point, index) in lifestylePoints" :key="point" :class="{ 'is-active': lifestylePointProgress[index] > 0.72 }" :style="{ opacity: lifestylePointProgress[index], transform: `translate3d(0, ${(1 - lifestylePointProgress[index]) * 22}px, 0)` }"><span>0{{ index + 1 }}</span><b>{{ point }}</b></p></div>
        </div>
      </div>
    </section>

    <section class="sound-grid-section">
      <header class="section-heading" data-reveal><p class="eyebrow">07 — Sound tech</p><h2>Внутри — физика.<br />Снаружи — <em>музыка.</em></h2><p>Интеллектуальная обработка слышит окружение, посадку и характер записи — и незаметно удерживает баланс.</p></header>
      <div class="sound-grid">
        <article class="sound-card sound-card-wide" data-reveal><div class="wave-visual"><i /><i /><i /><i /><i /></div><span>01</span><h3>NIVØR DSP</h3><p>Обработка в реальном времени без металлического окраса и потери динамики.</p></article>
        <article class="sound-card sound-card-dark" data-reveal><div class="sound-motion bluetooth-motion" aria-hidden="true"><Bluetooth /></div><span>02</span><h3>Multipoint 5.4</h3><p>Плавно переключается с рабочего звонка на музыку в телефоне.</p></article>
        <article class="sound-card sound-card-image" data-reveal><img :src="assetUrl('sovra-acoustic-macro.png')" alt="Акустическая камера и динамический драйвер NIVØR крупным планом" /><div><span>03</span><h3>Acoustic chamber</h3><p>Воздушный поток настроен для собранного баса и открытой сцены.</p></div></article>
        <article class="sound-card sound-card-coral" data-reveal><div class="sound-motion spatial-motion" aria-hidden="true"><Waves /></div><span>04</span><h3>Spatial Field</h3><p>Шире сцена — точнее положение голоса и инструментов.</p></article>
        <article class="sound-card sound-card-lines" data-reveal><span>05</span><h3>Voice Focus</h3><p>Голос остаётся разборчивым в метро, кафе и на ветру.</p></article>
      </div>
    </section>

    <section id="product" class="product-section">
      <div class="product-gallery" data-reveal aria-live="polite">
        <img v-for="color in colors" :key="`${selectedModel.id}-${color.id}`" :class="{ 'is-active': selectedColorId === color.id }" :src="assetUrl(selectedModel.images[color.id])" :alt="selectedColorId === color.id ? `${selectedModel.name} — ${color.name}` : ''" :aria-hidden="selectedColorId !== color.id" loading="lazy" decoding="async" />
        <div class="gallery-label"><span>{{ String(colors.findIndex((color) => color.id === selectedColorId) + 1).padStart(2, '0') }} / 05</span><span>{{ selectedColor.name }}</span></div>
      </div>
      <div class="product-info" data-reveal>
        <div class="model-switcher" aria-label="Модель наушников"><button v-for="model in models" :key="model.id" type="button" :class="{ selected: selectedModelId === model.id }" :aria-pressed="selectedModelId === model.id" @click="selectedModelId = model.id"><span>NIVØR</span><b>{{ model.shortName }}</b></button></div>
        <p class="eyebrow">{{ selectedModel.name }} · {{ selectedModel.category }}</p><h2>{{ selectedModel.headline }}<br /><em>{{ selectedModel.accent }}</em></h2><p class="product-lead">{{ selectedModel.description }}</p>
        <div class="product-rating"><span>★★★★★</span><a href="#reviews">{{ selectedModel.rating }}</a></div>
        <div class="product-options"><span>Цвет · {{ selectedColor.name }}</span><div><button v-for="color in colors" :key="color.id" type="button" :class="{ selected: selectedColorId === color.id }" :aria-label="color.name" :aria-pressed="selectedColorId === color.id" @click="selectedColorId = color.id"><i class="swatch" :class="color.className" /></button></div></div>
        <div class="product-price-row"><strong>{{ formatPrice(selectedModel.price) }}</strong><span>или {{ selectedModel.installment }} без переплаты</span></div>
        <button class="add-button" type="button" @click="addToCart"><span>Добавить в корзину</span><ShoppingBag /><ChevronRight /></button>
        <ul class="service-list"><li><PackageCheck />Бесплатная доставка от 3 дней</li><li><RotateCcw />30 дней на возврат</li><li><ShieldCheck />Гарантия 2 года</li></ul>
      </div>
    </section>

    <section id="reviews" class="review-section">
      <div class="review-index">4,9 <span>/ 5</span></div><blockquote data-reveal>«Редкий случай, когда шумоподавление не съедает характер записи. NIVØR звучат широко, спокойно и очень честно — хочется переслушать знакомые альбомы.»</blockquote><footer data-reveal><span class="review-avatar">МК</span><span><b>Марина Крылова</b><small>Саунд-продюсер · Москва</small></span><span class="verified"><Check />Проверенная покупка</span></footer>
    </section>

    <section id="faq" class="faq-section">
      <header><p class="eyebrow">08 — Вопросы и ответы</p><h2>Всё, что важно<br />знать <em>до покупки.</em></h2><p>Не нашли ответ? Напишите нам — обычно отвечаем за 15 минут.</p><a href="mailto:hello@nivor.audio">hello@nivor.audio <ArrowRight /></a></header>
      <div class="faq-list">
        <div v-for="([question, answer], index) in faqs" :key="question" class="faq-item" data-slot="accordion-item">
          <button type="button" data-slot="accordion-trigger" :aria-expanded="openFaq === index" @click="openFaq = openFaq === index ? null : index"><span>{{ question }}</span><ChevronDown :class="{ 'is-open': openFaq === index }" /></button>
          <div v-show="openFaq === index" data-slot="accordion-content"><div><p>{{ answer }}</p></div></div>
        </div>
      </div>
    </section>

    <section ref="finalCtaRef" class="final-cta-section">
      <div class="final-cta-sticky">
        <div class="final-cta-media" aria-hidden="true"><img class="final-cta-headphones" :src="assetUrl(selectedModel.images[selectedColorId])" alt="" :style="{ transform: finalImageTransform, filter: `brightness(${0.62 + easedFinalProgress * 0.14}) contrast(${1.08 + easedFinalProgress * 0.06})` }" /></div>
        <div class="final-cta-copy"><p :style="{ opacity: finalKickerProgress, transform: `translate3d(0, ${(1 - finalKickerProgress) * 22}px, 0)` }">Готовы услышать разницу?</p><h2 :aria-label="selectedModel.name"><span :style="{ opacity: finalTitleProgress, transform: `translate3d(calc(${(1 - finalTitleProgress) * -12} * var(--layout-unit)), 0, 0)` }">NIVØR</span><span :style="{ opacity: finalTitleProgress, transform: `translate3d(calc(${(1 - finalTitleProgress) * 12} * var(--layout-unit)), 0, 0)` }">{{ selectedModel.shortName }}</span></h2><button type="button" :style="{ opacity: finalButtonProgress, transform: `translate3d(0, ${(1 - finalButtonProgress) * 26}px, 0) scale(${0.96 + finalButtonProgress * 0.04})` }" @click="addToCart"><span>Заказать сейчас</span><b>{{ formatPrice(selectedModel.price) }}</b><ArrowRight /></button><small :style="{ opacity: finalButtonProgress }">{{ selectedModel.name }} · {{ selectedColor.name }}</small></div>
      </div>
    </section>

    <footer class="site-footer">
      <div class="footer-brand"><a class="footer-logo" href="#top" aria-label="NIVØR — к началу страницы"><img class="brand-mark" :src="assetUrl('nivor-mark.svg')" alt="" aria-hidden="true" /><strong>NIVØR</strong></a><p>Пространство между<br />тишиной и музыкой.</p></div>
      <div><span>Покупателям</span><RouterLink to="/headphones/one/">NIVØR ONE</RouterLink><RouterLink to="/headphones/air/">NIVØR AIR</RouterLink><RouterLink to="/headphones/studio/">NIVØR STUDIO</RouterLink><a href="#faq">Поддержка</a></div>
      <div><span>Контакты</span><a href="mailto:hello@nivor.audio">hello@nivor.audio</a><a href="tel:+78005550186">8 800 555-01-86</a><p>Ежедневно, 09:00—21:00</p></div>
      <div class="newsletter"><span>Новости без шума</span><p>Релизы, плейлисты и один хороший материал в месяц.</p><form @submit.prevent><label class="sr-only" for="email-subscribe">Email</label><input id="email-subscribe" type="email" placeholder="you@email.ru" /><button type="submit" aria-label="Подписаться"><ArrowRight /></button></form></div>
      <div ref="footerBottomRef" class="footer-bottom"><span class="footer-credit">© 2026 Concept Design &amp; Development — <a href="https://arcode-dev.ru/" target="_blank" rel="noreferrer">ArCode ↗</a></span></div>
    </footer>
  </main>
  <a
    class="website-cta"
    :style="{ '--website-cta-bottom': `${websiteCtaBottom}px` }"
    :class="{ 'is-visible': isPastHero && !mobileMenuOpen }"
    :tabindex="isPastHero && !mobileMenuOpen ? 0 : -1"
    :aria-hidden="!isPastHero || mobileMenuOpen"
    href="https://arcode-dev.ru/"
    target="_blank"
    rel="noopener noreferrer"
  ><span>Хочу такой же сайт</span><ArrowDownRight aria-hidden="true" /></a>
</template>
