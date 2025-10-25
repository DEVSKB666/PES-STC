<template>
  <div class="space-y-4">
    <h2 class="text-xl font-bold">ตัวชี้วัด (HR)</h2>
    <div class="card grid md:grid-cols-3 gap-3">
      <select v-model="topic_id" class="input">
        <option :value="null" disabled>
          -- เลือกหัวข้อ (ไม่บังคับ) --
        </option>
        <option v-for="topic in topics" :key="topic.id" :value="topic.id">
          {{ topic.name }}
        </option>
      </select>
      <input v-model="title" class="input" placeholder="ชื่อตัวชี้วัด" />
      <input v-model="description" class="input" placeholder="รายละเอียด" />
      <input
        v-model.number="weight"
        class="input"
        type="number"
        placeholder="น้ำหนัก (%)"
      />
      <input
        v-model.number="score_min"
        class="input"
        type="number"
        placeholder="min score"
      />
      <input
        v-model.number="score_max"
        class="input"
        type="number"
        placeholder="max score"
      />
      <select v-model="evidence_type" class="input">
        <option value="pdf_or_url">pdf_or_url</option>
        <option value="pdf">pdf</option>
        <option value="url">url</option>
        <option value="none">none</option>
      </select>
      <button class="btn" @click="add">เพิ่ม</button>
    </div>
    <div class="elative overflow-x-auto rounded-lg shadow-md">
      <table class="w-full text-sm text-left text-gray-700">
        <thead
          class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-white"
        >
          <tr>
            <th scope="col" class="px-6 py-3">ID</th>
            <th scope="col" class="px-6 py-3">หัวข้อ</th>
            <th scope="col" class="px-6 py-3">ชื่อ</th>
            <th scope="col" class="px-6 py-3">น้ำหนัก</th>
            <th scope="col" class="px-6 py-3">ช่วง</th>
            <th scope="col" class="px-6 py-3">หลักฐาน</th>
            <th scope="col" class="px-6 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="i in list"
            :key="i.id"
            class="bg-white border-b hover:bg-gray-50 transition"
          >
            <td class="px-6 py-4">{{ i.id }}</td>
            <td class="px-6 py-4">{{ i.topic_name || '-' }}</td>
            <td class="px-6 py-4">{{ i.title }}</td>
            <td class="px-6 py-4">{{ i.weight }}%</td>
            <td class="px-6 py-4">{{ i.score_min }}-{{ i.score_max }}</td>
            <td class="px-6 py-4">{{ i.evidence_type }}</td>
            <td class="px-6 py-4">
              <a
                href="#"
                class="inline-block px-3 py-1 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                @click.prevent="remove(i)"
                >ลบ</a
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
const list = ref([]);
const topics = ref([]);
const topic_id = ref(null);
const title = ref('');
const description = ref('');
const weight = ref(10);
const score_min = ref(1);
const score_max = ref(4);
const evidence_type = ref('pdf_or_url');
const load = async () => {
  const r = await fetch('/api/common/indicators', {
    headers: auth.authHeader(),
  });
  const j = await r.json();
  list.value = j.data || [];
};

const loadTopics = async () => {
  try {
    const r = await fetch('/api/common/topics', {
      headers: auth.authHeader(),
    });
    const j = await r.json();
    topics.value = j.data || [];
  } catch (e) {
    console.error('Failed to load topics:', e);
  }
};
const add = async () => {
  // ใช้ .value เพื่อเอาค่าออกจาก ref (ไม่ส่ง reactive object เข้า JSON)
  const payload = {
    topic_id: topic_id.value || null,
    title: title.value,
    description: description.value,
    weight: Number(weight.value || 0),
    score_min: Number(score_min.value || 0),
    score_max: Number(score_max.value || 0),
    evidence_type: evidence_type.value,
  };

  try {
    const r = await fetch('/api/hr/indicators', {
      method: 'POST',
      headers: { ...auth.authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      console.error('failed to add indicator', await r.text());
      return;
    }

    // reset form
    title.value = '';
    description.value = '';
    topic_id.value = null;
    weight.value = 10;
    score_min.value = 1;
    score_max.value = 4;
    evidence_type.value = 'pdf_or_url';

    await load();
  } catch (e) {
    console.error(e);
  }
};

onMounted(() => {
  load();
  loadTopics();
});
</script>
