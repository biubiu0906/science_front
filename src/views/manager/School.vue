<template>
  <div>
    <div class="card" style="margin-bottom: 5px">
      <el-input
        v-model="data.name"
        :prefix-icon="Search"
        style="width: 240px; margin-right: 10px"
        placeholder="请输入学校名称查询"
        :disabled="data.loading"
      />
      <el-button type="info" plain size="small" :loading="data.loading" @click="search">查询</el-button>
      <el-button type="warning" plain size="small" style="margin: 0 10px" :disabled="data.loading" @click="reset">重置</el-button>
    </div>

    <div class="card" style="margin-bottom: 5px">
      <div style="margin-bottom: 10px; margin-left: 10px;">
        <el-button type="primary" plain size="small" :disabled="data.loading" @click="handleAdd">新增</el-button>
        <el-button type="danger" plain size="small" :disabled="data.loading" @click="delBatch">批量删除</el-button>
      </div>
      <el-table
        stripe
        v-loading="data.loading"
        :data="data.tableData"
        @selection-change="handleSelectionChange"
        :header-cell-style="{ backgroundColor: '#e9edf2' }"
        class="table-center"
        empty-text="暂无数据"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" :index="indexMethod" width="60" />
        <el-table-column prop="name" label="学校名称" min-width="220" sortable />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template v-slot="scope">
            {{ formatDateTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180">
          <template v-slot="scope">
            {{ formatDateTime(scope.row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template v-slot="scope">
            <el-tooltip content="查看画像" placement="bottom" effect="light">
              <el-button type="success" circle :icon="View" size="small" @click="openProfile(scope.row)" />
            </el-tooltip>
            <el-tooltip content="编辑" placement="bottom" effect="light">
              <el-button type="primary" circle :icon="Edit" size="small" @click="handleEdit(scope.row)" />
            </el-tooltip>
            <el-tooltip content="删除" placement="bottom" effect="light">
              <el-button type="danger" circle :icon="Delete" size="small" @click="del(scope.row.id)" />
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

    <el-dialog :title="data.form.id ? '编辑学校' : '新增学校'" v-model="data.formVisible" width="30%" destroy-on-close>
      <el-form ref="formRef" :model="data.form" :rules="rules" label-width="80px" style="padding: 20px">
        <el-form-item label="学校名称" prop="name">
          <el-input v-model="data.form.name" placeholder="请输入学校名称" maxlength="255" show-word-limit />
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
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import request from "@/utils/request.js";
import { clearSchoolsCache } from "@/utils/dict.js";
import { usePaginationQuery } from "@/utils/paginationQuery.js";
import { clearTableQuery, tableQueryParams } from "@/utils/tableQuery.js";
import { ElMessage, ElMessageBox } from "@/utils/element-plus";
import { Delete, Edit, Search, View } from "@element-plus/icons-vue";

const router = useRouter()
const queryFields = ['name']

const data = reactive({
  name: null,
  tableData: [],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  formVisible: false,
  form: {},
  ids: [],
  loading: false
})

const paginationQuery = usePaginationQuery(data)
const formRef = ref(null)

const rules = reactive({
  name: [
    { required: true, message: '请输入学校名称', trigger: 'blur' },
    { min: 2, max: 255, message: '学校名称长度在 2 到 255 个字符', trigger: 'blur' }
  ]
})

const indexMethod = (index) => {
  return (data.pageNum - 1) * data.pageSize + index + 1
}

const formatDateTime = (value) => {
  if (!value) return ''
  return String(value).replace('T', ' ').slice(0, 19)
}

const schoolPayload = () => ({
  id: data.form.id,
  name: data.form.name?.trim()
})

const load = () => {
  data.loading = true
  paginationQuery.sync()
  request.get('/school/selectPage', {
    params: {
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      ...tableQueryParams(data, queryFields)
    }
  }).then(res => {
    if (res.code === '200') {
      data.tableData = res.data?.list || []
      data.total = res.data?.total || 0
    } else {
      ElMessage.error(res.msg)
    }
  }).finally(() => {
    data.loading = false
  })
}

const handleAdd = () => {
  data.form = { name: '' }
  data.formVisible = true
}

const handleEdit = (row) => {
  data.form = {
    id: row.id,
    name: row.name
  }
  data.formVisible = true
}

const add = () => {
  request.post('/school/add', schoolPayload()).then(res => {
    if (res.code === '200') {
      ElMessage.success('操作成功')
      clearSchoolsCache()
      data.formVisible = false
      load()
    } else {
      ElMessage.error(res.msg)
    }
  })
}

const update = () => {
  request.put('/school/update', schoolPayload()).then(res => {
    if (res.code === '200') {
      ElMessage.success('操作成功')
      clearSchoolsCache()
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
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', { type: 'warning', buttonSize: 'small' }).then(() => {
    request.delete('/school/delete/' + id).then(res => {
      if (res.code === '200') {
        ElMessage.success('删除成功')
        clearSchoolsCache()
        load()
      } else {
        ElMessage.error(res.msg)
      }
    })
  }).catch(() => {})
}

const delBatch = () => {
  if (!data.ids.length) {
    ElMessage.warning('请选择数据')
    return
  }
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', { type: 'warning', buttonSize: 'small' }).then(() => {
    request.delete('/school/delete/batch', { data: data.ids }).then(res => {
      if (res.code === '200') {
        ElMessage.success('操作成功')
        clearSchoolsCache()
        load()
      } else {
        ElMessage.error(res.msg)
      }
    })
  }).catch(() => {})
}

const handleSelectionChange = (rows) => {
  data.ids = rows.map(v => v.id)
}

const openProfile = (row) => {
  if (!row?.id) return
  router.push({ path: '/manager/entityProfile', query: { type: 'school', id: row.id } })
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

load()
</script>
