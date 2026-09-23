<script setup lang="ts">
import type { AcceptPortalInviteInput, PortalSession } from '../types/api'
import { portalAuthMessages, singleQuery } from '../utils/authError'

definePageMeta({
  layout: 'auth'
})

const { t } = useI18n()
const route = useRoute()
const { request } = useApi()
const { setSession } = usePortalSession()

const token = computed(() => singleQuery(route.query.token))
const email = computed(() => singleQuery(route.query.email))
const password = ref('')
const passwordConfirmation = ref('')
const submitting = ref(false)
const errors = ref<Array<string>>([])

useHead({
  title: t('auth.acceptTitle'),
  meta: [
    { name: 'robots', content: 'noindex' }
  ]
})
useSeoMeta({
  robots: 'noindex'
})

async function onSubmit(): Promise<void> {
  errors.value = []
  submitting.value = true

  const body: AcceptPortalInviteInput = {
    token: token.value,
    email: email.value,
    password: password.value,
    password_confirmation: passwordConfirmation.value
  }

  try {
    const me = await request('/api/portal/auth/accept', {
      method: 'POST',
      body
    }) as PortalSession

    setSession(me)
    clearNuxtData()
    await navigateTo('/rates')
  } catch (caught: unknown) {
    errors.value = portalAuthMessages(caught)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AnkPanel :title="t('auth.acceptTitle')">
    <form
      class="auth-form"
      @submit.prevent="onSubmit"
    >
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

      <UFormField :label="t('auth.password')">
        <UInput
          v-model="password"
          type="password"
          autocomplete="new-password"
          required
          class="w-full"
        />
      </UFormField>

      <UFormField :label="t('auth.passwordConfirm')">
        <UInput
          v-model="passwordConfirmation"
          type="password"
          autocomplete="new-password"
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
          {{ t('auth.submitAccept') }}
        </UButton>
      </div>
    </form>
  </AnkPanel>
</template>
