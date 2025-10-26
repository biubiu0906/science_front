<template>
  <Transition name="security-alert" appear>
    <div v-if="visible" class="security-alert-container">
      <div class="security-alert-content">
        <div class="alert-icon">⚠️</div>
        <div class="alert-text">
          <div class="alert-title">重要提示</div>
          <div class="alert-message">
            本平台为互联网非涉密平台，严禁处理传输国家秘密、工作秘密。
          </div>
        </div>
        <div class="alert-actions">
          <el-button type="danger" size="small" @click="handleConfirm" class="confirm-btn">
            我知道了
          </el-button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { defineEmits, defineProps, watch } from 'vue'
import { securityAlertManager } from '@/utils/securityAlert.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

// 使用全局状态
const visible = securityAlertManager.state

// 监听 props 变化，同步到全局状态
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    securityAlertManager.show()
  } else {
    securityAlertManager.hide()
  }
})

// 监听全局状态变化，同步到 props
watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
})

const handleConfirm = () => {
  securityAlertManager.hide()
  emit('confirm')
}
</script>

<style scoped>
.security-alert-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3000;
  pointer-events: none;
}

.security-alert-content {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border: 1px solid #f56c6c;
  border-radius: 8px;
  padding: 16px 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 600px;
  min-width: 400px;
  pointer-events: auto;
}

.alert-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.alert-text {
  flex: 1;
}

.alert-title {
  font-size: 16px;
  font-weight: bold;
  color: #f56c6c;
  margin-bottom: 4px;
}

.alert-message {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  margin: 0;
}

.alert-actions {
  flex-shrink: 0;
}

.confirm-btn {
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 4px;
}

/* 过渡动画 */
.security-alert-enter-active,
.security-alert-leave-active {
  transition: all 0.3s ease;
}

.security-alert-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.security-alert-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
</style>