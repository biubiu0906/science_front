<template>
  <div>
    <div class="card" style="margin-bottom: 5px">
      <el-input v-model="data.name" prefix-icon="Search" style="width: 240px; margin-right: 10px" placeholder="请输入姓名查询"></el-input>
      <el-button type="info" plain size="small" @click="load">查询</el-button>
        <el-button type="warning" plain size="small" style="margin: 0 10px" @click="reset">重置</el-button>
      </div>

    <div class="card" style="margin-bottom: 5px">
      <div style="margin-bottom: 10px; margin-left: 10px;">
        <el-button type="primary" plain size="small" @click="handleAdd">新增</el-button>
        <el-button type="danger" plain size="small" @click="delBatch">批量删除</el-button>
      </div>
      <el-table stripe :data="data.tableData" @selection-change="handleSelectionChange" :header-cell-style="{backgroundColor: '#e9edf2'}" class="table-center">
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="80" />
        <el-table-column prop="avatar" label="头像" align="center">
          <template v-slot="scope">
            <el-image style="width: 30px; height: 30px; border-radius: 50%; display: block; margin: 0 auto"
                      :src="scope.row.avatar || '/src/assets/imgs/头像.jpeg'" 
                      :preview-src-list="[scope.row.avatar || '/src/assets/imgs/头像.jpeg']" 
                      preview-teleported></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" min-width="100" sortable />
        <el-table-column prop="gender" label="性别" sortable>
          <template v-slot="scope">
            {{ scope.row.gender === 'boy' ? '男' : scope.row.gender === 'girl' ? '女' : scope.row.gender === 'Male' ? '男' : scope.row.gender === 'Female' ? '女' : scope.row.gender }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="电话" min-width="120" sortable />
        <el-table-column prop="email" label="邮箱" min-width="120" sortable />
        <el-table-column prop="unit" label="单位" min-width="120" sortable />
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
        <el-table-column prop="username" label="用户名" sortable />
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
        <el-table-column label="操作" width="100" fixed="right">
          <template v-slot="scope">
            <el-button type="primary" circle size="small" :icon="Edit" @click="handleEdit(scope.row)"></el-button>
            <el-button type="danger" circle size="small" :icon="Delete" @click="del(scope.row.id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="card" v-if="data.total">
      <el-pagination @current-change="load" background layout="prev, pager, next" :page-size="data.pageSize" v-model:current-page="data.pageNum" :total="data.total" />
    </div>

    <el-dialog title="教师信息" v-model="data.formVisible" width="40%" destroy-on-close>
      <el-form ref="formRef" :model="data.form" :rules="rules" label-width="100px" style="padding: 20px">
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
  </div>
</template>

<script setup>

import {reactive, ref} from "vue";
import request from "@/utils/request.js";
import {ElMessage, ElMessageBox} from "element-plus";
import {Delete, Edit, View, Hide} from "@element-plus/icons-vue";
import Password from "./Password.vue";

// 表单引用
const formRef = ref(null)

const baseUrl = import.meta.env.VITE_BASE_URL

const data = reactive({
  user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
  formVisible: false,
  form: {},
  tableData: [],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  name: null,
  ids: [],
  Password: null,
  showPassword: false
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
const handleAdd = () => {
  data.form = {}
  data.formVisible = true
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

const del = (id) => {
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', { type: 'warning' }).then(res => {
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
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', { type: 'warning' }).then(res => {
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

load()
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
</style>