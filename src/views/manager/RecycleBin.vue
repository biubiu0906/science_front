<template>
  <div class="recycle-page">
    <div class="recycle-shell">
      <aside class="recycle-side">
        <button
          v-for="item in categories"
          :key="item.value"
          type="button"
          class="category-item"
          :class="{ active: data.category === item.value }"
          @click="switchCategory(item.value)"
        >
          {{ item.label }}
        </button>
      </aside>

      <section class="recycle-main">
        <header class="page-heading">
          <h2>{{ currentMeta.title }}</h2>
        </header>

      <div class="toolbar">
        <div class="toolbar-left">
          <el-button type="primary" :icon="RefreshLeft" @click="restoreSelected">恢复选中数据</el-button>
          <el-button type="danger" :icon="Delete" @click="purgeSelected">彻底删除选中项</el-button>
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
        <el-select v-model="data.displayType" :placeholder="currentMeta.typeLabel" clearable>
          <el-option v-for="type in currentMeta.typeOptions" :key="type" :label="type" :value="type" />
        </el-select>
        <el-date-picker
          v-model="data.dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="删除开始时间"
          end-placeholder="删除结束时间"
          value-format="YYYY-MM-DD HH:mm:ss"
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
          <el-table-column prop="sourceId" label="编号" width="132" fixed="left" />
          <el-table-column prop="title" :label="currentMeta.nameLabel" min-width="520" sortable show-overflow-tooltip />
          <el-table-column prop="code" :label="currentMeta.codeLabel" width="180" sortable show-overflow-tooltip>
            <template #default="{ row }">{{ row.code || '-' }}</template>
          </el-table-column>
          <el-table-column prop="displayType" :label="currentMeta.typeLabel" width="150" sortable show-overflow-tooltip>
            <template #default="{ row }">{{ row.displayType || '-' }}</template>
          </el-table-column>
          <el-table-column prop="deletedTime" label="删除时间" width="230" sortable>
            <template #default="{ row }">{{ formatDateTime(row.deletedTime) }}</template>
          </el-table-column>
          <el-table-column prop="attachmentCount" label="附件数" width="88" align="center">
            <template #default="{ row }">{{ formatAttachment(row.attachmentCount) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="250" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleView(row)">查看</el-button>
              <el-button link type="primary" @click="restoreOne(row)">恢复</el-button>
              <el-button link type="primary" @click="purgeOne(row)">彻底删除</el-button>
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
          layout="total, prev, pager, next, sizes, jumper"
          background
          @current-change="load"
          @size-change="handleSizeChange"
        />
      </footer>
      </section>
    </div>

    <el-dialog v-model="data.detailVisible" :title="`${currentMeta.title}详情`" width="760px" destroy-on-close>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="编号">{{ data.current.sourceId || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="currentMeta.codeLabel">{{ data.current.code || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="currentMeta.nameLabel" :span="2">{{ data.current.title || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="currentMeta.typeLabel">{{ data.current.displayType || '-' }}</el-descriptions-item>
        <el-descriptions-item label="删除时间">{{ formatDateTime(data.current.deletedTime) }}</el-descriptions-item>
        <el-descriptions-item label="负责人">{{ data.current.ownerName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="所属机构">{{ data.current.laboratoryName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ data.current.status || '-' }}</el-descriptions-item>
        <el-descriptions-item label="附件数">{{ formatAttachment(data.current.attachmentCount) }}</el-descriptions-item>
        <el-descriptions-item label="说明" :span="2">{{ data.current.summary || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '@/utils/request.js'
import { ElMessage, ElMessageBox } from '@/utils/element-plus'
import { Delete, Refresh, RefreshLeft, Search } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const categories = [
  { label: '成果', value: 'achievement' },
  { label: '课题', value: 'topic' }
]

const metaMap = {
  topic: {
    title: '课题',
    nameLabel: '课题名称',
    codeLabel: '课题编号',
    typeLabel: '课题类型',
    typeOptions: ['纵向课题', '横向课题', '国家级课题', '省部级课题', '校级课题', '课题']
  },
  achievement: {
    title: '成果',
    nameLabel: '成果名称',
    codeLabel: '成果编号',
    typeLabel: '成果类型',
    typeOptions: ['科普作品', '原理性模型与原型', '软件与数据库', '专利与技术', '专著与教材', '学术论文', '成果']
  }
}

const data = reactive({
  category: 'topic',
  tableData: [],
  total: 0,
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  displayType: '',
  dateRange: [],
  selectedRows: [],
  advancedVisible: false,
  detailVisible: false,
  current: {},
  loading: false
})

const currentMeta = computed(() => metaMap[data.category] || metaMap.topic)

const normalizeRecord = (row = {}) => {
  return {
    id: row.id,
    sourceId: row.sourceId ?? row.source_id ?? row.id,
    recycleType: row.recycleType ?? row.recycle_type,
    title: row.title,
    code: row.code,
    displayType: row.displayType ?? row.display_type,
    deletedTime: row.deletedTime ?? row.deleted_time,
    attachmentCount: row.attachmentCount ?? row.attachment_count ?? 0,
    status: row.status,
    ownerName: row.ownerName ?? row.owner_name,
    laboratoryName: row.laboratoryName ?? row.laboratory_name,
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

const formatAttachment = (count) => {
  const value = Number(count || 0)
  return value > 0 ? value : '-'
}

const syncCategoryFromRoute = () => {
  const category = route.params.category === 'achievement' ? 'achievement' : 'topic'
  data.category = category
}

const load = () => {
  data.loading = true
  request.get('/recycleBin/selectPage', {
    params: {
      category: data.category,
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      keyword: data.keyword || undefined,
      displayType: data.displayType || undefined,
      startTime: data.dateRange?.[0] || undefined,
      endTime: data.dateRange?.[1] || undefined
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

const switchCategory = (category) => {
  if (category === data.category) return
  router.push(`/manager/recycleBin/${category}`)
}

const handleSearch = () => {
  data.pageNum = 1
  load()
}

const resetSearch = () => {
  data.keyword = ''
  data.displayType = ''
  data.dateRange = []
  data.pageNum = 1
  load()
}

const handleSizeChange = (size) => {
  data.pageSize = size
  data.pageNum = 1
  load()
}

const handleSelectionChange = (selection) => {
  data.selectedRows = selection
}

const handleView = (row) => {
  data.current = JSON.parse(JSON.stringify(row))
  data.detailVisible = true
}

const restoreOne = (row) => {
  ElMessageBox.confirm(`确定恢复“${row.title || row.sourceId}”吗？`, '恢复确认', {
    type: 'warning',
    buttonSize: 'small'
  }).then(() => {
    request.post(`/recycleBin/restore/${data.category}/${row.sourceId}`).then(res => {
      if (res.code === '200') {
        ElMessage.success('恢复成功')
        load()
      } else {
        ElMessage.error(res.msg || '恢复失败')
      }
    })
  }).catch(() => {})
}

const restoreSelected = () => {
  if (!data.selectedRows.length) {
    ElMessage.warning('请选择数据')
    return
  }
  ElMessageBox.confirm(`确定恢复已选择的 ${data.selectedRows.length} 项数据吗？`, '批量恢复', {
    type: 'warning',
    buttonSize: 'small'
  }).then(() => {
    request.post('/recycleBin/restore/batch', {
      category: data.category,
      ids: data.selectedRows.map(row => row.sourceId)
    }).then(res => {
      if (res.code === '200') {
        ElMessage.success('恢复成功')
        data.selectedRows = []
        load()
      } else {
        ElMessage.error(res.msg || '恢复失败')
      }
    })
  }).catch(() => {})
}

const purgeOne = (row) => {
  ElMessageBox.confirm(`彻底删除后无法恢复，确定删除“${row.title || row.sourceId}”吗？`, '彻底删除确认', {
    type: 'warning',
    buttonSize: 'small',
    confirmButtonText: '彻底删除'
  }).then(() => {
    request.delete(`/recycleBin/purge/${data.category}/${row.sourceId}`).then(res => {
      if (res.code === '200') {
        ElMessage.success('彻底删除成功')
        load()
      } else {
        ElMessage.error(res.msg || '彻底删除失败')
      }
    })
  }).catch(() => {})
}

const purgeSelected = () => {
  if (!data.selectedRows.length) {
    ElMessage.warning('请选择数据')
    return
  }
  ElMessageBox.confirm(`彻底删除后无法恢复，确定删除已选择的 ${data.selectedRows.length} 项数据吗？`, '批量彻底删除', {
    type: 'warning',
    buttonSize: 'small',
    confirmButtonText: '彻底删除'
  }).then(() => {
    request.delete('/recycleBin/purge/batch', {
      data: {
        category: data.category,
        ids: data.selectedRows.map(row => row.sourceId)
      }
    }).then(res => {
      if (res.code === '200') {
        ElMessage.success('彻底删除成功')
        data.selectedRows = []
        load()
      } else {
        ElMessage.error(res.msg || '彻底删除失败')
      }
    })
  }).catch(() => {})
}

watch(
  () => route.params.category,
  () => {
    syncCategoryFromRoute()
    data.pageNum = 1
    data.keyword = ''
    data.displayType = ''
    data.dateRange = []
    data.selectedRows = []
    load()
  },
  { immediate: true }
)
</script>

<style scoped>
.recycle-page {
  min-height: calc(100vh - 90px);
  background: #fff;
  color: #202124;
  border: 1px solid #ebeef5;
}

.recycle-shell {
  display: flex;
  min-height: calc(100vh - 90px);
}

.recycle-side {
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

.recycle-main {
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
  min-width: 150px;
}

.toolbar-left :deep(.el-button--danger) {
  min-width: 168px;
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

.advanced-panel :deep(.el-select) {
  width: 180px;
}

.advanced-panel :deep(.el-date-editor) {
  width: 330px;
}

.table-wrap {
  height: calc(100vh - 312px);
  min-height: 390px;
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

.table-footer :deep(.el-pagination) {
  color: #5f6670;
}

@media (max-width: 1280px) {
  .recycle-side {
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

  .toolbar,
  .advanced-panel {
    flex-wrap: wrap;
  }

  .toolbar-right {
    margin-left: auto;
  }
}
</style>
