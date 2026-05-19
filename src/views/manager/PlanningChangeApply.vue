<template>
  <div class="change-page">
    <header class="page-heading">
      <h2>变更申请</h2>
      <p>
        对于已经成功立项的基地重大项目，您可以根据需要提交变更申请。根据基地重大项目管理规定，系统将为不同类型的变更申请确定【审核级别】，需由相应的主管部门逐级审核。
        当变更申请被终审批准后，请您点击【执行变更】按钮将此变更申请信息合并到项目数据中，以最终完成项目的变更。在最终点击【执行变更】前，您可以随时撤销变更申请，或对被驳回的申请进行修改并重新提交。
      </p>
    </header>

    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="primary" :icon="Plus" @click="handleAdd">发起变更申请</el-button>
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
      </div>
    </div>

    <div v-show="data.advancedVisible" class="advanced-panel">
      <el-select v-model="data.advancedFilters.changeType" placeholder="变更类型" clearable>
        <el-option v-for="type in changeTypeOptions" :key="type" :label="type" :value="type" />
      </el-select>
      <el-select v-model="data.advancedFilters.status" placeholder="申请状态" clearable>
        <el-option v-for="status in statusOptions" :key="status" :label="status" :value="status" />
      </el-select>
      <el-select v-model="data.advancedFilters.nextStep" placeholder="下一个环节" clearable>
        <el-option v-for="step in nextStepOptions" :key="step" :label="step" :value="step" />
      </el-select>
      <el-date-picker
        v-model="data.advancedFilters.date"
        type="datetimerange"
        range-separator="至"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        value-format="YYYY-MM-DD HH:mm:ss"
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
        <el-table-column prop="projectCode" label="立项编号" width="150" show-overflow-tooltip />
        <el-table-column prop="projectName" label="项目名称" min-width="420" show-overflow-tooltip />
        <el-table-column prop="changeType" label="变更类型" width="190" show-overflow-tooltip />
        <el-table-column prop="changeReason" label="变更理由" width="220" show-overflow-tooltip>
          <template #default="{ row }">{{ row.changeReason || '-' }}</template>
        </el-table-column>
        <el-table-column prop="applyTime" label="变更申请时间" width="240" sortable>
          <template #default="{ row }">{{ formatDateTime(row.applyTime) }}</template>
        </el-table-column>
        <el-table-column prop="nextStep" label="下一个环节" width="180" fixed="right">
          <template #default="{ row }">{{ row.nextStep || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
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

    <el-dialog v-model="data.formVisible" title="发起变更申请" width="820px" destroy-on-close>
      <el-form ref="formRef" :model="data.form" :rules="rules" label-width="118px" class="change-form">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="序号" prop="serialNumber">
              <el-input v-model="data.form.serialNumber" placeholder="请输入序号" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="立项编号" prop="projectCode">
              <el-input v-model="data.form.projectCode" placeholder="请输入立项编号" clearable />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="项目名称" prop="projectName">
          <el-input v-model="data.form.projectName" placeholder="请输入项目名称" clearable />
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="变更类型" prop="changeType">
              <el-select v-model="data.form.changeType" placeholder="请选择变更类型" clearable style="width: 100%">
                <el-option v-for="type in changeTypeOptions" :key="type" :label="type" :value="type" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="审核级别" prop="auditLevel">
              <el-select v-model="data.form.auditLevel" placeholder="请选择审核级别" clearable style="width: 100%">
                <el-option label="实验室审核" value="实验室审核" />
                <el-option label="学校审核" value="学校审核" />
                <el-option label="主管部门审核" value="主管部门审核" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="变更理由" prop="changeReason">
          <el-input v-model="data.form.changeReason" type="textarea" :rows="3" placeholder="请输入变更理由" clearable />
        </el-form-item>
        <el-form-item label="变更内容" prop="changeContent">
          <el-input v-model="data.form.changeContent" type="textarea" :rows="4" placeholder="请输入具体变更内容" clearable />
        </el-form-item>
        <el-form-item label="备注" prop="summary">
          <el-input v-model="data.form.summary" type="textarea" :rows="2" placeholder="请输入备注" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="data.formVisible = false">取 消</el-button>
        <el-button type="primary" @click="save">提 交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="data.detailVisible" title="变更申请详情" width="820px" destroy-on-close>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="序号">{{ data.current.serialNumber || '-' }}</el-descriptions-item>
        <el-descriptions-item label="立项编号">{{ data.current.projectCode || '-' }}</el-descriptions-item>
        <el-descriptions-item label="项目名称" :span="2">{{ data.current.projectName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="变更类型">{{ data.current.changeType || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审核级别">{{ data.current.auditLevel || '-' }}</el-descriptions-item>
        <el-descriptions-item label="申请状态">{{ data.current.status || '-' }}</el-descriptions-item>
        <el-descriptions-item label="下一个环节">{{ data.current.nextStep || '-' }}</el-descriptions-item>
        <el-descriptions-item label="申请时间" :span="2">{{ formatDateTime(data.current.applyTime) }}</el-descriptions-item>
        <el-descriptions-item label="变更理由" :span="2">{{ data.current.changeReason || '-' }}</el-descriptions-item>
        <el-descriptions-item label="变更内容" :span="2">{{ data.current.changeContent || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ data.current.summary || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import request from '@/utils/request.js'
import { ElMessage } from '@/utils/element-plus'
import { Plus, Refresh, Search } from '@element-plus/icons-vue'

const formRef = ref()

const changeTypeOptions = ['项目预算', '(计划)结项时间', '负责人变更', '研究内容变更', '项目名称变更', '其他']
const statusOptions = ['已提交', '审核中', '审核通过', '已驳回', '已撤销', '已合并']
const nextStepOptions = ['待审核', '学校审核', '主管部门审核', '执行变更', '已合并']

const rules = {
  projectCode: [{ required: true, message: '请输入立项编号', trigger: 'blur' }],
  projectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  changeType: [{ required: true, message: '请选择变更类型', trigger: 'change' }],
  changeReason: [{ required: true, message: '请输入变更理由', trigger: 'blur' }]
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
    changeType: '',
    status: '',
    nextStep: '',
    date: []
  },
  formVisible: false,
  detailVisible: false,
  form: {},
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
    changeType: row.changeType ?? row.change_type,
    changeReason: row.changeReason ?? row.change_reason,
    changeContent: row.changeContent ?? row.change_content,
    applyTime: row.applyTime ?? row.apply_time,
    auditLevel: row.auditLevel ?? row.audit_level,
    nextStep: row.nextStep ?? row.next_step,
    status: row.status,
    merged: row.merged,
    summary: row.summary,
    createTime: row.createTime ?? row.create_time,
    updateTime: row.updateTime ?? row.update_time
  }
}

const toApiPayload = (row = {}) => {
  return {
    id: row.id,
    laboratory_id: row.laboratoryId,
    serial_number: row.serialNumber,
    project_code: row.projectCode,
    project_name: row.projectName,
    change_type: row.changeType,
    change_reason: row.changeReason,
    change_content: row.changeContent,
    audit_level: row.auditLevel,
    summary: row.summary
  }
}

const formatDateTime = (value) => {
  if (!value) return '-'
  if (Array.isArray(value)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = value
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`
  }
  return String(value).replace('T', ' ')
}

const load = () => {
  data.loading = true
  request.get('/planningChangeApply/selectPage', {
    params: {
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      keyword: data.keyword || undefined,
      changeType: data.advancedFilters.changeType || undefined,
      status: data.advancedFilters.status || undefined,
      nextStep: data.advancedFilters.nextStep || undefined,
      startTime: data.advancedFilters.date?.[0] || undefined,
      endTime: data.advancedFilters.date?.[1] || undefined
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
  data.advancedFilters.changeType = ''
  data.advancedFilters.status = ''
  data.advancedFilters.nextStep = ''
  data.advancedFilters.date = []
  data.pageNum = 1
  load()
}

const handleAdd = () => {
  data.form = {
    auditLevel: '学校审核'
  }
  data.formVisible = true
}

const handleView = (row) => {
  data.current = JSON.parse(JSON.stringify(row))
  data.detailVisible = true
}

const save = () => {
  formRef.value.validate(valid => {
    if (!valid) return
    request.post('/planningChangeApply/add', toApiPayload(data.form)).then(res => {
      if (res.code === '200') {
        ElMessage.success('提交成功')
        data.formVisible = false
        load()
      } else {
        ElMessage.error(res.msg || '提交失败')
      }
    })
  })
}

load()
</script>

<style scoped>
.change-page {
  min-height: calc(100vh - 90px);
  padding: 0 16px;
  background: #fff;
  color: #202124;
  border: 1px solid #ebeef5;
}

.page-heading {
  padding: 24px 0 26px;
  border-bottom: 1px solid #edf0f3;
}

.page-heading h2 {
  margin: 0 0 20px;
  color: #1f2329;
  font-size: 22px;
  line-height: 1.2;
  font-weight: 700;
}

.page-heading p {
  max-width: 1500px;
  margin: 0;
  color: #4f5965;
  font-size: 15px;
  line-height: 1.8;
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
  min-width: 156px;
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
  width: 390px;
}

.table-card {
  height: calc(100vh - 394px);
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

.change-form {
  padding: 10px 20px;
}

@media (max-width: 1280px) {
  .page-heading h2 {
    font-size: 20px;
  }

  .toolbar,
  .advanced-panel {
    flex-wrap: wrap;
  }

  .toolbar-right {
    margin-left: auto;
  }
}
</style>
