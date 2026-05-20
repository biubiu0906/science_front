<template>
  <div class="institution-infrastructure-page">
    <InstitutionScopeList v-if="canSelectScope" ref="scopeListRef" module="infrastructure" :columns="scopeColumns" @select="openScope" />

    <InstitutionMaintenanceDialog
      v-if="shouldShowMaintenance"
      v-model:visible="data.scopeDialogVisible"
      :dialog="canSelectScope"
      :title="scopeDialogTitle"
      @closed="closeScopeDialog"
    >
    <div v-if="canSelectScope && data.selectedScope" class="selected-scope-bar">
      <div>
        <span class="selected-scope-name">{{ data.selectedScope.institutionName }}</span>
        <el-tag size="small" style="margin-left: 8px">{{ data.selectedScope.institutionType }}</el-tag>
        <span class="selected-scope-school">{{ data.selectedScope.schoolName }}</span>
      </div>
      <el-button link type="primary" @click="returnToScopeList">关闭</el-button>
    </div>

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
    </InstitutionMaintenanceDialog>
  </div>
</template>

<script setup>
import { reactive, onMounted, computed, ref } from 'vue'
import request from '@/utils/request.js'
import { getSchools } from '@/utils/dict.js'
import { ElMessage } from '@/utils/element-plus'
import { DocumentChecked } from '@element-plus/icons-vue'
import InstitutionScopeList from '@/components/InstitutionScopeList.vue'
import InstitutionMaintenanceDialog from '@/components/InstitutionMaintenanceDialog.vue'

const fieldMap = {
  institutionType: 'institution_type',
  schoolId: 'school_id',
  organizationId: 'organization_id',
  laboratoryId: 'laboratory_id',
  officeArea: 'office_area',
  officeRooms: 'office_rooms',
  copierCount: 'copier_count',
  faxCount: 'fax_count',
  computerCount: 'computer_count',
  computerNetworkRate: 'computer_network_rate',
  labArea: 'lab_area',
  labRooms: 'lab_rooms',
  mainLabEquip: 'main_lab_equip',
  mainSoftware: 'main_software'
}

const scopeListRef = ref()

const scopeColumns = [
  { label: '办公面积', prop: 'summary.officeArea', minWidth: 110, suffix: '平米' },
  { label: '办公用房', prop: 'summary.officeRooms', minWidth: 110, suffix: '间' },
  { label: '计算机数', prop: 'summary.computerCount', minWidth: 110, suffix: '台' },
  { label: '联网率', prop: 'summary.computerNetworkRate', minWidth: 100, suffix: '%' },
  { label: '实验室面积', prop: 'summary.labArea', minWidth: 120, suffix: '平米' },
  { label: '实验室间数', prop: 'summary.labRooms', minWidth: 120, suffix: '间' }
]

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
  currentUser: {},
  schools: [],
  organizations: [],
  scope: {
    institutionType: '实验室',
    schoolId: null,
    organizationId: null
  },
  selectedScope: null,
  scopeDialogVisible: false,
  info: {},
  editingSectionKey: '',
  editForm: {}
})

try {
  data.currentUser = JSON.parse(localStorage.getItem('xm-user') || '{}')
} catch (_) {
  data.currentUser = {}
}

const canSelectScope = computed(() => ['SUPER_ADMIN', 'SCHOOL_ADMIN'].includes(data.currentUser.role))
const shouldShowMaintenance = computed(() => !canSelectScope.value || !!data.selectedScope)
const scopeDialogTitle = computed(() => data.selectedScope ? `维护 ${data.selectedScope.institutionName}` : '机构基础设施维护')

const filteredOrganizations = computed(() => {
  return (data.organizations || []).filter((organization) => {
    if (data.scope.schoolId && String(organization.schoolId) !== String(data.scope.schoolId)) return false
    if (data.scope.institutionType !== '学校' && organization.laboratoryHierarchy !== data.scope.institutionType) return false
    return true
  })
})

const normalizeInfo = (raw = {}) => {
  const normalized = {}
  Object.keys(fieldMap).forEach((key) => {
    normalized[key] = raw[key] ?? raw[fieldMap[key]] ?? ''
  })
  if (raw.id) normalized.id = raw.id
  normalized.schoolId = raw.schoolId ?? raw.school_id ?? normalized.schoolId
  normalized.organizationId = raw.organizationId ?? raw.organization_id ?? normalized.organizationId
  normalized.laboratoryId = raw.laboratoryId ?? raw.laboratory_id ?? normalized.organizationId
  normalized.institutionType = raw.institutionType ?? raw.institution_type ?? normalized.institutionType
  return normalized
}

const getScopeParams = () => {
  if (!canSelectScope.value) return {}
  const params = {
    institutionType: data.scope.institutionType,
    schoolId: data.scope.schoolId
  }
  if (data.scope.institutionType !== '学校') {
    params.organizationId = data.scope.organizationId
  }
  return params
}

const load = () => {
  if (canSelectScope.value && data.scope.institutionType !== '学校' && !data.scope.organizationId) {
    data.info = {}
    return
  }
  request.get('/infrastructure/current', { params: getScopeParams() }).then(res => {
    if (res.code === '200') {
      data.info = normalizeInfo(res.data || {})
      data.scope.institutionType = data.info.institutionType || data.scope.institutionType
      data.scope.schoolId = data.info.schoolId || data.scope.schoolId
      data.scope.organizationId = data.info.organizationId || data.scope.organizationId
    } else {
      ElMessage.error(res.msg || '获取基础设施信息失败')
    }
  })
}

const initScope = () => {
  if (!canSelectScope.value) return
  if (data.currentUser.role === 'SCHOOL_ADMIN') {
    data.scope.schoolId = data.currentUser.schoolId || data.schools[0]?.id || null
  } else {
    data.scope.schoolId = data.schools[0]?.id || null
  }
  data.scope.institutionType = '实验室'
  selectFirstOrganization()
}

const loadScopeOptions = () => {
  if (!canSelectScope.value) return Promise.resolve()
  return Promise.all([
    getSchools(),
    request.get('/laboratory/list')
  ]).then(([schoolsData, organizationRes]) => {
    data.schools = schoolsData || []
    if (organizationRes.code === '200') {
      data.organizations = organizationRes.data || []
    }
    initScope()
  }).catch(() => {})
}

const selectFirstOrganization = () => {
  if (data.scope.institutionType === '学校') {
    data.scope.organizationId = null
    return true
  }
  const first = filteredOrganizations.value[0]
  data.scope.organizationId = first?.id || null
  return !!first
}

const handleScopeTypeChange = () => {
  selectFirstOrganization()
  load()
}

const handleSchoolChange = () => {
  selectFirstOrganization()
  load()
}

const openScope = (scope) => {
  data.selectedScope = scope
  data.scopeDialogVisible = true
  data.scope.institutionType = scope.institutionType
  data.scope.schoolId = scope.schoolId
  data.scope.organizationId = scope.organizationId || null
  data.info = {}
  data.editingSectionKey = ''
  data.editForm = {}
  load()
}

const returnToScopeList = () => {
  if (canSelectScope.value) {
    data.scopeDialogVisible = false
    return
  }
  closeScopeDialog()
}

const closeScopeDialog = () => {
  data.selectedScope = null
  data.info = {}
  data.editingSectionKey = ''
  data.editForm = {}
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
  submitData.institutionType = data.info.institutionType || data.scope.institutionType
  submitData.schoolId = data.info.schoolId || data.scope.schoolId
  submitData.organizationId = data.info.organizationId || data.scope.organizationId
  submitData.laboratoryId = submitData.organizationId || null
  
  request.put('/infrastructure/current', submitData, { params: getScopeParams() }).then(res => {
    if (res.code === '200') {
      data.info = normalizeInfo(res.data || submitData)
      data.editingSectionKey = ''
      data.editForm = {}
      scopeListRef.value?.load?.()
      ElMessage.success('保存成功')
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  })
}

onMounted(() => {
  loadScopeOptions().then(() => {
    if (!canSelectScope.value) load()
  })
})
</script>

<style scoped>
.institution-infrastructure-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.selected-scope-bar {
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 0;
  border: 1px solid #e4e7ed;
  background: #fff;
}

.selected-scope-name {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.selected-scope-school {
  margin-left: 12px;
  font-size: 13px;
  color: #606266;
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
