<template>
  <div class="institution-scope-list">
    <div class="scope-filter">
      <el-input
        v-model="query.keyword"
        :prefix-icon="Search"
        placeholder="请输入机构名称/学校/账号查询"
        clearable
        style="width: 260px"
        @keyup.enter="search"
        @clear="search"
      />
      <el-select v-model="query.institutionType" placeholder="机构类型" clearable style="width: 140px" @change="search">
        <el-option label="学校" value="学校" />
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
            <el-tag :type="row.institutionType === '学校' ? 'success' : 'primary'">{{ row.institutionType }}</el-tag>
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
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="$emit('select', row)">{{ props.actionText }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="scope-pagination" v-if="total">
      <el-pagination
        v-model:current-page="query.pageNum"
        v-model:page-size="query.pageSize"
        :page-sizes="[5, 10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @current-change="load"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import request from '@/utils/request.js'
import { ElMessage } from '@/utils/element-plus'
import { getSchools } from '@/utils/dict.js'

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

const query = reactive({
  keyword: '',
  institutionType: '',
  schoolId: null,
  pageNum: 1,
  pageSize: 10
})

const canFilterSchool = computed(() => user.role === 'SUPER_ADMIN')

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
