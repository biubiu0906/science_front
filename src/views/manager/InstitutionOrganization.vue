<template>
  <InstitutionScopeList v-if="canSelectScope" ref="scopeListRef" module="organization" :columns="scopeColumns" @select="openScope" />
  <InstitutionMaintenanceDialog
    v-if="shouldShowMaintenance"
    v-model:visible="data.scopeDialogVisible"
    :dialog="canSelectScope"
    :title="scopeDialogTitle"
    @closed="closeScopeDialog"
  >
  <div class="organization-page">
    <!-- 左侧子菜单 -->
    <div class="org-sidebar">
      <el-menu
        :default-active="activeMenu"
        @select="handleMenuSelect"
        class="org-menu"
      >
        <el-menu-item index="academic_committee">学术委员会</el-menu-item>
      </el-menu>
    </div>

    <!-- 右侧内容区 -->
    <div class="org-content">
      <div v-if="canSelectScope && data.selectedScope" class="selected-scope-bar">
        <div>
          <span class="selected-scope-name">{{ data.selectedScope.institutionName }}</span>
          <el-tag size="small" style="margin-left: 8px">{{ data.selectedScope.institutionType }}</el-tag>
          <span class="selected-scope-school">{{ data.selectedScope.schoolName }}</span>
        </div>
        <el-button link type="primary" @click="returnToScopeList">关闭</el-button>
      </div>

      <!-- 标题 & 描述 -->
      <div class="content-header">
        <h2 class="page-title">学术委员会</h2>
        <p class="page-desc">
          负责审议本机构科研远景规划和计划，对较大型学术活动提出建议并推动与促进对外学术交流、科技合作和审议重大研究课题的顾问机构
        </p>
      </div>

      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button type="primary" :icon="Plus" @click="handleAdd">+ 新增</el-button>
          <el-button :icon="Delete" @click="handleDeleteBatch" title="删除" />
          <el-button :icon="RefreshLeft" @click="handleRestore" title="还原" />
          <el-button :icon="Sort" @click="handleSort" title="排序" />
        </div>
        <div class="toolbar-right">
          <el-input
            v-model="data.searchKeyword"
            placeholder="搜索关键词..."
            :prefix-icon="Search"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          />
          <el-button @click="handleAdvancedSearch">高级查询</el-button>
          <el-button :icon="Refresh" @click="load" circle title="刷新" />
          <el-button :icon="Grid" circle title="列设置" />
          <el-button :icon="Download" circle title="导出" />
          <el-button :icon="Upload" circle title="导入" />
        </div>
      </div>

      <!-- 表格 -->
      <el-table
        :data="data.tableData"
        stripe
        @selection-change="handleSelectionChange"
        :header-cell-style="{ backgroundColor: '#f5f7fa', color: '#606266', fontWeight: '600' }"
        class="data-table"
        empty-text="暂无数据"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="序号" width="120" sortable />
        <el-table-column prop="name" label="名称/届次" min-width="200" sortable />
        <el-table-column prop="foundedDate" label="成立时间" width="150" sortable>
          <template #header>
            成立时间 <el-icon style="vertical-align: middle; margin-left: 2px;"><Sort /></el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="expiryDate" label="届满时间" width="150" sortable>
          <template #header>
            届满时间 <el-icon style="vertical-align: middle; margin-left: 2px;"><Sort /></el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="attachmentCount" label="附件数" width="100" align="center">
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

      <!-- 底部：已选 + 分页 -->
      <div class="table-footer">
        <div class="selected-info">已选择 {{ data.selectedIds.length }} 项</div>
        <div class="pagination-wrap">
          <el-pagination
            v-model:current-page="data.pageNum"
            v-model:page-size="data.pageSize"
            :page-sizes="[5, 10, 20, 50, 100]"
            :total="data.total"
            layout="total, sizes, prev, pager, next, jumper"
            background
            @current-change="load"
            @size-change="(size) => (data.pageSize = size, data.pageNum = 1, load())"
          />
        </div>
      </div>
    </div>

    <!-- 新增/编辑 对话框 -->
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
  </div>
  </InstitutionMaintenanceDialog>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import request from '@/utils/request.js'
import { ElMessage, ElMessageBox } from '@/utils/element-plus'
import InstitutionScopeList from '@/components/InstitutionScopeList.vue'
import InstitutionMaintenanceDialog from '@/components/InstitutionMaintenanceDialog.vue'
import {
  Plus,
  Delete,
  RefreshLeft,
  Sort,
  Search,
  Refresh,
  Grid,
  Download,
  Upload
} from '@element-plus/icons-vue'

const activeMenu = ref('academic_committee')

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
  pageSize: 10,
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

const handleMenuSelect = (key) => {
  activeMenu.value = key
}

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

const returnToScopeList = () => {
  if (canSelectScope.value) {
    data.scopeDialogVisible = false
    return
  }
  closeScopeDialog()
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

const handleAdvancedSearch = () => {
  ElMessage.info('高级查询功能待完善')
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

const handleRestore = () => {
  ElMessage.info('还原功能待完善')
}

const handleSort = () => {
  ElMessage.info('排序功能待完善')
}

const handleSelectionChange = (rows) => {
  data.selectedIds = rows.map(r => r.id)
}

onMounted(() => {
  if (!canSelectScope.value) load()
})
</script>

<style scoped>
.organization-page {
  display: flex;
  height: 100%;
  min-height: 0;
  gap: 0;
  background: #f0f2f5;
}

/* 左侧子菜单 */
.org-sidebar {
  width: 120px;
  min-width: 120px;
  background: #fff;
  border-right: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.org-menu {
  border-right: none;
}

.org-menu :deep(.el-menu-item) {
  font-size: 14px;
  padding: 0 16px;
  height: 48px;
  line-height: 48px;
}

.org-menu :deep(.el-menu-item.is-active) {
  color: #1677ff;
  border-right: 2px solid #1677ff;
  background-color: #e8f4ff;
  font-weight: 500;
}

/* 右侧内容区 */
.org-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  padding: 20px 24px;
  overflow: auto;
}

.selected-scope-bar {
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 14px;
  margin-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
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

/* 标题区 */
.content-header {
  margin-bottom: 16px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 8px;
}

.page-desc {
  font-size: 13px;
  color: #606266;
  margin: 0;
  line-height: 1.6;
}

/* 工具栏 */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  flex-wrap: wrap;
  gap: 8px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 表格 */
.data-table {
  flex: 1;
  width: 100%;
}

.data-table :deep(.el-table__header th) {
  background-color: #f5f7fa !important;
}

/* 底部 */
.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-info {
  font-size: 13px;
  color: #1677ff;
  cursor: default;
}

.pagination-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.total-info {
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
}
</style>
