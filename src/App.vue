<template>
  <!-- 使用 ElConfigProvider 设置全局语言包，确保所有 Element Plus 组件使用中文 -->
  <ElConfigProvider :locale="locale">
    <RouterView />
  </ElConfigProvider>
</template>

<script setup>
import { ElConfigProvider } from 'element-plus'
// 引入中文语言包
import zhCn from 'element-plus/es/locale/lang/zh-cn'

// 设置语言包
const locale = zhCn
</script>