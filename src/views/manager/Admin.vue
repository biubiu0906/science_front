<template>
  <div>
    <div class="card" style="margin-bottom: 5px">
      <el-input v-model="data.name" :prefix-icon="Search" style="width: 240px; margin-right: 10px" placeholder="请输入名称查询"></el-input>
      <el-input v-model="data.username" :prefix-icon="Search" style="width: 180px; margin-right: 10px" placeholder="请输入用户名查询"></el-input>
      <el-input v-model="data.phone" :prefix-icon="Search" style="width: 160px; margin-right: 10px" placeholder="请输入电话查询"></el-input>
      <el-input v-model="data.email" :prefix-icon="Search" style="width: 200px; margin-right: 10px" placeholder="请输入邮箱查询"></el-input>
      <el-button type="info" plain @click="search" size="small">查询</el-button>
      <el-button type="warning" plain style="margin: 0 10px" @click="reset" size="small">重置</el-button>
    </div>
    

    <div class="card" style="margin-bottom: 5px">
      <div style="margin-bottom: 10px; margin-left: 10px;">
        <el-button type="primary" plain @click="handleAdd" size="small">新增</el-button>
        <el-button type="danger" plain @click="delBatch" size="small">批量删除</el-button>
      </div>
      <el-table stripe :data="data.tableData" @selection-change="handleSelectionChange" :header-cell-style="{backgroundColor: '#e9edf2'}" class="table-center" empty-text="暂无数据">
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" :index="indexMethod" width="60" />
        <el-table-column prop="avatar" label="头像" align="center">
          <template v-slot="scope">
            <el-image style="width: 30px; height: 30px; border-radius: 50%; display: block; margin: 0 auto"
                      :src="scope.row.avatar || '/avatar.png'" 
                      :preview-src-list="[scope.row.avatar || '/avatar.png']" 
                      preview-teleported></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" sortable>
          <template v-slot="scope">
            <span v-if="scope.row.name">{{ scope.row.name }}</span>
            <span v-else class="no-data-text">暂无数据</span>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="电话" sortable>
          <template v-slot="scope">
            <span v-if="scope.row.phone">{{ scope.row.phone }}</span>
            <span v-else class="no-data-text">暂无数据</span>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" sortable>
          <template v-slot="scope">
            <span v-if="scope.row.email">{{ scope.row.email }}</span>
            <span v-else class="no-data-text">暂无数据</span>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" sortable>
          <template v-slot="scope">
            <span v-if="scope.row.username">{{ scope.row.username }}</span>
            <span v-else class="no-data-text">暂无数据</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template v-slot="scope">
            <el-tooltip content="编辑管理员" placement="bottom" effect="light">
              <el-button type="primary" circle :icon="Edit" @click="handleEdit(scope.row)" size="small"></el-button>
            </el-tooltip>
            <el-tooltip content="删除管理员" placement="bottom" effect="light">
              <el-button type="danger" circle :icon="Delete" @click="del(scope.row.id)" size="small"></el-button>
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

    <el-dialog title="管理员信息" v-model="data.formVisible" width="40%" destroy-on-close @opened="handleDialogOpened">
      <el-form ref="formRef" :model="data.form" :rules="rules" label-width="70px" style="padding: 20px">
        <el-form-item prop="username" label="用户名">
          <el-input v-model="data.form.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item prop="password" label="密码" v-if="!data.form.id">
          <el-input v-model="data.form.password" type="password" placeholder="请输入密码" show-password></el-input>
        </el-form-item>
        <el-form-item prop="name" label="姓名">
          <el-input v-model="data.form.name" placeholder="请输入姓名"></el-input>
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
        <el-form-item prop="phone" label="电话">
          <el-input v-model="data.form.phone" placeholder="请输入电话"></el-input>
        </el-form-item>
        <el-form-item prop="email" label="邮箱">
          <el-input v-model="data.form.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="data.formVisible = false" size="small">取 消</el-button>
          <el-button type="primary" @click="save" size="small">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 安全提醒组件 -->
    <SecurityAlert v-model="data.showSecurityAlert" @confirm="handleSecurityConfirm" />
  </div>
</template>

<script setup>

import {reactive, ref} from "vue";
import request from "@/utils/request.js";
import { usePaginationQuery } from '@/utils/paginationQuery.js';
import { clearTableQuery, tableQueryParams } from '@/utils/tableQuery.js';
import {ElMessage, ElMessageBox} from "@/utils/element-plus";
import {Delete, Edit, View, Hide, Search} from "@element-plus/icons-vue";
import SecurityAlert from "@/components/SecurityAlert.vue";
import { encrypt, getSecurityParams } from '@/utils/rsa.js'

// 表单引用
const formRef = ref(null)

const baseUrl = import.meta.env.VITE_BASE_URL
const queryFields = ['name', 'username', 'phone', 'email']

const data = reactive({
  formVisible: false,
  form: {},
  tableData: [],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  name: null,
  username: null,
  phone: null,
  email: null,
  ids: [],
  showSecurityAlert: false
})

const paginationQuery = usePaginationQuery(data)

const indexMethod = (index) => {
  return (data.pageNum - 1) * data.pageSize + index + 1
}

const rules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度在 2 到 10 个字符', trigger: 'blur' }
  ]
})

const load = () => {
  paginationQuery.sync()
  request.get('/admin/selectPage', {
    params: {
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      ...tableQueryParams(data, queryFields)
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
const add = async () => {
  try {
    const addData = { ...data.form }
    // 加密密码
    addData.password = await encrypt(addData.password)
    // 获取安全参数
    const securityParams = await getSecurityParams()
    Object.assign(addData, securityParams)

    request.post('/admin/add', addData).then(res => {
      if (res.code === '200') {
        ElMessage.success('操作成功')
        data.formVisible = false
        load()
      } else {
        ElMessage.error(res.msg)
      }
    })
  } catch (e) {
    ElMessage.error(e.message || '操作失败')
  }
}

const update = () => {
  request.put('/admin/update', data.form).then(res => {
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
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', { type: 'warning', buttonSize: 'small' }).then(res => {
    request.delete('/admin/delete/' + id).then(res => {
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
    request.delete("/admin/delete/batch", {data: data.ids}).then(res => {
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

const search = () => {
  paginationQuery.reset()
  load()
}

const reset = () => {
  clearTableQuery(data, queryFields)
  paginationQuery.reset()
  load()
}

// 处理对话框打开事件
const handleDialogOpened = () => {
  // 移除自动弹出安全提醒的逻辑
}

// 处理安全提醒确认
const handleSecurityConfirm = () => {
  data.showSecurityAlert = false
}

load()
</script>

<style scoped>
.no-data-text {
  color: #909399;
  font-size: 12px;
}
</style>
