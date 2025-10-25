<template>
  <div class="space-y-4">
    <h2 class="text-xl font-bold">การมอบหมาย (HR)</h2>
    <div class="card grid md:grid-cols-4 gap-3">
      <select v-model.number="cycle_id" class="input">
        <option :value="null" disabled>-- เลือกรอบ --</option>
        <option v-for="c in cycles" :key="c.id" :value="c.id">
          {{ c.id }} · {{ c.name }}
        </option>
      </select>
      <select v-model.number="evaluated_id" class="input">
        <option :value="null" disabled>-- เลือกผู้รับการประเมิน --</option>
        <option v-for="u in evaluatees" :key="u.id" :value="u.id">
          {{ u.name }} (#{{ u.id }})
        </option>
      </select>
      <select v-model.number="committee_id" class="input">
        <option :value="null" disabled>-- เลือกกรรมการ --</option>
        <option v-for="u in committees" :key="u.id" :value="u.id">
          {{ u.name }} (#{{ u.id }})
        </option>
      </select>
      <button class="btn" @click="add">มอบหมาย</button>
    </div>
    <div class="relative overflow-x-auto rounded-lg shadow-md">
      <table class="w-full text-sm text-left text-gray-700">
        <thead
          class="text-xs text-gray-700 unpercase bg-gray-50 dark:bg-gray-700 dark:text-white"
        >
          <tr>
            <th scope="col" class="px-6 py-3">ID</th>
            <th scope="col" class="px-6 py-3">รอบ</th>
            <th scope="col" class="px-6 py-3">ผู้รับการประเมิน</th>
            <th scope="col" class="px-6 py-3">กรรมการ</th>
            <th scope="col" class="px-6 py-3">สถานะ</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="a in list"
            :key="a.id"
            class="bg-white border-b holverLbg-gray-50 transition"
          >
            <td class="px-6 py-4">{{ a.id }}</td>
            <td class="px-6 py-4">{{ a.cycle_id }}</td>
            <td class="px-6 py-4">{{ a.evaluated_name }}</td>
            <td class="px-6 py-4">{{ a.committee_name }}</td>
            <td class="px-6 py-4"><span :class="{'text-white bg-green-500 px-2 py-1 rounded-full': a.review_count > 0, 'text-white bg-red-500 px-2 py-1 rounded-full': a.review_count === 0}">
              {{ (a.review_count>0) ? 'ประเมินแล้ว' : 'ยังไม่ได้ประเมิน' }}
            </span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue';
import { useAuthStore } from '../../store/auth';
const auth = useAuthStore();

const list = ref([]);
const cycles = ref([]);
const evaluatees = ref([]);
const committees = ref([]);

const cycle_id = ref(null);
const evaluated_id = ref(null);
const committee_id = ref(null);

const loadCycles = async () => {
  try {
    const r = await fetch('/api/common/cycles', { headers: auth.authHeader() });
    const j = await r.json();
    cycles.value = j.data || [];
    const active = cycles.value.find((c) => c.is_active);
    cycle_id.value = (active?.id ?? cycles.value[0]?.id) || null;
  } catch (e) {
    console.error('loadCycles error', e);
  }
};

const loadUsers = async () => {
  try {
    const r = await fetch('/api/hr/users', { headers: auth.authHeader() });
    const j = await r.json();
    const all = j.data || [];
    evaluatees.value = all.filter((u) => u.role === 'ผู้รับการประเมิน');
    committees.value = all.filter((u) => u.role === 'คณะกรรมการประเมิน');
  } catch (e) {
    console.error('loadUsers error', e);
  }
};

const loadAssignments = async () => {
  try {
    const q = cycle_id.value ? `?cycle_id=${cycle_id.value}` : '';
    const r = await fetch(`/api/hr/assignments${q}`, {
      headers: auth.authHeader(),
    });
    const j = await r.json();
    list.value = j.data || [];
  } catch (e) {
    console.error('loadAssignments error', e);
  }
};

const add = async () => {
  if (!cycle_id.value || !evaluated_id.value || !committee_id.value) {
    alert('กรุณาเลือกรอบ ผู้รับการประเมิน และกรรมการให้ครบ');
    return;
  }
  const payload = {
    cycle_id: Number(cycle_id.value),
    evaluated_id: Number(evaluated_id.value),
    committee_id: Number(committee_id.value),
  };

  try {
    const r = await fetch('/api/hr/assignments', {
      method: 'POST',
      headers: { ...auth.authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      const text = await r.text().catch(() => 'server error');
      alert('ไม่สามารถมอบหมายได้: ' + text);
      return;
    }
    await loadAssignments();
    evaluated_id.value = null;
    committee_id.value = null;
  } catch (e) {
    console.error(e);
    alert('เกิดข้อผิดพลาดในการส่งข้อมูล');
  }
};

onMounted(async () => {
  await loadCycles();
  await loadUsers();
  await loadAssignments();
});

watch(cycle_id, () => {
  loadAssignments();
});
</script>
