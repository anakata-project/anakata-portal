<script setup lang="ts">
import type { PortalForgotInput, operations } from '../types/api'
import { portalAuthMessages } from '../utils/authError'

definePageMeta({
  layout: 'auth'
})

const { t } = useI18n()
const { request } = useApi()

const email = ref('')
const submitting = ref(false)
const sent = ref('')
const errors = ref<Array<string>>([])

useHead(() => ({
  title: t('auth.forgotTitle')
}))

async function onSubmit(): Promise<void> {
  errors.value = []
  sent.value = ''
  submitting.value = true

  const body: PortalForgotInput = { email: email.value.trim() }

  try {
    const response = await request('/api/portal/auth/forgot', {
      method: 'POST',
      body
    }) as operations['portalAuth.forgot']['responses'][200]['content']['application/json']

    sent.value = response.message
  } catch (caught: unknown) {
    errors.value = portalAuthMessages(caught)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AnkPanel :title="t('auth.forgotTitle')">
    <form
      class="auth-form"
      @submit.prevent="onSubmit"
    >
      <p
        v-if="sent"
        class="notice"
      >
        {{ sent }}
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

      <div class="auth-actions">
        <UButton
          type="submit"
          color="primary"
          class="w-full"
          :loading="submitting"
          :disabled="submitting"
        >
          {{ t('auth.sendReset') }}
        </UButton>
      </div>

      <NuxtLink
        to="/login"
        class="auth-link"
      >
        {{ t('auth.backToSignIn') }}
      </NuxtLink>
    </form>
  </AnkPanel>
</template>
