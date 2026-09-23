<script setup lang="ts">
import { NAV } from '../navigation'

const { t } = useI18n()
const route = useRoute()
const { session, logout } = usePortalSession()

const pageTitle = computed(() => {
  const item = NAV.find(entry => entry.to === route.path)

  return item ? t(item.labelKey) : t('shell.brand')
})

useHead(() => ({
  title: pageTitle.value
}))
</script>

<template>
  <div class="portal-app">
    <aside class="portal-side">
      <PortalBrand />
      <nav
        class="portal-nav"
        :aria-label="t('shell.brand')"
      >
        <NuxtLink
          v-for="item in NAV"
          :key="item.to"
          :to="item.to"
          class="portal-link"
          :class="{ 'is-on': item.to === route.path }"
        >
          {{ t(item.labelKey) }}
        </NuxtLink>
      </nav>
      <img
        class="portal-prow"
        src="/brand/prow.png"
        alt=""
        width="36"
        height="19"
        draggable="false"
      >
    </aside>

    <main class="portal-main">
      <div class="portal-head">
        <h1>{{ pageTitle }}</h1>
        <div class="portal-who">
          <span
            v-if="session?.agency.name"
            class="portal-agency"
          >{{ session.agency.name }}</span>
          <span class="mono">{{ t('shell.signedInAs') }}</span>
          <span
            v-if="session"
            class="who-email"
          >{{ session.name }}</span>
          <AnkThemeToggle />
          <UButton
            color="neutral"
            variant="outline"
            @click="logout"
          >
            {{ t('shell.signOut') }}
          </UButton>
        </div>
      </div>
      <slot />
    </main>
  </div>
</template>
