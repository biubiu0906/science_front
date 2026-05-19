<template>
  <div class="exchange-page">
    <div class="exchange-shell">
      <aside class="exchange-side">
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

      <section class="exchange-main">
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
          <el-select v-model="data.advancedFilters.type" :placeholder="typeColumnLabel" clearable>
            <el-option v-for="type in activeTypeOptions" :key="type" :label="type" :value="type" />
          </el-select>
          <el-input
            v-model="data.advancedFilters.participant"
            :placeholder="participantColumnLabel"
            clearable
            @keyup.enter="handleSearch"
          />
          <el-input
            v-model="data.advancedFilters.location"
            :placeholder="locationColumnLabel"
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
            <el-table-column prop="name" :label="nameColumnLabel" min-width="520" sortable show-overflow-tooltip />
            <el-table-column prop="type" :label="typeColumnLabel" width="180" sortable show-overflow-tooltip />
            <el-table-column prop="eventDate" :label="dateColumnLabel" width="164" sortable />
            <el-table-column prop="location" :label="locationColumnLabel" min-width="220" sortable show-overflow-tooltip />
            <el-table-column prop="participant" :label="participantColumnLabel" min-width="220" show-overflow-tooltip />
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
      </section>
    </div>

    <el-dialog
      v-model="data.formVisible"
      :title="data.form.id ? `编辑${activeCategory.name}` : `新增${activeCategory.name}`"
      width="760px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="data.form" :rules="rules" label-width="118px" class="exchange-form">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="序号" prop="serialNumber">
              <el-input v-model="data.form.serialNumber" placeholder="请输入序号" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="typeColumnLabel" prop="type">
              <el-select v-model="data.form.type" placeholder="请选择类型" style="width: 100%" filterable allow-create>
                <el-option v-for="type in activeTypeOptions" :key="type" :label="type" :value="type" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="nameColumnLabel" prop="name">
          <el-input v-model="data.form.name" type="textarea" :rows="2" placeholder="请输入名称" clearable />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item :label="dateColumnLabel" prop="eventDate">
              <el-date-picker
                v-model="data.form.eventDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="locationColumnLabel" prop="location">
              <el-input v-model="data.form.location" placeholder="请输入地点或单位" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item :label="participantColumnLabel" prop="participant">
              <el-input v-model="data.form.participant" placeholder="请输入人员" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主办/承办单位" prop="organizer">
              <el-input v-model="data.form.organizer" placeholder="请输入单位" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
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
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '@/utils/request.js'
import { ElMessage, ElMessageBox } from '@/utils/element-plus'
import { Delete, Document, Download, Grid, Plus, Refresh, Search, Share } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const categories = [
  {
    key: 'hostedConference',
    name: '主办学术会议',
    description: '本机构作为主办/承办方举办的各类国内/国际学术研讨会、论坛、年会等学术会议。'
  },
  { key: 'attendedConference', name: '参加学术会议', description: '本机构成员参加的国内外学术会议、论坛、研讨会等交流活动。' },
  { key: 'internationalActivity', name: '国际交流活动', description: '与境外高校、科研机构、国际组织开展的访问、合作、联合研讨等交流活动。' },
  { key: 'publication', name: '主办刊物', description: '本机构主办、承办或参与建设的学术刊物、辑刊、内刊及连续出版物。' },
  { key: 'lecture', name: '学术讲座', description: '本机构组织开展的专题报告、学术讲座、名家讲坛等活动。' }
]

const typeOptionsMap = {
  hostedConference: ['国际会议', '国内全国性会议', '校内会议', '专题研讨会'],
  attendedConference: ['国际会议', '国内全国性会议', '区域性会议', '专题研讨会'],
  internationalActivity: ['出访交流', '来访交流', '联合研讨', '合作签约'],
  publication: ['学术期刊', '辑刊', '内刊', '会议论文集'],
  lecture: ['专家讲座', '学术报告', '名家讲坛', '工作坊']
}

const formRef = ref()

const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  eventDate: [{ required: true, message: '请选择日期', trigger: 'change' }]
}

const data = reactive({
  activeCategoryKey: 'hostedConference',
  tableData: [],
  total: 0,
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  selectedRows: [],
  advancedVisible: false,
  advancedFilters: {
    type: '',
    participant: '',
    location: '',
    date: []
  },
  formVisible: false,
  form: {},
  loading: false
})

const activeCategory = computed(() => {
  return categories.find(item => item.key === data.activeCategoryKey) || categories[0]
})

const activeTypeOptions = computed(() => {
  return typeOptionsMap[data.activeCategoryKey] || []
})

const nameColumnLabel = computed(() => {
  const map = {
    hostedConference: '会议名称',
    attendedConference: '会议名称',
    internationalActivity: '活动名称',
    publication: '刊物名称',
    lecture: '讲座名称'
  }
  return map[data.activeCategoryKey] || '名称'
})

const typeColumnLabel = computed(() => {
  if (data.activeCategoryKey === 'publication') return '刊物类型'
  if (data.activeCategoryKey === 'lecture') return '讲座类型'
  if (data.activeCategoryKey === 'internationalActivity') return '活动类型'
  return '会议类型'
})

const dateColumnLabel = computed(() => {
  return data.activeCategoryKey === 'publication' ? '出版日期' : '会议时间'
})

const locationColumnLabel = computed(() => {
  const map = {
    publication: '出版单位',
    internationalActivity: '交流地点',
    lecture: '讲座地点'
  }
  return map[data.activeCategoryKey] || '举办地点'
})

const participantColumnLabel = computed(() => {
  const map = {
    hostedConference: '负责人',
    attendedConference: '参会人员',
    internationalActivity: '交流人员',
    publication: '负责人',
    lecture: '主讲人'
  }
  return map[data.activeCategoryKey] || '人员'
})

const getValidCategoryKey = (category) => {
  const key = typeof category === 'string' ? category : ''
  return categories.some(item => item.key === key) ? key : 'hostedConference'
}

const normalizeRecord = (row = {}) => {
  return {
    id: row.id,
    laboratoryId: row.laboratoryId ?? row.laboratory_id,
    category: row.category,
    serialNumber: row.serialNumber ?? row.serial_number,
    name: row.name,
    type: row.type,
    eventDate: row.eventDate ?? row.event_date,
    location: row.location,
    participant: row.participant,
    organizer: row.organizer,
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
    category: row.category,
    serial_number: row.serialNumber,
    name: row.name,
    type: row.type,
    event_date: row.eventDate,
    location: row.location,
    participant: row.participant,
    organizer: row.organizer,
    attachment_count: Number(row.attachmentCount || 0),
    summary: row.summary
  }
}

const load = () => {
  data.loading = true
  request.get('/academicExchange/selectPage', {
    params: {
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      category: data.activeCategoryKey,
      keyword: data.keyword || undefined,
      type: data.advancedFilters.type || undefined,
      participant: data.advancedFilters.participant || undefined,
      location: data.advancedFilters.location || undefined,
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

const switchCategory = (key) => {
  if (key === data.activeCategoryKey) return
  router.push(`/manager/academicExchange/${key}`)
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
  data.advancedFilters.participant = ''
  data.advancedFilters.location = ''
  data.advancedFilters.date = []
  data.pageNum = 1
  load()
}

const handleAdd = () => {
  data.form = {
    category: data.activeCategoryKey,
    type: activeTypeOptions.value[0] || '',
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
      ? request.put('/academicExchange/update', payload)
      : request.post('/academicExchange/add', payload)
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
    request.delete(`/academicExchange/delete/${row.id}`).then(res => {
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
    request.delete('/academicExchange/delete/batch', { data: ids }).then(res => {
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
    router.replace(`/manager/academicExchange/${nextCategory}`)
    return
  }
  data.activeCategoryKey = nextCategory
  data.pageNum = 1
  data.selectedRows = []
  resetSearch()
}, { immediate: true })
</script>

<style scoped>
.exchange-page {
  min-height: calc(100vh - 90px);
  background: #fff;
  color: #202124;
  border: 1px solid #ebeef5;
}

.exchange-shell {
  display: flex;
  min-height: calc(100vh - 90px);
}

.exchange-side {
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

.exchange-main {
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

.advanced-panel :deep(.el-date-editor) {
  width: 330px;
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

.exchange-form {
  padding: 10px 20px;
}

@media (max-width: 1280px) {
  .exchange-side {
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
