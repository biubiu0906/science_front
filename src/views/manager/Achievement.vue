<template>
  <div>
    <div class="card" style="margin-bottom: 5px">
      <el-input v-model="data.projectCode" :prefix-icon="Search" style="width: 240px; margin-right: 10px"
        placeholder="请输入立项编号查询"></el-input>
      <el-input v-model="data.projectName" :prefix-icon="Search" style="width: 240px; margin-right: 10px"
        placeholder="请输入项目名称查询"></el-input>
      <el-input v-model="data.name" :prefix-icon="Search" style="width: 200px; margin-right: 10px"
        placeholder="请输入成果名称查询"></el-input>
      <el-input v-model="data.teacherName" :prefix-icon="Search" style="width: 160px; margin-right: 10px"
        placeholder="请输入教师查询"></el-input>
      <el-cascader
        v-model="data.typeId"
        :options="data.typeData"
        :props="typeCascaderProps"
        placeholder="成果类型"
        clearable
        filterable
        style="width: 220px; margin-right: 10px"
      />
      <el-select v-if="data.user.role === 'TEACHER'" v-model="data.visible" placeholder="是否公开" clearable style="width: 130px; margin-right: 10px">
        <el-option label="公开" :value="1" />
        <el-option label="不公开" :value="0" />
      </el-select>
      <el-button size="small" type="info" plain @click="search">查询</el-button>
      <el-button size="small" type="warning" plain style="margin: 0 10px" @click="reset">重置</el-button>
    </div>

    <div class="card" style="margin-bottom: 5px">
      <div style="margin-bottom: 10px; margin-left: 10px;">
        <el-button v-if="data.user.role === 'TEACHER'" type="primary" plain size="small" @click="handleAdd">新增</el-button>
        <el-button v-if="data.user.role === 'SUPER_ADMIN'" type="danger" plain size="small" @click="delBatch">批量删除</el-button>
      </div>
      <el-table stripe :data="data.tableData" @selection-change="handleSelectionChange" :header-cell-style="{ backgroundColor: '#e9edf2' }" class="table-center" empty-text="暂无数据">
        <el-table-column v-if="data.user.role === 'SUPER_ADMIN'" type="selection" width="55" />
        <el-table-column type="index" label="序号" :index="indexMethod" width="60" />
        <el-table-column prop="name" label="成果名称" min-width="200" sortable>
          <template v-slot="scope">
            <div v-if="scope.row.name" class="achievement-name-cell">
              {{ scope.row.name }}
            </div>
            <span v-else style="color: #999;">暂无数据</span>
          </template>
        </el-table-column>
        <el-table-column prop="typeName" label="成果类型" min-width="110" show-overflow-tooltip sortable>
          <template v-slot="scope">
            <span v-if="scope.row.typeName">{{ scope.row.typeName }}</span>
            <span v-else style="color: #999;">暂无数据</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="成果描述" min-width="230" sortable>
          <template v-slot="scope">
            <div v-if="scope.row.description" class="description-preview">
              {{ getLimitedText(scope.row.description) }}
            </div>
            <span v-else class="empty-text">暂无数据</span>
          </template>
        </el-table-column>
        <el-table-column prop="teacherName" label="教师" min-width="100" sortable>
          <template v-slot="scope">
            <span v-if="scope.row.teacherName">{{ scope.row.teacherName }}</span>
            <span v-else style="color: #999;">暂无数据</span>
          </template>
        </el-table-column>
        <el-table-column prop="projectName" label="项目名称" min-width="150" show-overflow-tooltip sortable>
          <template v-slot="scope">
            <span v-if="scope.row.projectName">{{ scope.row.projectName }}</span>
            <span v-else style="color: #999;">暂无数据</span>
          </template>
        </el-table-column>
        <el-table-column prop="projectCode" label="立项编号" min-width="120" show-overflow-tooltip sortable>
          <template v-slot="scope">
            <span v-if="scope.row.projectCode">{{ scope.row.projectCode }}</span>
            <span v-else style="color: #999;">暂无数据</span>
          </template>
        </el-table-column>
        <el-table-column prop="evidence" label="证明材料" min-width="120" sortable>
          <template v-slot="scope">
            <template v-if="scope.row.evidence">
              <el-tooltip content="下载证明材料" placement="bottom" effect="light">
                <el-button type="primary" size="small" @click="down(scope.row.evidence)">下载文件</el-button>
              </el-tooltip>
            </template>
            <span v-else style="color: #999;">暂无数据</span>
          </template>
        </el-table-column>
        <el-table-column prop="visible" label="是否公开" min-width="120" sortable v-if="data.user.role === 'TEACHER'">
          <template v-slot="scope">
            <el-tag v-if="scope.row.visible === 1" type="success">公开</el-tag>
            <el-tag v-else type="warning">不公开</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="审核状态" min-width="120" sortable>
          <template v-slot="scope">
            <el-tag :type="getApprovalStatusTagType(scope.row.status)">{{ getApprovalStatusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="审核信息" min-width="110" sortable>
          <template v-slot="scope">
            <div v-if="scope.row.reason" :class="getContentAlignClass(scope.row.reason)">
              {{ scope.row.reason }}
            </div>
            <span v-else style="color: #999;">暂无数据</span>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="审核时间" min-width="110" show-overflow-tooltip sortable>
          <template v-slot="scope">
            <span v-if="scope.row.time">{{ scope.row.time }}</span>
            <span v-else style="color: #999;">暂无数据</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template v-slot="scope">
            <el-tooltip content="查看详情" placement="bottom" effect="light">
              <el-button type="primary" circle :icon="View" size="small" @click="handleViewAchievementDetail(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip v-if="data.user.role === 'TEACHER' && scope.row.status === '待审核'" content="编辑成果" placement="bottom" effect="light">
              <el-button type="primary" circle :icon="Edit" size="small" @click="handleEdit(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip v-if="canReviewProjectOrAchievement(data.user.role, scope.row.status)" content="审核成果" placement="bottom" effect="light">
              <el-button type="warning" circle :icon="Tickets" size="small" @click="handleCheck(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除成果" placement="bottom" effect="light">
              <el-button type="danger" circle size="small" :icon="Delete" @click="del(scope.row.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="card" v-if="data.total">
      <el-pagination
        @current-change="load"
        @size-change="(size) => (paginationQuery.setPageSize(size), load())"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[5, 10, 20, 50, 100]"
        v-model:page-size="data.pageSize"
        v-model:current-page="data.pageNum"
        :total="data.total"
      />
    </div>

    <el-dialog title="科研成果详情" v-model="data.detailVisible" width="55%" destroy-on-close>
      <el-descriptions v-if="data.detailRow" border :column="2" class="achievement-detail">
        <el-descriptions-item label="成果名称" :span="2">{{ displayValue(data.detailRow.name) }}</el-descriptions-item>
        <el-descriptions-item label="成果类型">{{ displayValue(data.detailRow.typeName) }}</el-descriptions-item>
        <el-descriptions-item label="教师">{{ displayValue(data.detailRow.teacherName) }}</el-descriptions-item>
        <el-descriptions-item label="项目名称" :span="2">{{ displayValue(data.detailRow.projectName) }}</el-descriptions-item>
        <el-descriptions-item label="立项编号">{{ displayValue(data.detailRow.projectCode) }}</el-descriptions-item>
        <el-descriptions-item label="是否公开">
          <template v-if="data.detailRow.visible === 1">公开</template>
          <template v-else-if="data.detailRow.visible === 0">不公开</template>
          <template v-else>暂无数据</template>
        </el-descriptions-item>
        <el-descriptions-item label="审核状态">{{ getApprovalStatusText(data.detailRow.status) }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ displayValue(data.detailRow.time) }}</el-descriptions-item>
        <el-descriptions-item label="审核信息" :span="2">
          <div class="detail-text">{{ displayValue(data.detailRow.reason) }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="成果描述" :span="2">
          <div class="detail-text">{{ displayValue(data.detailRow.description) }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="证明材料" :span="2">
          <el-button v-if="data.detailRow.evidence" link type="primary" @click="down(data.detailRow.evidence)">下载文件</el-button>
          <span v-else>暂无数据</span>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="data.detailVisible = false" size="small">关 闭</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog :title="data.form.id ? '科研成果编辑' : '科研成果提交'" v-model="data.formVisible" width="40%" destroy-on-close @opened="handleDialogOpened" @close="handleDialogClose">
      <el-form ref="formRef" :model="data.form" :rules="rules" label-width="80px" style="padding: 10px 20px">
        <el-form-item prop="visible" label="是否公开">
            <el-switch
              :model-value="data.form.visible === 1"
              @update:model-value="data.form.visible = $event ? 1 : 0"
              inline-prompt
              active-text="是"
              inactive-text="否"
            />
        </el-form-item>
        <el-form-item prop="projectId" label="科研项目" class="custom-form-item">
          <el-select v-model="data.form.projectId" placeholder="请选择科研项目">
            <el-option v-for="item in data.projectData" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
            <el-option label="无依托项目" :value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="typeId" label="成果类型" class="custom-form-item">
          <el-cascader
            v-model="data.form.typeId"
            :options="data.typeData"
            :props="typeCascaderProps"
            placeholder="请选择成果类型"
            clearable
            filterable
          />
        </el-form-item>
        <el-form-item prop="name" label="成果名称" class="custom-form-item">
          <el-input v-model="data.form.name" placeholder="请输入成果名称"></el-input>
        </el-form-item>
        <el-form-item prop="description" label="成果描述" class="custom-form-item">
          <el-input type="textarea" :rows="4" v-model="data.form.description" placeholder="请输入成果描述"></el-input>
        </el-form-item>
        <el-form-item prop="evidence" label="证明材料" class="custom-form-item">
          <el-upload 
            :action="baseUrl + '/files/upload'" 
            :on-success="handleEvidenceUpload"
            :on-remove="handleRemove"
            :file-list="data.fileList"
            :limit="1"
          >
            <el-button type="primary" size="small">点击上传</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="data.formVisible = false" size="small">取 消</el-button>
          <el-button type="primary" @click="save" size="small">确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog title="科研成果审核" v-model="data.checkVisible" width="40%" destroy-on-close>
      <el-form :model="data.form" label-width="70px" style="padding: 20px">
        <el-form-item prop="status" label="审核状态">
          <el-select v-model="data.form.status" placeholder="请选择审核结果">
            <el-option label="通过" value="通过"></el-option>
            <el-option label="驳回" value="驳回"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="reason" label="审核理由">
          <el-input v-model="data.form.reason" placeholder="请输入审核理由"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="data.checkVisible = false" size="small">取 消</el-button>
          <el-button type="primary" @click="submit" size="small">提 交</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 安全提醒组件 -->
    <SecurityAlert v-model="data.showSecurityAlert" @confirm="handleSecurityConfirm" />
  </div>
</template>

<script setup>

import { reactive, ref, onMounted } from "vue";
import request from "@/utils/request.js";
import { usePaginationQuery } from '@/utils/paginationQuery.js';
import { clearTableQuery, tableQueryParams } from '@/utils/tableQuery.js';
import { ElMessage, ElMessageBox } from "@/utils/element-plus";
import { Delete, Edit, Tickets, Search, View } from "@element-plus/icons-vue";
import router from "@/router/index.js";
import SecurityAlert from "@/components/SecurityAlert.vue";
import { securityAlertManager } from "@/utils/securityAlert.js";
import { fetchLaboratoryLevel, getCachedLaboratoryLevel, getUserLaboratoryId } from "@/utils/laboratoryLevel.js";
const baseUrl = import.meta.env.VITE_BASE_URL
const queryFields = ['projectCode', 'projectName', 'name', 'teacherName', 'typeId', 'description', 'visible', 'status', 'reason', 'time']
const typeCascaderProps = {
  value: 'id',
  label: 'name',
  children: 'children',
  emitPath: false
}
const formRef = ref()
const rules = reactive({
  visible: [{ required: true, message: '请选择是否公开', trigger: 'change' }],
  projectId: [{ required: true, message: '请选择科研项目', trigger: 'change' }],
  typeId: [{ required: true, message: '请选择成果类型', trigger: 'change' }],
  name: [{ required: true, message: '请输入成果名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入成果描述', trigger: 'blur' }],
})
const data = reactive({
  user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
  formVisible: false,
  checkVisible: false,
  detailVisible: false,
  form: {},
  detailRow: null,
  tableData: [],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  projectCode: null,
  projectName: null,
  name: null,
  teacherName: null,
  typeId: null,
  description: null,
  visible: null,
  status: null,
  reason: null,
  time: null,
  projectData: [],
  typeData: [],
  fileList: [], // 证明材料文件列表
  ids: [],
  laboratoryLevel: getCachedLaboratoryLevel(getUserLaboratoryId(JSON.parse(localStorage.getItem('xm-user') || '{}'))),
  showSecurityAlert: false // 控制安全提醒弹窗的显示
})

const paginationQuery = usePaginationQuery(data)

const indexMethod = (index) => {
  return (data.pageNum - 1) * data.pageSize + index + 1
}

const isLaboratoryReviewRole = (role) => {
  return role === 'KEY_LABORATORY' || role === 'NORMAL_LABORATORY'
}

const canReviewProjectOrAchievement = (role, status) => {
  if (isLaboratoryReviewRole(role) && status === '待审核') return true
  if (role === 'SCHOOL_ADMIN' && status === '实验室审核通过') return true
  if ((role === 'SUPER_ADMIN' || role === 'ADMIN') && status === '校审通过') return true
  return false
}

const getApprovalStatusTagType = (status) => {
  const map = {
    '待审核': 'warning',
    '实验室审核通过': 'primary',
    '实验室审核驳回': 'danger',
    '校审通过': 'primary',
    '校审驳回': 'danger',
    '审核通过': 'success',
    '审核未通过': 'danger',
    '不通过': 'danger'
  }
  return map[status] || 'info'
}

const getApprovalStatusText = (status) => {
  return status === '待审核' ? '待实验室审核' : displayValue(status)
}

const navTo = (url) => {
  location.href = url
}
const loadProject = () => {
  request.get('/project/selectAll', {
    params: {
      teacherId: data.user.id,
      status: '审核通过'
    }
  }).then(res => {
    if (res.code === '200') {
      data.projectData = res.data
    } else {
      ElMessage.error(res.msg)
    }
  })
}
const loadType = () => {
  request.get('/type/selectTree').then(res => {
    if (res.code === '200') {
      data.typeData = res.data
    } else {
      ElMessage.error(res.msg)
    }
  })
}
const load = () => {
  paginationQuery.sync()
  const queryParams = tableQueryParams(data, queryFields)
  request.get('/achievement/selectPage', {
    params: {
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      ...queryParams
    }
  }).then(res => {
    if (res.code === '200') {
      data.tableData = res.data?.list || []
      data.total = res.data?.total
    }
  })
}
const handleAdd = () => {
  data.form = { visible: 0, projectId: null }
  data.fileList = []
  data.formVisible = true
}
const handleEdit = (row) => {
  data.form = JSON.parse(JSON.stringify(row))
  if (data.form.projectId === null) {
    data.form.projectId = 0
  }
  // 回显文件
  if (data.form.evidence) {
    data.fileList = [{
      name: data.form.evidence.split('/').pop().replace(/^\d+-/, ''),
      url: data.form.evidence
    }]
  } else {
    data.fileList = []
  }
  data.formVisible = true
}
const handleCheck = (row) => {
  data.form = {
    id: row.id,
    status: '通过',
    reason: ''
  }
  data.checkVisible = true
}
const add = (form) => {
  request.post('/achievement/add', form).then(res => {
    if (res.code === '200') {
      ElMessage.success('操作成功')
      data.formVisible = false
      paginationQuery.reset()
      load()
    } else {
      ElMessage.error(res.msg)
    }
  })
}

const update = (form) => {
  request.put('/achievement/update', form).then(res => {
    if (res.code === '200') {
      ElMessage.success('操作成功')
      data.formVisible = false
      load()
    }
  })
}

const save = () => {
  formRef.value.validate(valid => {
    if (valid) {
      let submitForm = JSON.parse(JSON.stringify(data.form))
      if (submitForm.projectId === 0) {
        submitForm.projectId = null
      }
      data.form.id ? update(submitForm) : add(submitForm)
    }
  })
}

const submit = () => {
  if (data.form.status === '驳回' && !String(data.form.reason || '').trim()) {
    ElMessage.warning('请输入驳回理由')
    return
  }
  request.put('/achievement/check', data.form).then(res => {
    if (res.code === '200') {
      ElMessage.success('操作成功')
      data.checkVisible = false
      load()
    } else {
      ElMessage.error(res.msg)
    }
  })
}

const del = (id) => {
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', { type: 'warning', buttonSize: 'small' }).then(res => {
    request.delete('/achievement/delete/' + id).then(res => {
      if (res.code === '200') {
        ElMessage.success("删除成功")
        load()
      } else {
        ElMessage.error(res.msg)
      }
    })
  }).catch(err => {
    console.error(err)
  })
}
const delBatch = () => {
  if (!data.ids.length) {
    ElMessage.warning("请选择数据")
    return
  }
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', { type: 'warning', buttonSize: 'small' }).then(res => {
    request.delete("/achievement/delete/batch", { data: data.ids }).then(res => {
      if (res.code === '200') {
        ElMessage.success('操作成功')
        load()
      } else {
        ElMessage.error(res.msg)
      }
    })
  }).catch(err => {
    console.error(err)
  })
}
const handleSelectionChange = (rows) => {
  data.ids = rows.map(v => v.id)
}
const search = () => {
  paginationQuery.reset()
  load()
}

const reset = () => {
  clearTableQuery(data, queryFields)
  paginationQuery.reset()
  load()
}

const handleEvidenceUpload = (res) => {
  data.form.evidence = res.data
  data.fileList = [{
    name: res.data.split('/').pop().replace(/^\d+-/, ''),
    url: res.data
  }]
}
const handleRemove = () => {
  data.form.evidence = null
  data.fileList = []
}
const down = (url) => {
  window.open(url)
}

const DESCRIPTION_LIMIT = 45

const getLimitedText = (content) => {
  const text = String(content || '')
  return text.length > DESCRIPTION_LIMIT ? `${text.slice(0, DESCRIPTION_LIMIT)}...` : text
}

const displayValue = (value) => {
  return value === null || value === undefined || value === '' ? '暂无数据' : value
}

const handleViewAchievementDetail = (row) => {
  data.detailRow = JSON.parse(JSON.stringify(row))
  data.detailVisible = true
}

const getLaboratoryLevel = () => {
  const laboratoryId = getUserLaboratoryId(data.user)
  if (!laboratoryId) {
    return
  }

  const cached = getCachedLaboratoryLevel(laboratoryId)
  if (cached !== null) {
    data.laboratoryLevel = cached
    return
  }

  fetchLaboratoryLevel(laboratoryId, data.user.token).then(level => {
    if (level !== null) data.laboratoryLevel = level
  })
}


// 根据内容是否会换行动态设置文本对齐方式
const getContentAlignClass = (content) => {
  if (!content) return 'content-center'
  
  // 如果内容包含换行符，直接判断为多行
  if (content.includes('\n')) {
    return 'content-justify'
  }
  
  // 估算内容在表格列中是否会换行
  // 考虑中文字符宽度约为英文字符的2倍，表格列宽度约为110px
  // 一般情况下，超过15-20个中文字符或30-40个英文字符会换行
  const chineseCharCount = (content.match(/[\u4e00-\u9fa5]/g) || []).length
  const otherCharCount = content.length - chineseCharCount
  const estimatedWidth = chineseCharCount * 2 + otherCharCount
  
  // 如果估算宽度超过阈值，认为会换行，使用两端对齐
  if (estimatedWidth > 25) {
    return 'content-justify'
  }
  
  // 否则使用居中对齐
  return 'content-center'
}

// 处理对话框打开事件
const handleDialogOpened = () => {
  securityAlertManager.show()
}

// 处理对话框关闭事件
const handleDialogClose = () => {
  securityAlertManager.hide()
}

// 处理安全提醒确认
const handleSecurityConfirm = () => {
  data.showSecurityAlert = false
}

onMounted(() => {
  if (data.user.id) {
    getLaboratoryLevel()
  }
})

load()
loadProject()
loadType()
</script>

<style scoped>
/* 条件文本对齐样式 */
.content-center {
  text-align: center;
}

.content-justify {
  text-align: justify;
  text-justify: inter-ideograph;
  line-height: 1.5;
}

.description-preview {
  max-width: 100%;
  line-height: 1.5;
  word-break: break-all;
  white-space: normal;
  text-align: left;
}

.achievement-name-cell {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}

.empty-text {
  color: #999;
}

.detail-text {
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}

:deep(.achievement-detail .el-descriptions__label) {
  width: 110px;
}

:deep(.el-form-item) {
  margin-bottom: 5px;
}

:deep(.el-form-item.custom-form-item) {
  margin-bottom: 15px !important;
}
</style>
