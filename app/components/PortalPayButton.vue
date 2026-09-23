<script setup lang="ts">
import type { PaymentLink, PortalBooking } from '../types/api'
import { portalPageMessages } from '../utils/authError'
import { openPaymentUrl, portalPayKind } from '../utils/portalPay'

const props = defineProps<{
  id: number
  status: PortalBooking['status']
  paymentState: PortalBooking['payment_state']
  openPaymentKinds: Array<string>
}>()

const { t } = useI18n()
const { request } = useApi()

const paying = ref(false)
const errors = ref<Array<string>>([])

const kind = computed(() => portalPayKind({
  status: props.status,
  payment_state: props.paymentState,
  open_payment_kinds: props.openPaymentKinds
}))

async function pay(): Promise<void> {
  if (kind.value === null || paying.value) {
    return
  }

  paying.value = true
  errors.value = []

  try {
    const link = await request(`/api/portal/bookings/${String(props.id)}/payment-link`, {
      method: 'POST',
      body: { kind: kind.value }
    }) as PaymentLink

    openPaymentUrl(link.url)
  } catch (caught: unknown) {
    errors.value = portalPageMessages(caught)
  } finally {
    paying.value = false
  }
}
</script>

<template>
  <div v-if="kind">
    <button
      type="button"
      class="mini"
      data-pay
      :data-kind="kind"
      :disabled="paying"
      @click="pay"
    >
      {{ kind === 'DEPOSIT' ? t('pay.deposit') : t('pay.balance') }}
    </button>
    <div
      v-if="errors.length"
      class="warnbox"
      data-pay-error
    >
      <p
        v-for="message in errors"
        :key="message"
      >
        {{ message }}
      </p>
    </div>
  </div>
</template>
