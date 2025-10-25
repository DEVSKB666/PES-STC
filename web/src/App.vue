<template>
  <div class="min-h-screen">
    <NavBar />
    <nav class="py-1 hidden md:block">
      <div class="bg-white p-4 md:p-6 md:ml-64 flex border-b text-white">
        <router-link to="/" class="font-semibold text-gray-700"
          >หน้าหลัก</router-link
        >
        <span class="mx-2">/</span>
        <span class="font-semibold">รายงาน/สถิติ</span>
      </div>
    </nav>
    <main class="max-w-6xl mx-auto p-4 md:p-6 md:ml-64">
      <router-view />
    </main>
  </div>
</template>
<script setup>
import NavBar from './components/NavBar.vue';
</script>
