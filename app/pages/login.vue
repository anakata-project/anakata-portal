<script setup lang="ts">
import { portalAuthMessages } from '../utils/authError'
import { postLoginPath } from '../utils/session'

definePageMeta({
  layout: 'auth'
})

const { t } = useI18n()
const route = useRoute()
const { login } = usePortalSession()

const email = ref('')
const password = ref('')
const submitting = ref(false)
const errors = ref<Array<string>>([])

const notice = computed(() => {
  return route.query.notice === 'session' ? t('auth.sessionEnded') : ''
})

useHead(() => ({
  title: t('auth.signIn')
}))

async function onSubmit(): Promise<void> {
  errors.value = []
  submitting.value = true

  try {
    await login(email.value.trim(), password.value)
    await navigateTo(postLoginPath(route.query.redirect))
  } catch (caught: unknown) {
    errors.value = portalAuthMessages(caught)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AnkPanel :title="t('auth.signIn')">
    <form
      class="auth-form"
      @submit.prevent="onSubmit"
    >
      <p
        v-if="notice"
        class="notice"
      >
        {{ notice }}
      </p>
      <div
        v-if="errors.length"
        class="warnbox"
      >
        <p
          v-for="message in errors"
          :key="message"
        >
          {{ message }}
        </p>
      </div>

      <UFormField :label="t('auth.email')">
        <UInput
          v-model="email"
          type="email"
          autocomplete="username"
          required
          class="w-full"
        />
      </UFormField>

      <UFormField :label="t('auth.password')">
        <UInput
          v-model="password"
          type="password"
          autocomplete="current-password"
          required
          class="w-full"
        />
      </UFormField>

      <div class="auth-actions">
        <UButton
          type="submit"
          color="primary"
          class="w-full"
          :loading="submitting"
          :disabled="submitting"
        >
          {{ t('auth.signIn') }}
        </UButton>
        <NuxtLink
          to="/forgot"
          class="auth-link"
        >
          {{ t('auth.forgotPassword') }}
        </NuxtLink>
      </div>
    </form>
  </AnkPanel>
</template>
