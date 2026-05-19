<template>
  <el-dialog
    v-if="dialog"
    :model-value="visible"
    :title="title"
    :width="width"
    :top="top"
    class="institution-maintenance-dialog"
    destroy-on-close
    :close-on-click-modal="false"
    @update:model-value="$emit('update:visible', $event)"
    @closed="$emit('closed')"
  >
    <div class="institution-maintenance-dialog-body">
      <slot />
    </div>
  </el-dialog>
  <div v-else class="institution-maintenance-inline">
    <slot />
  </div>
</template>

<script setup>
defineProps({
  dialog: {
    type: Boolean,
    default: false
  },
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: 'min(1120px, 92vw)'
  },
  top: {
    type: String,
    default: '5vh'
  }
})

defineEmits(['update:visible', 'closed'])
</script>

<style scoped>
.institution-maintenance-dialog-body {
  max-height: calc(90vh - 108px);
  overflow: auto;
}

.institution-maintenance-inline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

:deep(.institution-maintenance-dialog .el-dialog__body) {
  padding: 12px 20px 20px;
}
</style>
