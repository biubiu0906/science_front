<template>
  <div class="institution-basic-page">
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
            <span v-if="section.key === 'leaders'" class="warning-text">请及时更新基地主任及主任手机号信息</span>
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
            <el-radio-group v-else-if="item.type === 'radio'" v-model="data.editForm[item.prop]">
              <el-radio-button label="是" />
              <el-radio-button label="否" />
            </el-radio-group>
            <el-input
              v-else
              v-model="data.editForm[item.prop]"
              :type="item.full ? 'textarea' : 'text'"
              :rows="item.full ? 2 : undefined"
              clearable
            />
          </div>
          <div v-else class="info-value">{{ data.info[item.prop] || '' }}</div>
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

const sections = [
  {
    key: 'intro',
    title: '1. 机构简介',
    editable: false,
    items: [
      { label: '机构名称', prop: 'institutionName' },
      { label: '英文名称', prop: 'englishName' },
      { label: '研究类型', prop: 'researchType' },
      { label: '学术片', prop: 'academicField' },
      { label: '机构代码', prop: 'institutionCode' },
      { label: '成立时间', prop: 'establishmentDate' },
      { label: '所属高校', prop: 'affiliatedSchool' },
      { label: '机构类别', prop: 'institutionCategory' }
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
      { label: '所属学科', prop: 'mainDiscipline', full: true },
      { label: '涉及学科', prop: 'relatedDisciplines', full: true }
    ]
  },
  {
    key: 'leaders',
    title: '4. 主要负责人',
    editable: true,
    items: [
      { label: '基地主任', prop: 'baseDirector' },
      { label: '基地主任手机号', prop: 'baseDirectorPhone' },
      { label: '主任助理', prop: 'directorAssistant' },
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
]

const data = reactive({
  info: {},
  editingSectionKey: '',
  editForm: {},
  options: {
    competentDepartment: []
  }
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
  request.get('/institutionBasic/current').then(res => {
    if (res.code === '200') {
      data.info = normalizeInfo(res.data || {})
    } else {
      ElMessage.error(res.msg || '获取机构基本信息失败')
    }
  })
}

const loadOptions = () => {
  request.get('/institutionBasic/options/competentDepartment').then(res => {
    if (res.code === '200') {
      data.options.competentDepartment = res.data || []
    }
  })
}

const getItemOptions = (item) => {
  return data.options[item.prop]?.length ? data.options[item.prop] : item.options || []
}

const openEdit = (section) => {
  data.editingSectionKey = section.key
  data.editForm = { ...data.info }
}

const cancelEdit = () => {
  data.editingSectionKey = ''
  data.editForm = {}
}

const saveSection = () => {
  request.put('/institutionBasic/current', data.editForm).then(res => {
    if (res.code === '200') {
      data.info = normalizeInfo(res.data || data.editForm)
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
  loadOptions()
})
</script>

<style scoped>
.institution-basic-page {
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
