<template>
  <div class="flex items-center justify-center min-h-screen bg-slate-50">
    <Icon
      name="ph:spinner-duotone"
      class="text-4xl text-slate-400 animate-spin"
    />
  </div>
</template>

<script setup lang="ts">
// หน้านี้จะถูก handle โดย global auth middleware
// ถ้า login แล้ว จะ redirect ไป /dashboard
// ถ้ายังไม่ login จะ redirect ไป /login
</script>
