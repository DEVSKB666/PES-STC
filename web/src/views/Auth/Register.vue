
<template>
  <div class="min-h-[70vh] flex items-center justify-center p-4">
    <div class="w-full max-w-xl">
      <div class="text-center mb-6">
        <div class="text-3xl font-extrabold text-indigo-700">PES Plus</div>
        <div class="text-sm text-gray-600">Personnel Evaluation System (Demo)</div>
      </div>
      <div class="card grid md:grid-cols-2 gap-3">
        <input v-model="name" class="input md:col-span-2" placeholder="ชื่อ-นามสกุล" />
        <input v-model="email" class="input" placeholder="อีเมล" />
        <select v-model="role" class="input">
          <option disabled value="">เลือกบทบาท</option>
          <option>ผู้รับการประเมิน</option>
          <option>คณะกรรมการประเมิน</option>
          <option>ฝ่ายบริหารบุคลากร</option>
        </select>
        <input v-model="password" class="input" type="password" placeholder="รหัสผ่าน" />
        <input v-model="confirm" class="input" type="password" placeholder="ยืนยันรหัสผ่าน" />
        <button class="btn md:col-span-2" @click="go">สมัครสมาชิก</button>
        <p v-if="msg" class="text-green-600 text-sm md:col-span-2">{{msg}}</p>
        <p v-if="err" class="text-rose-600 text-sm md:col-span-2">{{err}}</p>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../store/auth'
const auth=useAuthStore()
const name=ref('ผู้ใช้ใหม่')
const email=ref('user@demo.local')
const role=ref('ผู้รับการประเมิน')
const password=ref('123456')
const confirm=ref('123456')
const msg=ref(''); const err=ref('')
const go=async()=>{
  try{
    err.value=''; msg.value=''
    if(password.value!==confirm.value) throw new Error('รหัสผ่านไม่ตรงกัน')
    await auth.register({name:name.value,email:email.value,password:password.value,role:role.value})
    msg.value='สมัครสำเร็จ! โปรดเข้าสู่ระบบ'
  }catch(e){ err.value=e.message }
}
</script>
