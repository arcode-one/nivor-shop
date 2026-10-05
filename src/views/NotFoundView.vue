<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>
<template>
  <main class="not-found-page">
    <p class="eyebrow">NIVØR · 404</p>
    <h1>Страница не найдена</h1>
    <p>Возможно, адрес изменился. Выберите модель на главной странице.</p>
    <RouterLink class="buy-button" to="/">К наушникам NIVØR</RouterLink>
  </main>
</template>
