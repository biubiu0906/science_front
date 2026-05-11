<template>
  <div>
    <div class="card" style="margin-bottom: 5px">
      <el-input v-model="data.username" :prefix-icon="Search" style="width: 180px; margin-right: 10px" placeholder="请输入用户名查询"></el-input>
      <el-input v-model="data.name" :prefix-icon="Search" style="width: 240px; margin-right: 10px" placeholder="请输入姓名查询"></el-input>
      <el-input v-model="data.phone" :prefix-icon="Search" style="width: 160px; margin-right: 10px" placeholder="请输入电话查询"></el-input>
      <el-input v-model="data.email" :prefix-icon="Search" style="width: 200px; margin-right: 10px" placeholder="请输入邮箱查询"></el-input>
      <el-select v-model="data.schoolId" placeholder="请选择学校查询" style="width: 240px; margin-right: 10px" clearable filterable>
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <el-option v-for="item in data.schools" :key="item.id" :label="item.name" :value="item.id"></el-option>
      </el-select>
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
        <el-table-column prop="username" label="用户名" sortable />
        <el-table-column prop="name" label="姓名" sortable />
        <el-table-column prop="schoolId" label="所属学校" sortable>
          <template v-slot="scope">
            {{ getSchoolName(scope.row.schoolId) }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="电话" sortable />
        <el-table-column prop="email" label="邮箱" sortable />
        <el-table-column label="操作" width="100" fixed="right">
          <template v-slot="scope">
            <el-tooltip content="编辑" placement="bottom" effect="light">
              <el-button type="primary" circle :icon="Edit" @click="handleEdit(scope.row)" size="small"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="bottom" effect="light">
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

    <el-dialog title="学校管理员信息" v-model="data.formVisible" width="40%" destroy-on-close>
      <el-form ref="formRef" :model="data.form" :rules="rules" label-width="80px" style="padding: 20px">
        <el-form-item prop="username" label="用户名">
          <el-input v-model="data.form.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item prop="password" label="密码" v-if="!data.form.id">
          <el-input v-model="data.form.password" type="password" placeholder="请输入密码" show-password></el-input>
        </el-form-item>
        <el-form-item prop="name" label="姓名">
          <el-input v-model="data.form.name" placeholder="请输入姓名"></el-input>
        </el-form-item>
        <el-form-item prop="schoolId" label="所属学校">
           <el-select v-model="data.form.schoolId" placeholder="请选择学校" style="width: 100%" filterable>
            <el-option v-for="item in data.schools" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="avatar" label="头像">
          <el-upload
              :action="baseUrl + '/files/upload'"
              :on-success="handleFileUpload"
              list-type="picture"
              :show-file-list="false"
              >
            <el-button type="primary" size="small">点击上传</el-button>
            <div v-if="data.form.avatar" style="margin-left: 10px; display: inline-block; vertical-align: middle;">
                <el-image :src="data.form.avatar" style="width: 50px; height: 50px; border-radius: 5px;" preview-teleported></el-image>
            </div>
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
  </div>
</template>

<script setup>
import {reactive, ref, onMounted} from "vue";
import request from "@/utils/request.js";
import { usePaginationQuery } from '@/utils/paginationQuery.js';
import { clearTableQuery, tableQueryParams } from '@/utils/tableQuery.js';
import {ElMessage, ElMessageBox} from "@/utils/element-plus";
import {Delete, Edit, Search} from "@element-plus/icons-vue";
import { encrypt, getSecurityParams } from '@/utils/rsa.js'

const formRef = ref(null)
const baseUrl = import.meta.env.VITE_BASE_URL
const queryFields = ['username', 'name', 'schoolId', 'phone', 'email']

const data = reactive({
  formVisible: false,
  form: {},
  tableData: [],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  username: null,
  name: null,
  schoolId: null, // Filter
  phone: null,
  email: null,
  schools: [], // List of schools
  ids: []
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
  ],
  schoolId: [
    { required: true, message: '请选择所属学校', trigger: 'change' }
  ]
})

const loadSchools = () => {
  request.get('/school/selectAll').then(res => {
    if (res.code === '200') {
      data.schools = res.data || []
    }
  })
}

const getSchoolName = (schoolId) => {
  const school = data.schools.find(s => s.id === schoolId)
  return school ? school.name : schoolId
}

const load = () => {
  paginationQuery.sync()
  request.get('/schoolAdmin/selectPage', {
    params: {
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      ...tableQueryParams(data, queryFields)
    }
  }).then(res => {
    if (res.code === '200') {
      data.tableData = res.data?.list || []
      data.total = res.data?.total
    } else {
      ElMessage.error(res.msg)
    }
  })
}

const handleAdd = () => {
  data.form = {}
  data.formVisible = true
  loadSchools()
}

const handleEdit = (row) => {
  data.form = JSON.parse(JSON.stringify(row))
  data.formVisible = true
  loadSchools()
}

const add = async () => {
  try {
    const addData = { ...data.form }
    // 加密密码
    if (addData.password) {
        addData.password = await encrypt(addData.password)
    }
    // 获取安全参数
    const securityParams = await getSecurityParams()
    Object.assign(addData, securityParams)

    request.post('/schoolAdmin/add', addData).then(res => {
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
  request.put('/schoolAdmin/update', data.form).then(res => {
    if (res.code === '200') {
      ElMessage.success('操作成功')
      data.formVisible = false
      load()
    } else {
      ElMessage.error(res.msg)
    }
  })
}

const save = () => {
  if (!formRef.value) return
  formRef.value.validate((valid) => {
    if (valid) {
      data.form.id ? update() : add()
    }
  })
}

const del = (id) => {
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', { type: 'warning', buttonSize: 'small' }).then(res => {
    request.delete('/schoolAdmin/delete/' + id).then(res => {
      if (res.code === '200') {
        ElMessage.success("删除成功")
        load()
      } else {
        ElMessage.error(res.msg)
      }
    })
  }).catch(err => {})
}

const delBatch = () => {
  if (!data.ids.length) {
    ElMessage.warning("请选择数据")
    return
  }
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', { type: 'warning', buttonSize: 'small' }).then(res => {
    request.delete("/schoolAdmin/delete/batch", {data: data.ids}).then(res => {
      if (res.code === '200') {
        ElMessage.success('操作成功')
        load()
      } else {
        ElMessage.error(res.msg)
      }
    })
  }).catch(err => {})
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

onMounted(() => {
    loadSchools()
    load()
})
</script>

<style scoped>
.no-data-text {
  color: #909399;
  font-size: 12px;
}
</style>
