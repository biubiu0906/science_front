<template>
  <div class="research-dept-page">
    <div
      v-for="section in sections"
      :key="section.key"
      class="info-section"
    >
      <div class="section-header">
        <div class="section-title">{{ section.title }}</div>
        <div class="section-actions" v-if="section.editable">
          <template v-if="data.editingSectionKey === section.key">
            <el-button type="primary" @click="saveSection">
              <el-icon><DocumentChecked /></el-icon>
              <span>保存</span>
            </el-button>
            <el-button link type="primary" @click="cancelEdit">取消</el-button>
          </template>
          <template v-else>
            <span class="required-hint">(* 为必填项)</span>
            <el-button link type="primary" @click="openEdit(section)">编辑</el-button>
          </template>
        </div>
      </div>
      <div class="section-body">
        <div
          v-for="item in section.items"
          :key="item.prop"
          class="info-row"
          :class="{ 'full-row': item.full }"
        >
          <div class="info-label">{{ item.label }}：</div>
          <div v-if="data.editingSectionKey === section.key" class="info-control">
            <el-input
              v-model="data.editForm[item.prop]"
              :type="item.full ? 'textarea' : 'text'"
              :rows="item.full ? 2 : undefined"
              clearable
            />
          </div>
          <div v-else class="info-value">
            {{ data.info[item.prop] || '' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import request from '@/utils/request.js'
import { ElMessage } from '@/utils/element-plus'
import { DocumentChecked } from '@element-plus/icons-vue'

const fieldMap = {
  schoolLeader: 'school_leader',
  departmentFullName: 'department_full_name',
  headName: 'head_name',
  headPosition: 'head_position',
  headTitle: 'head_title',
  headPhone: 'head_phone',
  headEmail: 'head_email',
  contactName: 'contact_name',
  contactPosition: 'contact_position',
  contactTitle: 'contact_title',
  contactPhone: 'contact_phone',
  contactEmail: 'contact_email'
}

const sections = [
  {
    key: 'basic',
    title: '1. 基本信息',
    editable: true,
    items: [
      { label: '分管基地工作校领导', prop: 'schoolLeader' },
      { label: '校科研管理部门全称', prop: 'departmentFullName' }
    ]
  },
  {
    key: 'head',
    title: '2. 校科研管理部门负责人信息',
    editable: true,
    items: [
      { label: '负责人', prop: 'headName' },
      { label: '负责人职务', prop: 'headPosition' },
      { label: '负责人职称', prop: 'headTitle' },
      { label: '负责人电话', prop: 'headPhone' },
      { label: '负责人邮箱', prop: 'headEmail' }
    ]
  },
  {
    key: 'contact',
    title: '3. 校科研管理部门联系人信息',
    editable: true,
    items: [
      { label: '联系人', prop: 'contactName' },
      { label: '联系人职务', prop: 'contactPosition' },
      { label: '联系人职称', prop: 'contactTitle' },
      { label: '联系人电话', prop: 'contactPhone' },
      { label: '联系人邮箱', prop: 'contactEmail' }
    ]
  }
]

const data = reactive({
  info: {},
  editingSectionKey: '',
  editForm: {}
})

const normalizeInfo = (raw = {}) => {
  const normalized = {}
  Object.keys(fieldMap).forEach((key) => {
    normalized[key] = raw[key] ?? raw[fieldMap[key]] ?? ''
  })
  if (raw.id) normalized.id = raw.id
  if (raw.laboratoryId || raw.laboratory_id) normalized.laboratoryId = raw.laboratoryId ?? raw.laboratory_id
  return normalized
}

const load = () => {
  request.get('/researchDepartment/current').then(res => {
    if (res.code === '200') {
      data.info = normalizeInfo(res.data || {})
    } else {
      ElMessage.error(res.msg || '获取科研管理部门信息失败')
    }
  })
}

const openEdit = (section) => {
  data.editingSectionKey = section.key
  data.editForm = JSON.parse(JSON.stringify(data.info))
}

const cancelEdit = () => {
  data.editingSectionKey = ''
  data.editForm = {}
}

const saveSection = () => {
  const submitData = { ...data.editForm }

  request.put('/researchDepartment/current', submitData).then(res => {
    if (res.code === '200') {
      data.info = normalizeInfo(res.data || submitData)
      data.editingSectionKey = ''
      data.editForm = {}
      ElMessage.success('保存成功')
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  })
}

onMounted(() => {
  load()
})
</script>

<style scoped>
.research-dept-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-section {
  border: 1px solid #e4e7ed;
  background: #fff;
}

.section-header {
  min-height: 58px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid #ebeef5;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 18px;
}

.required-hint {
  font-size: 13px;
  color: #f56c6c;
}

.section-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 120px;
  row-gap: 26px;
  padding: 28px 72px 30px;
}

.info-row {
  display: grid;
  grid-template-columns: 150px 1fr;
  align-items: center;
  min-width: 0;
}

.info-row.full-row {
  grid-column: 1 / -1;
  grid-template-columns: 150px 1fr;
}

.info-label {
  font-size: 14px;
  font-weight: 400;
  color: #333;
  text-align: right;
}

.info-value {
  min-height: 30px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  border-bottom: 1px solid #dcdfe6;
  color: #606266;
  font-size: 14px;
  font-weight: 400;
  word-break: break-word;
}

.info-control {
  min-height: 32px;
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 400;
}

.info-control :deep(.el-input__inner),
.info-control :deep(.el-textarea__inner) {
  font-size: 14px;
  font-weight: 400;
}

.section-actions :deep(.el-button) {
  font-weight: 400;
}

@media (max-width: 900px) {
  .section-body {
    grid-template-columns: 1fr;
    padding: 22px 18px;
    row-gap: 18px;
  }

  .info-row,
  .info-row.full-row {
    grid-column: 1;
    grid-template-columns: 130px 1fr;
  }

  .section-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
    padding: 14px 18px;
  }
}
</style>
