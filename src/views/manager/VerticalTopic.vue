<template>
  <div class="vertical-topic-page">
    <!-- 标题 & 描述 -->
    <div class="content-header">
      <h2 class="page-title">纵向课题</h2>
      <p class="page-desc">
        依托本机构申请的，由指定科研行政单位（如各级基金委、教育科技规划主管部门、高校等）代表各级政府部门立项，各级财政预算提供资金支持的研究课题。
      </p>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="primary" :icon="Plus" @click="handleAdd">+ 新增</el-button>
        <el-button :icon="CopyDocument" circle title="复制" />
        <el-button :icon="Delete" circle title="删除" @click="handleDeleteBatch" />
        <el-button :icon="Sort" circle title="排序" />
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
        <el-button :icon="Refresh" circle title="刷新" @click="load" />
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
      <el-table-column prop="serialNumber" label="序号" width="110" />
      <el-table-column prop="topicName" label="课题名" min-width="220" show-overflow-tooltip>
        <template #header>
          课题名 <el-icon style="vertical-align: middle; margin-left: 2px;"><Sort /></el-icon>
        </template>
        <template #default="{ row }">
          <span class="topic-name-link" @click="handleEdit(row)">{{ row.topicName }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="projectNumber" label="立项号" width="130" show-overflow-tooltip>
        <template #header>
          立项号 <el-icon style="vertical-align: middle; margin-left: 2px;"><Sort /></el-icon>
        </template>
        <template #default="{ row }">
          {{ row.projectNumber || '无' }}
        </template>
      </el-table-column>
      <el-table-column prop="projectCategory" label="项目类别" min-width="160" show-overflow-tooltip>
        <template #header>
          项目类别 <el-icon style="vertical-align: middle; margin-left: 2px;"><Sort /></el-icon>
        </template>
      </el-table-column>
      <el-table-column prop="establishmentTime" label="立项时间" width="120">
        <template #header>
          立项时间 <el-icon style="vertical-align: middle; margin-left: 2px;"><Sort /></el-icon>
        </template>
      </el-table-column>
      <el-table-column prop="approvedFunding" label="批准经费" width="110" align="right">
        <template #header>
          批准经费 <el-icon style="vertical-align: middle; margin-left: 2px;"><Sort /></el-icon>
        </template>
        <template #default="{ row }">
          {{ row.approvedFunding != null ? row.approvedFunding : 0 }}
        </template>
      </el-table-column>
      <el-table-column prop="topicStatus" label="课题状态" width="100" align="center">
        <template #header>
          课题状态 <el-icon style="vertical-align: middle; margin-left: 2px;"><Sort /></el-icon>
        </template>
        <template #default="{ row }">
          <el-tag
            :type="row.topicStatus === '在研' ? 'success' : row.topicStatus === '结项' ? 'info' : 'warning'"
            size="small"
            round
          >
            {{ row.topicStatus || '-' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="leaderName" label="负责人" width="100" show-overflow-tooltip />
      <el-table-column prop="institutionOrder" label="本机构排序" width="110" align="center">
        <template #default="{ row }">
          {{ row.institutionOrder ?? '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="attachmentCount" label="附件数" width="90" align="center">
        <template #default="{ row }">
          <el-badge
            v-if="row.attachmentCount > 0"
            :value="row.attachmentCount"
            class="attach-badge"
            type="primary"
          >
            <el-icon><Paperclip /></el-icon>
          </el-badge>
          <span v-else style="color: #c0c4cc;">0</span>
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
        <span class="total-info">总计 {{ data.total }} 条数据</span>
        <el-pagination
          v-model:current-page="data.pageNum"
          v-model:page-size="data.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="data.total"
          layout="prev, pager, next, sizes, jumper"
          background
          @current-change="load"
          @size-change="load"
        />
      </div>
    </div>

    <!-- 新增/编辑 对话框 -->
    <el-dialog
      v-model="data.formVisible"
      :title="data.form.id ? '编辑纵向课题' : '新增纵向课题'"
      width="620px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="data.form"
        :rules="rules"
        label-width="110px"
        style="padding: 10px 20px"
      >
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
          <el-input
            v-model="data.form.topicName"
            placeholder="请输入课题名称"
            clearable
            type="textarea"
            :rows="2"
          />
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
              <el-input-number
                v-model="data.form.approvedFunding"
                :min="0"
                :precision="2"
                style="width: 100%"
                placeholder="0"
              />
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
              <el-input-number
                v-model="data.form.institutionOrder"
                :min="1"
                style="width: 100%"
                placeholder="排序号"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="附件数" prop="attachmentCount">
              <el-input-number
                v-model="data.form.attachmentCount"
                :min="0"
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
import { reactive, ref, onMounted } from 'vue'
import request from '@/utils/request.js'
import { ElMessage, ElMessageBox } from '@/utils/element-plus'
import {
  Plus,
  Delete,
  Sort,
  Search,
  Refresh,
  Grid,
  Download,
  Upload,
  CopyDocument,
  Paperclip
} from '@element-plus/icons-vue'

const formRef = ref()

const rules = {
  topicName: [{ required: true, message: '请输入课题名', trigger: 'blur' }],
  topicStatus: [{ required: true, message: '请选择课题状态', trigger: 'change' }]
}

const data = reactive({
  tableData: [],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  searchKeyword: '',
  selectedIds: [],
  formVisible: false,
  form: {}
})

const load = () => {
  request.get('/verticalTopic/selectPage', {
    params: {
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
  })
}

const handleSearch = () => {
  data.pageNum = 1
  load()
}

const handleAdvancedSearch = () => {
  ElMessage.info('高级查询功能待完善')
}

const handleAdd = () => {
  data.form = { attachmentCount: 0 }
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
      ? request.put('/verticalTopic/update', data.form)
      : request.post('/verticalTopic/add', data.form)
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

const handleDelete = (id) => {
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', {
    type: 'warning',
    buttonSize: 'small'
  }).then(() => {
    request.delete(`/verticalTopic/delete/${id}`).then(res => {
      if (res.code === '200') {
        ElMessage.success('删除成功')
        load()
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
      } else {
        ElMessage.error(res.msg || '删除失败')
      }
    })
  }).catch(() => {})
}

const handleSelectionChange = (rows) => {
  data.selectedIds = rows.map(r => r.id)
}

onMounted(() => {
  load()
})
</script>

<style scoped>
.vertical-topic-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: #fff;
  padding: 20px 24px;
  overflow: auto;
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

/* 课题名可点击样式 */
.topic-name-link {
  color: #1677ff;
  cursor: pointer;
  transition: color 0.2s;
}

.topic-name-link:hover {
  color: #0958d9;
  text-decoration: underline;
}

/* 附件角标 */
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
