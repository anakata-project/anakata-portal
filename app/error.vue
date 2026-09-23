<script setup lang="ts">
const props = defineProps<{
  error: {
    statusCode?: number
    message?: string
  }
}>()

const { t } = useI18n()

function clear(): void {
  void clearError({ redirect: '/rates' })
}
</script>

<template>
  <UApp>
    <NuxtLayout>
      <AnkPanel :title="t('pages.notFound')">
        <p class="portal-placeholder">
          {{ props.error.message || t('pages.notFound') }}
        </p>
        <p class="portal-placeholder">
          <UButton
            color="primary"
            @click="clear"
          >
            {{ t('pages.backHome') }}
          </UButton>
        </p>
      </AnkPanel>
    </NuxtLayout>
  </UApp>
</template>
