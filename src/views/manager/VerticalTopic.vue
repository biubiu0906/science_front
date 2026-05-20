<template>
  <div class="vertical-topic-page">
    <InstitutionScopeList
      v-if="canSelectScope"
      ref="scopeListRef"
      module="verticalTopic"
      action-text="查看课题"
      :columns="scopeColumns"
      @select="openScope"
    />

    <InstitutionMaintenanceDialog
      v-if="shouldShowTopicPanel"
      v-model:visible="data.scopeDialogVisible"
      :dialog="canSelectScope"
      :title="scopeDialogTitle"
      width="min(1280px, 94vw)"
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

      <div class="content-header">
        <div>
          <h2 class="page-title">纵向课题</h2>
          <p class="page-desc">
            依托本机构申请的，由指定科研行政单位立项，并由各级财政预算提供资金支持的研究课题。
          </p>
        </div>
      </div>

      <div class="summary-grid">
        <div class="summary-item">
          <span class="summary-label">课题总数</span>
          <strong>{{ topicSummary.totalCount }}</strong>
        </div>
        <div class="summary-item">
          <span class="summary-label">在研课题</span>
          <strong>{{ topicSummary.activeCount }}</strong>
        </div>
        <div class="summary-item">
          <span class="summary-label">结项课题</span>
          <strong>{{ topicSummary.finishedCount }}</strong>
        </div>
        <div class="summary-item">
          <span class="summary-label">批准经费合计</span>
          <strong>{{ formatFunding(topicSummary.approvedFundingTotal) }} 万元</strong>
        </div>
        <div class="summary-item summary-wide">
          <span class="summary-label">最新课题</span>
          <strong>{{ topicSummary.latestTopicName || '-' }}</strong>
        </div>
      </div>

      <div class="toolbar">
        <div class="toolbar-left">
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
          <el-button :icon="Delete" circle title="删除" @click="handleDeleteBatch" />
          <el-button :icon="Sort" circle title="排序" />
        </div>
        <div class="toolbar-right">
          <el-input
            v-model="data.searchKeyword"
            placeholder="搜索课题名/立项号/负责人/类别"
            :prefix-icon="Search"
            clearable
            style="width: 260px"
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          />
          <el-button :icon="Refresh" circle title="刷新" @click="load" />
        </div>
      </div>

      <el-table
        v-loading="data.loading"
        :data="data.tableData"
        stripe
        @selection-change="handleSelectionChange"
        :header-cell-style="{ backgroundColor: '#f5f7fa', color: '#606266', fontWeight: '600' }"
        class="data-table"
        empty-text="暂无纵向课题"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="serialNumber" label="序号" width="110" />
        <el-table-column prop="topicName" label="课题名" min-width="240" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="topic-name-link" @click="openDetail(row)">{{ row.topicName || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="projectNumber" label="立项号" width="140" show-overflow-tooltip>
          <template #default="{ row }">{{ row.projectNumber || '无' }}</template>
        </el-table-column>
        <el-table-column prop="projectCategory" label="项目类别" min-width="170" show-overflow-tooltip />
        <el-table-column prop="establishmentTime" label="立项时间" width="120" />
        <el-table-column prop="approvedFunding" label="批准经费(万)" width="120" align="right">
          <template #default="{ row }">{{ formatFunding(row.approvedFunding) }}</template>
        </el-table-column>
        <el-table-column prop="topicStatus" label="课题状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.topicStatus)" size="small" round>{{ row.topicStatus || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="leaderName" label="负责人" width="110" show-overflow-tooltip />
        <el-table-column prop="institutionOrder" label="本机构排序" width="110" align="center">
          <template #default="{ row }">{{ row.institutionOrder ?? '-' }}</template>
        </el-table-column>
        <el-table-column prop="attachmentCount" label="附件数" width="90" align="center">
          <template #default="{ row }">
            <el-badge v-if="row.attachmentCount > 0" :value="row.attachmentCount" class="attach-badge" type="primary">
              <el-icon><Paperclip /></el-icon>
            </el-badge>
            <span v-else class="muted">0</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">详情</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="table-footer">
        <div class="selected-info">已选择 {{ data.selectedIds.length }} 项</div>
        <el-pagination
          v-model:current-page="data.pageNum"
          v-model:page-size="data.pageSize"
          :page-sizes="[5, 10, 20, 50, 100]"
          :total="data.total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="load"
          @size-change="handleSizeChange"
        />
      </div>
    </InstitutionMaintenanceDialog>

    <el-dialog
      v-model="data.detailVisible"
      title="纵向课题详情"
      width="760px"
      destroy-on-close
      append-to-body
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="序号">{{ displayValue(data.currentTopic.serialNumber) }}</el-descriptions-item>
        <el-descriptions-item label="立项号">{{ displayValue(data.currentTopic.projectNumber) }}</el-descriptions-item>
        <el-descriptions-item label="课题名" :span="2">{{ displayValue(data.currentTopic.topicName) }}</el-descriptions-item>
        <el-descriptions-item label="项目类别" :span="2">{{ displayValue(data.currentTopic.projectCategory) }}</el-descriptions-item>
        <el-descriptions-item label="立项时间">{{ displayValue(data.currentTopic.establishmentTime) }}</el-descriptions-item>
        <el-descriptions-item label="批准经费">{{ formatFunding(data.currentTopic.approvedFunding) }} 万元</el-descriptions-item>
        <el-descriptions-item label="课题状态">
          <el-tag :type="statusTagType(data.currentTopic.topicStatus)" size="small" round>{{ displayValue(data.currentTopic.topicStatus) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="负责人">{{ displayValue(data.currentTopic.leaderName) }}</el-descriptions-item>
        <el-descriptions-item label="本机构排序">{{ displayValue(data.currentTopic.institutionOrder) }}</el-descriptions-item>
        <el-descriptions-item label="附件数">{{ displayValue(data.currentTopic.attachmentCount) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ displayValue(data.currentTopic.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ displayValue(data.currentTopic.updateTime) }}</el-descriptions-item>
        <el-descriptions-item label="所属机构ID">{{ displayValue(data.currentTopic.laboratoryId) }}</el-descriptions-item>
        <el-descriptions-item label="记录ID">{{ displayValue(data.currentTopic.id) }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="data.detailVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleEdit(data.currentTopic)">编辑</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="data.formVisible"
      :title="data.form.id ? '编辑纵向课题' : '新增纵向课题'"
      width="620px"
      destroy-on-close
      append-to-body
    >
      <el-form ref="formRef" :model="data.form" :rules="rules" label-width="110px" style="padding: 10px 20px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="序号" prop="serialNumber">
              <el-input v-model="data.form.serialNumber" placeholder="如：18863025" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="立项号" prop="projectNumber">
              <el-input v-model="data.form.projectNumber" placeholder="如：VEA250001" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="课题名" prop="topicName">
          <el-input v-model="data.form.topicName" placeholder="请输入课题名称" clearable type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="项目类别" prop="projectCategory">
          <el-input v-model="data.form.projectCategory" placeholder="如：国家社会科学基金重大项目" clearable />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="立项时间" prop="establishmentTime">
              <el-date-picker
                v-model="data.form.establishmentTime"
                type="date"
                placeholder="请选择立项时间"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="批准经费(万)" prop="approvedFunding">
              <el-input-number v-model="data.form.approvedFunding" :min="0" :precision="2" style="width: 100%" placeholder="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="课题状态" prop="topicStatus">
              <el-select v-model="data.form.topicStatus" placeholder="请选择状态" style="width: 100%" clearable>
                <el-option label="在研" value="在研" />
                <el-option label="结项" value="结项" />
                <el-option label="中止" value="中止" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人" prop="leaderName">
              <el-input v-model="data.form.leaderName" placeholder="请输入负责人姓名" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="本机构排序" prop="institutionOrder">
              <el-input-number v-model="data.form.institutionOrder" :min="1" style="width: 100%" placeholder="排序号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="附件数" prop="attachmentCount">
              <el-input-number v-model="data.form.attachmentCount" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="data.formVisible = false">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </template>
    </el-dialog>
  </div>
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
  Sort,
  Search,
  Refresh,
  Paperclip
} from '@element-plus/icons-vue'

const formRef = ref()
const scopeListRef = ref()

const rules = {
  topicName: [{ required: true, message: '请输入课题名', trigger: 'blur' }],
  topicStatus: [{ required: true, message: '请选择课题状态', trigger: 'change' }]
}

const scopeColumns = [
  { label: '课题总数', prop: 'summary.totalCount', width: 100 },
  { label: '在研', prop: 'summary.activeCount', width: 80 },
  { label: '结项', prop: 'summary.finishedCount', width: 80 },
  { label: '批准经费合计', prop: 'summary.approvedFundingTotal', width: 130, suffix: ' 万' },
  { label: '附件数', prop: 'summary.attachmentCount', width: 90 },
  { label: '最新课题', prop: 'summary.latestTopicName', minWidth: 220 },
  { label: '最新立项时间', prop: 'summary.latestEstablishmentTime', width: 130 }
]

const data = reactive({
  currentUser: {},
  selectedScope: null,
  scopeDialogVisible: false,
  tableData: [],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  searchKeyword: '',
  selectedIds: [],
  formVisible: false,
  detailVisible: false,
  loading: false,
  form: {},
  currentTopic: {}
})

try {
  data.currentUser = JSON.parse(localStorage.getItem('xm-user') || '{}')
} catch (_) {
  data.currentUser = {}
}

const canSelectScope = computed(() => ['SUPER_ADMIN', 'SCHOOL_ADMIN'].includes(data.currentUser.role))
const shouldShowTopicPanel = computed(() => !canSelectScope.value || !!data.selectedScope)
const scopeDialogTitle = computed(() => data.selectedScope ? `${data.selectedScope.institutionName} 纵向课题` : '纵向课题')

const currentLaboratoryId = computed(() => {
  if (canSelectScope.value) return data.selectedScope?.organizationId || null
  return data.currentUser.laboratoryId || data.currentUser.id || null
})

const topicSummary = computed(() => {
  const rows = data.tableData || []
  const summary = {
    totalCount: data.total || rows.length,
    activeCount: 0,
    finishedCount: 0,
    approvedFundingTotal: 0,
    attachmentCount: 0,
    latestTopicName: ''
  }
  const sorted = [...rows].sort((a, b) => String(b.establishmentTime || b.createTime || '').localeCompare(String(a.establishmentTime || a.createTime || '')))
  rows.forEach(row => {
    if (row.topicStatus === '在研') summary.activeCount += 1
    if (row.topicStatus === '结项') summary.finishedCount += 1
    summary.approvedFundingTotal += Number(row.approvedFunding || 0)
    summary.attachmentCount += Number(row.attachmentCount || 0)
  })
  summary.latestTopicName = sorted[0]?.topicName || ''
  return summary
})

const getScopeParams = () => {
  const laboratoryId = currentLaboratoryId.value
  return laboratoryId ? { laboratoryId } : {}
}

const load = () => {
  if (canSelectScope.value && !data.selectedScope) return
  data.loading = true
  request.get('/verticalTopic/selectPage', {
    params: {
      ...getScopeParams(),
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      keyword: data.searchKeyword || undefined
    }
  }).then(res => {
    if (res.code === '200') {
      data.tableData = res.data?.list || []
      data.total = res.data?.total || 0
    } else {
      ElMessage.error(res.msg || '加载失败')
    }
  }).finally(() => {
    data.loading = false
  })
}

const openScope = (scope) => {
  data.selectedScope = scope
  data.scopeDialogVisible = true
  data.searchKeyword = ''
  data.pageNum = 1
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
  data.searchKeyword = ''
  data.pageNum = 1
}

const handleSearch = () => {
  data.pageNum = 1
  load()
}

const handleSizeChange = (size) => {
  data.pageSize = size
  data.pageNum = 1
  load()
}

const handleAdd = () => {
  data.form = {
    laboratoryId: currentLaboratoryId.value,
    attachmentCount: 0
  }
  data.formVisible = true
}

const handleEdit = (row) => {
  data.detailVisible = false
  data.form = JSON.parse(JSON.stringify(row))
  if (!data.form.laboratoryId && currentLaboratoryId.value) {
    data.form.laboratoryId = currentLaboratoryId.value
  }
  data.formVisible = true
}

const openDetail = (row) => {
  data.currentTopic = JSON.parse(JSON.stringify(row || {}))
  data.detailVisible = true
}

const save = () => {
  formRef.value.validate(valid => {
    if (!valid) return
    const submitData = { ...data.form }
    if (!submitData.laboratoryId && currentLaboratoryId.value) {
      submitData.laboratoryId = currentLaboratoryId.value
    }
    const api = submitData.id
      ? request.put('/verticalTopic/update', submitData)
      : request.post('/verticalTopic/add', submitData)
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
    request.delete(`/verticalTopic/delete/${id}`).then(res => {
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
    request.delete('/verticalTopic/delete/batch', { data: data.selectedIds }).then(res => {
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

const statusTagType = (status) => {
  if (status === '在研') return 'success'
  if (status === '结项') return 'info'
  return 'warning'
}

const formatFunding = (value) => {
  const num = Number(value || 0)
  return Number.isInteger(num) ? String(num) : num.toFixed(2)
}

const displayValue = (value) => {
  if (value === null || value === undefined || value === '') return '-'
  return value
}

onMounted(() => {
  if (!canSelectScope.value) load()
})
</script>

<style scoped>
.vertical-topic-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

.selected-scope-bar,
.summary-grid,
.toolbar {
  background: #fff;
  border: 1px solid #ebeef5;
}

.selected-scope-bar {
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  margin-bottom: 14px;
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

.content-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
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

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(120px, 1fr)) minmax(220px, 2fr);
  gap: 0;
  margin-bottom: 14px;
}

.summary-item {
  min-height: 78px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding: 14px 18px;
  border-right: 1px solid #ebeef5;
  min-width: 0;
}

.summary-item:last-child {
  border-right: 0;
}

.summary-label {
  font-size: 13px;
  color: #909399;
}

.summary-item strong {
  color: #111827;
  font-size: 18px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  margin-bottom: 0;
  flex-wrap: wrap;
  gap: 8px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.data-table {
  width: 100%;
}

.topic-name-link {
  color: #1677ff;
  cursor: pointer;
  transition: color 0.2s;
}

.topic-name-link:hover {
  color: #0958d9;
  text-decoration: underline;
}

.attach-badge {
  display: inline-flex;
  align-items: center;
}

.attach-badge :deep(.el-badge__content) {
  font-size: 10px;
  height: 16px;
  line-height: 16px;
  padding: 0 4px;
  min-width: 16px;
}

.muted {
  color: #c0c4cc;
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0 0;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-info {
  font-size: 13px;
  color: #1677ff;
  cursor: default;
}

@media (max-width: 1100px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(140px, 1fr));
  }

  .summary-item {
    border-bottom: 1px solid #ebeef5;
  }
}

@media (max-width: 760px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .summary-item {
    border-right: 0;
  }

  .toolbar {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
