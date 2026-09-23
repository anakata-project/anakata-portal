<script setup lang="ts">
import type { operations, PortalRequest } from '../../types/api'
import { portalPageMessages } from '../../utils/authError'
import { listPath } from '../../utils/listPath'
import { bookingStatusKey, bookingStatusTone } from '../../utils/portalStatus'

type RequestsBody = operations['portalRequest.index']['responses'][200]['content']['application/json']

const { t } = useI18n()
const { request } = useApi()

const page = ref(1)
const pending = ref(true)
const errors = ref<Array<string>>([])
const rows = ref<Array<PortalRequest>>([])
const meta = ref<RequestsBody['meta'] | null>(null)
const selected = ref<PortalRequest | null>(null)

async function load(): Promise<void> {
  pending.value = true
  errors.value = []

  try {
    const body = await request(listPath('/api/portal/requests', page.value)) as RequestsBody

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

function go(next: number): void {
  page.value = next
  void load()
}

function openRequest(row: PortalRequest): void {
  selected.value = row
}

function onDrawer(open: boolean): void {
  if (!open) {
    selected.value = null
  }
}

void load()
</script>

<template>
  <div>
    <p class="portal-toolbar">
      <NuxtLink
        class="mini"
        to="/requests/new"
      >
        {{ t('requests.newLink') }}
      </NuxtLink>
    </p>
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
        <table class="list mini-t">
          <thead>
            <tr>
              <th>{{ t('requests.colClient') }}</th>
              <th>{{ t('requests.colReference') }}</th>
              <th>{{ t('requests.colStatus') }}</th>
              <th>{{ t('requests.colNext') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-if="rows.length === 0"
              class="dr-empty"
            >
              <td colspan="4">
                {{ t('requests.empty') }}
              </td>
            </tr>
            <tr
              v-for="(row, index) in rows"
              :key="`${row.reference ?? 'request'}-${String(index)}`"
              class="portal-row"
              role="button"
              tabindex="0"
              :aria-label="row.reference ?? t('nav.requests')"
              :data-request="row.reference ?? ''"
              @click="openRequest(row)"
              @keydown.enter.prevent="openRequest(row)"
            >
              <td>{{ row.lead_guest }}</td>
              <td class="bk-ref">
                {{ row.reference ?? '—' }}
              </td>
              <td>
                <AnkPill :tone="bookingStatusTone(row.status)">
                  {{ t(bookingStatusKey(row.status)) }}
                </AnkPill>
              </td>
              <td data-field="next">
                {{ row.next }}
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
          {{ t('lists.previous') }}
        </button>
        <span>{{ t('lists.pager', { page: String(meta.current_page), total: String(meta.total) }) }}</span>
        <button
          type="button"
          :disabled="meta.current_page >= meta.last_page"
          @click="go(meta.current_page + 1)"
        >
          {{ t('lists.next') }}
        </button>
      </div>
    </template>

    <USlideover
      :open="selected !== null"
      :title="selected?.reference ?? t('nav.requests')"
      @update:open="onDrawer"
    >
      <template #body>
        <div
          v-if="selected"
          data-request-drawer
        >
          <div class="kv">
            <span>{{ t('requests.colReference') }}</span>
            <span class="bk-ref">{{ selected.reference ?? '—' }}</span>
          </div>
          <div class="kv">
            <span>{{ t('requests.colStatus') }}</span>
            <span>
              <AnkPill :tone="bookingStatusTone(selected.status)">
                {{ t(bookingStatusKey(selected.status)) }}
              </AnkPill>
            </span>
          </div>
          <div class="kv">
            <span>{{ t('requests.colClient') }}</span>
            <span>{{ selected.lead_guest }}</span>
          </div>
          <div class="kv">
            <span>{{ t('requests.colNext') }}</span>
            <span>{{ selected.next }}</span>
          </div>
          <PortalPayButton
            :id="selected.id"
            :status="selected.status"
            :payment-state="selected.payment_state"
            :open-payment-kinds="selected.open_payment_kinds"
          />
        </div>
      </template>
    </USlideover>
  </div>
</template>
