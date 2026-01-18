<template>
  <div>
    <div class="card" style="margin-bottom: 5px">
      <el-input v-model="data.name" :prefix-icon="Search" style="width: 240px; margin-right: 10px" placeholder="请输入姓名查询"></el-input>
      <el-button type="info" plain size="small" @click="load">查询</el-button>
        <el-button type="warning" plain size="small" style="margin: 0 10px" @click="reset">重置</el-button>
      </div>

    <div class="card" style="margin-bottom: 5px">
      <div style="margin-bottom: 10px; margin-left: 10px;">
        <el-button type="primary" plain size="small" @click="handleAdd">新增</el-button>
        <el-button type="success" plain size="small" @click="handleBatchAdd" v-if="data.user.role !== 'ADMIN'">批量新增</el-button>
        <el-button type="danger" plain size="small" @click="delBatch">批量删除</el-button>
      </div>
      <el-table stripe :data="data.tableData" @selection-change="handleSelectionChange" :header-cell-style="{backgroundColor: '#e9edf2'}" class="table-center" empty-text="暂无数据">
        <el-table-column type="selection" width="35" />
        <el-table-column type="index" label="序号" :index="indexMethod" width="60" />
        <el-table-column prop="avatar" label="头像" text-align="center">
          <template v-slot="scope">
            <el-image style="width: 30px; height: 30px; border-radius: 50%; display: block; margin: 0 auto"
                      :src="scope.row.avatar || '/avatar.png'" 
                      :preview-src-list="[scope.row.avatar || '/avatar.png']" 
                      preview-teleported></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" min-width="100" sortable>
          <template v-slot="scope">
            <span v-if="scope.row.name">{{ scope.row.name }}</span>
            <span v-else class="no-data-text">暂无数据</span>
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别" width="80" sortable>
          <template v-slot="scope">
            <span v-if="scope.row.gender">{{ scope.row.gender === 'boy' ? '男' : scope.row.gender === 'girl' ? '女' : scope.row.gender === 'Male' ? '男' : scope.row.gender === 'Female' ? '女' : scope.row.gender }}</span>
            <span v-else class="no-data-text">暂无数据</span>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="电话" min-width="120" sortable>
          <template v-slot="scope">
            <span v-if="scope.row.phone">{{ scope.row.phone }}</span>
            <span v-else class="no-data-text">暂无数据</span>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="120" sortable>
          <template v-slot="scope">
            <span v-if="scope.row.email">{{ scope.row.email }}</span>
            <span v-else class="no-data-text">暂无数据</span>
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="单位" min-width="120" sortable>
          <template v-slot="scope">
            <span v-if="scope.row.unit">{{ scope.row.unit }}</span>
            <span v-else class="no-data-text">暂无数据</span>
          </template>
        </el-table-column>
        <el-table-column prop="ofLab" label="所属实验室" min-width="180" sortable>
          <template v-slot="scope">
            <span v-if="scope.row.ofLab">{{ scope.row.ofLab }}</span>
            <span v-else class="no-data-text">暂无数据</span>
          </template>
        </el-table-column>
        <el-table-column prop="employmentType" label="全职/非全职" min-width="130" sortable>
          <template v-slot="scope">
            <el-tag 
              :type="scope.row.employmentType === 'FULL_TIME' ? 'success' : 'primary'" 
              class="teacher-type-tag"
            >
              {{ scope.row.employmentType === 'FULL_TIME' ? '全职' : '非全职' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" min-width="100" sortable>
          <template v-slot="scope">
            <span v-if="scope.row.username">{{ scope.row.username }}</span>
            <span v-else class="no-data-text">暂无数据</span>
          </template>
        </el-table-column>
        <el-table-column prop="password" label="密码" min-width="150" sortable>
          <template #header>
            <span>密码</span>
            <el-button 
              :icon="data.showPassword ? View : Hide" 
              @click="togglePasswordVisibility" 
              size="small" 
              text 
              style="margin-left: 8px"
              :title="data.showPassword ? '隐藏密码' : '显示密码'"
            >
              {{ data.showPassword ? '隐藏' : '显示' }}
            </el-button>
          </template>
          <template v-slot="scope">
            <span v-if="data.showPassword">{{ scope.row.password }}</span>
            <span v-else>******</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template v-slot="scope">
            <el-tooltip content="编辑教师" placement="bottom" effect="light">
              <el-button type="primary" circle size="small" :icon="Edit" @click="handleEdit(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="生成报告" placement="bottom" effect="light">
              <el-button type="success" circle size="small" :icon="Collection" @click="handleReportForm(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除教师" placement="bottom" effect="light">
              <el-button type="danger" circle size="small" :icon="Delete" @click="del(scope.row.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="card" v-if="data.total">
      <el-pagination @current-change="load" background layout="prev, pager, next" :page-size="data.pageSize" v-model:current-page="data.pageNum" :total="data.total" />
    </div>

    <el-dialog title="教师信息" v-model="data.formVisible" width="40%" destroy-on-close @opened="handleDialogOpened">
      <el-form ref="formRef" :model="data.form" :rules="rules" label-width="100px" style="padding: 20px; margin-right: 30px;">
        <el-form-item prop="username" label="用户名">
          <el-input v-model="data.form.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item prop="password" label="密码">
          <el-input v-model="data.form.password" type="password" placeholder="请输入密码" show-password></el-input>
        </el-form-item>
        <el-form-item prop="name" label="姓名">
          <el-input v-model="data.form.name" placeholder="请输入姓名"></el-input>
        </el-form-item>
        <el-form-item prop="phone" label="电话">
          <el-input v-model="data.form.phone" placeholder="请输入电话"></el-input>
        </el-form-item>
        <el-form-item prop="email" label="邮箱">
          <el-input v-model="data.form.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item prop="unit" label="单位">
          <el-input v-model="data.form.unit" placeholder="请输入单位"></el-input>
        </el-form-item>
        <el-form-item v-if="data.user.role==='ADMIN'" prop="ofLab" label="所属实验室">
          <el-select v-model="data.form.ofLab" placeholder="请选择所属实验室">
            <el-option
              v-for="item in data.labOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item prop="gender" label="性别">
          <el-radio-group v-model="data.form.gender">
            <el-radio value="boy">男</el-radio>
            <el-radio value="girl">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="employmentType" label="全职/非全职">
          <el-radio-group v-model="data.form.employmentType">
            <el-radio value="FULL_TIME">全职</el-radio>
            <el-radio value="PART_TIME">非全职</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="avatar" label="头像">
          <el-upload
              :action="baseUrl + '/files/upload'"
              :on-success="handleFileUpload"
              list-type="picture"
              >
            <el-button type="primary" size="small">点击上传</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button size="small" @click="data.formVisible = false">取 消</el-button>
        <el-button type="primary" size="small" @click="save">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog title="批量新增教师信息" v-model="data.batchFormVisible" width="40%" destroy-on-close @closed="handleBatchDialogClosed">
        <el-upload
          ref="batchUploadRef"
          class="upload-demo"
          drag
          :action="baseUrl + '/teacher/import'"
          accept=".xlsx"
          :limit="1"
          :auto-upload="false"
          :headers="uploadHeaders"
          :file-list="data.batchFileList"
          :before-upload="beforeBatchUpload"
          :on-success="onBatchImportSuccess"
          :on-error="onBatchImportError"
          :on-change="handleBatchChange"
          :on-remove="handleBatchRemove"
          :on-exceed="handleBatchExceed"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            拖拽文件到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              <span class="template-link" @click="downloadTemplate">点击此处获取模板</span>
              <span>，文件大小不能超过 10MB</span>
            </div>
          </template>
        </el-upload>
      <template #footer>
        <span class="dialog-footer">
          <el-button size="small" @click="data.batchFormVisible = false">取 消</el-button>
          <el-button type="primary" size="small" @click="batchAdd">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog 
      title="生成报告" 
      v-model="data.reportFormVisible" 
      width="450px" 
      destroy-on-close
      :modal="true"
      :close-on-click-modal="false"
      append-to-body>
      <el-form ref="reportFormRef" :model="data.reportForm" :rules="reportRules" style="display: flex; flex-direction: column; align-items: center;">
        <el-form-item prop="beginTime" label="起始时间" style="margin-top: 5px;">
          <el-date-picker
            v-model="data.reportForm.beginTime"
            type="datetime"
            placeholder="请选择起始时间"
            format="YYYY-MM-DD HH:mm:ss"
            date-format="MMM DD, YYYY"
            time-format="HH:mm"
          />
        </el-form-item>
        <el-form-item prop="endTime" label="结束时间">
          <el-date-picker
            v-model="data.reportForm.endTime"
            type="datetime"
            placeholder="请选择结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            date-format="MMM DD, YYYY"
            time-format="HH:mm"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button size="small" @click="data.reportFormVisible = false">取 消</el-button>
          <el-button type="primary" size="small" @click="createReport">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 安全提醒组件 -->
    <SecurityAlert v-model="data.showSecurityAlert" @confirm="handleSecurityConfirm" />
  </div>
</template>

<script setup>

import {reactive, ref, computed} from "vue";
import request from "@/utils/request.js";
import {ElMessage, ElMessageBox} from "@/utils/element-plus";
import {Delete, Edit, View, Hide, Collection, UploadFilled, Search} from "@element-plus/icons-vue";
import Password from "./Password.vue";
import SecurityAlert from "@/components/SecurityAlert.vue";

// 表单引用
const formRef = ref(null)
const reportFormRef = ref(null)
// 批量上传组件引用
const batchUploadRef = ref(null)
const baseUrl = import.meta.env.VITE_BASE_URL

const uploadHeaders = computed(() => {
  const user = JSON.parse(localStorage.getItem('xm-user') || '{}')
  return { token: user.token || '' }
})

const indexMethod = (index) => {
  return (data.pageNum - 1) * data.pageSize + index + 1
}

const data = reactive({
  user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
  formVisible: false,
  form: {},
  reportFormVisible: false,
  batchFormVisible: false,  // 批量新增教师信息
  reportForm: {},
  tableData: [],
  labOptions: [],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  name: null,
  ids: [],
  Password: null,
  showPassword: false,
  showSecurityAlert: false,
  // 批量上传文件列表（受控模式，便于在上传成功后清空）
  batchFileList: []
})

// 表单验证规则
const rules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入电话', trigger: 'blur' },
    { min: 11, max: 11, message: '请检查是否正确', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
  ],
  employmentType: [
    { required: true, message: '请选择全职/非全职', trigger: 'change' }
  ],
  unit: [
    { required: true, message: '请输入单位', trigger: 'blur' },
  ],
  ofLab: [
    { required: true, message: '请输入所属实验室', trigger: 'blur' },
  ],
})

const reportRules = reactive({
  beginTime: [
    { required: true, message: '请选择起始时间', trigger: 'change' }
  ],
  endTime: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ],
})

const load = () => {
  if(data.user.role === 'ADMIN'){
    request.get('/teacher/selectTeachers', {
      params: {
        pageNum: data.pageNum,
        pageSize: data.pageSize,
        name: data.name
      }
    }).then(res => {
      if (res.code === '200') {
        data.tableData = res.data?.list || []
        data.total = res.data?.total
      }
    })
  }else{
    request.get('/teacher/selectPage', {
      params: {
        pageNum: data.pageNum,
        pageSize: data.pageSize,
        name: data.name
      }
    }).then(res => {
      if (res.code === '200') {
        data.tableData = res.data?.list || []
        data.total = res.data?.total
      }
    })
  }
}

const loadLabOptions = () => {
  request.get('/laboratory/selectAll').then(res => {
    if (res.code === '200') {
      // 后端直接返回数组，不是包装在list中
      data.labOptions = res.data || []
      data.labOptions.forEach(item => {
        // 后端返回的字段是userName，不是username
        item.value = item.userName
        item.label = item.laboratoryName
      })
      console.log('实验室选项加载成功:', data.labOptions)
    }
  }).catch(error => {
    console.error('加载实验室选项失败:', error)
    ElMessage.error('加载实验室选项失败')
  })
}

const handleAdd = () => {
  data.form = {}
  data.formVisible = true
}

const handleBatchAdd = () => {
  data.batchFormVisible = true
}

const handleEdit = (row) => {
  data.form = JSON.parse(JSON.stringify(row))
  data.formVisible = true
}
const add = () => {
  request.post('/teacher/add', data.form).then(res => {
    if (res.code === '200') {
      ElMessage.success('操作成功')
      data.formVisible = false
      load()
    } else {
      ElMessage.error(res.msg)
    }
  })
}

const update = () => {
  request.put('/teacher/update', data.form).then(res => {
    if (res.code === '200') {
      ElMessage.success('操作成功')
      data.formVisible = false
      load()
    }
  })
}

// 保存教师信息（包含表单验证）
const save = () => {
  if (!formRef.value) return
  
  formRef.value.validate((valid) => {
    if (valid) {
      // 验证通过，执行保存操作
      data.form.id ? update() : add()
    } else {
      // 验证失败，显示错误信息
      ElMessage.error('请填写完整的必填信息')
      return false
    }
  })
}

// 创建教师报告
const handleReportForm = (id) => {
  data.reportFormVisible = true
  if(data.user.role === 'ADMIN'){
    data.reportForm.targetId = id
    data.reportForm.targetType = 'TEACHER'
  }else{
    data.reportForm.teacherId = id
  }
}

const createReport = () => {
  if (!reportFormRef.value) return
  
  reportFormRef.value.validate((valid) => {
    console.log('form', data.reportForm)
    if (valid) {
      // 格式化时间为 YYYY-MM-DD 格式
      const formatDate = (date) => {
        if (!date) return null
        const d = new Date(date)
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }

      // 准备发送的参数，包含格式化后的时间
      const requestParams = {
        ...data.reportForm,
        beginTime: formatDate(data.reportForm.beginTime),
        endTime: formatDate(data.reportForm.endTime)
      }

      // 验证通过，执行保存操作
      if(data.user.role === 'ADMIN'){
        request.get('/report/admin', {
          params: requestParams
        }).then(res => {
        if (res.code === '200') {
          ElMessage.success('请求成功，请到报告信息页查看报告信息')
          data.reportFormVisible = false
        } else {
          ElMessage.error(res.msg)
        }
      })
      }else {
        request.get('/report/teacher', {
          params: requestParams
        }).then(res => {
        if (res.code === '200') {
          ElMessage.success('请求成功，请到报告信息页查看报告信息')
          data.reportFormVisible = false
        } else {
          ElMessage.error(res.msg)
        }
      })
      }
    } else {
      // 验证失败，显示错误信息
      ElMessage.error('请填写完整的必填信息')
    }
  })
}

const del = (id) => {
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', { type: 'warning', buttonSize: 'small' }).then(res => {
    request.delete('/teacher/delete/' + id).then(res => {
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
    request.delete("/teacher/delete/batch", {data: data.ids}).then(res => {
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

const handleFileUpload = (res) => {
  data.form.avatar = res.data
}

const reset = () => {
  data.name = null
  load()
}

const togglePasswordVisibility = () => {
  data.showPassword = !data.showPassword
}

// 批量上传前置校验
const beforeBatchUpload = (file) => {
  const isXlsx = file.name?.toLowerCase().endsWith('.xlsx') || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  const isLt10M = file.size / 1024 / 1024 <= 10
  if (!isXlsx) {
    ElMessage.error('仅支持 .xlsx 模板文件，请检查文件类型')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB')
    return false
  }
  return true
}

// 批量上传成功回调
const onBatchImportSuccess = (res) => {
  if (res?.code === '200') {
    ElMessage.success('教师信息导入成功')
    data.batchFormVisible = false
    data.batchFileList = []
    load()
    return
  }
}

// 批量上传失败回调
const onBatchImportError = (err) => {
  let msg = '文件上传失败，请稍后重试或联系管理员'
  try {
    const respText = err?.xhr?.responseText || err?.message
    if (respText) {
      try {
        const json = JSON.parse(respText)
        msg = json?.msg || msg
      } catch (_) {
        if (typeof respText === 'string' && respText.length <= 200) {
          msg = respText
        }
      }
    }
  } catch (_) {}
  ElMessage.error(msg)
}

// 超出文件数限制的处理
const handleBatchExceed = () => {
  ElMessage.warning('仅支持上传 1 个文件。如需替换，请先移除已选择的文件')
}

// 下载模板文件（函数级注释）
const downloadTemplate = () => {
  request.get('/teacher/import/template', { responseType: 'blob' })
    .then((blob) => {
      // 如果后端返回的是 Excel 文件的二进制流，直接创建下载链接
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      // 默认文件名，可根据需要改为后端返回的文件名
      a.download = '教师导入模板.xlsx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      ElMessage.success('模板下载成功')
    })
    .catch((err) => {
      console.error('模板下载失败:', err)
      ElMessage.error('模板下载失败，请稍后重试')
    })
}

// 批量导入提交
const batchAdd = () => {
  if (!data.batchFileList || data.batchFileList.length === 0) {
    ElMessage.warning('请先上传文件')
    return
  }
  batchUploadRef.value?.submit()
  // 不立即关闭对话框，待上传成功后在 onBatchImportSuccess 中关闭
}

// 处理对话框打开事件
const handleDialogOpened = () => {
  // 移除自动弹出安全提醒的逻辑
}

// 处理安全提醒确认
const handleSecurityConfirm = () => {
  data.showSecurityAlert = false
}

// 批量上传文件列表变更
const handleBatchChange = (file, fileList) => {
  data.batchFileList = fileList
}

// 批量上传移除文件
const handleBatchRemove = (file, fileList) => {
  data.batchFileList = fileList
}

// 关闭批量上传对话框时清理状态
const handleBatchDialogClosed = () => {
  // 清空文件列表
  data.batchFileList = []
  const uploader = batchUploadRef.value
  if (uploader && typeof uploader.clearFiles === 'function') {
    uploader.clearFiles()
  }
}

load()
loadLabOptions()
</script>


<style scoped>
.teacher-type-tag {
  font-weight: 500;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
}

.teacher-type-tag.el-tag--info {
  background-color: #f4f4f5;
  border-color: #e9e9eb;
  color: #909399;
}

.teacher-type-tag.el-tag--success {
  background-color: #f0f9ff;
  border-color: #c6f6d5;
  color: #38a169;
}

.template-link {
  color: #409EFF;
  cursor: pointer;
  margin-right: 1px;
}
.template-link:hover {
  text-decoration: underline;
}

.no-data-text {
  color: #909399;
  font-size: 12px;
}
</style>