<template>
  <div class="space-y-4">
    <h2 class="text-xl font-bold">หัวข้อการประเมิน (HR)</h2>
    <div class="card grid md:grid-cols-3 gap-3">
      <input v-model="name" class="input" placeholder="ชื่อหัวข้อ" />
      <input v-model="description" class="input" placeholder="รายละเอียด" />
      <button class="btn" @click="add">เพิ่ม</button>
    </div>
    <div class="relative overflow-x-auto rounded-lg shadow-md">
      <table class="w-full text-sm text-left text-gray-700">
        <thead
          class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-white"
        >
          <tr>
            <th scope="col" class="px-6 py-3">ID</th>
            <th scope="col" class="px-6 py-3">ชื่อ</th>
            <th scope="col" class="px-6 py-3">รายละเอียด</th>
            <th scope="col" class="px-6 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="t in list"
            :key="t.id"
            class="bg-white border-b hover:bg-gray-50 transition"
          >
            <td class="px-6 py-4">{{ t.id }}</td>
            <td class="px-6 py-4">{{ t.name }}</td>
            <td class="px-6 py-4">{{ t.description }}</td>
            <td class="px-6 py-4">
              <a
                href="#"
                class="inline-block px-3 py-1 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                @click.prevent="remove(t)"
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
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const list = ref([]);
const name = ref('');
const description = ref('');

const handleAuthFailure = async (res) => {
  // try parse body for message
  let body = null;
  try {
    body = await res.json();
  } catch {
    /* ignore */
  }
  const msg = body?.message || body?.error || `${res.status} ${res.statusText}`;
  if (res.status === 401 || /invalid token/i.test(String(msg))) {
    alert('โทเค็นไม่ถูกต้องหรือหมดอายุ — โปรดเข้าสู่ระบบใหม่');
    auth.logout();
    router.push('/login');
    return true;
  }
  return false;
};

const load = async () => {
  try {
    const r = await fetch('/api/common/topics', { headers: auth.authHeader() });
    if (!r.ok) {
      if (await handleAuthFailure(r)) return;
      console.error('load topics failed', await r.text().catch(() => null));
      return;
    }
    const j = await r.json();
    list.value = j.data || [];
  } catch (e) {
    console.error(e);
  }
};

const add = async () => {
  if (!name.value || !name.value.trim()) {
    alert('กรุณากรอกชื่อหัวข้อ');
    return;
  }

  const payload = { name: name.value, description: description.value || '' };

  try {
    const r = await fetch('/api/hr/topics', {
      method: 'POST',
      headers: { ...auth.authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      if (await handleAuthFailure(r)) return;
      const text = await r.text().catch(() => null);
      console.error('failed to add topic', text);
      alert('เพิ่มหัวข้อไม่สำเร็จ: ' + (text || r.status));
      return;
    }

    name.value = '';
    description.value = '';
    await load();
  } catch (e) {
    console.error(e);
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
  }
};

const remove = async (t) => {
  if (!t?.id) return;
  if (!confirm(`ยืนยันลบหัวข้อ: ${t.name}?`)) return;
  try {
    const r = await fetch(`/api/hr/topics/${t.id}`, {
      method: 'DELETE',
      headers: { ...auth.authHeader() },
    });
    if (!r.ok) {
      if (await handleAuthFailure(r)) return;
      const text = await r.text().catch(() => null);
      console.error('failed to delete topic', text);
      alert('ลบหัวข้อไม่สำเร็จ: ' + (text || r.status));
      return;
    }
    await load();
  } catch (e) {
    console.error(e);
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
  }
};

onMounted(load);
</script>
