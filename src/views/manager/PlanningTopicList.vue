<template>
  <div class="topic-page">
    <header class="page-heading">
      <h2>课题列表</h2>
    </header>

    <div class="toolbar">
      <div></div>
      <div class="toolbar-right">
        <el-input
          v-model="data.keyword"
          class="keyword-input"
          placeholder="搜索关键词..."
          clearable
          :prefix-icon="Search"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-button class="advanced-btn" @click="data.advancedVisible = !data.advancedVisible">高级查询</el-button>
        <el-tooltip content="刷新" placement="bottom" effect="light">
          <el-button :icon="Refresh" @click="resetSearch" />
        </el-tooltip>
      </div>
    </div>

    <div v-show="data.advancedVisible" class="advanced-panel">
      <el-input v-model="data.advancedFilters.principal" placeholder="负责人" clearable @keyup.enter="handleSearch" />
      <el-select v-model="data.advancedFilters.applicationPeriod" placeholder="申报周期" clearable>
        <el-option v-for="period in applicationPeriodOptions" :key="period" :label="period" :value="period" />
      </el-select>
      <el-select v-model="data.advancedFilters.status" placeholder="状态" clearable>
        <el-option v-for="status in statusOptions" :key="status" :label="status" :value="status" />
      </el-select>
      <el-date-picker
        v-model="data.advancedFilters.date"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
      />
      <el-button type="primary" @click="handleSearch">查询</el-button>
    </div>

    <div class="table-card" v-loading="data.loading">
      <el-table
        :data="data.tableData"
        height="100%"
        border
        stripe
        :header-cell-style="{ backgroundColor: '#f0f0f0', color: '#202124' }"
        @selection-change="handleSelectionChange"
        empty-text="暂无数据"
      >
        <el-table-column type="selection" width="58" fixed="left" />
        <el-table-column prop="serialNumber" label="序号" width="132" fixed="left" />
        <el-table-column prop="projectCode" label="立项编号" min-width="170" show-overflow-tooltip />
        <el-table-column prop="projectName" label="项目名称" min-width="360" show-overflow-tooltip />
        <el-table-column prop="principal" label="负责人" width="150" show-overflow-tooltip />
        <el-table-column prop="applicationPeriod" label="申报周期" width="160" show-overflow-tooltip />
        <el-table-column label="计划研究周期" min-width="300" show-overflow-tooltip>
          <template #default="{ row }">{{ formatResearchPeriod(row) }}</template>
        </el-table-column>
        <el-table-column prop="approvalDate" label="立项日期" width="160" />
        <el-table-column prop="completionDate" label="结项日期" width="160">
          <template #default="{ row }">{{ row.completionDate || '-' }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="140">
          <template #default="{ row }">{{ row.status || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="downloadApplication(row)">下载申请书</el-button>
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="selected-footer">
        已选择 <strong>{{ data.selectedRows.length }}</strong> 项
      </div>
    </div>

    <div class="pagination-row">
      <el-pagination
        v-model:current-page="data.pageNum"
        v-model:page-size="data.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="data.total"
        layout="total, prev, pager, next, sizes"
        background
        @current-change="load"
        @size-change="handleSizeChange"
      />
    </div>

    <el-dialog v-model="data.detailVisible" title="课题详情" width="760px" destroy-on-close>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="立项编号">{{ data.current.projectCode || '-' }}</el-descriptions-item>
        <el-descriptions-item label="负责人">{{ data.current.principal || '-' }}</el-descriptions-item>
        <el-descriptions-item label="项目名称" :span="2">{{ data.current.projectName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="申报周期">{{ data.current.applicationPeriod || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ data.current.status || '-' }}</el-descriptions-item>
        <el-descriptions-item label="计划研究周期" :span="2">{{ formatResearchPeriod(data.current) }}</el-descriptions-item>
        <el-descriptions-item label="立项日期">{{ data.current.approvalDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="结项日期">{{ data.current.completionDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ data.current.summary || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import request from '@/utils/request.js'
import { ElMessage } from '@/utils/element-plus'
import { Refresh, Search } from '@element-plus/icons-vue'

const applicationPeriodOptions = ['十四五', '十三五', '十二五', '十一五', '其他']
const statusOptions = ['在研', '已结项', '已立项', '延期', '终止']

const data = reactive({
  tableData: [],
  total: 0,
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  selectedRows: [],
  advancedVisible: false,
  advancedFilters: {
    principal: '',
    applicationPeriod: '',
    status: '',
    date: []
  },
  detailVisible: false,
  current: {},
  loading: false
})

const normalizeRecord = (row = {}) => {
  return {
    id: row.id,
    laboratoryId: row.laboratoryId ?? row.laboratory_id,
    serialNumber: row.serialNumber ?? row.serial_number,
    projectCode: row.projectCode ?? row.project_code,
    projectName: row.projectName ?? row.project_name,
    principal: row.principal,
    applicationPeriod: row.applicationPeriod ?? row.application_period,
    researchStartDate: row.researchStartDate ?? row.research_start_date,
    researchEndDate: row.researchEndDate ?? row.research_end_date,
    approvalDate: row.approvalDate ?? row.approval_date,
    completionDate: row.completionDate ?? row.completion_date,
    status: row.status,
    applicationFile: row.applicationFile ?? row.application_file,
    summary: row.summary
  }
}

const formatResearchPeriod = (row = {}) => {
  const start = row.researchStartDate || '-'
  const end = row.researchEndDate || '-'
  return start === '-' && end === '-' ? '-' : `${start} ~ ${end}`
}

const load = () => {
  data.loading = true
  request.get('/planningTopicList/selectPage', {
    params: {
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      keyword: data.keyword || undefined,
      principal: data.advancedFilters.principal || undefined,
      applicationPeriod: data.advancedFilters.applicationPeriod || undefined,
      status: data.advancedFilters.status || undefined,
      startDate: data.advancedFilters.date?.[0] || undefined,
      endDate: data.advancedFilters.date?.[1] || undefined
    }
  }).then(res => {
    if (res.code === '200') {
      data.tableData = (res.data?.list || []).map(normalizeRecord)
      data.total = res.data?.total || 0
    } else {
      ElMessage.error(res.msg || '加载失败')
    }
  }).catch(() => {
    data.tableData = []
    data.total = 0
  }).finally(() => {
    data.loading = false
  })
}

const handleSelectionChange = (selection) => {
  data.selectedRows = selection
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

const resetSearch = () => {
  data.keyword = ''
  data.advancedFilters.principal = ''
  data.advancedFilters.applicationPeriod = ''
  data.advancedFilters.status = ''
  data.advancedFilters.date = []
  data.pageNum = 1
  load()
}

const downloadApplication = (row) => {
  if (!row.applicationFile) {
    ElMessage.warning('暂无申请书附件')
    return
  }
  window.open(row.applicationFile, '_blank')
}

const handleView = (row) => {
  data.current = JSON.parse(JSON.stringify(row))
  data.detailVisible = true
}

load()
</script>

<style scoped>
.topic-page {
  min-height: calc(100vh - 90px);
  padding: 0 16px;
  background: #fff;
  color: #202124;
  border: 1px solid #ebeef5;
}

.page-heading {
  padding: 24px 0 24px;
  border-bottom: 1px solid #edf0f3;
}

.page-heading h2 {
  margin: 0;
  color: #1f2329;
  font-size: 22px;
  line-height: 1.2;
  font-weight: 700;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 26px 0 14px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-right :deep(.el-button) {
  height: 32px;
  margin-left: 0;
  border-radius: 4px;
  font-size: 14px;
}

.keyword-input {
  width: 270px;
}

.keyword-input :deep(.el-input__wrapper) {
  height: 32px;
  border-radius: 4px;
}

.advanced-btn {
  min-width: 96px;
}

.advanced-panel {
  display: flex;
  gap: 10px;
  padding: 0 0 14px;
}

.advanced-panel :deep(.el-input),
.advanced-panel :deep(.el-select) {
  width: 180px;
}

.advanced-panel :deep(.el-date-editor) {
  width: 330px;
}

.table-card {
  height: calc(100vh - 312px);
  min-height: 390px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.table-card :deep(.el-table) {
  height: calc(100% - 72px) !important;
  font-size: 14px;
}

.table-card :deep(.el-table__cell) {
  height: 48px;
  padding: 8px 0;
}

.table-card :deep(.el-table th.el-table__cell) {
  font-weight: 700;
}

.table-card :deep(.el-table .cell) {
  line-height: 1.4;
}

.table-card :deep(.el-table__fixed-right) {
  box-shadow: -8px 0 18px rgba(31, 35, 41, 0.14);
}

.table-card :deep(.el-button.is-link) {
  font-size: 14px;
}

.selected-footer {
  min-height: 72px;
  display: flex;
  align-items: center;
  padding: 0 36px;
  color: #1688ff;
  font-size: 14px;
  border-top: 1px solid #e5e7eb;
  background: #fff;
}

.selected-footer strong {
  font-weight: 600;
}

.pagination-row {
  display: flex;
  justify-content: flex-end;
  padding: 24px 8px 0;
}

.pagination-row :deep(.el-pagination) {
  color: #5f6670;
}

@media (max-width: 1280px) {
  .page-heading h2 {
    font-size: 20px;
  }

  .toolbar,
  .advanced-panel {
    flex-wrap: wrap;
  }
}
</style>
