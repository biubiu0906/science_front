<template>
  <div>
    <div class="card" style="margin-bottom: 5px">
      <el-input v-model="data.name" :prefix-icon="Search" style="width: 240px; margin-right: 10px" placeholder="请输入学校名称查询"></el-input>
      <el-button type="info" plain size="small" @click="load">查询</el-button>
      <el-button type="warning" plain size="small" style="margin: 0 10px" @click="reset">重置</el-button>
    </div>

    <div class="card" style="margin-bottom: 5px" v-if="data.user.role === 'SUPER_ADMIN'">
      <div style="margin-bottom: 10px; margin-left: 10px;">
        <el-button type="primary" plain size="small" @click="handleAdd">新增</el-button>
        <el-button type="danger" plain size="small" @click="delBatch">批量删除</el-button>
      </div>
    </div>

    <div class="card" style="margin-bottom: 5px">
      <el-table stripe :data="data.tableData" @selection-change="handleSelectionChange" :header-cell-style="{backgroundColor: '#e9edf2'}" class="table-center" empty-text="暂无数据">
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" :index="indexMethod" width="60" />
        <el-table-column prop="name" label="学校名称" />
        <el-table-column label="操作" width="120" fixed="right" v-if="data.user.role === 'SUPER_ADMIN'">
          <template v-slot="scope">
            <!--<el-tooltip content="查看画像" placement="bottom" effect="light">
              <el-button type="primary" circle :icon="View" @click="openProfile(scope.row)" size="small"></el-button>
            </el-tooltip>-->
            <el-tooltip content="删除" placement="bottom" effect="light">
              <el-button type="danger" circle :icon="Delete" @click="del(scope.row.id)" size="small"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="card" v-if="data.total">
      <el-pagination @current-change="load" background layout="prev, pager, next" :page-size="data.pageSize" v-model:current-page="data.pageNum" :total="data.total" />
    </div>

    <el-dialog title="新增学校" v-model="data.formVisible" width="30%" destroy-on-close>
      <el-form :model="data.form" ref="formRef" :rules="rules" label-width="80px" style="padding: 20px">
        <el-form-item label="学校名称" prop="name">
          <el-input v-model="data.form.name" placeholder="请输入学校名称"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="data.formVisible = false">取消</el-button>
          <el-button type="primary" @click="save">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { Search, Delete, View } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import request from "@/utils/request";
import { ElMessage, ElMessageBox } from "@/utils/element-plus";

const router = useRouter()

const data = reactive({
  user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
  name: '',
  tableData: [],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  formVisible: false,
  form: {},
  ids: []
})

const formRef = ref(null)

const rules = reactive({
  name: [
    { required: true, message: '请输入学校名称', trigger: 'blur' }
  ]
})

const indexMethod = (index) => {
  return (data.pageNum - 1) * data.pageSize + index + 1
}

const load = () => {
  request.get('/school/selectPage', {
    params: {
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      name: data.name
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

const reset = () => {
  data.name = ''
  load()
}

const handleAdd = () => {
  data.form = {}
  data.formVisible = true
}

const save = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      request.post('/school/add', data.form).then(res => {
        if (res.code === '200') {
          ElMessage.success('新增成功')
          data.formVisible = false
          load()
        } else {
          ElMessage.error(res.msg)
        }
      })
    }
  })
}

const del = (id) => {
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', { type: 'warning', buttonSize: 'small' }).then(res => {
    request.delete('/school/delete/' + id).then(res => {
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
    request.delete("/school/delete/batch", {data: data.ids}).then(res => {
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

const openProfile = (row) => {
  if (!row?.id) return
  router.push({ path: '/manager/entityProfile', query: { type: 'school', id: row.id } })
}

load()
</script>

<style scoped>

</style>
