<template>
  <div class="summary-page">
    <header class="page-heading">
      <h2>实验室总结</h2>
    </header>

    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
        <el-tooltip content="批量导入" placement="bottom" effect="light">
          <el-button :icon="Document" @click="handleTodo('批量导入')" />
        </el-tooltip>
        <el-tooltip content="批量删除" placement="bottom" effect="light">
          <el-button :icon="Delete" @click="deleteSelected" />
        </el-tooltip>
        <el-tooltip content="流程设置" placement="bottom" effect="light">
          <el-button :icon="Share" @click="handleTodo('流程设置')" />
        </el-tooltip>
      </div>

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
        <el-tooltip content="列设置" placement="bottom" effect="light">
          <el-button :icon="Grid" @click="handleTodo('列设置')" />
        </el-tooltip>
        <el-tooltip content="导出" placement="bottom" effect="light">
          <el-button :icon="Download" @click="handleTodo('导出')" />
        </el-tooltip>
        <el-tooltip content="报表" placement="bottom" effect="light">
          <el-button :icon="Document" @click="handleTodo('报表')" />
        </el-tooltip>
      </div>
    </div>

    <div v-show="data.advancedVisible" class="advanced-panel">
      <el-select v-model="data.advancedFilters.summaryPeriod" placeholder="总结周期" clearable>
        <el-option v-for="period in summaryPeriodOptions" :key="period" :label="period" :value="period" />
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
        <el-table-column prop="summaryTitle" label="总结标题" min-width="720" sortable show-overflow-tooltip />
        <el-table-column prop="writtenDate" label="撰写时间" width="164" sortable />
        <el-table-column prop="summaryPeriod" label="总结周期" width="164" sortable />
        <el-table-column prop="attachmentCount" label="附件数" width="88" align="center">
          <template #default="{ row }">{{ formatAttachment(row.attachmentCount) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="146" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="primary" @click="handleDelete(row)">删除</el-button>
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
        layout="total, prev, pager, next, sizes, jumper"
        background
        @current-change="load"
        @size-change="handleSizeChange"
      />
    </div>

    <el-dialog
      v-model="data.formVisible"
      :title="data.form.id ? '编辑实验室总结' : '新增实验室总结'"
      width="760px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="data.form" :rules="rules" label-width="118px" class="summary-form">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="序号" prop="serialNumber">
              <el-input v-model="data.form.serialNumber" placeholder="请输入序号" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="撰写时间" prop="writtenDate">
              <el-date-picker
                v-model="data.form.writtenDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="总结标题" prop="summaryTitle">
          <el-input v-model="data.form.summaryTitle" type="textarea" :rows="2" placeholder="请输入总结标题" clearable />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="总结周期" prop="summaryPeriod">
              <el-select v-model="data.form.summaryPeriod" placeholder="请选择总结周期" style="width: 100%" filterable allow-create>
                <el-option v-for="period in summaryPeriodOptions" :key="period" :label="period" :value="period" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="附件数" prop="attachmentCount">
              <el-input-number v-model="data.form.attachmentCount" :min="0" :max="99" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="总结内容" prop="content">
          <el-input v-model="data.form.content" type="textarea" :rows="5" placeholder="请输入总结内容" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="data.formVisible = false">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import request from '@/utils/request.js'
import { ElMessage, ElMessageBox } from '@/utils/element-plus'
import { Delete, Document, Download, Grid, Plus, Refresh, Search, Share } from '@element-plus/icons-vue'

const summaryPeriodOptions = ['年度总结', '半年度总结', '季度总结', '月度总结', '十三五总结', '十四五总结', '其他']

const formRef = ref()

const rules = {
  summaryTitle: [{ required: true, message: '请输入总结标题', trigger: 'blur' }],
  writtenDate: [{ required: true, message: '请选择撰写时间', trigger: 'change' }],
  summaryPeriod: [{ required: true, message: '请选择总结周期', trigger: 'change' }]
}

const data = reactive({
  tableData: [],
  total: 0,
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  selectedRows: [],
  advancedVisible: false,
  advancedFilters: {
    summaryPeriod: '',
    date: []
  },
  formVisible: false,
  form: {},
  loading: false
})

const normalizeRecord = (row = {}) => {
  return {
    id: row.id,
    laboratoryId: row.laboratoryId ?? row.laboratory_id,
    serialNumber: row.serialNumber ?? row.serial_number,
    summaryTitle: row.summaryTitle ?? row.summary_title,
    writtenDate: row.writtenDate ?? row.written_date,
    summaryPeriod: row.summaryPeriod ?? row.summary_period,
    attachmentCount: row.attachmentCount ?? row.attachment_count ?? 0,
    content: row.content,
    createTime: row.createTime ?? row.create_time,
    updateTime: row.updateTime ?? row.update_time
  }
}

const toApiPayload = (row = {}) => {
  return {
    id: row.id,
    laboratory_id: row.laboratoryId,
    serial_number: row.serialNumber,
    summary_title: row.summaryTitle,
    written_date: row.writtenDate,
    summary_period: row.summaryPeriod,
    attachment_count: Number(row.attachmentCount || 0),
    content: row.content
  }
}

const formatAttachment = (count) => {
  const value = Number(count || 0)
  return value > 0 ? value : '-'
}

const load = () => {
  data.loading = true
  request.get('/labSummary/selectPage', {
    params: {
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      keyword: data.keyword || undefined,
      summaryPeriod: data.advancedFilters.summaryPeriod || undefined,
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
  data.advancedFilters.summaryPeriod = ''
  data.advancedFilters.date = []
  data.pageNum = 1
  load()
}

const handleAdd = () => {
  data.form = {
    summaryPeriod: '年度总结',
    attachmentCount: 1
  }
  data.formVisible = true
}

const handleEdit = (row) => {
  data.form = JSON.parse(JSON.stringify(row))
  data.formVisible = true
}

const save = () => {
  formRef.value.validate(valid => {
    if (!valid) return
    const payload = toApiPayload(data.form)
    const api = data.form.id
      ? request.put('/labSummary/update', payload)
      : request.post('/labSummary/add', payload)
    api.then(res => {
      if (res.code === '200') {
        ElMessage.success('操作成功')
        data.formVisible = false
        load()
      } else {
        ElMessage.error(res.msg || '操作失败')
      }
    })
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', { type: 'warning', buttonSize: 'small' }).then(() => {
    request.delete(`/labSummary/delete/${row.id}`).then(res => {
      if (res.code === '200') {
        ElMessage.success('删除成功')
        load()
      } else {
        ElMessage.error(res.msg || '删除失败')
      }
    })
  }).catch(() => {})
}

const deleteSelected = () => {
  if (!data.selectedRows.length) {
    ElMessage.warning('请选择数据')
    return
  }
  const ids = data.selectedRows.map(item => item.id)
  ElMessageBox.confirm(`确定删除已选择的 ${ids.length} 项数据吗？`, '删除确认', { type: 'warning', buttonSize: 'small' }).then(() => {
    request.delete('/labSummary/delete/batch', { data: ids }).then(res => {
      if (res.code === '200') {
        ElMessage.success('删除成功')
        data.selectedRows = []
        load()
      } else {
        ElMessage.error(res.msg || '删除失败')
      }
    })
  }).catch(() => {})
}

const handleTodo = (name) => {
  ElMessage.info(`${name}功能待接入`)
}

load()
</script>

<style scoped>
.summary-page {
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

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-left :deep(.el-button),
.toolbar-right :deep(.el-button) {
  height: 32px;
  margin-left: 0;
  border-radius: 4px;
  font-size: 14px;
}

.toolbar-left :deep(.el-button--primary) {
  min-width: 104px;
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

.summary-form {
  padding: 10px 20px;
}

@media (max-width: 1280px) {
  .page-heading h2 {
    font-size: 20px;
  }

  .toolbar {
    flex-wrap: wrap;
  }

  .toolbar-right {
    margin-left: auto;
  }
}
</style>
