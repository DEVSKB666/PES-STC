
<template>
  <div class="space-y-4">
    <h2 class="text-xl font-bold">ผลงานที่ส่ง (ฉัน)</h2>

    <div class="card grid md:grid-cols-3 gap-3 items-center">
      <div>
        <label class="block text-xs text-gray-600 mb-1">รอบประเมิน</label>
        <select v-model.number="cycle_id" class="input w-full">
          <option :value="null" disabled>-- เลือกรอบ --</option>
          <option v-for="c in cycles" :key="c.id" :value="c.id">{{ c.id }} · {{ c.name }}</option>
        </select>
      </div>
      <div class="md:col-span-2">
        <div>ส่งแล้ว: <b>{{progress.submitted}}</b> / ทั้งหมด: <b>{{progress.total}}</b></div>
        <div class="w-full bg-gray-200 h-2 rounded mt-2">
          <div class="bg-indigo-600 h-2 rounded" :style="{width: (progress.submitted*100/Math.max(1,progress.total)) + '%'}"></div>
        </div>
      </div>
    </div>

    <div class="relative overflow-x-auto rounded-lg shadow-md">
      <table class="w-full text-sm text-left text-gray-700">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th class="px-6 py-3">ID</th>
            <th class="px-6 py-3">ตัวชี้วัด</th>
            <th class="px-6 py-3">คะแนน</th>
            <th class="px-6 py-3">หลักฐาน</th>
            <th class="px-6 py-3">วันที่ส่ง</th>
            <th class="px-6 py-3">สถานะ</th>
            <th class="px-6 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in list" :key="s.id" class="bg-white border-b hover:bg-gray-50 transition">
            <td class="px-6 py-4">{{ s.id }}</td>
            <td class="px-6 py-4">{{ s.indicator_title }}</td>
            <td class="px-6 py-4">{{ s.self_score ?? '-' }}</td>
            <td class="px-6 py-4">
              <template v-if="s.evidence_path">
                <a :href="fileUrl(s.evidence_path)" target="_blank" class="bg-blue-600 text-white px-2 py-1 rounded">
                  เปิดหลักฐาน
                </a>
              </template>
              <template v-else>-</template>
            </td>
            <td class="px-6 py-4">{{ new Date(s.created_at).toLocaleString() }}</td>
            <td class="px-6 py-4">
              <span :class="s.status === 'reviewed' ? 'text-green-600' : 'text-gray-600'">
                {{ s.status === 'reviewed' ? 'ประเมินแล้ว' : 'รอประเมิน' }}
              </span>
            </td>
            <td class="px-6 py-4">
              <button class="px-3 py-1 text-xs font-semibold text-white bg-red-600 rounded hover:bg-red-700" @click="remove(s)">ลบ</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '../../store/auth'
const auth = useAuthStore()

const cycles = ref([])
const cycle_id = ref(null)
const progress = ref({ total: 0, submitted: 0 })
const list = ref([])

const fileUrl = (p) => p?.startsWith('http') ? p : '/uploads/' + (p || '').replace(/^\+/, '')

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

const loadProgress = async () => {
  try {
    const q = cycle_id.value ? `?cycle_id=${cycle_id.value}` : ''
    const r = await fetch(`/api/evaluated/progress${q}`, { headers: auth.authHeader() })
    if (!r.ok) { await handleAuthFailure(r); return }
    const j = await r.json()
    progress.value = j.data || { total: 0, submitted: 0 }
  } catch (e) {
    console.error('loadProgress error', e)
  }
}

const loadList = async () => {
  try {
    const q = cycle_id.value ? `?cycle_id=${cycle_id.value}` : ''
    const r = await fetch(`/api/evaluated/submissions${q}`, { headers: auth.authHeader() })
    if (!r.ok) { await handleAuthFailure(r); return }
    const j = await r.json()
    list.value = j.data || []
  } catch (e) {
    console.error('loadList error', e)
  }
}

const remove = async (s) => {
  if (s.status === 'reviewed') {
    alert('รายการนี้ถูกประเมินแล้ว ไม่สามารถลบได้')
    return
  }
  if (!confirm(`ยืนยันลบผลงาน #${s.id}?`)) return
  try {
    const r = await fetch(`/api/evaluated/submissions/${s.id}`, { method: 'DELETE', headers: auth.authHeader() })
    if (!r.ok) {
      const txt = await r.text().catch(() => 'server error')
      alert('ลบไม่สำเร็จ: ' + txt)
      return
    }
    await loadProgress()
    await loadList()
  } catch (e) {
    console.error('remove error', e)
  }
}

onMounted(async () => {
  await loadCycles()
  await loadProgress()
  await loadList()
})

watch(cycle_id, async () => {
  await loadProgress()
  await loadList()
})
</script>
