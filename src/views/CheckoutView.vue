<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { ArrowLeft, ArrowRight, Check, LockKeyhole, PackageCheck, ShoppingBag } from '@lucide/vue';
import { assetUrl } from '../assets';
import { cartCount, cartTotal, type CartState, EMPTY_CART, findColor, findProduct, formatPrice, readCart, saveCart } from '../cart';

const cart = ref<CartState>(EMPTY_CART);
const ready = ref(false);
const delivery = ref<'courier' | 'pickup'>('courier');
const complete = ref(false);
const quantity = computed(() => cartCount(cart.value));
const total = computed(() => cartTotal(cart.value));

onMounted(() => {
  cart.value = readCart();
  requestAnimationFrame(() => { ready.value = true; });
});

function submitOrder() {
  complete.value = true;
  saveCart(EMPTY_CART);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
</script>

<template>
  <main v-if="complete" class="commerce-page order-complete-page">
    <div class="order-complete-mark"><Check /></div><p class="eyebrow">Заказ принят · NIV-2608</p><h1>Спасибо.<br /><em>Скоро свяжемся.</em></h1><p>Подтверждение заказа отправлено на указанную почту. Менеджер уточнит удобное время доставки.</p><RouterLink class="commerce-primary" to="/"><span>Вернуться в магазин</span><ArrowRight /></RouterLink>
  </main>

  <main v-else class="commerce-page">
    <header class="commerce-header">
      <RouterLink class="brand" to="/" aria-label="NIVØR — на главную"><img class="brand-mark" :src="assetUrl('nivor-mark.svg')" alt="" aria-hidden="true" /><span>NIVØR</span></RouterLink>
      <div class="commerce-steps" aria-label="Этапы заказа"><span>01 Корзина</span><i /><span class="active">02 Оформление</span></div>
      <RouterLink class="commerce-back" to="/cart"><ArrowLeft />Вернуться в корзину</RouterLink>
    </header>

    <section class="commerce-shell checkout-page-shell">
      <div class="commerce-title"><h1>Оформление <em>заказа.</em></h1><p class="eyebrow">Финальный шаг</p></div>

      <div v-if="ready && quantity === 0" class="commerce-empty"><ShoppingBag /><p class="eyebrow">Заказ не найден</p><h2>Сначала добавьте товар.</h2><p>Корзина пуста — вернитесь к линейке NIVØR и выберите модель с цветом.</p><RouterLink :to="{ path: '/', hash: '#product' }">Перейти к выбору <ArrowRight /></RouterLink></div>

      <div v-else class="checkout-page-grid" :class="{ 'is-ready': ready }">
        <form class="checkout-page-form" @submit.prevent="submitOrder">
          <section class="checkout-form-block">
            <div class="checkout-block-heading"><span>01</span><div><h2>Контактные данные</h2><p>Для подтверждения и статуса доставки.</p></div></div>
            <div class="checkout-fields">
              <div><label for="checkout-name" data-slot="label">Имя</label><input id="checkout-name" name="name" data-slot="input" placeholder="Александр" autocomplete="name" required /></div>
              <div><label for="checkout-phone" data-slot="label">Телефон</label><input id="checkout-phone" name="phone" data-slot="input" type="tel" placeholder="+7 900 000-00-00" autocomplete="tel" required /></div>
              <div class="full-field"><label for="checkout-email" data-slot="label">Email</label><input id="checkout-email" name="email" data-slot="input" type="email" placeholder="you@email.ru" autocomplete="email" required /></div>
            </div>
          </section>

          <section class="checkout-form-block">
            <div class="checkout-block-heading"><span>02</span><div><h2>Способ доставки</h2><p>Доставка занимает от 3 рабочих дней.</p></div></div>
            <div class="delivery-options">
              <button type="button" :class="{ selected: delivery === 'courier' }" @click="delivery = 'courier'"><i><PackageCheck /></i><span><b>Курьером</b><small>До двери · от 3 дней</small></span><strong>Бесплатно</strong></button>
              <button type="button" :class="{ selected: delivery === 'pickup' }" @click="delivery = 'pickup'"><i><ShoppingBag /></i><span><b>Пункт выдачи</b><small>Ближайший пункт · от 3 дней</small></span><strong>Бесплатно</strong></button>
            </div>
            <div class="checkout-fields"><div class="full-field"><label for="checkout-address" data-slot="label">Адрес доставки</label><input id="checkout-address" name="address" data-slot="input" :placeholder="delivery === 'courier' ? 'Город, улица, дом, квартира' : 'Город и удобный район'" autocomplete="street-address" required /></div></div>
          </section>

          <button class="commerce-primary checkout-submit" type="submit"><span>Подтвердить заказ</span><ArrowRight /></button>
          <p class="secure-note"><LockKeyhole />Данные передаются по защищённому соединению. Оплата — после подтверждения.</p>
        </form>

        <aside class="checkout-order-card">
          <p class="eyebrow">Ваш заказ · {{ quantity }} шт.</p>
          <div class="checkout-order-items"><div v-for="item in cart.items" :key="`${item.modelId}-${item.colorId}`" class="checkout-order-product"><img :src="assetUrl(findProduct(item.modelId).images[item.colorId])" :alt="`${findProduct(item.modelId).name} — ${findColor(item.colorId).name}`" /><div><span>{{ findProduct(item.modelId).name }}</span><strong>{{ findColor(item.colorId).name }}</strong><small>{{ item.qty }} × {{ formatPrice(findProduct(item.modelId).price) }}</small></div></div></div>
          <div class="order-line"><span>Товары</span><b>{{ formatPrice(total) }}</b></div><div class="order-line"><span>Доставка</span><b>Бесплатно</b></div><div class="order-total"><span>К оплате</span><strong>{{ formatPrice(total) }}</strong></div>
        </aside>
      </div>
    </section>
  </main>
</template>
