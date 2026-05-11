<template>
  <div>
    <div class="card" style="margin-bottom: 5px">
      <el-select v-model="data.type" placeholder="请选择学术类型" style="width: 200px; margin-right: 10px">
        <el-option label="学术会议" value="学术会议"></el-option>
        <el-option label="学术讲座" value="学术讲座"></el-option>
        <el-option label="学术论坛" value="学术论坛"></el-option>
        <el-option label="学术竞赛" value="学术竞赛"></el-option>
        <el-option label="学术研讨会" value="学术研讨会"></el-option>
      </el-select>
      <el-input v-model="data.name" :prefix-icon="Search" style="width: 240px; margin-right: 10px" placeholder="请输入活动名称查询"></el-input>
      <el-input v-model="data.location" :prefix-icon="Search" style="width: 180px; margin-right: 10px" placeholder="请输入位置查询"></el-input>
      <el-select v-model="data.status" placeholder="活动状态" clearable style="width: 130px; margin-right: 10px">
        <el-option label="进行中" value="进行中" />
        <el-option label="未开始" value="未开始" />
        <el-option label="已结束" value="已结束" />
      </el-select>
      <el-button type="info" plain size="small" @click="search">查询</el-button>
        <el-button type="warning" plain size="small" style="margin: 0 10px" @click="reset">重置</el-button>
      </div>
      <div style="margin-bottom: 10px">
        <el-button type="primary" plain size="small" @click="handleAdd">新增</el-button>
        <el-button type="danger" plain size="small" @click="delBatch">批量删除</el-button>
    </div>

    <div class="card" style="margin-bottom: 5px">
      <el-table stripe :data="data.tableData" @selection-change="handleSelectionChange" :header-cell-style="{ backgroundColor: '#e9edf2' }" class="table-center" empty-text="暂无数据">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="img" label="活动封面" width="100">
          <template v-slot="scope">
            <el-image style="width: 60px; height: 60px; border-radius: 5px; display: block" v-if="scope.row.img"
                      :src="scope.row.img" :preview-src-list="[scope.row.img]" preview-teleported></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="学术类型" width="100"/>
        <el-table-column prop="name" label="活动名称" show-overflow-tooltip/>
        <el-table-column prop="content" label="活动描述" show-overflow-tooltip/>
        <el-table-column prop="location" label="位置" />
        <el-table-column prop="start" label="开始时间" width="120"/>
        <el-table-column prop="end" label="结束时间"  width="120"/>
        <el-table-column prop="status" label="活动状态"  width="100">
          <template v-slot="scope">
            <el-tag v-if="scope.row.status === '进行中'" type="success">{{ scope.row.status }}</el-tag>
            <el-tag v-if="scope.row.status === '未开始'" type="warning">{{ scope.row.status }}</el-tag>
            <el-tag v-if="scope.row.status === '已结束'" type="danger">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template v-slot="scope">
            <el-tooltip content="编辑活动" placement="bottom" effect="light">
              <el-button type="primary" circle size="small" :icon="Edit" @click="handleEdit(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除活动" placement="bottom" effect="light">
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

    <el-dialog title="学术活动" v-model="data.formVisible" width="40%" destroy-on-close @opened="handleDialogOpened">
      <el-form ref="formRef" :rules="rules" :model="data.form" label-width="80px" style="padding: 20px">
        <el-form-item prop="avatar" label="活动封面">
          <el-upload
              :action="baseUrl + '/files/upload'"
              :on-success="handleFileUpload"
              list-type="picture"
          >
            <el-button type="primary" size="small">上传活动封面</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item prop="name" label="活动名称">
          <el-input v-model="data.form.name" placeholder="请输入活动名称"></el-input>
        </el-form-item>
        <el-form-item prop="type" label="学术类型">
          <el-select v-model="data.form.type" placeholder="请选择学术类型">
            <el-option label="学术会议" value="学术会议"></el-option>
            <el-option label="学术讲座" value="学术讲座"></el-option>
            <el-option label="学术论坛" value="学术论坛"></el-option>
            <el-option label="学术竞赛" value="学术竞赛"></el-option>
            <el-option label="学术研讨会" value="学术研讨会"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="content" label="活动描述">
          <el-input type="textarea" :rows="4" v-model="data.form.content" placeholder="请输入活动描述"></el-input>
        </el-form-item>
        <el-form-item prop="location" label="举办地点">
          <el-input v-model="data.form.location" placeholder="请输入举办地点"></el-input>
        </el-form-item>
        <el-form-item prop="start" label="开始日期">
          <el-date-picker value-format="YYYY-MM-DD" v-model="data.form.start" type="date" placeholder="请选择日期" style="width: 100%"></el-date-picker>
        </el-form-item>
        <el-form-item prop="end" label="结束日期">
          <el-date-picker value-format="YYYY-MM-DD" v-model="data.form.end" type="date" placeholder="请选择日期" style="width: 100%"></el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button size="small" @click="data.formVisible = false">取 消</el-button>
        <el-button type="primary" size="small" @click="save">确 定</el-button>
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
import {Delete, Edit, Search} from "@element-plus/icons-vue";
import SecurityAlert from "@/components/SecurityAlert.vue";
const baseUrl = import.meta.env.VITE_BASE_URL
const queryFields = ['type', 'name', 'content', 'location', 'start', 'end', 'status']

const data = reactive({
  formVisible: false,
  form: {},
  tableData: [],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  type: null,
  name: null,
  content: null,
  location: null,
  start: null,
  end: null,
  status: null,
  ids: [],
  showSecurityAlert: false // 控制安全提醒弹窗的显示
})

const paginationQuery = usePaginationQuery(data)

const formRef = ref()
const rules = reactive({
  name: [
    {required: true, message: '请输入活动名称', trigger: 'blur'},
  ],
  type: [
    {required: true, message: '请选择学术类型', trigger: 'blur'},
  ],
  content: [
    {required: true, message: '请输入活动描述', trigger: 'blur'},
  ],
})

const load = () => {
  paginationQuery.sync()
  request.get('/activity/selectPage', {
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
}
const handleEdit = (row) => {
  data.form = JSON.parse(JSON.stringify(row))
  data.formVisible = true
}
const add = () => {
  request.post('/activity/add', data.form).then(res => {
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
  request.put('/activity/update', data.form).then(res => {
    if (res.code === '200') {
      ElMessage.success('操作成功')
      data.formVisible = false
      load()
    }
  })
}

const save = () => {
  formRef.value.validate(valid => {
    if (valid){
      data.form.id ? update() : add()
    }
  })
}

const del = (id) => {
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', { type: 'warning', buttonSize: 'small' }).then(res => {
    request.delete('/activity/delete/' + id).then(res => {
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
    request.delete("/activity/delete/batch", {data: data.ids}).then(res => {
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

const handleFileUpload = (res) => {
  data.form.img = res.data
}

// 处理对话框打开事件
const handleDialogOpened = () => {
  data.showSecurityAlert = true
}

// 处理安全提醒确认
const handleSecurityConfirm = () => {
  data.showSecurityAlert = false
}

load()
</script>
