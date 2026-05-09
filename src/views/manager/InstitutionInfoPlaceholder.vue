<template>
  <div class="institution-placeholder">
    <el-empty :description="`${route.meta.name || '机构信息'}页面待实现`" />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<style scoped>
.institution-placeholder {
  min-height: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
