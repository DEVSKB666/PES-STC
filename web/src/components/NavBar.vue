<template>
  <!-- Mobile Header -->
  <header class="md:hidden bg-white/80 backdrop-blur sticky top-0 z-50 border-b">
    <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button class="p-2 rounded-md hover:bg-gray-200" @click="sidebarOpen = true">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <router-link to="/" class="font-bold text-lg text-indigo-700">PES STC</router-link>
      </div>
      <div class="text-sm" v-if="auth.token">👤 {{ auth.name }}</div>
    </div>
  </header>

  <!-- Mobile Sidebar -->
  <transition name="slide">
    <div v-if="sidebarOpen" class="fixed inset-0 z-50 md:hidden">
      <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" @click="sidebarOpen = false"></div>
      <nav class="fixed top-0 left-0 bottom-0 w-3/4 max-w-xs bg-white p-6 overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <router-link to="/" class="font-bold text-lg text-indigo-700">PES STC</router-link>
          <button class="p-2" @click="sidebarOpen = false">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <nav class="mb-6">
          <ul class="flex flex-col gap-2 text-sm">
            <li v-if="auth.isHR">
              <router-link @click="closeMobile" to="/hr/topics" class="nav-link">หัวข้อ</router-link>
            </li>
            <li v-if="auth.isHR">
              <router-link @click="closeMobile" to="/hr/indicators" class="nav-link">ตัวชี้วัด</router-link>
            </li>
            <li v-if="auth.isHR">
              <router-link @click="closeMobile" to="/hr/cycles" class="nav-link">รอบ</router-link>
            </li>
            <li v-if="auth.isHR">
              <router-link @click="closeMobile" to="/hr/assignments" class="nav-link">มอบหมาย</router-link>
            </li>
            <li v-if="auth.isHR">
              <router-link @click="closeMobile" to="/hr/reports" class="nav-link">รายงาน</router-link>
            </li>
            <li v-if="auth.isCommittee">
              <router-link @click="closeMobile" to="/committee/queue" class="nav-link">คิวกรรมการ</router-link>
            </li>
            <li v-if="auth.isCommittee">
              <router-link @click="closeMobile" to="/committee/review" class="nav-link">รีวิว</router-link>
            </li>
            <li v-if="auth.isEvaluated">
              <router-link @click="closeMobile" to="/evaluated/submit" class="nav-link">ส่งงาน</router-link>
            </li>
            <!-- <li>
              <router-link @click="closeMobile" to="/evaluated/tracking" class="nav-link">ติดตาม</router-link>
            </li> -->
          </ul>
        </nav>
        
        <div class="pt-4 border-t" v-if="auth.token">
          <div class="mb-3">
            👤 {{ auth.name }} · <span class="kpi">{{ auth.role }}</span>
          </div>
          <button @click="handleLogout" class="w-full py-2 px-3 text-sm text-red-600 hover:bg-red-50 rounded">
            ออกจากระบบ
          </button>
        </div>
      </nav>
    </div>
  </transition>

  <!-- Desktop Sidebar -->
  <aside class="hidden md:fixed md:top-0 md:left-0 md:flex md:flex-col md:w-64 md:h-screen bg-white/95 backdrop-blur border-r shadow-sm md:z-40">
    <div class="px-6 py-6">
      <router-link to="/" class="font-bold text-lg text-indigo-700">PES STC</router-link>
    </div>
    <div class="px-6 py-4 border-t text-sm">
      <div v-if="auth.token">
        <div class="py-2 bg-gray-200 px-3 rounded-lg mb-3">
          👤 {{ auth.name }}
        </div>
        <span class="kpi">{{ auth.role }}</span>
      </div>
      <div v-else class="flex gap-3">
        <router-link to="/login" class="btn">เข้าสู่ระบบ</router-link>
        <router-link to="/register" class="btn">สมัคร</router-link>
      </div>
    </div>
    <nav class="px-4 py-2 flex-1 overflow-y-auto">
      <ul class="flex flex-col gap-2 text-sm">
        <li v-if="auth.isHR">
          <router-link to="/hr/topics" class="nav-link">หัวข้อ</router-link>
        </li>
        <li v-if="auth.isHR">
          <router-link to="/hr/indicators" class="nav-link">ตัวชี้วัด</router-link>
        </li>
        <li v-if="auth.isHR">
          <router-link to="/hr/cycles" class="nav-link">รอบ</router-link>
        </li>
        <li v-if="auth.isHR">
          <router-link to="/hr/assignments" class="nav-link">มอบหมาย</router-link>
        </li>
        <li v-if="auth.isHR">
          <router-link to="/hr/reports" class="nav-link">รายงาน</router-link>
        </li>
        <li v-if="auth.isCommittee">
          <router-link to="/committee/queue" class="nav-link">คิวกรรมการ</router-link>
        </li>
        <li v-if="auth.isCommittee">
          <router-link to="/committee/review" class="nav-link">รีวิว</router-link>
        </li>
        <li v-if="auth.isEvaluated">
          <router-link to="/evaluated/submit" class="nav-link">ส่งผลงาน</router-link>
        </li>
        <li v-if="auth.isEvaluated">
          <router-link to="/evaluated/tracking" class="nav-link">ติดตาม</router-link>
        </li>
        <li v-if="auth.isEvaluated">
          <router-link to="/evaluated/report" class="nav-link">รายงาน</router-link>
        </li>
      </ul>
    </nav>
    <div class="p-4 border-t" v-if="auth.token">
      <button @click="auth.logout()" class="w-full py-2 px-3 text-sm text-red-600 hover:bg-red-50 rounded">
        ออกจากระบบ
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../store/auth';

const auth = useAuthStore();
const sidebarOpen = ref(false);
const route = useRoute();

function closeMobile() {
  sidebarOpen.value = false;
}

function handleLogout() {
  sidebarOpen.value = false;
  auth.logout();
}

// ปิด sidebar บนมือถือเมื่อ route เปลี่ยน
watch(
  () => route.fullPath,
  () => {
    sidebarOpen.value = false;
  }
);
</script>

<style scoped>
.nav-link {
  @apply block px-3 py-2 rounded hover:bg-indigo-50 transition-colors;
}
.nav-link.router-link-active {
  @apply bg-indigo-50 text-indigo-700 font-medium;
}
.kpi {
  @apply inline-block px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800;
}
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
