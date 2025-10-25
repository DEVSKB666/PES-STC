<template>
  <div class="space-y-4">
    <h2 class="text-xl font-bold">รอบการประเมิน (HR)</h2>

    <!-- form -->
    <div class="card p-4">
      <form @submit.prevent="add" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- left: basic info -->
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >ชื่อรอบ</label
            >
            <input
              v-model="name"
              type="text"
              placeholder="เช่น ประเมินปี 2025"
              class="input w-full px-3 py-2 rounded-md border-gray-200 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm text-gray-600 mb-1"
                >วันที่เริ่ม</label
              >
              <input
                v-model="start_date"
                type="date"
                class="input w-full px-3 py-2 rounded-md border-gray-200"
              />
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1"
                >วันที่สิ้นสุด</label
              >
              <input
                v-model="end_date"
                type="date"
                class="input w-full px-3 py-2 rounded-md border-gray-200"
              />
            </div>
          </div>
        </div>

        <!-- right: periods & actions -->
        <div class="space-y-3">
          <div class="bg-gray-50 p-3 rounded-md border border-gray-100">
            <div class="text-sm font-medium text-gray-700 mb-2">ช่วงส่งงาน</div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                v-model="submit_start"
                type="datetime-local"
                class="input w-full px-3 py-2 rounded-md border-gray-200"
              />
              <input
                v-model="submit_end"
                type="datetime-local"
                class="input w-full px-3 py-2 rounded-md border-gray-200"
              />
            </div>
            <p class="text-xs text-gray-500 mt-2">
              ตั้งเวลาเปิด-ปิดการส่งคะแนน
            </p>
          </div>

          <div class="bg-gray-50 p-3 rounded-md border border-gray-100">
            <div class="text-sm font-medium text-gray-700 mb-2">ช่วงรีวิว</div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                v-model="review_start"
                type="datetime-local"
                class="input w-full px-3 py-2 rounded-md border-gray-200"
              />
              <input
                v-model="review_end"
                type="datetime-local"
                class="input w-full px-3 py-2 rounded-md border-gray-200"
              />
            </div>
            <p class="text-xs text-gray-500 mt-2">
              เวลาสำหรับกรรมการรีวิว/ให้คะแนน
            </p>
          </div>

          <div class="flex items-center justify-between gap-3">
            <label class="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                v-model="is_active"
                class="w-4 h-4 rounded border-gray-300"
              />
              ใช้งาน
            </label>

            <div class="ml-auto">
              <button
                type="submit"
                class="btn bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                เพิ่มรอบ
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>

    <!-- table -->
    <div class="card p-0">
      <div class="overflow-x-auto rounded-lg">
        <table class="min-w-full text-sm divide-y divide-gray-200">
          <thead class="bg-gray-50 dark:bg-gray-700 text-white">
            <tr>
              <th class="px-4 py-2 text-left font-medium ">ID</th>
              <th class="px-4 py-2 text-left font-medium">
                ชื่อ
              </th>
              <th class="px-4 py-2 text-left font-medium">
                ช่วงส่ง
              </th>
              <th class="px-4 py-2 text-left font-medium">
                ช่วงรีวิว
              </th>
              <th class="px-4 py-2 text-left font-medium">
                สถานะ
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr v-for="c in list" :key="c.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 align-top w-16 text-gray-700">{{ c.id }}</td>
              <td class="px-4 py-3 align-top text-gray-800">{{ c.name }}</td>
              <td class="px-4 py-3 align-top text-gray-700">
                <div class="text-xs text-gray-500">
                  {{ formatDate(c.submit_start) }}
                </div>
                <div class="text-xs text-gray-500">
                  → {{ formatDate(c.submit_end) }}
                </div>
              </td>
              <td class="px-4 py-3 align-top text-gray-700">
                <div class="text-xs text-gray-500">
                  {{ formatDate(c.review_start) }}
                </div>
                <div class="text-xs text-gray-500">
                  → {{ formatDate(c.review_end) }}
                </div>
              </td>
              <td class="px-4 py-3 align-top">
                <span
                  :class="[
                    'inline-block px-2 py-1 rounded-full text-xs font-semibold',
                    c.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600',
                  ]"
                >
                  {{ c.is_active ? 'เปิดใช้งาน' : 'ปิด' }}
                </span>
              </td>
            </tr>

            <tr v-if="list.length === 0">
              <td colspan="5" class="px-4 py-6 text-center text-gray-500">
                ไม่มีข้อมูลรอบ
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../store/auth';

const auth = useAuthStore();
const list = ref([]);

const name = ref('');
const start_date = ref('');
const end_date = ref('');
const submit_start = ref('');
const submit_end = ref('');
const review_start = ref('');
const review_end = ref('');
const is_active = ref(true);

const load = async () => {
  try {
    const r = await fetch('/api/common/cycles', { headers: auth.authHeader() });
    if (!r.ok) return;
    const j = await r.json();
    list.value = j.data || [];
  } catch (e) {
    console.error(e);
  }
};

const add = async () => {
  const payload = {
    name: name.value,
    start_date: start_date.value,
    end_date: end_date.value,
    submit_start: submit_start.value,
    submit_end: submit_end.value,
    review_start: review_start.value,
    review_end: review_end.value,
    is_active: Boolean(is_active.value),
  };

  try {
    const r = await fetch('/api/hr/cycles', {
      method: 'POST',
      headers: { ...auth.authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      console.error('failed to add cycle', await r.text());
      return;
    }

    // reset form
    name.value = '';
    start_date.value = '';
    end_date.value = '';
    submit_start.value = '';
    submit_end.value = '';
    review_start.value = '';
    review_end.value = '';
    is_active.value = true;

    await load();
  } catch (e) {
    console.error(e);
  }
};

const formatDate = (d) => {
  if (!d) return '-';
  try {
    const dt = new Date(d);
    return dt.toLocaleString();
  } catch {
    return d;
  }
};

onMounted(load);
</script>
