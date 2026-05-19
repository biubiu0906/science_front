<template>
  <div v-if="canSelectScope" class="digital-admin-page">
    <div class="digital-shell">
      <aside class="digital-side">
        <button
          v-for="item in moduleOptions"
          :key="item.key"
          type="button"
          class="digital-side-item"
          :class="{ active: activeMenu === item.key }"
          @click="handleMenuSelect(item.key)"
        >
          {{ item.title }}
        </button>
      </aside>

      <section class="digital-main">
        <header class="page-heading">
          <h2>{{ currentModule.title }}</h2>
          <p>{{ currentModule.desc }}</p>
        </header>
        <InstitutionScopeList
          ref="scopeListRef"
          module="digital"
          :columns="scopeColumns"
          @select="openScope"
        />
      </section>
    </div>

    <InstitutionMaintenanceDialog
      v-if="shouldShowMaintenance"
      v-model:visible="data.scopeDialogVisible"
      :title="scopeDialogTitle"
      dialog
      @closed="closeScopeDialog"
    >
      <div class="digital-maintenance-content">
        <div class="selected-scope-bar">
          <div>
            <span class="selected-scope-name">{{ data.selectedScope.institutionName }}</span>
            <el-tag size="small" style="margin-left: 8px">{{ data.selectedScope.institutionType }}</el-tag>
            <span class="selected-scope-school">{{ data.selectedScope.schoolName }}</span>
          </div>
          <el-button link type="primary" @click="returnToScopeList">关闭</el-button>
        </div>
        <InstitutionDigitalContent
          :active-menu="activeMenu"
          :current-module="currentModule"
          :table-data="data.tableData"
          v-model:page-num="data.pageNum"
          v-model:page-size="data.pageSize"
          v-model:search-keyword="data.searchKeyword"
          :total="data.total"
          :selected-ids="data.selectedIds"
          :loading="data.loading"
          @load="load"
          @search="handleSearch"
          @add="handleAdd"
          @delete-batch="handleDeleteBatch"
          @selection-change="handleSelectionChange"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>
    </InstitutionMaintenanceDialog>
  </div>

  <div v-else class="digital-direct-page">
    <div class="digital-shell">
      <aside class="digital-side">
        <button
          v-for="item in moduleOptions"
          :key="item.key"
          type="button"
          class="digital-side-item"
          :class="{ active: activeMenu === item.key }"
          @click="handleMenuSelect(item.key)"
        >
          {{ item.title }}
        </button>
      </aside>

      <section class="digital-main">
        <InstitutionDigitalContent
          :active-menu="activeMenu"
          :current-module="currentModule"
          :table-data="data.tableData"
          v-model:page-num="data.pageNum"
          v-model:page-size="data.pageSize"
          v-model:search-keyword="data.searchKeyword"
          :total="data.total"
          :selected-ids="data.selectedIds"
          :loading="data.loading"
          @load="load"
          @search="handleSearch"
          @add="handleAdd"
          @delete-batch="handleDeleteBatch"
          @selection-change="handleSelectionChange"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </section>
    </div>
  </div>

  <el-dialog
    v-model="data.formVisible"
    :title="dialogTitle"
    width="520px"
    append-to-body
    destroy-on-close
  >
    <el-form ref="formRef" :model="data.form" :rules="currentRules" label-width="110px" style="padding: 10px 20px">
      <el-form-item :label="currentModule.nameLabel" prop="name">
        <el-input v-model="data.form.name" :placeholder="'请输入' + currentModule.nameLabel" clearable />
      </el-form-item>

      <el-form-item v-if="activeMenu === 'PLATFORM'" label="入口地址" prop="url">
        <el-input v-model="data.form.url" placeholder="请输入入口地址" clearable />
      </el-form-item>

      <el-form-item :label="currentModule.categoryLabel" prop="category">
        <el-input v-model="data.form.category" :placeholder="'请输入' + currentModule.categoryLabel" clearable />
      </el-form-item>

      <el-form-item v-if="activeMenu === 'HARDWARE' || activeMenu === 'SOFTWARE'" :label="currentModule.quantityLabel" prop="quantity">
        <el-input-number v-model="data.form.quantity" :min="0" style="width: 100%" />
      </el-form-item>

      <el-form-item v-if="activeMenu !== 'PLATFORM'" :label="currentModule.priceLabel" prop="unitPrice">
        <el-input-number v-model="data.form.unitPrice" :min="0" :precision="2" style="width: 100%" />
      </el-form-item>

      <el-form-item v-if="currentModule.dateLabel" :label="currentModule.dateLabel" prop="installDate">
        <el-date-picker
          v-model="data.form.installDate"
          type="date"
          :placeholder="'请选择' + currentModule.dateLabel"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="附件数" prop="attachmentCount">
        <el-input-number v-model="data.form.attachmentCount" :min="0" style="width: 100%" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="data.formVisible = false">取 消</el-button>
      <el-button type="primary" @click="save">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import request from '@/utils/request.js'
import { ElMessage, ElMessageBox } from '@/utils/element-plus'
import InstitutionScopeList from '@/components/InstitutionScopeList.vue'
import InstitutionMaintenanceDialog from '@/components/InstitutionMaintenanceDialog.vue'
import InstitutionDigitalContent from '@/components/InstitutionDigitalContent.vue'

const moduleConfig = {
  PLATFORM: {
    key: 'PLATFORM',
    title: '网络平台',
    desc: '本机构建设运营的网站、社交网络、新媒体账号等学术交流和宣传发布平台',
    nameLabel: '平台名称',
    categoryLabel: '平台类别',
    dateLabel: '开通时间',
    quantityLabel: '',
    priceLabel: '',
    countProp: 'platformCount'
  },
  HARDWARE: {
    key: 'HARDWARE',
    title: '硬件设备',
    desc: '本机构采购的、用于科研工作的重要仪器设备',
    nameLabel: '设备名称',
    categoryLabel: '设备类型',
    dateLabel: '安装时间',
    quantityLabel: '数量',
    priceLabel: '单台价格',
    countProp: 'hardwareCount'
  },
  SOFTWARE: {
    key: 'SOFTWARE',
    title: '软件工具',
    desc: '本机构购买的、用于科研工作的重要软件工具',
    nameLabel: '软件名称',
    categoryLabel: '软件类型',
    dateLabel: '安装时间',
    quantityLabel: '安装数量',
    priceLabel: '单价',
    countProp: 'softwareCount'
  },
  DATA: {
    key: 'DATA',
    title: '数据资源',
    desc: '本机构或所在学校/单位购买的，服务于机构科研人员的数据研究资源，例如各类文献数据库、行业数据资源等。',
    nameLabel: '数据资源名称',
    categoryLabel: '资源类别',
    dateLabel: '',
    quantityLabel: '',
    priceLabel: '采购价格(万元)',
    countProp: 'dataCount'
  }
}

const moduleOptions = Object.values(moduleConfig)
const activeMenu = ref('PLATFORM')
const formRef = ref()
const scopeListRef = ref()
const scopeColumns = computed(() => {
  const base = [
    { label: '信息化条目', prop: 'summary.totalCount', minWidth: 110 }
  ]
  switch (activeMenu.value) {
    case 'PLATFORM':
      return [...base, { label: '网络平台数', prop: 'summary.platformCount', minWidth: 100 }]
    case 'HARDWARE':
      return [...base, { label: '硬件设备数', prop: 'summary.hardwareCount', minWidth: 100 }]
    case 'SOFTWARE':
      return [...base, { label: '软件工具数', prop: 'summary.softwareCount', minWidth: 100 }]
    case 'DATA':
      return [...base, { label: '数据资源数', prop: 'summary.dataCount', minWidth: 100 }]
    default:
      return base
  }
})

const data = reactive({
  currentUser: {},
  selectedScope: null,
  tableData: [],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  searchKeyword: '',
  selectedIds: [],
  scopeDialogVisible: false,
  formVisible: false,
  form: {},
  loading: false
})

try {
  data.currentUser = JSON.parse(localStorage.getItem('xm-user') || '{}')
} catch (_) {
  data.currentUser = {}
}

const canSelectScope = computed(() => ['SUPER_ADMIN', 'SCHOOL_ADMIN'].includes(data.currentUser.role))
const shouldShowMaintenance = computed(() => canSelectScope.value && data.scopeDialogVisible && !!data.selectedScope)
const currentModule = computed(() => moduleConfig[activeMenu.value])
const scopeDialogTitle = computed(() => data.selectedScope ? `维护 ${data.selectedScope.institutionName} - ${currentModule.value.title}` : '信息化建设维护')

const dialogTitle = computed(() => {
  const prefix = data.form.id ? '编辑' : '新增'
  return `${prefix}${currentModule.value.title}`
})

const currentRules = computed(() => ({
  name: [{ required: true, message: `请输入${currentModule.value.nameLabel}`, trigger: 'blur' }]
}))

const handleMenuSelect = (key) => {
  activeMenu.value = key
}

watch(activeMenu, () => {
  data.pageNum = 1
  data.searchKeyword = ''
  data.selectedIds = []
  if (data.selectedScope || !canSelectScope.value) {
    data.tableData = []
    data.total = 0
    load()
  }
})

const getScopeParams = () => {
  if (!canSelectScope.value || !data.selectedScope) return {}
  return {
    institutionType: data.selectedScope.institutionType,
    schoolId: data.selectedScope.schoolId,
    organizationId: data.selectedScope.organizationId
  }
}

const load = () => {
  data.loading = true
  request.get('/digitalInfo/selectPage', {
    params: {
      ...getScopeParams(),
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
  }).finally(() => {
    data.loading = false
  })
}

const handleSearch = () => {
  data.pageNum = 1
  load()
}

const openScope = (scope) => {
  data.selectedScope = scope
  data.scopeDialogVisible = true
  data.pageNum = 1
  data.tableData = []
  data.total = 0
  data.selectedIds = []
  load()
}

const returnToScopeList = () => {
  data.scopeDialogVisible = false
}

const closeScopeDialog = () => {
  data.selectedScope = null
  data.tableData = []
  data.total = 0
  data.selectedIds = []
  data.formVisible = false
  data.form = {}
}

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
      ? request.put('/digitalInfo/update', formData, { params: getScopeParams() })
      : request.post('/digitalInfo/add', formData, { params: getScopeParams() })
    api.then(res => {
      if (res.code === '200') {
        ElMessage.success('操作成功')
        data.formVisible = false
        load()
        scopeListRef.value?.load?.()
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
        scopeListRef.value?.load?.()
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
        scopeListRef.value?.load?.()
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
  if (!canSelectScope.value) load()
})
</script>

<style scoped>
.digital-admin-page,
.digital-direct-page {
  height: 100%;
  min-height: 0;
}

.digital-shell {
  display: flex;
  height: 100%;
  min-height: 0;
  background: #fff;
  border: 1px solid #ebeef5;
}

.digital-side {
  width: 158px;
  min-width: 158px;
  padding: 12px 0;
  background: #fff;
  border-right: 1px solid #e4e7ed;
}

.digital-side-item {
  width: 100%;
  height: 52px;
  border: 0;
  border-right: 3px solid transparent;
  background: transparent;
  color: #303133;
  cursor: pointer;
  font-size: 14px;
  text-align: left;
  padding: 0 22px;
}

.digital-side-item:hover {
  color: #1677ff;
  background: #f5f9ff;
}

.digital-side-item.active {
  color: #1677ff;
  background: #e8f4ff;
  border-right-color: #1677ff;
  font-weight: 600;
}

.digital-main {
  flex: 1;
  min-width: 0;
  padding: 20px 24px;
  overflow: auto;
}

.page-heading {
  min-height: 54px;
  margin-bottom: 16px;
}

.page-heading h2 {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 8px;
}

.page-heading p {
  font-size: 13px;
  color: #606266;
  margin: 0;
  line-height: 1.6;
}

.digital-maintenance-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
  background: #fff;
}

.selected-scope-bar {
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
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
</style>
