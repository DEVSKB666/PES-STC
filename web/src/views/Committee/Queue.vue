<template>
  <div class="space-y-4">
    <h2 class="text-xl font-bold">คิวงานของกรรมการ</h2>
    <div class="relative overflow-x-auto rounded-lg shadow-md">
      <table class="w-full text-sm text-left text-gray-700">
        <thead class="text-xs text-gray-700 unpercase bg-gray-50 dark:bg-gray-700 dark:text-white">
          <tr>
            <th scope="col" class="px-6 py-3">Submission</th>
            <th scope="col" class="px-6 py-3">ผู้รับการประเมิน</th>
            <th scope="col" class="px-6 py-3">ตัวชี้วัด</th>
            <th scope="col" class="px-6 py-3">Self</th>
            <th scope="col" class="px-6 py-3">หลักฐาน</th>
            <th scope="col" class="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.submission_id" class="border-t">
            <td class="px-6 py-3">#{{ r.submission_id }}</td>
            <td class="px-6 py-3">{{ r.evaluated_name }}</td>
            <td class="px-6 py-3">{{ r.indicator_title }}</td>
            <td class="px-6 py-3">{{ r.self_score }}</td>
            <td class="px-6 py-3">
              <a
                v-if="r.evidence_path"
                :href="fileUrl(r.evidence_path)"
                class="link"
                target="_blank"
                >ไฟล์</a
              >
            </td>
            <td class="px-6 py-3">
              <router-link
                class="link"
                :to="{
                  path: '/committee/review',
                  query: { id: r.submission_id },
                }"
                >รีวิว</router-link
              >
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../store/auth';
const auth = useAuthStore();
const rows = ref([]);
const fileUrl = (p) =>
  p?.startsWith('http') ? p : '/uploads/' + (p || '').replace(/^\+/, '');
const load = async () => {
  const r = await fetch('/api/committee/queue', { headers: auth.authHeader() });
  const j = await r.json();
  rows.value = j.data || [];
};
onMounted(load);
</script>
