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
  </div>
</template>
