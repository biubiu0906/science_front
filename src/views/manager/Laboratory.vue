<template>
  <div>
    <div class="card" style="margin-bottom: 5px">
      <el-input v-model="data.labName" :prefix-icon="Search" style="width: 240px; margin-right: 10px" placeholder="请输入实验室名称查询"></el-input>
      <el-button type="info" plain size="small" @click="load">查询</el-button>
        <el-button type="warning" plain size="small" style="margin: 0 10px" @click="reset">重置</el-button>
      </div>

    <div class="card" style="margin-bottom: 5px">
      <div style="margin-bottom: 10px; margin-left: 10px;">
        <el-button type="primary" plain size="small" @click="handleAdd">新增</el-button>
        <el-button type="danger" plain size="small" @click="delBatch">批量删除</el-button>
      </div>
      <el-table stripe :data="data.tableData" @selection-change="handleSelectionChange" :header-cell-style="{ backgroundColor: '#e9edf2' }" class="table-center" empty-text="暂无数据">
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" :index="indexMethod" width="60" />
        <el-table-column prop="laboratoryName" label="实验室名称" sortable>
          <template v-slot="scope">
            <span v-if="scope.row.laboratoryName">{{ scope.row.laboratoryName }}</span>
            <span v-else class="no-data-text">暂无数据</span>
          </template>
        </el-table-column>
        <el-table-column prop="laboratoryDescription" label="实验室描述" sortable>
          <template v-slot="scope">
            <span v-if="scope.row.laboratoryDescription">{{ scope.row.laboratoryDescription }}</span>
            <span v-else class="no-data-text">暂无数据</span>
          </template>
        </el-table-column>
        <el-table-column prop="laboratoryAddress" label="实验室地址" sortable>
          <template v-slot="scope">
            <span v-if="scope.row.laboratoryAddress">{{ scope.row.laboratoryAddress }}</span>
            <span v-else class="no-data-text">暂无数据</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="实验室类别" sortable>
          <template v-slot="scope">
            <el-tag 
              :type="scope.row.type == 1 ? 'primary' : 'success'" 
              class="lab-type-tag"
            >
              {{ scope.row.type == 1 ? '普通实验室' : '重点实验室' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="账号" sortable>
          <template v-slot="scope">
            <span v-if="scope.row.username">{{ scope.row.username }}</span>
            <span v-else class="no-data-text">暂无数据</span>
          </template>
        </el-table-column>
        <el-table-column prop="password" label="密码" width="150" sortable>
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
            <el-tooltip content="编辑实验室" placement="bottom" effect="light">
              <el-button type="primary" circle size="small" :icon="Edit" @click="handleEdit(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="生成报告" placement="bottom" effect="light">
              <el-button type="success" circle size="small" :icon="Collection" @click="handleReportForm(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除实验室" placement="bottom" effect="light">
              <el-button type="danger" circle size="small" :icon="Delete" @click="del(scope.row.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="card" v-if="data.total">
      <el-pagination @current-change="load" background layout="prev, pager, next" :page-size="data.pageSize" v-model:current-page="data.pageNum" :total="data.total" />
    </div>

    <el-dialog title="实验室信息" v-model="data.formVisible" width="40%" destroy-on-close>
      <el-form ref="formRef" :model="data.form" :rules="rules" label-width="100px" style="padding: 20px">
        <el-form-item prop="username" label="账号">
          <el-input v-model="data.form.username" placeholder="请输入实验室账号"></el-input>
        </el-form-item>
        <el-form-item prop="password" label="密码">
          <el-input v-model="data.form.password" type="password" placeholder="请输入密码" show-password></el-input>
        </el-form-item>
        <el-form-item prop="laboratoryName" label="实验室名称">
          <el-input v-model="data.form.laboratoryName" placeholder="请输入实验室名称"></el-input>
        </el-form-item>
        <el-form-item prop="laboratoryDescription" label="实验室描述">
          <el-input v-model="data.form.laboratoryDescription" placeholder="请输入实验室描述"></el-input>
        </el-form-item>
        <el-form-item prop="laboratoryAddress" label="实验室地址">
          <el-input v-model="data.form.laboratoryAddress" placeholder="请输入实验室地址"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button size="small" @click="data.formVisible = false">取 消</el-button>
        <el-button type="primary" size="small" @click="save">确 定</el-button>
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
  </div>
</template>

<script setup>

import {reactive, ref} from "vue";
import request from "@/utils/request.js";
import {ElMessage, ElMessageBox} from "@/utils/element-plus";
import {Delete, Edit, View, Hide, Collection, Search} from "@element-plus/icons-vue";

// 表单引用
const formRef = ref(null)
const reportFormRef = ref(null)

const indexMethod = (index) => {
  return (data.pageNum - 1) * data.pageSize + index + 1
}

const data = reactive({
  formVisible: false,
  form: {},
  reportFormVisible: false,
  reportForm: {},
  tableData: [],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  ids: [],
  laboratoryName: null,
  username: null,
  password: null,
  showPassword: false,
  laboratoryDescription: null,
  laboratoryAddress: null
})

// 表单验证规则
const rules = reactive({
  username: [
    { required: true, message: '请输入实验室账号', trigger: 'blur' },
    { min: 3, max: 20, message: '账号长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  laboratoryName: [
    { required: true, message: '请输入实验室名称', trigger: 'blur' },
    { min: 2, max: 50, message: '实验室名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
})

const load = () => {
  request.get('/laboratory/selectPage', {
    params: {
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      labName: data.labName
    }
  }).then(res => {
    if (res.code === '200') {
      data.tableData = res.data?.list || []
      data.total = res.data?.total
    }
  })
}
const handleAdd = () => {
  data.form = {}
  data.formVisible = true
}
const handleEdit = (row) => {
  data.form = JSON.parse(JSON.stringify(row))
  data.formVisible = true
}
const add = () => {
  request.post('/laboratory/add', data.form).then(res => {
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
  request.put('/laboratory/update', data.form).then(res => {
    if (res.code === '200') {
      ElMessage.success('操作成功')
      data.formVisible = false
      load()
    }
  })
}

const save = () => {
  // 表单验证
  if (!formRef.value) {
    ElMessage.error('表单引用未找到')
    return
  }
  
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
  data.reportForm.targetType = 'LAB'
  data.reportForm.targetId = id
}

const createReport = () => {
  if (!reportFormRef.value) return
  reportFormRef.value.validate((valid) => {
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
    } else {
      // 验证失败，显示错误信息
      ElMessage.error('请填写完整的必填信息')
    }
  })
}

const del = (id) => {
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', { type: 'warning', buttonSize: 'small' }).then(res => {
    request.delete('/laboratory/delete/' + id).then(res => {
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
    request.delete("/laboratory/delete/batch", {data: data.ids}).then(res => {
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
  data.labName = null
  load()
}

const togglePasswordVisibility = () => {
  data.showPassword = !data.showPassword
}


load()
</script>

<style scoped>
.lab-type-tag {
  font-weight: 500;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
}

.lab-type-tag.el-tag--info {
  background-color: #f4f4f5;
  border-color: #e9e9eb;
  color: #909399;
}

.lab-type-tag.el-tag--success {
  background-color: #f0f9ff;
  border-color: #c6f6d5;
  color: #38a169;
}

.no-data-text {
  color: #909399;
  font-size: 12px;
}
</style>