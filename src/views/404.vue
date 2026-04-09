<template>
  <div>
    <div style="height: 100vh; display: flex; justify-content: center; align-items: center">
      <div style="width: 30%">
        <img src="@/assets/imgs/404.jpg" alt="" style="width: 100%">
        <div style="font-size: 30px; text-align: center">{{ message }}<router-link to="/">请返回主页</router-link></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const message = computed(() => {
  if (String(route.query.code) === '403') return '无权限访问该页面！'
  return '找不到页面啦！'
})
</script>
