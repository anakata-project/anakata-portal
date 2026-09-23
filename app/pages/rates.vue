<script setup lang="ts">
import type { operations, PortalAgency, PortalNetRates } from '../types/api'
import { portalPageMessages } from '../utils/authError'

type RatesBody = operations['portalAgency.rates']['responses'][200]['content']['application/json']

const { t } = useI18n()
const { request } = useApi()

const pending = ref(true)
const errors = ref<Array<string>>([])
const years = ref<Array<PortalNetRates>>([])
const commissionPct = ref<number | null>(null)

async function load(): Promise<void> {
  pending.value = true
  errors.value = []

  try {
    const [me, rates] = await Promise.all([
      request('/api/portal/me') as Promise<PortalAgency>,
      request('/api/portal/rates') as Promise<RatesBody>
    ])

    commissionPct.value = me.agency.commission_pct
    years.value = rates.data
  } catch (caught: unknown) {
    commissionPct.value = null
    years.value = []
    errors.value = portalPageMessages(caught)
  } finally {
    pending.value = false
  }
}

void load()
</script>

<template>
  <div>
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
      <div
        v-if="commissionPct !== null"
        class="mono prevl"
      >
        {{ t('rates.line', { pct: String(commissionPct) }) }}
      </div>
      <p
        v-if="years.length === 0"
        class="gmeta"
      >
        {{ t('rates.empty') }}
      </p>
      <div
        v-else
        class="portal-scroll"
      >
        <table class="list mini-t">
          <thead>
            <tr>
              <th>{{ t('rates.netRate') }}</th>
              <th
                v-for="year in years"
                :key="year.year"
              >
                {{ year.year }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ t('rates.suitePp') }}</td>
              <td
                v-for="year in years"
                :key="`s-${year.year}`"
                :data-year="year.year"
                data-field="suite_pp"
              >
                <AnkMoney :amount="year.suite_pp" />
              </td>
            </tr>
            <tr>
              <td>{{ t('rates.ownerPp') }}</td>
              <td
                v-for="year in years"
                :key="`o-${year.year}`"
              >
                <AnkMoney :amount="year.owner_pp" />
              </td>
            </tr>
            <tr>
              <td>{{ t('rates.charterWeek') }}</td>
              <td
                v-for="year in years"
                :key="`c-${year.year}`"
              >
                <AnkMoney :amount="year.charter_week" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>
