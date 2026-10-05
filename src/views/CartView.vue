<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { ArrowLeft, ArrowRight, Minus, PackageCheck, Plus, RotateCcw, ShieldCheck, ShoppingBag, Trash2 } from '@lucide/vue';
import { assetUrl } from '../assets';
import {
  cartCount,
  cartTotal,
  type CartState,
  EMPTY_CART,
  findColor,
  findProduct,
  formatPrice,
  type ProductColorId,
  type ProductModelId,
  readCart,
  saveCart,
} from '../cart';

const cart = ref<CartState>(EMPTY_CART);
const ready = ref(false);
const quantity = computed(() => cartCount(cart.value));
const total = computed(() => cartTotal(cart.value));

onMounted(() => {
  cart.value = readCart();
  requestAnimationFrame(() => { ready.value = true; });
});

function updateQuantity(modelId: ProductModelId, colorId: ProductColorId, qty: number) {
  const next: CartState = {
    items: cart.value.items.flatMap((item) => item.modelId === modelId && item.colorId === colorId
      ? (qty > 0 ? [{ ...item, qty }] : [])
      : [item]),
  };
  cart.value = next;
  saveCart(next);
}
</script>

<template>
  <main class="commerce-page">
    <header class="commerce-header">
      <RouterLink class="brand" to="/" aria-label="NIVØR — на главную"><img class="brand-mark" :src="assetUrl('nivor-mark.svg')" alt="" aria-hidden="true" /><span>NIVØR</span></RouterLink>
      <div class="commerce-steps" aria-label="Этапы заказа"><span class="active">01 Корзина</span><i /><span>02 Оформление</span></div>
      <RouterLink class="commerce-back" :to="{ path: '/', hash: '#models' }"><ArrowLeft />Продолжить покупки</RouterLink>
    </header>

    <section class="commerce-shell cart-page-shell">
      <div class="commerce-title"><h1>Корзина <em>{{ ready ? String(quantity).padStart(2, '0') : '00' }}</em></h1><p class="eyebrow">Ваш заказ</p></div>

      <div v-if="ready && quantity === 0" class="commerce-empty">
        <ShoppingBag /><p class="eyebrow">Пока тихо</p><h2>В корзине ничего нет.</h2><p>Выберите модель NIVØR и один из пяти фирменных цветов — мы сохраним точную комплектацию.</p><RouterLink :to="{ path: '/', hash: '#product' }">Выбрать наушники <ArrowRight /></RouterLink>
      </div>

      <div v-else class="cart-page-grid" :class="{ 'is-ready': ready }">
        <div class="cart-items">
          <article v-for="item in cart.items" :key="`${item.modelId}-${item.colorId}`" class="cart-product-card">
            <div class="cart-product-image"><img :src="assetUrl(findProduct(item.modelId).images[item.colorId])" :alt="`${findProduct(item.modelId).name} — ${findColor(item.colorId).name}`" /></div>
            <div class="cart-product-copy">
              <div><p class="eyebrow">{{ findProduct(item.modelId).category }}</p><h2>{{ findProduct(item.modelId).name }}</h2></div>
              <div class="cart-product-meta"><span>Цвет</span><strong><i class="swatch" :class="findColor(item.colorId).className" />{{ findColor(item.colorId).name }}</strong><RouterLink :to="{ path: '/', hash: '#product' }">Изменить</RouterLink></div>
              <div class="cart-product-meta"><span>Количество</span><div class="quantity-control"><button type="button" aria-label="Уменьшить количество" @click="updateQuantity(item.modelId, item.colorId, item.qty - 1)"><Minus /></button><b>{{ item.qty }}</b><button type="button" aria-label="Увеличить количество" @click="updateQuantity(item.modelId, item.colorId, item.qty + 1)"><Plus /></button></div></div>
              <div class="cart-product-price">{{ formatPrice(findProduct(item.modelId).price * item.qty) }}</div>
              <button class="cart-remove" type="button" @click="updateQuantity(item.modelId, item.colorId, 0)"><Trash2 />Удалить товар</button>
            </div>
          </article>
        </div>

        <aside class="order-card">
          <p class="eyebrow">Итого</p>
          <div class="order-line"><span>{{ cart.items.length }} {{ cart.items.length === 1 ? 'позиция' : 'позиции' }} · {{ quantity }} шт.</span><b>{{ formatPrice(total) }}</b></div>
          <div class="order-line"><span>Доставка</span><b>Бесплатно</b></div>
          <div class="order-total"><span>К оплате</span><strong>{{ formatPrice(total) }}</strong></div>
          <RouterLink class="commerce-primary" to="/checkout"><span>Перейти к оформлению</span><ArrowRight /></RouterLink>
          <small>Оплата после подтверждения заказа</small>
          <div class="order-assurances"><span><PackageCheck />Доставка от 3 дней</span><span><RotateCcw />Возврат 30 дней</span><span><ShieldCheck />Гарантия 2 года</span></div>
        </aside>
      </div>
    </section>
  </main>
</template>
