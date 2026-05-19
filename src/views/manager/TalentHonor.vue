<template>
  <div class="honor-page">
    <header class="page-heading">
      <h2>人才称号与荣誉</h2>
      <p>本机构人员入选的各类人才支持奖励计划或称号，如院士、长江学者、千人计划人才等</p>
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
      <el-input
        v-model="data.advancedFilters.selectedPerson"
        placeholder="入选人"
        clearable
        @keyup.enter="handleSearch"
      />
      <el-select v-model="data.advancedFilters.category" placeholder="类别" clearable>
        <el-option v-for="category in categoryOptions" :key="category" :label="category" :value="category" />
      </el-select>
      <el-input
        v-model="data.advancedFilters.supportUnit"
        placeholder="申报依托单位"
        clearable
        @keyup.enter="handleSearch"
      />
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
        <el-table-column prop="selectedPerson" label="入选人" width="150" sortable show-overflow-tooltip />
        <el-table-column prop="honorTitle" label="荣誉称号全称" min-width="440" sortable show-overflow-tooltip />
        <el-table-column prop="category" label="类别" width="180" sortable />
        <el-table-column prop="selectedDate" label="入选时间" width="164" sortable />
        <el-table-column prop="supportUnit" label="申报依托单位" min-width="260" show-overflow-tooltip />
        <el-table-column prop="attachmentCount" label="附件数" width="88" align="center" />
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
      :title="data.form.id ? '编辑人才称号与荣誉' : '新增人才称号与荣誉'"
      width="760px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="data.form" :rules="rules" label-width="118px" class="honor-form">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="序号" prop="serialNumber">
              <el-input v-model="data.form.serialNumber" placeholder="请输入序号" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入选人" prop="selectedPerson">
              <el-input v-model="data.form.selectedPerson" placeholder="请输入入选人" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="荣誉称号全称" prop="honorTitle">
          <el-input v-model="data.form.honorTitle" type="textarea" :rows="2" placeholder="请输入荣誉称号全称" clearable />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="类别" prop="category">
              <el-select v-model="data.form.category" placeholder="请选择类别" style="width: 100%" filterable allow-create>
                <el-option v-for="category in categoryOptions" :key="category" :label="category" :value="category" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入选时间" prop="selectedDate">
              <el-date-picker
                v-model="data.form.selectedDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="申报依托单位" prop="supportUnit">
              <el-input v-model="data.form.supportUnit" placeholder="请输入申报依托单位" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="附件数" prop="attachmentCount">
              <el-input-number v-model="data.form.attachmentCount" :min="0" :max="99" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注" prop="summary">
          <el-input v-model="data.form.summary" type="textarea" :rows="3" placeholder="请输入备注" clearable />
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

const categoryOptions = ['院士', '长江学者', '千人计划人才', '国家杰青', '万人计划', '省部级人才', '学会任职', '其他']

const formRef = ref()

const rules = {
  selectedPerson: [{ required: true, message: '请输入入选人', trigger: 'blur' }],
  honorTitle: [{ required: true, message: '请输入荣誉称号全称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择类别', trigger: 'change' }],
  selectedDate: [{ required: true, message: '请选择入选时间', trigger: 'change' }]
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
    selectedPerson: '',
    category: '',
    supportUnit: '',
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
    selectedPerson: row.selectedPerson ?? row.selected_person,
    honorTitle: row.honorTitle ?? row.honor_title,
    category: row.category,
    selectedDate: row.selectedDate ?? row.selected_date,
    supportUnit: row.supportUnit ?? row.support_unit,
    attachmentCount: row.attachmentCount ?? row.attachment_count ?? 0,
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
    selected_person: row.selectedPerson,
    honor_title: row.honorTitle,
    category: row.category,
    selected_date: row.selectedDate,
    support_unit: row.supportUnit,
    attachment_count: Number(row.attachmentCount || 0),
    summary: row.summary
  }
}

const load = () => {
  data.loading = true
  request.get('/talentHonor/selectPage', {
    params: {
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      keyword: data.keyword || undefined,
      selectedPerson: data.advancedFilters.selectedPerson || undefined,
      category: data.advancedFilters.category || undefined,
      supportUnit: data.advancedFilters.supportUnit || undefined,
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
  data.advancedFilters.selectedPerson = ''
  data.advancedFilters.category = ''
  data.advancedFilters.supportUnit = ''
  data.advancedFilters.date = []
  data.pageNum = 1
  load()
}

const handleAdd = () => {
  data.form = {
    category: '其他',
    supportUnit: '-',
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
      ? request.put('/talentHonor/update', payload)
      : request.post('/talentHonor/add', payload)
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
    request.delete(`/talentHonor/delete/${row.id}`).then(res => {
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
    request.delete('/talentHonor/delete/batch', { data: ids }).then(res => {
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
.honor-page {
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
  margin: 0 0 22px;
  color: #1f2329;
  font-size: 22px;
  line-height: 1.2;
  font-weight: 700;
}

.page-heading p {
  margin: 0;
  color: #5f6670;
  font-size: 14px;
  line-height: 1.45;
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

.advanced-panel :deep(.el-select),
.advanced-panel :deep(.el-input) {
  width: 180px;
}

.advanced-panel :deep(.el-date-editor) {
  width: 330px;
}

.table-card {
  height: calc(100vh - 356px);
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

.honor-form {
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
