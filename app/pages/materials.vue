<script setup lang="ts">
import type { operations, PortalMaterial } from '../types/api'
import { portalPageMessages } from '../utils/authError'
import { downloadPortalFile } from '../utils/downloadFile'
import { formatSize } from '../utils/formatSize'

type MaterialsBody = operations['portalSalesMaterial.index']['responses'][200]['content']['application/json']

const { t } = useI18n()
const { request } = useApi()
const { format } = useDates()
const config = useRuntimeConfig()

const pending = ref(true)
const errors = ref<Array<string>>([])
const downloadError = ref('')
const downloadingId = ref<number | null>(null)
const materials = ref<Array<PortalMaterial>>([])
const note = ref('')

async function load(): Promise<void> {
  pending.value = true
  errors.value = []

  try {
    const body = await request('/api/portal/sales-materials') as MaterialsBody

    materials.value = body.data
    note.value = body.data.length === 0 ? body.meta.note : ''
  } catch (caught: unknown) {
    materials.value = []
    note.value = ''
    errors.value = portalPageMessages(caught)
  } finally {
    pending.value = false
  }
}

async function download(id: number): Promise<void> {
  downloadError.value = ''
  downloadingId.value = id

  try {
    await downloadPortalFile(
      `/api/portal/sales-materials/${String(id)}/file`,
      String(config.public.apiBase)
    )
  } catch (caught: unknown) {
    const lines = portalPageMessages(caught)
    downloadError.value = lines[0] ?? ''
  } finally {
    downloadingId.value = null
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
      <p
        v-if="materials.length === 0 && note"
        class="gmeta"
      >
        {{ note }}
      </p>
      <div
        v-else
        class="portal-scroll"
      >
        <table class="list">
          <thead>
            <tr>
              <th>{{ t('materials.title') }}</th>
              <th>{{ t('materials.kind') }}</th>
              <th>{{ t('materials.size') }}</th>
              <th>{{ t('materials.version') }}</th>
              <th>{{ t('materials.updated') }}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in materials"
              :key="row.id"
            >
              <td>{{ row.title }}</td>
              <td>{{ row.kind }}</td>
              <td>{{ formatSize(row.size) }}</td>
              <td>{{ row.version }}</td>
              <td>{{ format(row.updated, 'dateTime') }}</td>
              <td>
                <button
                  type="button"
                  class="mini"
                  :disabled="downloadingId === row.id"
                  @click="download(row.id)"
                >
                  {{ t('materials.download') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        v-if="downloadError"
        class="warnbox"
      >
        <p>{{ downloadError }}</p>
      </div>
    </template>
  </div>
</template>
