<template>
  <div class="space-y-4">
    <h2 class="text-xl font-bold">ส่งคะแนนตนเอง</h2>

    <div class="card p-4">
      <form
        @submit.prevent="onSubmit(false)"
        class="grid grid-cols-1 md:grid-cols-3 gap-3 items-end"
      >
        <div>
          <label class="block text-xs text-gray-600 mb-1">รอบประเมิน</label>
          <select v-model.number="cycle_id" class="input w-full">
            <option disabled value="">-- เลือกรอบ --</option>
            <option v-for="c in cycles" :key="c.id" :value="c.id">
              {{ c.id }} · {{ c.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-xs text-gray-600 mb-1">ตัวชี้วัด</label>
          <select v-model.number="indicator_id" class="input w-full">
            <option :value="null" disabled>-- เลือกตัวชี้วัด --</option>
            <option v-for="i in indicators" :key="i.id" :value="i.id">
              #{{ i.id }} · {{ i.title }} · {{ i.topic_name || '-' }} (w: {{ i.weight }}%)
            </option>
          </select>
        </div>

        <div>
          <label class="block text-xs text-gray-600 mb-1">ประเภทหลักฐาน</label>
          <select v-model="type" class="input w-full">
            <option value="score">score</option>
            <option value="file">file</option>
            <option value="url">url</option>
            <option value="text">text</option>
          </select>
        </div>

        <!-- score input always shown -->
        <div>
          <label class="block text-xs text-gray-600 mb-1">คะแนน (1-4)</label>
          <select v-model.number="self_score" class="input w-full">
            <option v-for="n in [1, 2, 3, 4]" :key="n" :value="n">
              {{ n }}
            </option>
          </select>
        </div>

        <div v-if="type === 'url'" class="md:col-span-2">
          <label class="block text-xs text-gray-600 mb-1">ลิงก์หลักฐาน</label>
          <input
            v-model="evidence_url"
            type="url"
            class="input w-full"
            placeholder="https://..."
          />
        </div>

        <div v-if="type === 'text'" class="md:col-span-2">
          <label class="block text-xs text-gray-600 mb-1">ข้อความสะท้อน</label>
          <textarea
            v-model="text"
            rows="4"
            class="input w-full"
            placeholder="พิมพ์ข้อความ..."
          ></textarea>
        </div>

        <div v-if="type === 'file'" class="md:col-span-2">
          <label class="block text-xs text-gray-600 mb-1"
            >อัปโหลดไฟล์ (PDF, DOC, JPG)</label
          >
          <input
            ref="fileInputRef"
            @change="onFileChange"
            type="file"
            accept=".pdf,.doc,.docx,image/*"
            class="w-full"
          />
          <div v-if="uploadName" class="text-xs text-gray-600 mt-1">
            ไฟล์: {{ uploadName }}
          </div>
        </div>

        <!-- actions -->
        <div class="flex items-center gap-3 md:col-span-3 mt-2">
          <button
            type="button"
            class="btn bg-gray-200 px-3 py-2 rounded"
            :disabled="loading"
            @click="onSubmit(true)"
          >
            บันทึกฉบับร่าง
          </button>

          <button
            type="button"
            class="btn bg-indigo-600 text-white px-4 py-2 rounded"
            :disabled="loading"
            @click="onSubmit(false)"
          >
            ส่งแบบประเมิน
          </button>

          <button
            type="button"
            class="btn px-3 py-2"
            @click="resetForm"
            :disabled="loading"
          >
            รีเซ็ต
          </button>

          <div
            v-if="msg"
            class="text-sm ml-4"
            :class="msgError ? 'text-red-600' : 'text-green-600'"
          >
            {{ msg }}
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../store/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

// lists
const cycles = ref([]);
const indicators = ref([]);

// form state
const cycle_id = ref(null);
const indicator_id = ref(null);
const type = ref('score'); // score | file | url | text

const self_score = ref(3);
const evidence_url = ref('');
const text = ref('');
const file = ref(null);
const uploadName = ref('');

const loading = ref(false);
const msg = ref('');
const msgError = ref(false);

const fileInputRef = ref(null);

// helpers
const onFileChange = (e) => {
  const f = e.target.files?.[0] || null;
  file.value = f;
  uploadName.value = f ? f.name : '';
};

const isValidUrl = (s) => {
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
};

// send; isDraft=true => save draft, else submit
const onSubmit = async (isDraft) => {
  msg.value = '';
  msgError.value = false;

  if (!cycle_id.value || !indicator_id.value) {
    msg.value = 'กรุณาใส่ cycle_id และ indicator_id';
    msgError.value = true;
    return;
  }

  // validate score always
  if (self_score.value == null) {
    msg.value = 'กรุณาเลือกคะแนน';
    msgError.value = true;
    return;
  }
  if (Number(self_score.value) < 1 || Number(self_score.value) > 4) {
    msg.value = 'คะแนนต้องอยู่ระหว่าง 1 ถึง 4';
    msgError.value = true;
    return;
  }

  // validate evidence per type
  if (type.value === 'url' && !isValidUrl(evidence_url.value)) {
    msg.value = 'ลิงก์ไม่ถูกต้อง';
    msgError.value = true;
    return;
  }

  if (type.value === 'text' && !text.value.trim()) {
    msg.value = 'กรุณาใส่ข้อความ';
    msgError.value = true;
    return;
  }

  if (type.value === 'file' && !file.value) {
    msg.value = 'กรุณาเลือกไฟล์';
    msgError.value = true;
    return;
  }

  loading.value = true;

  try {
    if (type.value === 'file') {
      // 1) upload file to get path
      const form = new FormData();
      form.append('cycle_id', String(cycle_id.value));
      form.append('indicator_id', String(indicator_id.value));
      form.append('status', isDraft ? 'draft' : 'submitted');
      form.append('file', file.value);

      const r1 = await fetch('/api/evaluated/upload', {
        method: 'POST',
        headers: auth.authHeader(),
        body: form,
      });

      const t1 = await r1.text().catch(() => null);
      let b1 = null;
      try { b1 = JSON.parse(t1) } catch { b1 = t1 }

      if (!r1.ok) {
        console.error('upload-evidence failed', r1.status, b1);
        msg.value = b1?.message || String(b1) || `${r1.status} ${r1.statusText}`;
        msgError.value = true;
        return;
      }

      const path = b1?.data?.path || null;
      if (!path) {
        msg.value = 'อัปโหลดสำเร็จ แต่ไม่พบพาธไฟล์';
        msgError.value = true;
        return;
      }

      // 2) create submission with score + evidence_path
      const payload = {
        cycle_id: Number(cycle_id.value),
        items: [{
          indicator_id: Number(indicator_id.value),
          score: Number(self_score.value),
          evidence_url: path,
        }],
        status: isDraft ? 'draft' : 'submitted',
      };

      const r2 = await fetch('/api/evaluated/self-evaluation', {
        method: 'POST',
        headers: { ...auth.authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const t2 = await r2.text().catch(() => null);
      let b2 = null; try { b2 = JSON.parse(t2) } catch { b2 = t2 }

      if (!r2.ok) {
        console.error('self-evaluation failed', r2.status, b2);
        msg.value = b2?.message || b2?.error || String(b2) || `${r2.status} ${r2.statusText}`;
        msgError.value = true;
      } else {
        msg.value = b2?.message || 'บันทึกสำเร็จ';
        msgError.value = false;
      }
    } else {
      // build item array expected by backend
      const item = { indicator_id: Number(indicator_id.value), score: Number(self_score.value) };
      if (type.value === 'url') {
        item.evidence_url = evidence_url.value || null;
      } else if (type.value === 'text') {
        item.text = text.value || null;
      }

      const payload = {
        cycle_id: Number(cycle_id.value),
        items: [item],
        status: isDraft ? 'draft' : 'submitted',
      };

      const res = await fetch('/api/evaluated/self-evaluation', {
        method: 'POST',
        headers: { ...auth.authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const txt = await res.text().catch(() => null);
      let body = null;
      try {
        body = JSON.parse(txt);
      } catch {
        body = txt;
      }

      if (!res.ok) {
        console.error('self-evaluation failed', res.status, body);
        msg.value =
          body?.message ||
          body?.error ||
          String(body) ||
          `${res.status} ${res.statusText}`;
        msgError.value = true;
      } else {
        msg.value = body?.message || 'บันทึกสำเร็จ';
        msgError.value = false;
      }
    }
  } catch (e) {
    console.error('submit error', e);
    msg.value = 'เกิดข้อผิดพลาด (ดู console/Network/Server logs)';
    msgError.value = true;
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  self_score.value = 3;
  evidence_url.value = '';
  text.value = '';
  file.value = null;
  uploadName.value = '';
  msg.value = '';
  msgError.value = false;
  if (fileInputRef.value) fileInputRef.value.value = '';
};

const handleAuthFailure = async (res) => {
  let body = null;
  try { body = await res.json(); } catch {}
  const msg = body?.message || body?.error || `${res.status} ${res.statusText}`;
  if (res.status === 401 || /invalid token/i.test(String(msg))) {
    alert('โทเค็นไม่ถูกต้องหรือหมดอายุ — โปรดเข้าสู่ระบบใหม่');
    auth.logout();
    router.push('/login');
    return true;
  }
  return false;
};

const loadCycles = async () => {
  try {
    const r = await fetch('/api/common/cycles', { headers: auth.authHeader() });
    if (!r.ok) { if (await handleAuthFailure(r)) return; return; }
    const j = await r.json();
    cycles.value = j.data || [];
    const active = cycles.value.find((c) => c.is_active);
    cycle_id.value = (active?.id ?? cycles.value[0]?.id) || null;
  } catch (e) {
    console.error('loadCycles error', e);
  }
};

const loadIndicators = async () => {
  try {
    const r = await fetch('/api/common/indicators', { headers: auth.authHeader() });
    if (!r.ok) { if (await handleAuthFailure(r)) return; return; }
    const j = await r.json();
    indicators.value = j.data || [];
  } catch (e) {
    console.error('loadIndicators error', e);
  }
};

onMounted(() => {
  loadCycles();
  loadIndicators();
});
</script>