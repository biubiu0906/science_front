import { ref } from 'vue'

// 全局安全提醒状态
const isSecurityAlertVisible = ref(false)

// 安全提醒管理器
export const securityAlertManager = {
  // 显示安全提醒
  show() {
    isSecurityAlertVisible.value = true
  },
  
  // 隐藏安全提醒
  hide() {
    isSecurityAlertVisible.value = false
  },
  
  // 获取当前状态
  get isVisible() {
    return isSecurityAlertVisible.value
  },
  
  // 获取响应式状态
  get state() {
    return isSecurityAlertVisible
  }
}