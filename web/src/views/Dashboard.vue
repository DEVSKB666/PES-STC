<template>
  <div class="space-y-6">
    <div class="card bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
      <h1 class="text-2xl font-bold">PES STC – ระบบประเมินบุคลากร</h1>
      <p class="text-white/90">Personnel Evaluation System (Demo)</p>
    </div>

    <div v-if="auth.token" class="grid md:grid-cols-3 gap-4">
      <router-link v-if="auth.isHR" to="/hr/topics" class="card hover:shadow-lg"
        >หัวข้อการประเมิน</router-link
      >
      <router-link
        v-if="auth.isHR"
        to="/hr/indicators"
        class="card hover:shadow-lg"
        >ตัวชี้วัด</router-link
      >
      <router-link v-if="auth.isHR" to="/hr/cycles" class="card hover:shadow-lg"
        >รอบการประเมิน</router-link
      >
      <router-link
        v-if="auth.isHR"
        to="/hr/assignments"
        class="card hover:shadow-lg"
        >มอบหมายกรรมการ</router-link
      >
      <router-link
        v-if="auth.isCommittee"
        to="/committee/queue"
        class="card hover:shadow-lg"
        >คิวกรรมการ</router-link
      >
      <router-link
        v-if="auth.isCommittee"
        to="/committee/review"
        class="card hover:shadow-lg"
        >ให้คะแนน/คอมเมนต์</router-link
      >
      <router-link
        v-if="auth.isEvaluated"
        to="/evaluated/submit"
        class="card hover:shadow-lg"
        >ส่งคะแนนตนเอง</router-link
      >
      <router-link
        v-if="auth.isEvaluated"
        to="/evaluated/report"
        class="card hover:shadow-lg"
        >รายงาน</router-link
      >
      <router-link
        v-if="auth.isEvaluated"
        to="/evaluated/tracking"
        class="card hover:shadow-lg"
        >ติดตาม</router-link
      >
      <router-link
        v-if="auth.isHR"
        to="/hr/reports"
        class="card hover:shadow-lg"
        >รายงาน/สถิติ</router-link
      >
    </div>

    <div v-else class="card">
      <p>
        โปรด
        <router-link class="link" to="/login">เข้าสู่ระบบ</router-link> หรือ
        <router-link class="link" to="/register">สมัครสมาชิก</router-link>
      </p>
    </div>
  </div>
</template>
<script setup>
import { useAuthStore } from '../store/auth';
const auth = useAuthStore();
</script>
