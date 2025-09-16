<template>
  <div>
    <div class="card" style="margin-bottom: 5px">
      <el-input v-model="data.labName" prefix-icon="Search" style="width: 240px; margin-right: 10px" placeholder="请输入实验室名称查询"></el-input>
      <el-button type="info" plain @click="load">查询</el-button>
      <el-button type="warning" plain style="margin: 0 10px" @click="reset">重置</el-button>
    </div>
    <div class="card" style="margin-bottom: 5px">
      <el-button type="primary" plain @click="handleAdd">新增</el-button>
      <el-button type="danger" plain @click="delBatch">批量删除</el-button>
    </div>

    <div class="card" style="margin-bottom: 5px">
      <el-table stripe :data="data.tableData" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="labName" label="实验室名称" />
        <el-table-column prop="level" label="级别" />
        <el-table-column prop="totalStaff" label="人数" />
        <el-table-column prop="establishmentDate" label="成立时间" />
        <el-table-column prop="username" label="账号" />
        <el-table-column prop="password" label="密码">
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
            <el-button type="primary" circle :icon="Edit" @click="handleEdit(scope.row)"></el-button>
            <el-button type="danger" circle :icon="Delete" @click="del(scope.row.id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="card" v-if="data.total">
      <el-pagination @current-change="load" background layout="prev, pager, next" :page-size="data.pageSize" v-model:current-page="data.pageNum" :total="data.total" />
    </div>

    <el-dialog title="实验室信息" v-model="data.formVisible" width="40%" destroy-on-close>
      <el-form ref="formRef" :model="data.form" :rules="rules" label-width="90px" style="padding: 20px">
        <el-form-item prop="username" label="账号">
          <el-input v-model="data.form.username" placeholder="请输入实验室账号"></el-input>
        </el-form-item>
        <el-form-item prop="password" label="密码">
          <el-input v-model="data.form.password" type="password" placeholder="请输入密码" show-password></el-input>
        </el-form-item>
        <el-form-item prop="labName" label="实验室名称">
          <el-input v-model="data.form.labName" placeholder="请输入实验室名称"></el-input>
        </el-form-item>
        <el-form-item prop="level" label="级别">
          <el-input v-model="data.form.level" placeholder="请输入实验室级别"></el-input>
        </el-form-item>
        <el-form-item prop="totalStaff" label="人数">
          <el-input v-model="data.form.totalStaff" placeholder="请输入实验室人数"></el-input>
        </el-form-item>
        <el-form-item prop="establishmentDate" label="成立时间">
          <el-input v-model="data.form.establishmentDate" placeholder="请输入实验室成立时间"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="data.formVisible = false">取 消</el-button>
          <el-button type="primary" @click="save">确 定</el-button>
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

// 表单引用
const formRef = ref(null)

const baseUrl = import.meta.env.VITE_BASE_URL

const data = reactive({
  formVisible: false,
  form: {},
  tableData: [],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  ids: [],
  labName: null,
  level: null,
  totalStaff: null,
  establishmentDate: null,
  username: null,
  password: null,
  showPassword: false // 控制密码显示状态
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
  labName: [
    { required: true, message: '请输入实验室名称', trigger: 'blur' },
    { min: 2, max: 50, message: '实验室名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  level: [
    { required: true, message: '请输入实验室级别', trigger: 'blur' }
  ],
  totalStaff: [
    { required: true, message: '请输入实验室人数', trigger: 'blur' },
    { pattern: /^\d+$/, message: '人数必须为正整数', trigger: 'blur' }
  ],
  establishmentDate: [
    { required: true, message: '请输入成立时间', trigger: 'blur' }
  ]
})

const load = () => {
  request.get('/lab/selectPage', {
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
  request.post('/lab/add', data.form).then(res => {
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
  request.put('/lab/update', data.form).then(res => {
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

const del = (id) => {
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', { type: 'warning' }).then(res => {
    request.delete('/lab/delete/' + id).then(res => {
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
    request.delete("/lab/delete/batch", {data: data.ids}).then(res => {
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