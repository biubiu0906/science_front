<template>
  <div class="academic-page">
    <div class="academic-shell">
      <aside class="achievement-side">
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

      <section class="achievement-main">
        <template v-if="canSelectScope && !data.selectedScope">
          <header class="page-heading">
            <h2>{{ activeCategory.name }}</h2>
            <p>{{ activeCategory.description }}</p>
          </header>

          <InstitutionScopeList
            ref="scopeListRef"
            module="academicAchievement"
            action-text="查看成果"
            :columns="scopeColumns"
            @select="openScope"
          />
        </template>

        <template v-else>
          <div v-if="canSelectScope && data.selectedScope" class="selected-scope-bar">
            <div>
              <span class="selected-scope-name">{{ data.selectedScope.institutionName }}</span>
              <el-tag size="small" style="margin-left: 8px">{{ data.selectedScope.institutionType }}</el-tag>
              <span class="selected-scope-school">{{ data.selectedScope.schoolName }}</span>
            </div>
            <el-button link type="primary" @click="returnToScopeList">返回机构列表</el-button>
          </div>

          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">成果总数</span>
              <strong>{{ achievementSummary.totalCount }}</strong>
            </div>
            <div class="summary-item">
              <span class="summary-label">期刊论文</span>
              <strong>{{ achievementSummary.journalCount }}</strong>
            </div>
            <div class="summary-item">
              <span class="summary-label">会议论文</span>
              <strong>{{ achievementSummary.conferenceCount }}</strong>
            </div>
            <div class="summary-item">
              <span class="summary-label">有收录信息</span>
              <strong>{{ achievementSummary.indexedCount }}</strong>
            </div>
            <div class="summary-item summary-wide">
              <span class="summary-label">最新成果</span>
              <strong>{{ achievementSummary.latestTitle || '-' }}</strong>
            </div>
          </div>

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
              <el-button :icon="Refresh" @click="resetSearch" />
              <el-button :icon="Grid" @click="handleTodo('列设置')" />
              <el-button :icon="Download" @click="handleTodo('导出')" />
              <el-button :icon="Document" @click="handleTodo('报表')" />
            </div>
          </div>

          <div v-show="data.advancedVisible" class="advanced-panel">
            <el-input v-model="data.advancedFilters.author" placeholder="作者" clearable @keyup.enter="handleSearch" />
            <el-input v-model="data.advancedFilters.journal" :placeholder="journalColumnLabel" clearable @keyup.enter="handleSearch" />
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

          <div class="table-wrap" v-loading="data.loading">
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
              <el-table-column prop="serialNumber" label="序号" width="130" fixed="left" />
              <el-table-column prop="title" :label="titleColumnLabel" min-width="360" sortable show-overflow-tooltip>
                <template #default="{ row }">
                  <span class="achievement-title-link" @click="openDetail(row)">{{ row.title || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="journal" :label="journalColumnLabel" min-width="220" sortable show-overflow-tooltip />
              <el-table-column prop="publishDate" :label="dateColumnLabel" width="150" sortable />
              <el-table-column prop="authors" label="作者" min-width="220" show-overflow-tooltip />
              <el-table-column prop="institutionSignature" label="本机构署名" width="140" sortable />
              <el-table-column prop="attachment" label="附件" width="140" show-overflow-tooltip />
              <el-table-column prop="doi" label="DOI" min-width="170" show-overflow-tooltip />
              <el-table-column prop="indexedStatus" label="收录情况" width="130" />
              <el-table-column label="操作" width="176" fixed="right" align="center">
                <template #default="{ row }">
                  <el-button link type="primary" @click="openDetail(row)">详情</el-button>
                  <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
                  <el-button link type="primary" @click="handleDelete(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <footer class="table-footer">
            <span>已选择 <strong>{{ data.selectedRows.length }}</strong> 项</span>
            <el-pagination
              v-model:current-page="data.pageNum"
              v-model:page-size="data.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="data.total"
              layout="total, sizes, prev, pager, next, jumper"
              background
              @current-change="load"
              @size-change="handleSizeChange"
            />
          </footer>
        </template>
      </section>
    </div>

    <el-dialog
      v-model="data.detailVisible"
      title="学术成果详情"
      width="820px"
      destroy-on-close
      append-to-body
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="成果类别">{{ activeCategoryName(data.detailRow.category) }}</el-descriptions-item>
        <el-descriptions-item label="序号">{{ displayValue(data.detailRow.serialNumber) }}</el-descriptions-item>
        <el-descriptions-item :label="detailTitleLabel(data.detailRow.category)" :span="2">{{ displayValue(data.detailRow.title) }}</el-descriptions-item>
        <el-descriptions-item :label="detailJournalLabel(data.detailRow.category)" :span="2">{{ displayValue(data.detailRow.journal) }}</el-descriptions-item>
        <el-descriptions-item :label="detailDateLabel(data.detailRow.category)">{{ displayValue(data.detailRow.publishDate) }}</el-descriptions-item>
        <el-descriptions-item label="作者">{{ displayValue(data.detailRow.authors) }}</el-descriptions-item>
        <el-descriptions-item label="本机构署名">{{ displayValue(data.detailRow.institutionSignature) }}</el-descriptions-item>
        <el-descriptions-item label="收录情况">{{ displayValue(data.detailRow.indexedStatus) }}</el-descriptions-item>
        <el-descriptions-item label="DOI">{{ displayValue(data.detailRow.doi) }}</el-descriptions-item>
        <el-descriptions-item label="附件">{{ displayValue(data.detailRow.attachment) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ displayValue(data.detailRow.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ displayValue(data.detailRow.updateTime) }}</el-descriptions-item>
        <el-descriptions-item label="所属机构ID">{{ displayValue(data.detailRow.laboratoryId) }}</el-descriptions-item>
        <el-descriptions-item label="记录ID">{{ displayValue(data.detailRow.id) }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="data.detailVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleEdit(data.detailRow)">编辑</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="data.formVisible"
      :title="data.form.id ? `编辑${activeCategory.name}` : `新增${activeCategory.name}`"
      width="720px"
      destroy-on-close
      append-to-body
    >
      <el-form ref="formRef" :model="data.form" :rules="rules" label-width="110px" class="achievement-form">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="序号" prop="serialNumber">
              <el-input v-model="data.form.serialNumber" placeholder="请输入序号" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="dateColumnLabel" prop="publishDate">
              <el-date-picker
                v-model="data.form.publishDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="titleColumnLabel" prop="title">
          <el-input v-model="data.form.title" type="textarea" :rows="2" placeholder="请输入题目或成果名称" clearable />
        </el-form-item>
        <el-form-item :label="journalColumnLabel" prop="journal">
          <el-input v-model="data.form.journal" placeholder="请输入发表期刊、会议或来源" clearable />
        </el-form-item>
        <el-form-item label="作者" prop="authors">
          <el-input v-model="data.form.authors" placeholder="请输入作者" clearable />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="本机构署名" prop="institutionSignature">
              <el-input v-model="data.form.institutionSignature" placeholder="如：No.1" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="收录情况" prop="indexedStatus">
              <el-input v-model="data.form.indexedStatus" placeholder="如：CSSCI / SSCI" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="DOI" prop="doi">
              <el-input v-model="data.form.doi" placeholder="请输入 DOI" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="附件" prop="attachment">
              <el-input v-model="data.form.attachment" placeholder="请输入附件地址或名称" clearable />
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
import InstitutionScopeList from '@/components/InstitutionScopeList.vue'
import { Delete, Document, Download, Grid, Plus, Refresh, Search, Share } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const categories = [
  {
    key: 'journal',
    name: '期刊论文',
    description: '发表在各类定期出版的正式刊物上的学术论文，刊物应有ISSN/CN刊号（含电子刊物，不含各类报纸）'
  },
  { key: 'conference', name: '会议论文', description: '在国内外学术会议上发表或收录的论文成果。' },
  { key: 'collection', name: '文集文章', description: '收录于论文集、文集、辑刊等出版物中的学术文章。' },
  { key: 'book', name: '书籍著作', description: '公开出版的学术专著、编著、译著、教材及相关著作成果。' },
  { key: 'report', name: '研究报告', description: '围绕研究课题、咨询项目形成并完成提交的研究报告。' },
  { key: 'software', name: '软件研发', description: '软件系统、平台工具、算法程序等研发类成果。' },
  { key: 'database', name: '数据库建设', description: '专业数据库、样本库、语料库及相关数据资源建设成果。' },
  { key: 'digital', name: '音像/数字作品', description: '音像制品、数字出版物、网络作品等数字化成果。' },
  { key: 'other', name: '其他成果', description: '不属于以上类别但可认定为学术成果的其他成果。' }
]

const formRef = ref()
const scopeListRef = ref()

const rules = {
  title: [{ required: true, message: '请输入题目或成果名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择成果类别', trigger: 'change' }]
}

const scopeColumns = [
  { label: '成果总数', prop: 'summary.totalCount', width: 100 },
  { label: '期刊论文', prop: 'summary.journalCount', width: 100 },
  { label: '会议论文', prop: 'summary.conferenceCount', width: 100 },
  { label: '著作', prop: 'summary.bookCount', width: 80 },
  { label: '研究报告', prop: 'summary.reportCount', width: 100 },
  { label: '有附件', prop: 'summary.attachmentCount', width: 90 },
  { label: '有收录信息', prop: 'summary.indexedCount', width: 110 },
  { label: '最新成果', prop: 'summary.latestTitle', minWidth: 240 },
  { label: '最新类别', prop: 'summary.latestCategoryName', width: 120 },
  { label: '最新日期', prop: 'summary.latestPublishDate', width: 120 }
]

const data = reactive({
  currentUser: {},
  selectedScope: null,
  activeCategoryKey: 'journal',
  tableData: [],
  aggregateRows: [],
  total: 0,
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  selectedRows: [],
  advancedVisible: false,
  advancedFilters: {
    author: '',
    journal: '',
    date: []
  },
  formVisible: false,
  detailVisible: false,
  form: {},
  detailRow: {},
  loading: false
})

try {
  data.currentUser = JSON.parse(localStorage.getItem('xm-user') || '{}')
} catch (_) {
  data.currentUser = {}
}

const canSelectScope = computed(() => ['SUPER_ADMIN', 'SCHOOL_ADMIN'].includes(data.currentUser.role))
const shouldShowAchievementPanel = computed(() => !canSelectScope.value || !!data.selectedScope)

const currentLaboratoryId = computed(() => {
  if (canSelectScope.value) return data.selectedScope?.organizationId || null
  return data.currentUser.laboratoryId || data.currentUser.id || null
})

const activeCategory = computed(() => {
  return categories.find(item => item.key === data.activeCategoryKey) || categories[0]
})

const achievementSummary = computed(() => {
  const rows = data.aggregateRows.length ? data.aggregateRows : (data.tableData || [])
  const summary = {
    totalCount: rows.length,
    journalCount: 0,
    conferenceCount: 0,
    indexedCount: 0,
    latestTitle: ''
  }
  const sorted = [...rows].sort((a, b) => String(b.publishDate || b.createTime || '').localeCompare(String(a.publishDate || a.createTime || '')))
  rows.forEach(row => {
    if (row.category === 'journal') summary.journalCount += 1
    if (row.category === 'conference') summary.conferenceCount += 1
    if (row.indexedStatus) summary.indexedCount += 1
  })
  summary.latestTitle = sorted[0]?.title || ''
  return summary
})

const getValidCategoryKey = (category) => {
  const key = typeof category === 'string' ? category : ''
  return categories.some(item => item.key === key) ? key : 'journal'
}

const activeCategoryName = (category) => {
  return categories.find(item => item.key === category)?.name || category || '-'
}

const titleColumnLabel = computed(() => {
  if (data.activeCategoryKey === 'journal' || data.activeCategoryKey === 'conference') return '论文题目'
  return '成果名称'
})

const journalColumnLabel = computed(() => {
  return detailJournalLabel(data.activeCategoryKey)
})

const dateColumnLabel = computed(() => {
  return detailDateLabel(data.activeCategoryKey)
})

const detailTitleLabel = (category) => {
  if (category === 'journal' || category === 'conference') return '论文题目'
  return '成果名称'
}

const detailJournalLabel = (category) => {
  const map = {
    journal: '发表期刊',
    conference: '会议名称',
    collection: '文集名称',
    book: '出版社',
    report: '委托/采纳单位',
    software: '研发单位',
    database: '数据库名称',
    digital: '作品载体',
    other: '来源'
  }
  return map[category] || '来源'
}

const detailDateLabel = (category) => {
  return category === 'journal' || category === 'conference' ? '发表日期' : '完成日期'
}

const getScopeParams = () => {
  const laboratoryId = currentLaboratoryId.value
  return laboratoryId ? { laboratoryId } : {}
}

const load = () => {
  if (canSelectScope.value && !data.selectedScope) return
  data.loading = true
  request.get('/academicAchievement/selectPage', {
    params: {
      ...getScopeParams(),
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      category: data.activeCategoryKey,
      keyword: data.keyword || undefined,
      author: data.advancedFilters.author || undefined,
      journal: data.advancedFilters.journal || undefined,
      startDate: data.advancedFilters.date?.[0] || undefined,
      endDate: data.advancedFilters.date?.[1] || undefined
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

const loadAggregateRows = () => {
  if (canSelectScope.value && !data.selectedScope) return
  request.get('/academicAchievement/selectAll', {
    params: getScopeParams()
  }).then(res => {
    if (res.code === '200') {
      data.aggregateRows = res.data || []
    }
  })
}

const openScope = (scope) => {
  data.selectedScope = scope
  data.keyword = ''
  data.pageNum = 1
  data.selectedRows = []
  data.aggregateRows = []
  loadAggregateRows()
  load()
}

const returnToScopeList = () => {
  if (canSelectScope.value) {
    closeScopeDialog()
    return
  }
  closeScopeDialog()
}

const closeScopeDialog = () => {
  data.selectedScope = null
  data.tableData = []
  data.aggregateRows = []
  data.total = 0
  data.selectedRows = []
  data.keyword = ''
  data.pageNum = 1
}

const switchCategory = (key) => {
  if (key === data.activeCategoryKey) return
  router.push(`/manager/academicAchievement/${key}`)
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
  data.advancedFilters.author = ''
  data.advancedFilters.journal = ''
  data.advancedFilters.date = []
  data.pageNum = 1
  load()
}

const handleAdd = () => {
  data.form = {
    laboratoryId: currentLaboratoryId.value,
    category: data.activeCategoryKey,
    institutionSignature: 'No.1'
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
  data.detailRow = JSON.parse(JSON.stringify(row || {}))
  data.detailVisible = true
}

const save = () => {
  formRef.value.validate(valid => {
    if (!valid) return
    const submitData = { ...data.form }
    submitData.category = data.activeCategoryKey
    if (!submitData.laboratoryId && currentLaboratoryId.value) {
      submitData.laboratoryId = currentLaboratoryId.value
    }
    const api = submitData.id
      ? request.put('/academicAchievement/update', submitData)
      : request.post('/academicAchievement/add', submitData)
    api.then(res => {
      if (res.code === '200') {
        ElMessage.success('操作成功')
        data.formVisible = false
        loadAggregateRows()
        load()
        scopeListRef.value?.load?.()
      } else {
        ElMessage.error(res.msg || '操作失败')
      }
    })
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', { type: 'warning', buttonSize: 'small' }).then(() => {
    request.delete(`/academicAchievement/delete/${row.id}`).then(res => {
      if (res.code === '200') {
        ElMessage.success('删除成功')
        loadAggregateRows()
        load()
        scopeListRef.value?.load?.()
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
  request.delete('/academicAchievement/delete/batch', { data: ids }).then(res => {
    if (res.code === '200') {
      ElMessage.success('删除成功')
      data.selectedRows = []
      loadAggregateRows()
      load()
      scopeListRef.value?.load?.()
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  })
}

const handleTodo = (name) => {
  ElMessage.info(`${name}功能待接入`)
}

const displayValue = (value) => {
  if (value === null || value === undefined || value === '') return '-'
  return value
}

watch(() => route.params.category, (category) => {
  const nextCategory = getValidCategoryKey(category)
  if (!category || category !== nextCategory) {
    router.replace(`/manager/academicAchievement/${nextCategory}`)
    return
  }
  data.activeCategoryKey = nextCategory
  data.pageNum = 1
  data.selectedRows = []
  if (shouldShowAchievementPanel.value) {
    loadAggregateRows()
    load()
  }
}, { immediate: true })
</script>

<style scoped>
.academic-page {
  min-height: calc(100vh - 90px);
  color: #202124;
}

.selected-scope-bar,
.summary-grid,
.academic-shell {
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

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(120px, 1fr)) minmax(220px, 2fr);
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

.academic-shell {
  display: flex;
  min-height: calc(100vh - 150px);
}

.achievement-side {
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

.achievement-main {
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
  width: 240px;
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

.advanced-panel :deep(.el-input) {
  width: 180px;
}

.advanced-panel :deep(.el-date-editor) {
  width: 330px;
}

.table-wrap {
  height: calc(100vh - 360px);
  min-height: 360px;
  border: 1px solid #e5e7eb;
  border-bottom: 0;
  overflow: hidden;
}

.table-wrap :deep(.el-table) {
  font-size: 14px;
}

.table-wrap :deep(.el-table__cell) {
  height: 48px;
  padding: 8px 0;
}

.table-wrap :deep(.el-table th.el-table__cell) {
  font-weight: 700;
}

.table-wrap :deep(.el-table .cell) {
  line-height: 1.4;
}

.table-wrap :deep(.el-table__fixed-right) {
  box-shadow: -8px 0 18px rgba(31, 35, 41, 0.14);
}

.table-wrap :deep(.el-button.is-link) {
  font-size: 14px;
}

.achievement-title-link {
  color: #1677ff;
  cursor: pointer;
}

.achievement-title-link:hover {
  color: #0958d9;
  text-decoration: underline;
}

.table-footer {
  min-height: 46px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 18px 6px 36px;
  color: #1688ff;
  font-size: 14px;
  border: 1px solid #e5e7eb;
  background: #fff;
}

.table-footer strong {
  font-weight: 600;
}

.achievement-form {
  padding: 10px 20px;
}

@media (max-width: 1280px) {
  .achievement-side {
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

@media (max-width: 980px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(140px, 1fr));
  }

  .summary-item {
    border-bottom: 1px solid #ebeef5;
  }
}
</style>
