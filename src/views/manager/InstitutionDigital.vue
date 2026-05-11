<template>
  <div class="digital-page">
    <!-- 左侧子菜单 -->
    <div class="digital-sidebar">
      <el-menu
        :default-active="activeMenu"
        @select="handleMenuSelect"
        class="digital-menu"
      >
        <el-menu-item index="PLATFORM">网络平台</el-menu-item>
        <el-menu-item index="HARDWARE">硬件设备</el-menu-item>
        <el-menu-item index="SOFTWARE">软件工具</el-menu-item>
        <el-menu-item index="DATA">数据资源</el-menu-item>
      </el-menu>
    </div>

    <!-- 右侧内容区 -->
    <div class="digital-content">
      <!-- 标题 & 描述 -->
      <div class="content-header">
        <h2 class="page-title">{{ currentModule.title }}</h2>
        <p class="page-desc">{{ currentModule.desc }}</p>
      </div>

      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button type="primary" @click="handleAdd">+ 新增</el-button>
          <el-button :icon="Delete" @click="handleDeleteBatch" title="删除" />
          <el-button :icon="RefreshLeft" title="还原" />
          <el-button :icon="Sort" title="排序" />
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
          <el-button>高级查询</el-button>
          <el-button :icon="Refresh" @click="load" circle title="刷新" />
          <el-button :icon="Grid" circle title="列设置" />
          <el-button :icon="Download" circle title="导出" />
          <el-button :icon="Upload" circle title="导入" />
        </div>
      </div>

      <!-- ==================== 网络平台 表格 ==================== -->
      <el-table
        v-if="activeMenu === 'PLATFORM'"
        :data="data.tableData"
        stripe
        @selection-change="handleSelectionChange"
        :header-cell-style="headerStyle"
        class="data-table"
        empty-text="暂无数据"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="序号" width="120" sortable />
        <el-table-column prop="name" label="平台名称" min-width="200" sortable show-overflow-tooltip />
        <el-table-column prop="url" label="入口地址" min-width="280" show-overflow-tooltip />
        <el-table-column prop="category" label="平台类别" width="130" sortable />
        <el-table-column prop="installDate" label="开通时间" width="130" sortable />
        <el-table-column prop="attachmentCount" label="附件数" width="80" align="center">
          <template #default="{ row }">{{ row.attachmentCount ?? '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- ==================== 硬件设备 表格 ==================== -->
      <el-table
        v-if="activeMenu === 'HARDWARE'"
        :data="data.tableData"
        stripe
        @selection-change="handleSelectionChange"
        :header-cell-style="headerStyle"
        class="data-table"
        empty-text="暂无数据"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="序号" width="120" sortable />
        <el-table-column prop="name" label="设备名称" min-width="200" sortable show-overflow-tooltip />
        <el-table-column prop="category" label="设备类型" min-width="150" sortable show-overflow-tooltip />
        <el-table-column prop="quantity" label="数量" width="80" sortable />
        <el-table-column prop="unitPrice" label="单台价格" width="110" sortable />
        <el-table-column prop="installDate" label="安装时间" width="130" sortable />
        <el-table-column prop="attachmentCount" label="附件数" width="80" align="center">
          <template #default="{ row }">{{ row.attachmentCount ?? '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- ==================== 软件工具 表格 ==================== -->
      <el-table
        v-if="activeMenu === 'SOFTWARE'"
        :data="data.tableData"
        stripe
        @selection-change="handleSelectionChange"
        :header-cell-style="headerStyle"
        class="data-table"
        empty-text="暂无数据"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="序号" width="120" sortable />
        <el-table-column prop="name" label="软件名称" min-width="250" sortable show-overflow-tooltip />
        <el-table-column prop="category" label="软件类型" width="130" sortable />
        <el-table-column prop="quantity" label="安装数量" width="100" sortable />
        <el-table-column prop="unitPrice" label="单价" width="80" sortable>
          <template #default="{ row }">{{ row.unitPrice ?? '-' }}</template>
        </el-table-column>
        <el-table-column prop="installDate" label="安装时间" width="130" sortable />
        <el-table-column prop="attachmentCount" label="附件数" width="80" align="center">
          <template #default="{ row }">{{ row.attachmentCount ?? '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- ==================== 数据资源 表格 ==================== -->
      <el-table
        v-if="activeMenu === 'DATA'"
        :data="data.tableData"
        stripe
        @selection-change="handleSelectionChange"
        :header-cell-style="headerStyle"
        class="data-table"
        empty-text="暂无数据"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="序号" width="120" sortable />
        <el-table-column prop="name" label="数据资源名称" min-width="280" sortable show-overflow-tooltip />
        <el-table-column prop="category" label="资源类别" width="140" sortable />
        <el-table-column prop="unitPrice" label="采购价格(万元)" width="140" sortable>
          <template #default="{ row }">{{ row.unitPrice ?? '-' }}</template>
        </el-table-column>
        <el-table-column prop="attachmentCount" label="附件数" width="80" align="center">
          <template #default="{ row }">{{ row.attachmentCount ?? '-' }}</template>
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
          <el-pagination
            v-model:current-page="data.pageNum"
            v-model:page-size="data.pageSize"
            :page-sizes="[5, 10, 20, 50, 100]"
            :total="data.total"
            layout="total, sizes, prev, pager, next, jumper"
            background
            @current-change="load"
            @size-change="(size) => (data.pageSize = size, data.pageNum = 1, load())"
          />
        </div>
      </div>
    </div>

    <!-- ==================== 新增/编辑 对话框 ==================== -->
    <el-dialog
      v-model="data.formVisible"
      :title="dialogTitle"
      width="520px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="data.form" :rules="currentRules" label-width="110px" style="padding: 10px 20px">
        <!-- 名称（共用） -->
        <el-form-item :label="currentModule.nameLabel" prop="name">
          <el-input v-model="data.form.name" :placeholder="'请输入' + currentModule.nameLabel" clearable />
        </el-form-item>

        <!-- 入口地址（仅网络平台） -->
        <el-form-item v-if="activeMenu === 'PLATFORM'" label="入口地址" prop="url">
          <el-input v-model="data.form.url" placeholder="请输入入口地址" clearable />
        </el-form-item>

        <!-- 类别（共用） -->
        <el-form-item :label="currentModule.categoryLabel" prop="category">
          <el-input v-model="data.form.category" :placeholder="'请输入' + currentModule.categoryLabel" clearable />
        </el-form-item>

        <!-- 数量（硬件设备、软件工具） -->
        <el-form-item v-if="activeMenu === 'HARDWARE' || activeMenu === 'SOFTWARE'" :label="currentModule.quantityLabel" prop="quantity">
          <el-input-number v-model="data.form.quantity" :min="0" style="width: 100%" />
        </el-form-item>

        <!-- 价格（硬件设备、软件工具、数据资源） -->
        <el-form-item v-if="activeMenu !== 'PLATFORM'" :label="currentModule.priceLabel" prop="unitPrice">
          <el-input-number v-model="data.form.unitPrice" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>

        <!-- 日期（共用） -->
        <el-form-item :label="currentModule.dateLabel" prop="installDate">
          <el-date-picker
            v-model="data.form.installDate"
            type="date"
            :placeholder="'请选择' + currentModule.dateLabel"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>

        <!-- 附件数 -->
        <el-form-item label="附件数" prop="attachmentCount">
          <el-input-number v-model="data.form.attachmentCount" :min="0" style="width: 100%" />
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
import { reactive, ref, computed, onMounted, watch } from 'vue'
import request from '@/utils/request.js'
import { ElMessage, ElMessageBox } from '@/utils/element-plus'
import {
  Delete,
  RefreshLeft,
  Sort,
  Search,
  Refresh,
  Grid,
  Download,
  Upload
} from '@element-plus/icons-vue'

const headerStyle = { backgroundColor: '#f5f7fa', color: '#606266', fontWeight: '600' }

// ==================== 模块配置 ====================
const moduleConfig = {
  PLATFORM: {
    title: '网络平台',
    desc: '本机构建设运营的网站、社交网络、新媒体账号等学术交流和宣传发布平台',
    nameLabel: '平台名称',
    categoryLabel: '平台类别',
    dateLabel: '开通时间',
    quantityLabel: '',
    priceLabel: ''
  },
  HARDWARE: {
    title: '硬件设备',
    desc: '本机构采购的、用于科研工作的重要仪器设备',
    nameLabel: '设备名称',
    categoryLabel: '设备类型',
    dateLabel: '安装时间',
    quantityLabel: '数量',
    priceLabel: '单台价格'
  },
  SOFTWARE: {
    title: '软件工具',
    desc: '本机构购买的、用于科研工作的重要软件工具',
    nameLabel: '软件名称',
    categoryLabel: '软件类型',
    dateLabel: '安装时间',
    quantityLabel: '安装数量',
    priceLabel: '单价'
  },
  DATA: {
    title: '数据资源',
    desc: '本机构或所在学校/单位购买的，服务于机构科研人员的数据研究资源，例如各类文献数据库、行业数据资源等。',
    nameLabel: '数据资源名称',
    categoryLabel: '资源类别',
    dateLabel: '',
    quantityLabel: '',
    priceLabel: '采购价格(万元)'
  }
}

// ==================== 状态 ====================
const activeMenu = ref('PLATFORM')
const formRef = ref()

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

const currentModule = computed(() => moduleConfig[activeMenu.value])

const dialogTitle = computed(() => {
  const prefix = data.form.id ? '编辑' : '新增'
  return `${prefix}${currentModule.value.title}`
})

const currentRules = computed(() => ({
  name: [{ required: true, message: `请输入${currentModule.value.nameLabel}`, trigger: 'blur' }]
}))

// ==================== 菜单切换 ====================
const handleMenuSelect = (key) => {
  activeMenu.value = key
}

watch(activeMenu, () => {
  data.pageNum = 1
  data.searchKeyword = ''
  data.selectedIds = []
  load()
})

// ==================== 数据加载 ====================
const load = () => {
  request.get('/digitalInfo/selectPage', {
    params: {
      moduleType: activeMenu.value,
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      name: data.searchKeyword || undefined
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

// ==================== CRUD ====================
const handleAdd = () => {
  data.form = { moduleType: activeMenu.value }
  data.formVisible = true
}

const handleEdit = (row) => {
  data.form = JSON.parse(JSON.stringify(row))
  data.formVisible = true
}

const save = () => {
  formRef.value.validate(valid => {
    if (!valid) return
    const formData = { ...data.form, moduleType: activeMenu.value }
    const api = formData.id
      ? request.put('/digitalInfo/update', formData)
      : request.post('/digitalInfo/add', formData)
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
    type: 'warning', buttonSize: 'small'
  }).then(() => {
    request.delete(`/digitalInfo/delete/${id}`).then(res => {
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
    type: 'warning', buttonSize: 'small'
  }).then(() => {
    request.delete('/digitalInfo/delete/batch', { data: data.selectedIds }).then(res => {
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

// ==================== 初始化 ====================
onMounted(() => {
  load()
})
</script>

<style scoped>
.digital-page {
  display: flex;
  height: 100%;
  min-height: 0;
  gap: 0;
  background: #f0f2f5;
}

/* 左侧子菜单 */
.digital-sidebar {
  width: 120px;
  min-width: 120px;
  background: #fff;
  border-right: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.digital-menu {
  border-right: none;
}

.digital-menu :deep(.el-menu-item) {
  font-size: 14px;
  padding: 0 16px;
  height: 48px;
  line-height: 48px;
}

.digital-menu :deep(.el-menu-item.is-active) {
  color: #1677ff;
  border-right: 2px solid #1677ff;
  background-color: #e8f4ff;
  font-weight: 500;
}

/* 右侧内容区 */
.digital-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
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
