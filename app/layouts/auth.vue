<template>
  <div class="auth-layout">
    <div class="auth-theme">
      <AnkThemeToggle />
    </div>

    <div class="auth-column">
      <PortalBrand />
      <slot />
    </div>
  </div>
</template>
