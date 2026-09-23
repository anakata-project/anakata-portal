<script setup lang="ts">
import type { operations, PortalAvailabilityRow } from '../types/api'
import { canRequestDeparture, labelTone } from '../utils/availabilityLabel'
import { availabilityPath } from '../utils/availabilityQuery'
import { portalPageMessages } from '../utils/authError'

type AvailabilityBody = operations['portalAvailability.index']['responses'][200]['content']['application/json']

type Filters = {
  fromMonth: string
  toMonth: string
  yacht: string
  itinerary: string
}

const { t } = useI18n()
const { request } = useApi()
const { format } = useDates()

const draft = reactive<Filters>({
  fromMonth: '',
  toMonth: '',
  yacht: '',
  itinerary: ''
})
const applied = ref<Filters>({
  fromMonth: '',
  toMonth: '',
  yacht: '',
  itinerary: ''
})
const page = ref(1)
const pending = ref(true)
const errors = ref<Array<string>>([])
const rows = ref<Array<PortalAvailabilityRow>>([])
const meta = ref<AvailabilityBody['meta'] | null>(null)

async function load(): Promise<void> {
  pending.value = true
  errors.value = []

  try {
    const body = await request(availabilityPath({
      ...applied.value,
      page: page.value
    })) as AvailabilityBody

    rows.value = body.data
    meta.value = body.meta
  } catch (caught: unknown) {
    rows.value = []
    meta.value = null
    errors.value = portalPageMessages(caught)
  } finally {
    pending.value = false
  }
}

function show(): void {
  page.value = 1
  applied.value = { ...draft }
  void load()
}

function go(next: number): void {
  page.value = next
  void load()
}

void load()
</script>

<template>
  <div>
    <form
      class="portal-filters"
      @submit.prevent="show"
    >
      <div class="field">
        <label for="av-from">{{ t('availability.from') }}</label>
        <input
          id="av-from"
          v-model="draft.fromMonth"
          type="month"
        >
      </div>
      <div class="field">
        <label for="av-to">{{ t('availability.to') }}</label>
        <input
          id="av-to"
          v-model="draft.toMonth"
          type="month"
        >
      </div>
      <div class="field">
        <label for="av-yacht">{{ t('availability.yacht') }}</label>
        <input
          id="av-yacht"
          v-model="draft.yacht"
          type="text"
          autocomplete="off"
          spellcheck="false"
        >
      </div>
      <div class="field">
        <label for="av-itinerary">{{ t('availability.itinerary') }}</label>
        <input
          id="av-itinerary"
          v-model="draft.itinerary"
          type="text"
          autocomplete="off"
          spellcheck="false"
        >
      </div>
      <UButton
        type="submit"
        color="primary"
      >
        {{ t('availability.apply') }}
      </UButton>
    </form>

    <p
      v-if="pending"
      class="bbnote"
    >
      …
    </p>
    <div
      v-else-if="errors.length"
      class="warnbox"
    >
      <p
        v-for="message in errors"
        :key="message"
      >
        {{ message }}
      </p>
    </div>
    <template v-else>
      <div class="portal-scroll">
        <table class="list">
          <thead>
            <tr>
              <th>{{ t('availability.date') }}</th>
              <th>{{ t('availability.yacht') }}</th>
              <th>{{ t('availability.itinerary') }}</th>
              <th>{{ t('availability.label') }}</th>
              <th>{{ t('rates.suitePp') }}</th>
              <th>{{ t('rates.ownerPp') }}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr
              v-if="rows.length === 0"
              class="dr-empty"
            >
              <td colspan="7">
                {{ t('availability.empty') }}
              </td>
            </tr>
            <tr
              v-for="row in rows"
              :key="row.id"
              :data-departure="row.id"
            >
              <td>{{ format(row.embark, 'short') }}</td>
              <td>{{ row.yacht }}</td>
              <td>{{ row.itinerary }}</td>
              <td>
                <AnkPill :tone="labelTone(row.label.code)">
                  {{ row.label.text }}
                </AnkPill>
              </td>
              <td>
                <AnkMoney :amount="row.net_rates.suite_pp" />
              </td>
              <td>
                <AnkMoney :amount="row.net_rates.owner_pp" />
              </td>
              <td>
                <NuxtLink
                  v-if="canRequestDeparture(row.label.code)"
                  class="mini"
                  :to="{ path: '/requests/new', query: { departure_id: String(row.id) } }"
                >
                  {{ t('availability.request') }}
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        v-if="meta && meta.last_page > 1"
        class="list-pager"
      >
        <button
          type="button"
          :disabled="meta.current_page <= 1"
          @click="go(meta.current_page - 1)"
        >
          {{ t('availability.previous') }}
        </button>
        <span>{{ t('availability.pager', { page: String(meta.current_page), total: String(meta.total) }) }}</span>
        <button
          type="button"
          :disabled="meta.current_page >= meta.last_page"
          @click="go(meta.current_page + 1)"
        >
          {{ t('availability.next') }}
        </button>
      </div>
    </template>
  </div>
</template>
