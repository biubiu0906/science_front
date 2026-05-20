<template>
  <div class="institution-scope-list">
    <div class="scope-filter">
      <el-input
        v-model="query.keyword"
        :prefix-icon="Search"
        placeholder="请输入机构名称/所属学校/账号查询"
        clearable
        style="width: 260px"
        @keyup.enter="search"
        @clear="search"
      />
      <el-select v-model="query.institutionType" placeholder="机构类型" clearable style="width: 140px" @change="search">
        <el-option label="实验室" value="实验室" />
        <el-option label="基地" value="基地" />
        <el-option label="团队" value="团队" />
      </el-select>
      <el-select
        v-if="canFilterSchool"
        v-model="query.schoolId"
        placeholder="所属学校"
        clearable
        filterable
        style="width: 240px"
        @change="search"
      >
        <el-option v-for="school in schools" :key="school.id" :label="school.name" :value="school.id" />
      </el-select>
      <el-button type="info" plain size="small" @click="search">查询</el-button>
      <el-button type="warning" plain size="small" @click="reset">重置</el-button>
      <el-button v-if="canManageScope" type="primary" plain size="small" :icon="Plus" @click="openCreateDialog">新增</el-button>
    </div>

    <div class="scope-table" v-loading="loading" element-loading-text="数据加载中...">
      <el-table
        stripe
        :data="tableData"
        :header-cell-style="{ backgroundColor: '#e9edf2' }"
        class="table-center"
        empty-text="暂无机构"
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" :index="indexMethod" width="70" />
        <el-table-column prop="institutionName" label="机构名称" min-width="220" show-overflow-tooltip />
        <el-table-column prop="institutionType" label="机构类型" width="110">
          <template #default="{ row }">
            <el-tag type="primary">{{ row.institutionType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="schoolName" label="所属学校" min-width="180" show-overflow-tooltip />
        <el-table-column prop="organizationAccount" label="组织账号" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">{{ row.organizationAccount || '-' }}</template>
        </el-table-column>
        <el-table-column
          v-for="(column, index) in props.columns"
          :key="'col-' + index"
          :label="column.label"
          :width="column.width"
          :min-width="column.minWidth || 120"
          show-overflow-tooltip
        >
          <template #default="{ row }">{{ getColumnDisplay(row, column) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="$emit('select', row)">{{ props.actionText }}</el-button>
            <el-button v-if="canDeleteRow(row)" link type="danger" @click="deleteScope(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="scope-pagination" v-if="total">
      <el-pagination
        v-model:current-page="query.pageNum"
        v-model:page-size="query.pageSize"
        :page-sizes="[15, 30, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @current-change="load"
        @size-change="handleSizeChange"
      />
    </div>

    <el-dialog
      v-model="createDialogVisible"
      title="新增机构"
      width="520px"
      destroy-on-close
      append-to-body
    >
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="92px" style="padding: 10px 18px">
        <el-form-item label="机构类型" prop="institutionType">
          <el-select v-model="createForm.institutionType" style="width: 100%" @change="handleCreateTypeChange">
            <el-option label="实验室" value="实验室" />
            <el-option label="基地" value="基地" />
            <el-option label="团队" value="团队" />
          </el-select>
        </el-form-item>
        <el-form-item label="组织名称" prop="name">
          <el-input v-model="createForm.name" clearable placeholder="请输入组织名称" />
        </el-form-item>
        <el-form-item label="所属学校" prop="schoolId">
          <el-select v-model="createForm.schoolId" filterable style="width: 100%" placeholder="请选择所属学校" :disabled="user.role === 'SCHOOL_ADMIN'">
            <el-option v-for="school in schools" :key="school.id" :label="school.name" :value="school.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="组织账号" prop="username">
          <el-input v-model="createForm.username" clearable placeholder="请输入组织账号" />
        </el-form-item>
        <el-form-item label="登录密码" prop="password">
          <el-input v-model="createForm.password" type="password" show-password clearable placeholder="请输入登录密码" />
        </el-form-item>
        <el-form-item label="组织描述">
          <el-input v-model="createForm.laboratoryDescription" type="textarea" :rows="2" clearable placeholder="请输入组织描述" />
        </el-form-item>
        <el-form-item label="组织地址">
          <el-input v-model="createForm.laboratoryAddress" type="textarea" :rows="2" clearable placeholder="请输入组织地址" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingScope" @click="saveScope">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import request from '@/utils/request.js'
import { ElMessage, ElMessageBox } from '@/utils/element-plus'
import { getSchools } from '@/utils/dict.js'
import { encrypt, getSecurityParams } from '@/utils/rsa.js'

const props = defineProps({
  actionText: {
    type: String,
    default: '维护'
  },
  module: {
    type: String,
    default: ''
  },
  columns: {
    type: Array,
    default: () => []
  }
})

defineEmits(['select'])

const user = (() => {
  try {
    return JSON.parse(localStorage.getItem('xm-user') || '{}')
  } catch (_) {
    return {}
  }
})()

const schools = ref([])
const tableData = ref([])
const total = ref(0)
const loading = ref(false)
const createDialogVisible = ref(false)
const createFormRef = ref()
const savingScope = ref(false)

const query = reactive({
  keyword: '',
  institutionType: '',
  schoolId: null,
  pageNum: 1,
  pageSize: 15
})

const createForm = reactive({
  institutionType: '实验室',
  name: '',
  schoolId: null,
  username: '',
  password: '',
  laboratoryDescription: '',
  laboratoryAddress: ''
})

const canFilterSchool = computed(() => user.role === 'SUPER_ADMIN')
const canManageScope = computed(() => user.role === 'SUPER_ADMIN' || user.role === 'SCHOOL_ADMIN')

const createRules = computed(() => {
  const rules = {
    institutionType: [{ required: true, message: '请选择机构类型', trigger: 'change' }],
    name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
  }
  rules.schoolId = [{ required: true, message: '请选择所属学校', trigger: 'change' }]
  rules.username = [
    { required: true, message: '请输入组织账号', trigger: 'blur' },
    { min: 3, max: 20, message: '账号长度在 3 到 20 个字符', trigger: 'blur' }
  ]
  rules.password = [
    { required: true, message: '请输入登录密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
  return rules
})

const indexMethod = (index) => {
  return (query.pageNum - 1) * query.pageSize + index + 1
}

const getByPath = (row, path) => {
  return String(path || '').split('.').reduce((target, key) => {
    if (!target) return undefined
    return target[key] ?? target[key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)]
  }, row)
}

const getColumnDisplay = (row, column) => {
  const value = getByPath(row, column.prop)
  if (value === null || value === undefined || value === '') return column.emptyText || '-'
  return column.suffix ? `${value}${column.suffix}` : value
}

const normalizeRow = (raw = {}) => {
  const summary = raw.summary || {}
  return {
    scopeKey: raw.scopeKey ?? raw.scope_key,
    institutionType: raw.institutionType ?? raw.institution_type,
    schoolId: raw.schoolId ?? raw.school_id,
    schoolName: raw.schoolName ?? raw.school_name,
    organizationId: raw.organizationId ?? raw.organization_id,
    organizationName: raw.organizationName ?? raw.organization_name,
    organizationAccount: raw.organizationAccount ?? raw.organization_account,
    institutionName: raw.institutionName ?? raw.institution_name,
    summary
  }
}

const loadSchools = () => {
  return getSchools().then(data => {
    schools.value = data || []
    if (user.role === 'SCHOOL_ADMIN') {
      query.schoolId = user.schoolId || schools.value[0]?.id || null
    }
  }).catch(() => {})
}

const load = () => {
  loading.value = true
  request.get('/institutionScope/selectPage', {
    params: {
      pageNum: query.pageNum,
      pageSize: query.pageSize,
      keyword: query.keyword || undefined,
      institutionType: query.institutionType || undefined,
      schoolId: query.schoolId || undefined,
      module: props.module || undefined
    }
  }).then(res => {
    if (res.code === '200') {
      tableData.value = (res.data?.list || []).map(normalizeRow)
      total.value = res.data?.total || 0
    } else {
      ElMessage.error(res.msg || '加载机构列表失败')
    }
  }).finally(() => {
    loading.value = false
  })
}

const search = () => {
  query.pageNum = 1
  load()
}

const reset = () => {
  query.keyword = ''
  query.institutionType = ''
  query.schoolId = user.role === 'SCHOOL_ADMIN' ? (user.schoolId || schools.value[0]?.id || null) : null
  query.pageNum = 1
  load()
}

const handleSizeChange = (size) => {
  query.pageSize = size
  query.pageNum = 1
  load()
}

const resetCreateForm = () => {
  createForm.institutionType = query.institutionType || '实验室'
  createForm.name = ''
  createForm.schoolId = user.role === 'SCHOOL_ADMIN' ? (user.schoolId || schools.value[0]?.id || null) : (query.schoolId || null)
  createForm.username = ''
  createForm.password = ''
  createForm.laboratoryDescription = ''
  createForm.laboratoryAddress = ''
}

const openCreateDialog = () => {
  resetCreateForm()
  createDialogVisible.value = true
}

const handleCreateTypeChange = () => {
  if (!createForm.schoolId) {
    createForm.schoolId = user.role === 'SCHOOL_ADMIN' ? (user.schoolId || schools.value[0]?.id || null) : (query.schoolId || schools.value[0]?.id || null)
  }
}

const saveScope = () => {
  createFormRef.value?.validate(async valid => {
    if (!valid) return
    savingScope.value = true
    try {
      const addData = {
        laboratoryName: createForm.name,
        laboratoryHierarchy: createForm.institutionType,
        schoolId: createForm.schoolId,
        username: createForm.username,
        password: await encrypt(createForm.password),
        laboratoryDescription: createForm.laboratoryDescription,
        laboratoryAddress: createForm.laboratoryAddress
      }
      Object.assign(addData, await getSecurityParams())
      const res = await request.post('/laboratory/add', addData)
      if (res.code !== '200') throw new Error(res.msg || '新增组织失败')
      ElMessage.success('新增成功')
      createDialogVisible.value = false
      query.pageNum = 1
      load()
    } catch (e) {
      ElMessage.error(e.message || '新增失败')
    } finally {
      savingScope.value = false
    }
  })
}

const canDeleteRow = (row) => {
  if (!canManageScope.value) return false
  if (user.role === 'SCHOOL_ADMIN' && String(row.schoolId) !== String(user.schoolId)) return false
  return true
}

const deleteScope = (row) => {
  ElMessageBox.confirm(`删除组织后数据无法恢复，您确定删除“${row.institutionName}”吗？`, '删除确认', {
    type: 'warning',
    buttonSize: 'small'
  }).then(async () => {
    const res = await request.delete(`/laboratory/delete/${row.organizationId}`)
    if (res.code === '200') {
      ElMessage.success('删除成功')
      if (tableData.value.length === 1 && query.pageNum > 1) query.pageNum -= 1
      load()
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  loading.value = true
  loadSchools().finally(load)
})

defineExpose({
  load,
  search
})
</script>

<style scoped>
.institution-scope-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.scope-filter,
.scope-table,
.scope-pagination {
  background: #fff;
  border: 1px solid #ebeef5;
}

.scope-filter {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 14px 16px;
}

.scope-table {
  padding: 0;
  width: 100%;
  min-height: 540px;
}

.scope-pagination {
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px;
}
</style>
