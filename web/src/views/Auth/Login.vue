
<template>
  <div class="min-h-[70vh] flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-6">
        <div class="text-3xl font-extrabold text-indigo-700">PES STC</div>
        <div class="text-sm text-gray-600">ระบบประเมินบุคลากร</div>
      </div>
      <form @submit.prevent="login" class="card space-y-3">
        <h1 class="text-xl font-semibold text-center">เข้าสู่ระบบ</h1>
        <input v-model="email" class="input" placeholder="อีเมล" required />
        <input v-model="password" class="input" type="password" placeholder="รหัสผ่าน" required />
        <button type="submit" class="btn w-full" :disabled="isLoading">
          {{ isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
        </button>
        <p v-if="error" class="text-rose-600 text-sm text-center">{{ error }}</p>
        <div class="flex items-center justify-between text-sm">
          <router-link class="link" to="/register">สมัครสมาชิก</router-link>
          <router-link class="link" to="/reset">ลืมรหัสผ่าน?</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../store/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const email = ref('admin')
const password = ref('123456')
const error = ref('')
const isLoading = ref(false)

const login = async () => {
  if (!email.value || !password.value) return
  
  error.value = ''
  isLoading.value = true
  
  try {
    await auth.login(email.value, password.value)
    router.push('/')
  } catch (e) {
    error.value = e.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
  } finally {
    isLoading.value = false
  }
}
</script>
