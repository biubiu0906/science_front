<template>
  <div class="intellectual-page">
    <div class="intellectual-shell">
      <aside class="property-side">
        <button
          v-for="item in categories"
          :key="item.key"
          type="button"
          class="category-item"
          :class="{ active: data.activeCategoryKey === item.key }"
          @click="switchCategory(item.key)"
        >
          {{ item.name }}
        </button>
      </aside>

      <section class="property-main">
        <header class="page-heading">
          <h2>{{ activeCategory.name }}</h2>
          <p>{{ activeCategory.description }}</p>
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
              placeholder="搜索关键词.."
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
          <el-select v-model="data.advancedFilters.type" placeholder="类型" clearable>
            <el-option v-for="type in activeTypeOptions" :key="type" :label="type" :value="type" />
          </el-select>
          <el-select v-model="data.advancedFilters.status" placeholder="状态" clearable>
            <el-option v-for="status in statusOptions" :key="status" :label="status" :value="status" />
          </el-select>
          <el-input
            v-model="data.advancedFilters.owner"
            :placeholder="ownerColumnLabel"
            clearable
            @keyup.enter="handleSearch"
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
            <el-table-column prop="name" label="名称" min-width="560" sortable show-overflow-tooltip />
            <el-table-column prop="type" label="类型" width="220" sortable show-overflow-tooltip />
            <el-table-column prop="status" label="状态" width="150" sortable />
            <el-table-column prop="owner" :label="ownerColumnLabel" min-width="265" show-overflow-tooltip />
            <el-table-column prop="institutionSignature" label="本机构署名" width="178" sortable />
            <el-table-column prop="attachmentCount" label="附件数" width="86" align="center" />
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
            layout="total, prev, pager, next, sizes"
            background
            @current-change="load"
            @size-change="handleSizeChange"
          />
        </div>
      </section>
    </div>

    <el-dialog
      v-model="data.formVisible"
      :title="data.form.id ? `编辑${activeCategory.name}` : `新增${activeCategory.name}`"
      width="720px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="data.form" :rules="rules" label-width="118px" class="property-form">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="序号" prop="serialNumber">
              <el-input v-model="data.form.serialNumber" placeholder="请输入序号" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类型" prop="type">
              <el-select v-model="data.form.type" placeholder="请选择类型" style="width: 100%">
                <el-option v-for="type in activeTypeOptions" :key="type" :label="type" :value="type" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="名称" prop="name">
          <el-input v-model="data.form.name" type="textarea" :rows="2" placeholder="请输入名称" clearable />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="data.form.status" placeholder="请选择状态" style="width: 100%">
                <el-option v-for="status in statusOptions" :key="status" :label="status" :value="status" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="本机构署名" prop="institutionSignature">
              <el-input v-model="data.form.institutionSignature" placeholder="如：No.1" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="ownerColumnLabel" prop="owner">
          <el-input v-model="data.form.owner" placeholder="请输入权利人或发明人" clearable />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="附件数" prop="attachmentCount">
              <el-input-number v-model="data.form.attachmentCount" :min="0" :max="99" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="授权/登记日期" prop="approvalDate">
              <el-date-picker
                v-model="data.form.approvalDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择日期"
                style="width: 100%"
              />
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
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '@/utils/request.js'
import { ElMessage, ElMessageBox } from '@/utils/element-plus'
import { Delete, Document, Download, Grid, Plus, Refresh, Search, Share } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const categories = [
  {
    key: 'patent',
    name: '专利',
    description: '本机构作为专利申请单位成功取得专利权的发明专利、实用新型专利、外观设计专利'
  },
  {
    key: 'copyright',
    name: '著作权',
    description: '本机构或成员依法取得的软件著作权、作品著作权及其他著作权类成果。'
  }
]

const patentTypeOptions = ['发明专利', '实用新型专利', '外观设计专利']
const copyrightTypeOptions = ['软件著作权', '作品著作权', '其他著作权']
const statusOptions = ['专利生效', '已授权', '登记完成', '申请中']

const formRef = ref()

const rules = {
  serialNumber: [{ required: true, message: '请输入序号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  owner: [{ required: true, message: '请输入权利人或发明人', trigger: 'blur' }]
}

const data = reactive({
  activeCategoryKey: 'patent',
  tableData: [],
  total: 0,
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  selectedRows: [],
  advancedVisible: false,
  advancedFilters: {
    type: '',
    status: '',
    owner: ''
  },
  formVisible: false,
  form: {},
  loading: false
})

const activeCategory = computed(() => {
  return categories.find(item => item.key === data.activeCategoryKey) || categories[0]
})

const activeTypeOptions = computed(() => {
  return data.activeCategoryKey === 'copyright' ? copyrightTypeOptions : patentTypeOptions
})

const ownerColumnLabel = computed(() => {
  return data.activeCategoryKey === 'copyright' ? '著作权人/作者' : '专利权人/发明人'
})

const getValidCategoryKey = (category) => {
  const key = typeof category === 'string' ? category : ''
  return categories.some(item => item.key === key) ? key : 'patent'
}

const normalizeRecord = (row = {}) => {
  return {
    id: row.id,
    laboratoryId: row.laboratoryId ?? row.laboratory_id,
    category: row.category,
    serialNumber: row.serialNumber ?? row.serial_number,
    name: row.name,
    type: row.type,
    status: row.status,
    owner: row.owner,
    institutionSignature: row.institutionSignature ?? row.institution_signature,
    attachmentCount: row.attachmentCount ?? row.attachment_count ?? 0,
    approvalDate: row.approvalDate ?? row.approval_date,
    createTime: row.createTime ?? row.create_time,
    updateTime: row.updateTime ?? row.update_time
  }
}

const toApiPayload = (row = {}) => {
  return {
    id: row.id,
    laboratory_id: row.laboratoryId,
    category: row.category,
    serial_number: row.serialNumber,
    name: row.name,
    type: row.type,
    status: row.status,
    owner: row.owner,
    institution_signature: row.institutionSignature,
    attachment_count: Number(row.attachmentCount || 0),
    approval_date: row.approvalDate
  }
}

const load = () => {
  data.loading = true
  request.get('/intellectualProperty/selectPage', {
    params: {
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      category: data.activeCategoryKey,
      keyword: data.keyword || undefined,
      type: data.advancedFilters.type || undefined,
      status: data.advancedFilters.status || undefined,
      owner: data.advancedFilters.owner || undefined
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

const switchCategory = (key) => {
  if (key === data.activeCategoryKey) return
  router.push(`/manager/intellectualProperty/${key}`)
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
  data.advancedFilters.type = ''
  data.advancedFilters.status = ''
  data.advancedFilters.owner = ''
  data.pageNum = 1
  load()
}

const handleAdd = () => {
  data.form = {
    category: data.activeCategoryKey,
    type: activeTypeOptions.value[0],
    status: data.activeCategoryKey === 'copyright' ? '登记完成' : '专利生效',
    institutionSignature: 'No.1',
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
    data.form.category = data.activeCategoryKey
    const payload = toApiPayload(data.form)
    const api = data.form.id
      ? request.put('/intellectualProperty/update', payload)
      : request.post('/intellectualProperty/add', payload)
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
    request.delete(`/intellectualProperty/delete/${row.id}`).then(res => {
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
    request.delete('/intellectualProperty/delete/batch', { data: ids }).then(res => {
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

watch(() => route.params.category, (category) => {
  const nextCategory = getValidCategoryKey(category)
  if (!category || category !== nextCategory) {
    router.replace(`/manager/intellectualProperty/${nextCategory}`)
    return
  }
  data.activeCategoryKey = nextCategory
  data.pageNum = 1
  data.selectedRows = []
  resetSearch()
}, { immediate: true })
</script>

<style scoped>
.intellectual-page {
  min-height: calc(100vh - 90px);
  background: #fff;
  color: #202124;
  border: 1px solid #ebeef5;
}

.intellectual-shell {
  display: flex;
  min-height: calc(100vh - 90px);
}

.property-side {
  width: 220px;
  flex-shrink: 0;
  padding-top: 16px;
  border-right: 1px solid #edf0f3;
  background: #fff;
}

.category-item {
  width: 100%;
  height: 52px;
  padding: 0 24px;
  border: 0;
  border-right: 4px solid transparent;
  background: transparent;
  color: #4f565f;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
}

.category-item:hover {
  color: #1688ff;
  background: #f4fbff;
}

.category-item.active {
  color: #1688ff;
  background: #e8f7ff;
  border-right-color: #1688ff;
}

.property-main {
  min-width: 0;
  flex: 1;
  padding: 18px 16px 0;
  overflow: hidden;
}

.page-heading {
  padding: 0 2px 14px;
  border-bottom: 1px solid #edf0f3;
}

.page-heading h2 {
  margin: 0 0 10px;
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
  padding: 14px 0;
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

.table-card {
  height: calc(100vh - 356px);
  min-height: 354px;
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

.property-form {
  padding: 10px 20px;
}

@media (max-width: 1280px) {
  .property-side {
    width: 190px;
  }

  .category-item {
    height: 50px;
    padding: 0 24px;
    font-size: 14px;
  }

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
