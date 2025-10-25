
<template>
  <div class="space-y-6">
    <div class="card">
      <h2 class="text-xl font-bold">ให้คะแนน/คอมเมนต์</h2>
      <p class="text-sm text-gray-600">เลือกรายการจากหน้า <router-link class="link" to="/committee/queue">คิวกรรมการ</router-link></p>
    </div>
    <div v-if="detail" class="card space-y-4">
      <div class="grid md:grid-cols-3 gap-3">
        <div class="p-3 rounded-xl bg-gray-50 border"><div class="text-xs text-gray-500">ผู้รับการประเมิน</div><div class="font-semibold">{{detail.evaluated_name}}</div><div class="text-xs text-gray-600">{{detail.evaluated_email}}</div></div>
        <div class="p-3 rounded-xl bg-gray-50 border"><div class="text-xs text-gray-500">ตัวชี้วัด</div><div class="font-semibold">{{detail.indicator_title}}</div><div class="text-xs text-gray-600">น้ำหนัก: {{detail.indicator_weight ?? detail.weight}}%</div></div>
        <div class="p-3 rounded-xl bg-gray-50 border"><div class="text-xs text-gray-500">Self score</div><div class="font-semibold text-blue-700 text-xl">{{detail.self_score}}</div><div class="text-xs text-gray-600">ช่วง: {{detail.score_min}}–{{detail.score_max}}</div></div>
      </div>
      <div class="rounded-xl border p-4">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold">หลักฐาน</h3>
          <a v-if="detail.evidence_path" :href="fileUrl(detail.evidence_path)" target="_blank" class="link">เปิดไฟล์</a>
        </div>
        <p v-if="!detail.evidence_path" class="text-sm text-gray-500">— ไม่มีไฟล์แนบ —</p>
      </div>
      <div class="rounded-xl border p-4">
        <h3 class="font-semibold mb-2">ให้คะแนน & คอมเมนต์</h3>
        <div class="grid md:grid-cols-3 gap-3">
          <input v-model.number="score" :min="detail.score_min" :max="detail.score_max" type="range" class="w-full"/>
          <input v-model.number="score" :min="detail.score_min" :max="detail.score_max" type="number" class="input"/>
          <input v-model="comment" class="input md:col-span-1" placeholder="ความคิดเห็น (ถ้ามี)"/>
        </div>
        <button class="btn mt-3" @click="submit">ส่งรีวิว</button>
        <div v-if="msg" class="text-green-600 text-sm mt-2">{{msg}}</div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../store/auth'
const auth=useAuthStore(); const route=useRoute()
const detail=ref(null); const score=ref(4); const comment=ref(''); const msg=ref(''); const err=ref('')
const fileUrl=(p)=> p?.startsWith('http')? p : '/uploads/'+(p||'').replace(/^\+/,'')
const load=async(id)=>{ err.value=''; detail.value=null; if(!id) return;
  const r=await fetch('/api/committee/submission/'+id,{headers:auth.authHeader()}); const j=await r.json().catch(()=>null); if(!r.ok){ err.value=j?.message||'ไม่พบ submission'; return } detail.value=j.data; score.value=j.data.self_score??3 }
onMounted(()=> load(route.query.id))
// ส่งค่า submission_id ให้ตรงกับข้อมูลที่โหลดจาก /submission/:id
const submit=async()=>{
  const r=await fetch('/api/committee/submit-score',{
    method:'POST',
    headers:{...auth.authHeader(),'Content-Type':'application/json'},
    body:JSON.stringify({submission_id:detail.value?.submission_id,score:Number(score.value),comment:comment.value})
  });
  const j=await r.json().catch(()=>null);
  msg.value=j?.message||(r.ok?'บันทึกรีวิวสำเร็จ':'เกิดข้อผิดพลาด')
}
</script>
