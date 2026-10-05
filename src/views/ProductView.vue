<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { ArrowLeft, ArrowRight, ShoppingBag } from '@lucide/vue';
import { PRODUCT_COLORS, PRODUCT_MODELS, addCartItem, findColor, findProduct, formatPrice, readCart, saveCart, type ProductModelId } from '../cart';
import { assetUrl } from '../assets';
import { isStore, productPath } from '../seo';

const route = useRoute();
const router = useRouter();
const model = computed(() => findProduct(route.params.modelId as ProductModelId));
// Static hosts serve identical HTML for query variants; apply selection after hydration.
const mounted = ref(false);
onMounted(() => { mounted.value = true; });
const selectedColor = computed(() => findColor(mounted.value && typeof route.query.color === 'string' ? PRODUCT_COLORS.find((color) => color.id === route.query.color)?.id ?? 'graphite' : 'graphite'));
const otherModels = computed(() => PRODUCT_MODELS.filter((item) => item.id !== model.value.id));
function addToCart() {
  saveCart(addCartItem(readCart(), model.value.id, selectedColor.value.id));
  void router.push('/cart/');
}
</script>

<template>
  <main class="product-detail-page">
    <header class="site-header">
      <RouterLink class="brand" to="/" aria-label="NIVØR — на главную"><img class="brand-mark" :src="assetUrl('nivor-mark.svg')" alt="" width="27" height="27" /><span>NIVØR</span></RouterLink>
      <RouterLink class="cart-button" to="/cart/"><ShoppingBag /><span>Корзина</span></RouterLink>
    </header>
    <div class="product-detail-shell">
      <nav class="breadcrumbs" aria-label="Хлебные крошки"><RouterLink to="/">Наушники NIVØR</RouterLink><span aria-hidden="true">/</span><span aria-current="page">{{ model.name }}</span></nav>
      <div class="product-detail-grid">
        <div class="product-detail-image"><img :src="assetUrl(model.images[selectedColor.id])" :alt="`${model.name} — ${selectedColor.name}`" width="1024" height="1024" fetchpriority="high" /></div>
        <section class="product-detail-copy">
          <p class="eyebrow">{{ model.category }}</p>
          <h1>{{ model.name }}<span>— {{ model.category }}</span></h1>
          <p class="product-lead">{{ model.description }}</p>
          <p v-if="!isStore" class="concept-note">Дизайн-концепт NIVØR: модели, характеристики и цены представлены для демонстрации интерфейса магазина.</p>
          <h2>Характеристики</h2>
          <ul class="product-detail-specs"><li v-for="spec in model.specs" :key="spec">{{ spec }}</li></ul>
          <h2>Цвет: {{ selectedColor.name }}</h2>
          <nav class="product-color-links" aria-label="Цвет наушников"><RouterLink v-for="color in PRODUCT_COLORS" :key="color.id" :to="{ path: productPath(model.id), query: { color: color.id } }" :class="{ selected: selectedColor.id === color.id }" :aria-current="selectedColor.id === color.id ? 'true' : undefined"><i class="swatch" :class="color.className" />{{ color.name }}</RouterLink></nav>
          <div class="product-price-row"><strong>{{ formatPrice(model.price) }}</strong><span v-if="!isStore">Демонстрационная цена</span></div>
          <button class="add-button requires-js" type="button" @click="addToCart"><span>Добавить в корзину</span><ShoppingBag /><ArrowRight /></button>
          <noscript><p>Для выбора комплектации и работы с корзиной включите JavaScript.</p></noscript>
          <RouterLink class="product-back-link" :to="{ path: '/', hash: '#models' }"><ArrowLeft />Сравнить все модели</RouterLink>
        </section>
      </div>
      <section class="product-detail-colors">
        <h2>{{ model.name }} в пяти цветах</h2>
        <div class="product-color-gallery"><figure v-for="color in PRODUCT_COLORS" :key="color.id"><img :src="assetUrl(model.images[color.id])" :alt="`${model.name}, ${color.name}`" width="1024" height="1024" loading="lazy" decoding="async" /><figcaption>{{ color.name }}</figcaption></figure></div>
      </section>
      <section class="related-models"><h2>Другие модели NIVØR</h2><div><RouterLink v-for="other in otherModels" :key="other.id" :to="productPath(other.id)"><h3>{{ other.name }}</h3><p>{{ other.description }}</p><span>Характеристики <ArrowRight /></span></RouterLink></div></section>
    </div>
    <footer class="product-detail-footer"><RouterLink to="/">NIVØR · Все модели</RouterLink><span>Concept Design &amp; Development — <a href="https://arcode-dev.ru/">ArCode</a></span></footer>
  </main>
</template>
