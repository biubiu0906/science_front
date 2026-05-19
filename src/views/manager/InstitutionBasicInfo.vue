<template>
  <div class="institution-basic-page">
    <InstitutionScopeList v-if="canSelectScope" ref="scopeListRef" module="basic" :columns="scopeColumns" @select="openScope" />

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
            <span v-if="section.key === 'leaders'" class="warning-text">请及时更新负责人及负责人手机号信息</span>
            <el-button link type="primary" @click="openEdit(section)">编辑</el-button>
          </template>
        </div>
      </div>
      <div class="section-body">
        <div
          v-for="item in getVisibleItems(section)"
          :key="item.prop"
          class="info-row"
          :class="{ 'full-row': item.full }"
        >
          <div class="info-label">{{ item.label }}：</div>
          <div v-if="data.editingSectionKey === section.key" class="info-control">
            <el-select
              v-if="item.type === 'select'"
              v-model="data.editForm[item.prop]"
              clearable
              style="width: 100%"
            >
              <el-option
              v-for="option in getItemOptions(item)"
                :key="option"
                :label="option"
                :value="option"
              />
            </el-select>
            <el-select
              v-else-if="item.type === 'school-select'"
              v-model="data.editForm[item.prop]"
              filterable
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="school in data.schools"
                :key="school.id"
                :label="school.name"
                :value="school.id"
              />
            </el-select>
            <el-radio-group v-else-if="item.type === 'radio'" v-model="data.editForm[item.prop]">
              <el-radio-button label="是" />
              <el-radio-button label="否" />
            </el-radio-group>
            <el-cascader
              v-else-if="item.type === 'cascader'"
              v-model="data.editForm[item.prop]"
              :options="getItemOptions(item)"
              :props="{ emitPath: false, label: 'label', value: 'value' }"
              clearable
              filterable
              style="width: 100%"
            />
            <el-tree-select
              v-else-if="item.type === 'tree-select'"
              v-model="data.editForm[item.prop]"
              :data="getItemOptions(item)"
              multiple
              :props="{ label: 'label', value: 'value' }"
              clearable
              filterable
              style="width: 100%"
              @change="(val) => handleTreeChange(item.prop, val)"
            />
            <el-input
              v-else
              v-model="data.editForm[item.prop]"
              :type="item.full ? 'textarea' : 'text'"
              :rows="item.full ? 2 : undefined"
              clearable
            />
          </div>
          <div v-else class="info-value">
            <template v-if="item.type === 'tree-select'">
              <el-tag v-for="tag in (data.info[item.prop] || [])" :key="tag" style="margin-right: 5px;">{{ tag }}</el-tag>
            </template>
            <template v-else>
              {{ getDisplayValue(item) }}
            </template>
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
  institutionName: 'institution_name',
  englishName: 'english_name',
  researchType: 'research_type',
  academicField: 'academic_field',
  institutionCode: 'institution_code',
  establishmentDate: 'establishment_date',
  affiliatedSchool: 'affiliated_school',
  institutionCategory: 'institution_category',
  competentDepartment: 'competent_department',
  coConstructionDepartment: 'co_construction_department',
  collegeLevel: 'college_level',
  entityInstitution: 'entity_institution',
  mainDiscipline: 'main_discipline',
  relatedDisciplines: 'related_disciplines',
  principalName: 'principal_name',
  principalPhone: 'principal_phone',
  baseDirector: 'base_director',
  baseDirectorPhone: 'base_director_phone',
  directorAssistant: 'director_assistant',
  administrativeSecretary: 'administrative_secretary',
  dataManager: 'data_manager',
  contactPerson: 'contact_person',
  contactPhone: 'contact_phone',
  fax: 'fax',
  mobile: 'mobile',
  email: 'email',
  website: 'website',
  province: 'province',
  postalCode: 'postal_code',
  address: 'address'
}

const institutionTypes = ['学校', '实验室', '基地', '团队']
const scopeListRef = ref()

const scopeColumns = [
  { label: '机构代码', prop: 'summary.institutionCode', minWidth: 120 },
  { label: '研究类型', prop: 'summary.researchType', minWidth: 120 },
  { label: '描述', prop: 'summary.laboratoryDescription', minWidth: 160 },
  { label: '地址', prop: 'summary.laboratoryAddress', minWidth: 160 },
  { label: '所属学科', prop: 'summary.mainDiscipline', minWidth: 160 },
  { label: '负责人', prop: 'summary.principalName', minWidth: 110 },
  { label: '负责人手机号', prop: 'summary.principalPhone', minWidth: 140 },
  { label: '联系人', prop: 'summary.contactPerson', minWidth: 110 },
  { label: '联系电话', prop: 'summary.contactPhone', minWidth: 140 }
]

const data = reactive({
  currentUser: {},
  schools: [],
  organizations: [],
  scope: {
    institutionType: '学校',
    schoolId: null,
    organizationId: null
  },
  selectedScope: null,
  scopeDialogVisible: false,
  info: {},
  editingSectionKey: '',
  editForm: {},
  options: {
    competentDepartment: [],
    mainDiscipline: [],
    relatedDisciplines: []
  }
})

try {
  data.currentUser = JSON.parse(localStorage.getItem('xm-user') || '{}')
} catch (_) {
  data.currentUser = {}
}

const canSelectScope = computed(() => ['SUPER_ADMIN', 'SCHOOL_ADMIN'].includes(data.currentUser.role))
const shouldShowMaintenance = computed(() => !canSelectScope.value || !!data.selectedScope)
const scopeDialogTitle = computed(() => data.selectedScope ? `维护 ${data.selectedScope.institutionName}` : '机构基本信息维护')

const filteredOrganizations = computed(() => {
  return (data.organizations || []).filter((organization) => {
    if (data.scope.schoolId && String(organization.schoolId) !== String(data.scope.schoolId)) return false
    if (data.scope.institutionType !== '学校' && organization.laboratoryHierarchy !== data.scope.institutionType) return false
    return true
  })
})

const sections = computed(() => [
  {
    key: 'intro',
    title: '1. 机构简介',
    editable: true,
    items: [
      { label: '机构名称', prop: 'institutionName' },
      { label: '机构类型', prop: 'institutionType', type: 'select' },
      { label: '英文名称', prop: 'englishName' },
      { label: '研究类型', prop: 'researchType' },
      { label: '学术片', prop: 'academicField' },
      { label: '机构代码', prop: 'institutionCode' },
      { label: '成立时间', prop: 'establishmentDate' },
      { label: '所属学校', prop: 'schoolId', type: 'school-select', hideForSchool: true }
    ]
  },
  {
    key: 'construction',
    title: '2. 机构建设与主管信息',
    editable: true,
    items: [
      { label: '主管部门', prop: 'competentDepartment', type: 'select' },
      { label: '共建部门', prop: 'coConstructionDepartment' },
      { label: '学院同级', prop: 'collegeLevel', type: 'radio' },
      { label: '实体机构', prop: 'entityInstitution', type: 'radio' }
    ]
  },
  {
    key: 'discipline',
    title: '3. 学科与方向',
    editable: true,
    items: [
      { label: '所属学科', prop: 'mainDiscipline', type: 'cascader', full: true },
      { label: '涉及学科', prop: 'relatedDisciplines', type: 'tree-select', full: true }
    ]
  },
  {
    key: 'leaders',
    title: '4. 主要负责人',
    editable: true,
    items: [
      { label: '负责人', prop: 'principalName' },
      { label: '负责人手机号', prop: 'principalPhone' },
      { label: '负责人助理', prop: 'directorAssistant' },
      { label: '行政秘书', prop: 'administrativeSecretary' },
      { label: '资料管理员', prop: 'dataManager' }
    ]
  },
  {
    key: 'contact',
    title: '5. 通讯方式',
    editable: true,
    items: [
      { label: '联系人', prop: 'contactPerson' },
      { label: '联系电话', prop: 'contactPhone' },
      { label: '传真', prop: 'fax' },
      { label: '手机', prop: 'mobile' },
      { label: '联系邮箱', prop: 'email' },
      { label: '网站地址', prop: 'website' },
      { label: '所在省市', prop: 'province' },
      { label: '邮政编码', prop: 'postalCode' },
      { label: '通讯地址', prop: 'address', full: true }
    ]
  }
])

const normalizeInfo = (raw = {}) => {
  const normalized = {}
  Object.keys(fieldMap).forEach((key) => {
    normalized[key] = raw[key] ?? raw[fieldMap[key]] ?? ''
  })
  if (raw.id) normalized.id = raw.id
  normalized.schoolId = raw.schoolId ?? raw.school_id ?? normalized.schoolId
  normalized.organizationId = raw.organizationId ?? raw.organization_id ?? normalized.organizationId
  normalized.laboratoryId = raw.laboratoryId ?? raw.laboratory_id ?? normalized.organizationId
  normalized.institutionType = raw.institutionType ?? raw.institution_type ?? raw.institutionCategory ?? raw.institution_category ?? normalized.institutionType
  normalized.principalName = raw.principalName ?? raw.principal_name ?? raw.baseDirector ?? raw.base_director ?? normalized.principalName
  normalized.principalPhone = raw.principalPhone ?? raw.principal_phone ?? raw.baseDirectorPhone ?? raw.base_director_phone ?? normalized.principalPhone
  
  if (normalized.relatedDisciplines && typeof normalized.relatedDisciplines === 'string') {
    try {
      normalized.relatedDisciplines = JSON.parse(normalized.relatedDisciplines)
    } catch (e) {
      normalized.relatedDisciplines = normalized.relatedDisciplines.split(',').filter(Boolean)
    }
  } else if (!normalized.relatedDisciplines) {
    normalized.relatedDisciplines = []
  }

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
  request.get('/institutionBasic/current', { params: getScopeParams() }).then(res => {
    if (res.code === '200') {
      data.info = normalizeInfo(res.data || {})
      data.scope.institutionType = data.info.institutionType || data.scope.institutionType
      data.scope.schoolId = data.info.schoolId || data.scope.schoolId
      data.scope.organizationId = data.info.organizationId || data.scope.organizationId
    } else {
      ElMessage.error(res.msg || '获取机构基本信息失败')
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
  data.scope.institutionType = '学校'
  data.scope.organizationId = null
}

const loadScopeOptions = () => {
  if (!canSelectScope.value) {
    return getSchools().then(res => {
      data.schools = res || []
    }).catch(() => {})
  }
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

const loadOptions = () => {
  request.get('/institutionBasic/options/competentDepartment').then(res => {
    if (res.code === '200') {
      data.options.competentDepartment = res.data || []
    }
  })
  request.get('/subject/tree').then(res => {
    if (res.code === '200') {
      data.options.mainDiscipline = res.data || []
      data.options.relatedDisciplines = res.data || []
    }
  })
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

const handleScopeTypeChange = () => {
  selectFirstOrganization()
  load()
}

const handleSchoolChange = () => {
  selectFirstOrganization()
  load()
}

const handleTreeChange = (prop, val) => {
  if (!val || !Array.isArray(val)) return;
  const isLeaf = (value, nodes) => {
    for (const node of nodes) {
      if (node.value === value) {
        return !node.children || node.children.length === 0;
      }
      if (node.children && node.children.length > 0) {
        const res = isLeaf(value, node.children);
        if (res !== null) return res;
      }
    }
    return null;
  };
  
  const options = data.options[prop] || [];
  const filtered = val.filter(v => isLeaf(v, options) === true);
  if (filtered.length !== val.length) {
    data.editForm[prop] = filtered;
  }
}

const getItemOptions = (item) => {
  if (item.prop === 'institutionType') return institutionTypes
  return data.options[item.prop]?.length ? data.options[item.prop] : item.options || []
}

const getCurrentInstitutionType = () => {
  if (data.editingSectionKey) {
    return data.editForm.institutionType || data.info.institutionType || data.scope.institutionType
  }
  return data.info.institutionType || data.scope.institutionType
}

const getVisibleItems = (section) => {
  return section.items.filter((item) => {
    if (item.hideForSchool && getCurrentInstitutionType() === '学校') return false
    return true
  })
}

const getSchoolName = (schoolId) => {
  return data.schools.find(school => String(school.id) === String(schoolId))?.name || ''
}

const getDisplayValue = (item) => {
  if (item.type === 'school-select') {
    return getSchoolName(data.info[item.prop]) || data.info.affiliatedSchool || ''
  }
  return data.info[item.prop] || ''
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
  if (Array.isArray(submitData.relatedDisciplines)) {
    submitData.relatedDisciplines = JSON.stringify(submitData.relatedDisciplines)
  }
  submitData.institutionType = submitData.institutionType || data.info.institutionType || data.scope.institutionType
  submitData.schoolId = submitData.schoolId || data.info.schoolId || data.scope.schoolId
  submitData.organizationId = submitData.organizationId || data.info.organizationId || data.scope.organizationId
  submitData.laboratoryId = submitData.organizationId || null
  if (submitData.institutionType === '学校') {
    submitData.organizationId = 0
    submitData.laboratoryId = null
  } else {
    submitData.affiliatedSchool = getSchoolName(submitData.schoolId) || submitData.affiliatedSchool
  }
  submitData.baseDirector = submitData.principalName
  submitData.baseDirectorPhone = submitData.principalPhone
  
  request.put('/institutionBasic/current', submitData, { params: getScopeParams() }).then(res => {
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
  loadOptions()
  loadScopeOptions().then(() => {
    if (!canSelectScope.value) load()
  })
})
</script>

<style scoped>
.institution-basic-page {
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

.warning-text {
  color: #f00;
  font-size: 14px;
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
.info-control :deep(.el-textarea__inner),
.info-control :deep(.el-radio-button__inner) {
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
