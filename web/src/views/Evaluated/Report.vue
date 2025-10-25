<template>
  <div class="space-y-4">
    <h2 class="text-xl font-bold">รายงานของฉัน (ผู้รับการประเมิน)</h2>

    <!-- Controls -->
    <div class="card grid md:grid-cols-3 gap-3 items-end">
      <div>
        <label class="block text-xs text-gray-600 mb-1">รอบประเมิน</label>
        <select v-model.number="cycle_id" class="input w-full">
          <option :value="null" disabled>-- เลือกรอบ --</option>
          <option v-for="c in cycles" :key="c.id" :value="c.id">{{ c.id }} · {{ c.name }}</option>
        </select>
      </div>
      <div class="md:col-span-2 flex items-center gap-3">
        <button
          v-if="cycle_id && me?.id"
          class="btn bg-indigo-600 text-white"
          :disabled="isExporting"
          @click="doExport"
        >{{ isExporting ? 'กำลังดาวน์โหลด...' : 'Export PDF' }}</button>
        <span v-if="exportMsg" class="text-sm text-gray-600">{{ exportMsg }}</span>
      </div>
    </div>

    <!-- Per-topic progress -->
    <div class="card">
      <h3 class="text-lg font-semibold mb-3">ความคืบหน้าแยกตามหัวข้อ</h3>
      <div v-if="topicProgress.length" class="space-y-2">
        <div v-for="t in topicProgress" :key="t.topic" class="space-y-1">
          <div class="flex items-center justify-between">
            <div class="font-medium">{{ t.topic }}</div>
            <div class="text-sm text-gray-600">ส่งแล้ว {{ t.submitted }} / ทั้งหมด {{ t.total }}</div>
          </div>
          <div class="w-full bg-gray-200 h-2 rounded">
            <div class="bg-green-600 h-2 rounded" :style="{width: (t.submitted*100/Math.max(1,t.total)) + '%'}"></div>
          </div>
        </div>
      </div>
      <div v-else class="text-sm text-gray-500">— ไม่มีข้อมูลหัวข้อ —</div>
    </div>

    <!-- Committee comments -->
    <div class="card">
      <h3 class="text-lg font-semibold mb-3">ความเห็นของกรรมการ</h3>
      <div class="overflow-x-auto rounded-lg">
        <table class="min-w-full text-sm divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left">ตัวชี้วัด</th>
              <th class="px-4 py-2 text-left">คะแนน</th>
              <th class="px-4 py-2 text-left">ความเห็น</th>
              <th class="px-4 py-2 text-left">วันที่</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in comments" :key="c.submission_id + '_' + c.created_at" class="bg-white">
              <td class="px-4 py-2">{{ c.indicator_title }}</td>
              <td class="px-4 py-2">{{ fmt(c.score) }}</td>
              <td class="px-4 py-2">{{ c.comment || '-' }}</td>
              <td class="px-4 py-2">{{ dt(c.created_at) }}</td>
            </tr>
            <tr v-if="!comments.length">
              <td class="px-4 py-2 text-gray-600" colspan="4">— ยังไม่มีความเห็น —</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../../store/auth'
const auth = useAuthStore()

// state
const cycles = ref([])
const cycle_id = ref(null)
const me = ref(null)
const comments = ref([])
const topicProgress = ref([])
const exportMsg = ref('')
const isExporting = ref(false)

const fmt = (n) => (n == null ? '-' : Number(n).toFixed(2))
const dt = (s) => new Date(s).toLocaleString()

// export URL for current user (not used directly anymore)
const exportUrl = computed(() => `/api/reports/export/${cycle_id.value}/${me.value?.id}`)

// helpers
const handleAuthFailure = async (res) => {
  let body = null
  try { body = await res.json() } catch {}
  const msg = body?.message || body?.error || `${res.status} ${res.statusText}`
  if (res.status === 401 || /invalid token/i.test(String(msg))) {
    alert('โทเค็นไม่ถูกต้องหรือหมดอายุ — โปรดเข้าสู่ระบบใหม่')
    auth.logout()
    location.href = '/login'
    return true
  }
  return false
}

// เรียก export ด้วย Authorization header แล้วดาวน์โหลดไฟล์ PDF
const doExport = async () => {
  if (!cycle_id.value || !me.value?.id) return
  exportMsg.value = ''
  isExporting.value = true
  try {
    const r = await fetch(`/api/reports/export/${cycle_id.value}/${me.value.id}`, { headers: auth.authHeader() })
    if (!r.ok) { await handleAuthFailure(r); exportMsg.value = 'ดาวน์โหลดไม่สำเร็จ'; return }
    const blob = await r.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report_${me.value?.name || 'me'}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
    exportMsg.value = 'ดาวน์โหลดสำเร็จ'
  } catch (e) {
    console.error('export error', e)
    exportMsg.value = 'เกิดข้อผิดพลาดระหว่างดาวน์โหลด'
  } finally {
    isExporting.value = false
    setTimeout(() => { exportMsg.value = '' }, 2000)
  }
}

const loadMe = async () => {
  try {
    const r = await fetch('/api/common/me', { headers: auth.authHeader() })
    if (!r.ok) { await handleAuthFailure(r); return }
    const j = await r.json(); me.value = j.data || null
  } catch(e) { console.error('loadMe error', e) }
}

const loadCycles = async () => {
  try {
    const r = await fetch('/api/common/cycles', { headers: auth.authHeader() })
    if (!r.ok) { await handleAuthFailure(r); return }
    const j = await r.json()
    cycles.value = j.data || []
    const active = cycles.value.find(c => c.is_active)
    cycle_id.value = (active?.id ?? cycles.value[0]?.id) || null
  } catch (e) {
    console.error('loadCycles error', e)
  }
}

const loadComments = async () => {
  try {
    const q = cycle_id.value ? `?cycle_id=${cycle_id.value}` : ''
    const r = await fetch(`/api/evaluated/comments${q}`, { headers: auth.authHeader() })
    if (!r.ok) { await handleAuthFailure(r); return }
    const j = await r.json()
    comments.value = j.data || []
  } catch (e) {
    console.error('loadComments error', e)
  }
}

// progress per topic: use submissions+indicators
const loadTopicProgress = async () => {
  try {
    const headers = auth.authHeader()
    const [rSubs, rInd] = await Promise.all([
      fetch(`/api/evaluated/submissions${cycle_id.value ? `?cycle_id=${cycle_id.value}` : ''}`, { headers }),
      fetch('/api/common/indicators', { headers })
    ])
    if (!rSubs.ok) { await handleAuthFailure(rSubs); return }
    if (!rInd.ok) { await handleAuthFailure(rInd); return }
    const subs = await rSubs.json()
    const inds = await rInd.json()
    const subsData = subs.data || []
    const indData = inds.data || []

    // compute totals per topic
    const totals = indData.reduce((acc, it) => {
      const topic = it.topic_name || 'Uncategorized'
      acc[topic] = (acc[topic] || 0) + 1
      return acc
    }, {})

    const submittedByTopic = subsData.reduce((acc, s) => {
      const topic = s.topic_name || 'Uncategorized'
      acc[topic] = (acc[topic] || 0) + 1
      return acc
    }, {})

    const merged = Object.keys({ ...totals, ...submittedByTopic }).map(topic => ({
      topic,
      total: totals[topic] || 0,
      submitted: submittedByTopic[topic] || 0
    }))

    topicProgress.value = merged.sort((a,b) => a.topic.localeCompare(b.topic))
  } catch (e) {
    console.error('loadTopicProgress error', e)
  }
}

onMounted(async () => {
  await loadMe()
  await loadCycles()
  await loadComments()
  await loadTopicProgress()
  exportMsg.value = ''
})

watch(cycle_id, async () => {
  await loadComments()
  await loadTopicProgress()
})
</script>