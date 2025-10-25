<template>
  <div class="space-y-4">
    <div class="card p-4">
      <h2 class="text-xl font-bold">รายงานสรุปผล (ตามบุคคล)</h2>
      <div class="flex gap-2 items-center mt-2">
        <label class="text-sm text-gray-600">รอบประเมิน</label>
        <select v-model.number="cycleId" class="input max-w-xs" @change="load">
          <option v-for="c in cycles" :key="c.id" :value="c.id">
            {{ c.name || ('รอบ ' + c.id) }}
          </option>
        </select>
        <button class="btn" @click="load">โหลดข้อมูล</button>
      </div>
      <div v-if="msg" class="text-sm text-red-600 mt-2">{{msg}}</div>
    </div>

    <!-- กราฟแท่งแนวตั้ง (แบบเดิม) -->
    <div class="card p-4" v-if="rows.length">
      <div class="text-xs text-gray-500 mb-2">
        คอลัมน์ = คะแนนรวมถ่วงน้ำหนัก (normalized) ต่อบุคคล
      </div>
      <div class="overflow-x-auto">
        <div class="flex items-end gap-4 px-2 py-4" style="min-height: 220px">
          <div v-for="r in rows" :key="r.user_id" class="flex flex-col items-center w-24" :title="`${r.name} — total: ${fmt(r.total_weighted)} / avg: ${fmt(r.avg_score)}`">
            <div class="text-xs text-gray-700 mb-2 tabular-nums">{{ fmt(r.total_weighted) }}</div>
            <div class="w-full bg-gray-100 rounded-t-md overflow-hidden flex items-end" style="height: 160px">
              <div class="w-full bg-gradient-to-t from-indigo-600 to-blue-400 transition-all" :style="{ height: columnHeight(r.total_weighted) }"></div>
            </div>
            <div class="mt-2 w-full text-xs text-center text-gray-700 truncate" style="line-height: 1.1rem">{{ r.name }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ตารางค่า (พร้อม PDF) -->
    <div class="card p-4 overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-xs text-gray-600">
            <th class="py-2">ผู้รับการประเมิน</th>
            <th class="py-2">Avg</th>
            <th class="py-2">Min</th>
            <th class="py-2">Max</th>
            <th class="py-2">Total</th>
            <th class="py-2">PDF</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.user_id" class="border-t">
            <td class="py-2">{{ r.name }}</td>
            <td class="py-2">{{ fmt(r.avg_score) }}</td>
            <td class="py-2">{{ fmt(r.min_score) }}</td>
            <td class="py-2">{{ fmt(r.max_score) }}</td>
            <td class="py-2">{{ fmt(r.total_weighted) }}</td>
            <td class="py-2">
              <button class="link" :disabled="exportingUserId===r.user_id" @click="doExport(r.user_id)">
                {{ exportingUserId===r.user_id ? 'กำลังดาวน์โหลด...' : 'ดาวน์โหลด' }}
              </button>
            </td>
          </tr>
          <tr v-if="!rows.length">
            <td class="p-2 text-gray-600" colspan="6">— ไม่มีข้อมูล —</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../../store/auth'
const auth = useAuthStore()
const cycleId = ref(0)
const cycles = ref([])
const rows = ref([])
const msg = ref('')
const exportingUserId = ref(null)

const fmt = (n) => (n == null ? '-' : Number(n).toFixed(2))

const loadPeriods = async () => {
  try {
    const r = await fetch('/api/hr/periods', { headers: auth.authHeader() })
    const j = await r.json().catch(()=>null)
    if(!r.ok) return
    cycles.value = j.data || []
    if (!cycleId.value && cycles.value.length) cycleId.value = cycles.value[0].id
  } catch (_) {}
}

const load = async () => {
  msg.value=''
  rows.value=[]
  if(!cycleId.value) return
  const r = await fetch('/api/hr/stats/overview?cycle_id=' + cycleId.value, { headers: auth.authHeader() })
  const j = await r.json().catch(()=>null)
  if(!r.ok) { msg.value = j?.message || 'โหลดข้อมูลไม่สำเร็จ'; return }
  rows.value = j.data || []
}

const maxValue = computed(() => {
  let max = 0
  for (const r of rows.value) {
    const v = Number(r.total_weighted ?? r.avg_score ?? 0) || 0
    if (v > max) max = v
  }
  return max
})

const columnHeight = (val) => {
  const n = Number(val ?? 0) || 0
  const max = maxValue.value || 0
  if (max === 0) return '6%'
  const pct = Math.round((n / max) * 100)
  return `${Math.max(6, pct)}%`
}

const exportUrl = (userId) => `/api/reports/export/${cycleId.value}/${userId}`

const doExport = async (userId) => {
  if (!cycleId.value || !userId) return
  exportingUserId.value = userId
  try {
    const r = await fetch(`/api/reports/export/${cycleId.value}/${userId}`, { headers: auth.authHeader() })
    const ok = r.ok
    const handled = ok ? false : await (async()=>{ try{ const j=await r.clone().json(); if(r.status===401){ alert('โทเค็นหมดอายุ โปรดเข้าสู่ระบบใหม่'); auth.logout(); location.href='/login'; return true } }catch{} return false })()
    if (!ok && !handled) { alert('ดาวน์โหลดไม่สำเร็จ'); return }
    const blob = await r.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report_${userId}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  } catch (e) {
    console.error('export error', e)
    alert('เกิดข้อผิดพลาดระหว่างดาวน์โหลด')
  } finally {
    exportingUserId.value = null
  }
}

onMounted(async ()=>{ await loadPeriods(); await load() })
</script>
