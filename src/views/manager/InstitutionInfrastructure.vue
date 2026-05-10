<template>
  <div class="institution-infrastructure-page">
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
              :rows="item.full ? 3 : undefined"
              clearable
            >
              <template #append v-if="item.unit && !item.full">{{ item.unit }}</template>
            </el-input>
          </div>
          <div v-else class="info-value">
            {{ data.info[item.prop] ?? '' }} <span v-if="(data.info[item.prop] !== null && data.info[item.prop] !== undefined && data.info[item.prop] !== '') && item.unit" style="margin-left: 4px; color: #909399;">({{ item.unit }})</span>
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
  officeArea: 'officeArea',
  officeRooms: 'officeRooms',
  copierCount: 'copierCount',
  faxCount: 'faxCount',
  computerCount: 'computerCount',
  computerNetworkRate: 'computerNetworkRate',
  labArea: 'labArea',
  labRooms: 'labRooms',
  mainLabEquip: 'mainLabEquip',
  mainSoftware: 'mainSoftware'
}

const sections = [
  {
    key: 'office_space',
    title: '1. 办公空间',
    editable: true,
    items: [
      { label: '办公用房面积', prop: 'officeArea', unit: '平米' },
      { label: '办公用房间数', prop: 'officeRooms', unit: '间' }
    ]
  },
  {
    key: 'office_equipment',
    title: '2. 办公设备',
    editable: true,
    items: [
      { label: '复印机数', prop: 'copierCount', unit: '台' },
      { label: '传真机数', prop: 'faxCount', unit: '台' },
      { label: '计算机数', prop: 'computerCount', unit: '台' },
      { label: '计算机联网率', prop: 'computerNetworkRate', unit: '%' }
    ]
  },
  {
    key: 'lab_condition',
    title: '3. 实验室情况',
    editable: true,
    items: [
      { label: '实验室面积', prop: 'labArea', unit: '平米' },
      { label: '实验室间数', prop: 'labRooms', unit: '间' },
      { label: '主要实验设备', prop: 'mainLabEquip' },
      { label: '主要应用软件', prop: 'mainSoftware' }
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
  request.get('/infrastructure/current').then(res => {
    if (res.code === '200') {
      data.info = normalizeInfo(res.data || {})
    } else {
      ElMessage.error(res.msg || '获取基础设施信息失败')
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
  
  request.put('/infrastructure/current', submitData).then(res => {
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
.institution-infrastructure-page {
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

.section-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 120px;
  row-gap: 26px;
  padding: 28px 72px 30px;
}

.info-row {
  display: grid;
  grid-template-columns: 118px 1fr;
  align-items: center;
  min-width: 0;
}

.info-row.full-row {
  grid-column: 1 / -1;
  grid-template-columns: 118px 1fr;
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
    grid-template-columns: 110px 1fr;
  }

  .section-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
    padding: 14px 18px;
  }
}
</style>
