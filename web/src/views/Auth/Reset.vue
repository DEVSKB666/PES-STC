
<template>
  <div class="min-h-[70vh] flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-6">
        <div class="text-3xl font-extrabold text-indigo-700">PES Plus</div>
        <div class="text-sm text-gray-600">Reset รหัสผ่าน (Demo)</div>
      </div>
      <div class="card space-y-3">
        <input v-model="email" class="input" placeholder="อีเมลที่ต้องการรีเซ็ต" />
        <input v-model="newpwd" class="input" type="password" placeholder="รหัสผ่านใหม่" />
        <button class="btn w-full" @click="go">รีเซ็ต</button>
        <p v-if="msg" class="text-green-600 text-sm text-center">{{msg}}</p>
        <p v-if="err" class="text-rose-600 text-sm text-center">{{err}}</p>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../store/auth'
const auth=useAuthStore()
const email=ref('hr@demo.local')
const newpwd=ref('123456')
const msg=ref(''); const err=ref('')
const go=async()=>{ try{ err.value=''; msg.value=''; await auth.reset(email.value,newpwd.value); msg.value='รีเซ็ตสำเร็จ! โปรดเข้าสู่ระบบ'; }catch(e){ err.value=e.message } }
</script>
