<script setup lang="ts">
import type { PortalRequestCreated, PortalRequestInput } from '../../types/api'
import { portalAuthMessages, singleQuery } from '../../utils/authError'
import { bookingStatusKey, bookingStatusTone } from '../../utils/portalStatus'

type Category = PortalRequestInput['category']

type CabinDraft = {
  adults: number
  children: number
}

const { t } = useI18n()
const route = useRoute()
const { request } = useApi()

const queryId = Number(singleQuery(route.query.departure_id))
const departureId = ref(Number.isInteger(queryId) && queryId > 0 ? String(queryId) : '')
const category = ref<Category>('SUITE')
const cabins = ref<Array<CabinDraft>>([{ adults: 1, children: 0 }])
const clientName = ref('')
const clientEmail = ref('')
const notes = ref('')
const acknowledged = ref(false)
const submitting = ref(false)
const errors = ref<Array<string>>([])
const created = ref<PortalRequestCreated | null>(null)

function addCabin(): void {
  cabins.value.push({ adults: 1, children: 0 })
}

function removeCabin(index: number): void {
  if (cabins.value.length < 2) {
    return
  }

  cabins.value.splice(index, 1)
}

function partyCount(value: number, minimum: number): number {
  if (!Number.isFinite(value)) {
    return minimum
  }

  return value
}

async function onSubmit(): Promise<void> {
  errors.value = []

  if (clientEmail.value.trim() === '') {
    errors.value = [t('requests.emailRequired')]
    return
  }

  if (!acknowledged.value) {
    errors.value = [t('requests.acknowledgeRequired')]
    return
  }

  const departure = Number(departureId.value)

  if (!Number.isInteger(departure) || departure < 1) {
    errors.value = [t('requests.departureRequired')]
    return
  }

  const payload: PortalRequestInput = {
    departure_id: departure,
    category: category.value,
    cabins: cabins.value.map(row => ({
      adults: partyCount(row.adults, 0),
      children: partyCount(row.children, 0)
    })),
    client: {
      name: clientName.value.trim(),
      email: clientEmail.value.trim()
    },
    client_of_record: true
  }
  const note = notes.value.trim()

  if (note !== '') {
    payload.notes = note
  }

  submitting.value = true

  try {
    created.value = await request('/api/portal/requests', {
      method: 'POST',
      body: payload
    }) as PortalRequestCreated
  } catch (caught: unknown) {
    errors.value = portalAuthMessages(caught)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <div
      v-if="created"
      data-request-result
    >
      <p
        v-for="reference in created.references"
        :key="reference"
        class="bk-ref"
      >
        {{ reference }}
      </p>
      <p>
        <AnkPill :tone="bookingStatusTone(created.status)">
          {{ t(bookingStatusKey(created.status)) }}
        </AnkPill>
      </p>
      <p class="notice">
        {{ created.message }}
      </p>
      <p>
        <NuxtLink
          to="/requests"
          class="auth-link"
        >
          {{ t('requests.backToList') }}
        </NuxtLink>
      </p>
    </div>
    <form
      v-else
      class="portal-form"
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

      <div class="field">
        <label for="req-departure">{{ t('requests.departure') }}</label>
        <input
          id="req-departure"
          v-model="departureId"
          type="number"
          min="1"
          step="1"
          required
        >
      </div>

      <div class="field">
        <label for="req-category">{{ t('requests.category') }}</label>
        <select
          id="req-category"
          v-model="category"
        >
          <option value="SUITE">
            {{ t('requests.suite') }}
          </option>
          <option value="OWNER">
            {{ t('requests.owner') }}
          </option>
        </select>
      </div>

      <div>
        <p class="prevl">
          {{ t('requests.cabins') }}
        </p>
        <div class="portal-cabins">
          <div
            v-for="(cabin, index) in cabins"
            :key="index"
            class="portal-cabin"
          >
            <div class="field">
              <label :for="`req-adults-${String(index)}`">{{ t('requests.adults') }}</label>
              <input
                :id="`req-adults-${String(index)}`"
                v-model.number="cabin.adults"
                type="number"
                min="1"
                step="1"
                required
              >
            </div>
            <div class="field">
              <label :for="`req-children-${String(index)}`">{{ t('requests.children') }}</label>
              <input
                :id="`req-children-${String(index)}`"
                v-model.number="cabin.children"
                type="number"
                min="0"
                step="1"
                required
              >
            </div>
            <button
              v-if="cabins.length > 1"
              type="button"
              class="mini"
              @click="removeCabin(index)"
            >
              {{ t('requests.removeCabin') }}
            </button>
          </div>
        </div>
        <p class="portal-toolbar">
          <button
            type="button"
            class="mini"
            @click="addCabin"
          >
            {{ t('requests.addCabin') }}
          </button>
        </p>
      </div>

      <div class="field">
        <label for="req-name">{{ t('requests.clientName') }}</label>
        <input
          id="req-name"
          v-model="clientName"
          type="text"
          autocomplete="name"
          required
        >
      </div>

      <div class="field">
        <label for="req-email">{{ t('requests.clientEmail') }}</label>
        <input
          id="req-email"
          v-model="clientEmail"
          type="email"
          autocomplete="email"
        >
      </div>

      <div class="field">
        <label for="req-notes">{{ t('requests.notes') }}</label>
        <textarea
          id="req-notes"
          v-model="notes"
          rows="4"
        />
      </div>

      <label
        class="portal-check"
        for="req-ack"
      >
        <input
          id="req-ack"
          v-model="acknowledged"
          type="checkbox"
        >
        <span>{{ t('requests.acknowledge') }}</span>
      </label>

      <div>
        <UButton
          type="submit"
          color="primary"
          :loading="submitting"
          :disabled="submitting"
        >
          {{ t('requests.submit') }}
        </UButton>
      </div>
    </form>
  </div>
</template>
