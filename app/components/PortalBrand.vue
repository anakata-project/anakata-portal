<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="portal-brand">
    <img
      src="/brand/wordmark-dark.png"
      alt="ANAKATA"
      class="brand-mark--dark"
      draggable="false"
    >
    <img
      src="/brand/wordmark-light.png"
      alt="ANAKATA"
      class="brand-mark--light"
      draggable="false"
    >
    <small>{{ t('shell.brand') }}</small>
  </div>
</template>
