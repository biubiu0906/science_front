<template>
  <InstitutionScopeList v-if="canSelectScope" ref="scopeListRef" module="organization" :columns="scopeColumns" @select="openScope" />
  <InstitutionMaintenanceDialog
    v-if="shouldShowMaintenance"
    v-model:visible="data.scopeDialogVisible"
    :dialog="canSelectScope"
    :title="scopeDialogTitle"
    @closed="closeScopeDialog"
  >
    <div class="org-list-page">
      <div class="toolbar">
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
        <el-button :icon="Delete" @click="handleDeleteBatch" title="批量删除" />
        <el-input
          v-model="data.searchKeyword"
          placeholder="搜索关键词..."
          :prefix-icon="Search"
          clearable
          style="width: 200px; margin-left: auto"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-button :icon="Refresh" @click="load" circle title="刷新" />
      </div>

      <el-table
        :data="data.tableData"
        stripe
        @selection-change="handleSelectionChange"
        :header-cell-style="{ backgroundColor: '#f5f7fa', color: '#606266', fontWeight: '600' }"
        empty-text="暂无数据"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="序号" width="100" />
        <el-table-column prop="name" label="名称/届次" min-width="180" />
        <el-table-column prop="foundedDate" label="成立时间" width="140" />
        <el-table-column prop="expiryDate" label="届满时间" width="140" />
        <el-table-column prop="attachmentCount" label="附件数" width="90" align="center">
          <template #default="{ row }">
            {{ row.attachmentCount ?? '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="table-footer">
        <span class="selected-info">已选择 {{ data.selectedIds.length }} 项</span>
        <el-pagination
          v-model:current-page="data.pageNum"
          v-model:page-size="data.pageSize"
          :page-sizes="[15, 30, 50, 100]"
          :total="data.total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="load"
          @size-change="(size) => (data.pageSize = size, data.pageNum = 1, load())"
        />
      </div>
    </div>

    <el-dialog
      v-model="data.formVisible"
      :title="data.form.id ? '编辑学术委员会' : '新增学术委员会'"
      width="480px"
      append-to-body
      destroy-on-close
    >
      <el-form ref="formRef" :model="data.form" :rules="rules" label-width="90px" style="padding: 10px 20px">
        <el-form-item label="名称/届次" prop="name">
          <el-input v-model="data.form.name" placeholder="如：第六届学术委员会" clearable />
        </el-form-item>
        <el-form-item label="成立时间" prop="foundedDate">
          <el-date-picker
            v-model="data.form.foundedDate"
            type="date"
            placeholder="请选择成立时间"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="届满时间" prop="expiryDate">
          <el-date-picker
            v-model="data.form.expiryDate"
            type="date"
            placeholder="请选择届满时间"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="附件数" prop="attachmentCount">
          <el-input-number v-model="data.form.attachmentCount" :min="0" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="data.formVisible = false">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </template>
    </el-dialog>
  </InstitutionMaintenanceDialog>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import request from '@/utils/request.js'
import { ElMessage, ElMessageBox } from '@/utils/element-plus'
import InstitutionScopeList from '@/components/InstitutionScopeList.vue'
import InstitutionMaintenanceDialog from '@/components/InstitutionMaintenanceDialog.vue'
import { Plus, Delete, Search, Refresh } from '@element-plus/icons-vue'

const formRef = ref()
const scopeListRef = ref()
const scopeColumns = [
  { label: '委员会数量', prop: 'summary.committeeCount', minWidth: 110 },
  { label: '最新委员会', prop: 'summary.latestCommitteeName', minWidth: 190 },
  { label: '成立时间', prop: 'summary.foundedDate', minWidth: 120 },
  { label: '届满时间', prop: 'summary.expiryDate', minWidth: 120 },
  { label: '附件总数', prop: 'summary.attachmentCount', minWidth: 100 }
]
const rules = {
  name: [{ required: true, message: '请输入名称/届次', trigger: 'blur' }],
  foundedDate: [{ required: true, message: '请选择成立时间', trigger: 'change' }]
}

const data = reactive({
  currentUser: {},
  selectedScope: null,
  tableData: [],
  pageNum: 1,
  pageSize: 15,
  total: 0,
  searchKeyword: '',
  selectedIds: [],
  scopeDialogVisible: false,
  formVisible: false,
  form: {}
})

try {
  data.currentUser = JSON.parse(localStorage.getItem('xm-user') || '{}')
} catch (_) {
  data.currentUser = {}
}

const canSelectScope = computed(() => ['SUPER_ADMIN', 'SCHOOL_ADMIN'].includes(data.currentUser.role))
const shouldShowMaintenance = computed(() => !canSelectScope.value || !!data.selectedScope)
const scopeDialogTitle = computed(() => data.selectedScope ? `维护 ${data.selectedScope.institutionName}` : '组织建设维护')

const getScopeParams = () => {
  if (!canSelectScope.value || !data.selectedScope) return {}
  return {
    institutionType: data.selectedScope.institutionType,
    schoolId: data.selectedScope.schoolId,
    organizationId: data.selectedScope.organizationId
  }
}

const load = () => {
  request.get('/academicCommittee/selectPage', {
    params: {
      ...getScopeParams(),
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      name: data.searchKeyword || undefined
    }
  }).then(res => {
    if (res.code === '200') {
      data.tableData = res.data?.list || []
      data.total = res.data?.total || 0
    } else {
      ElMessage.error(res.msg || '加载失败')
    }
  })
}

const openScope = (scope) => {
  data.selectedScope = scope
  data.scopeDialogVisible = true
  data.pageNum = 1
  data.tableData = []
  data.total = 0
  data.selectedIds = []
  load()
}

const closeScopeDialog = () => {
  data.selectedScope = null
  data.tableData = []
  data.total = 0
  data.selectedIds = []
  data.formVisible = false
  data.form = {}
}

const handleSearch = () => {
  data.pageNum = 1
  load()
}

const handleAdd = () => {
  data.form = {}
  data.formVisible = true
}

const handleEdit = (row) => {
  data.form = JSON.parse(JSON.stringify(row))
  data.formVisible = true
}

const save = () => {
  formRef.value.validate(valid => {
    if (!valid) return
    const api = data.form.id
      ? request.put('/academicCommittee/update', data.form, { params: getScopeParams() })
      : request.post('/academicCommittee/add', data.form, { params: getScopeParams() })
    api.then(res => {
      if (res.code === '200') {
        ElMessage.success('操作成功')
        data.formVisible = false
        load()
        scopeListRef.value?.load?.()
      } else {
        ElMessage.error(res.msg || '操作失败')
      }
    })
  })
}

const handleDelete = (id) => {
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', {
    type: 'warning',
    buttonSize: 'small'
  }).then(() => {
    request.delete(`/academicCommittee/delete/${id}`).then(res => {
      if (res.code === '200') {
        ElMessage.success('删除成功')
        load()
        scopeListRef.value?.load?.()
      } else {
        ElMessage.error(res.msg || '删除失败')
      }
    })
  }).catch(() => {})
}

const handleDeleteBatch = () => {
  if (!data.selectedIds.length) {
    ElMessage.warning('请先选择要删除的数据')
    return
  }
  ElMessageBox.confirm(`确定删除选中的 ${data.selectedIds.length} 条数据吗？`, '批量删除', {
    type: 'warning',
    buttonSize: 'small'
  }).then(() => {
    request.delete('/academicCommittee/delete/batch', { data: data.selectedIds }).then(res => {
      if (res.code === '200') {
        ElMessage.success('批量删除成功')
        data.selectedIds = []
        load()
        scopeListRef.value?.load?.()
      } else {
        ElMessage.error(res.msg || '删除失败')
      }
    })
  }).catch(() => {})
}

const handleSelectionChange = (rows) => {
  data.selectedIds = rows.map(r => r.id)
}

onMounted(() => {
  if (!canSelectScope.value) load()
})
</script>

<style scoped>
.org-list-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 4px;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-info {
  font-size: 13px;
  color: #1677ff;
}
</style>
