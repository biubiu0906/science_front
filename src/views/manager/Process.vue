<template>
  <div>
    <div class="card" style="margin-bottom: 5px">
      <el-input v-model="data.projectName" :prefix-icon="Search" style="width: 240px; margin-right: 10px"
        placeholder="请输入项目名称查询"></el-input>
      <el-button type="info" plain size="small" @click="load">查询</el-button>
        <el-button type="warning" plain size="small" style="margin: 0 10px" @click="reset">重置</el-button>
      </div>

    <div class="card" style="margin-bottom: 5px">
      <div style="margin-bottom: 10px; margin-left: 10px;">
        <el-button v-if="data.laboratoryLevel === 2" type="primary" plain size="small" @click="handleAdd">新增</el-button>
        <el-button v-if="data.user.role === 'SUPER_ADMIN'" type="danger" plain size="small" @click="delBatch">批量删除</el-button>
      </div>
      <el-table stripe :data="data.tableData" @selection-change="handleSelectionChange" :header-cell-style="{ backgroundColor: '#e9edf2' }" class="table-center" empty-text="暂无数据">
        <el-table-column v-if="data.user.role === 'SUPER_ADMIN'" type="selection" width="55" />
        <el-table-column type="index" label="序号" :index="indexMethod" width="60" />
        <el-table-column prop="projectName" label="项目名称" sortable />
        <el-table-column prop="projectCode" label="项目编号" sortable />
        <el-table-column prop="teacherName" label="教师姓名" sortable />
        <el-table-column prop="time" label="报告日期" sortable />
        <el-table-column prop="content" label="工作内容" sortable>
          <template v-slot="scope">
            <div :class="getContentAlignClass(scope.row.content)">
              {{ scope.row.content }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="question" label="遇到的问题" sortable>
          <template v-slot="scope">
            <div :class="getContentAlignClass(scope.row.question)">
              {{ scope.row.question }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="solution" label="解决方案" sortable>
          <template v-slot="scope">
            <div :class="getContentAlignClass(scope.row.solution)">
              {{ scope.row.solution }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template v-slot="scope">
            <el-tooltip v-if="data.user.role === 'TEACHER'" content="编辑科研过程" placement="bottom" effect="light">
              <el-button type="primary" circle size="small" :icon="Edit" @click="handleEdit(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除科研过程" placement="bottom" effect="light">
              <el-button type="danger" circle size="small" :icon="Delete" @click="del(scope.row.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="card" v-if="data.total">
      <el-pagination @current-change="load" background layout="prev, pager, next" :page-size="data.pageSize"
        v-model:current-page="data.pageNum" :total="data.total" />
    </div>

    <el-dialog title="科研过程" v-model="data.formVisible" width="40%" destroy-on-close>
      <el-form ref="formRef" :rules="rules" :model="data.form" label-width="85px" style="padding: 20px">
        <el-form-item prop="projectId" label="科研项目">
          <el-select v-model="data.form.projectId" placeholder="请选择科研项目">
            <el-option v-for="item in data.projectData" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="content" label="工作内容">
          <el-input type="textarea" :rows="4" v-model="data.form.content" placeholder="请输入工作内容"></el-input>
        </el-form-item>
        <el-form-item prop="question" label="遇到的问题">
          <el-input v-model="data.form.question" placeholder="请输入遇到的问题"></el-input>
        </el-form-item>
        <el-form-item prop="solution" label="解决方案">
          <el-input type="textarea" :rows="4" v-model="data.form.solution" placeholder="请输入解决方案"></el-input>
        </el-form-item>
        <el-form-item prop="time" label="报告日期">
          <el-date-picker style="width: 100%" v-model="data.form.time" value-format="YYYY-MM-DD" type="date"
            placeholder="请选择日期"></el-date-picker>
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

import { reactive, ref, onMounted } from "vue";
import request from "@/utils/request.js";
import { ElMessage, ElMessageBox } from "@/utils/element-plus";
import { Delete, Edit, Search } from "@element-plus/icons-vue";


const data = reactive({
  user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
  formVisible: false,
  form: {},
  tableData: [],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  projectName: null,
  ids: [],
  projectData: [],
  laboratoryLevel: null
})

const indexMethod = (index) => {
  return (data.pageNum - 1) * data.pageSize + index + 1
}

const formRef = ref()
const rules = reactive({
  projectId: [
    { required: true, message: '请选择科研项目', trigger: 'blur' },
  ],
  content: [
    { required: true, message: '请输入工作内容', trigger: 'blur' },
  ],
  time: [
    { required: true, message: '请选择报告日期', trigger: 'blur' },
  ],
})

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
const load = () => {
  request.get('/process/selectPage', {
    params: {
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      projectName: data.projectName
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
  request.post('/process/add', data.form).then(res => {
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
  request.put('/process/update', data.form).then(res => {
    if (res.code === '200') {
      ElMessage.success('操作成功')
      data.formVisible = false
      load()
    }
  })
}

const save = () => {
  data.form.id ? update() : add()
}

const del = (id) => {
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', { type: 'warning', buttonSize: 'small' }).then(res => {
    request.delete('/process/delete/' + id).then(res => {
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
    request.delete("/process/delete/batch", { data: data.ids }).then(res => {
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

const reset = () => {
  data.projectName = null
  load()
}

const getLaboratoryLevel = () => {
  // 检查用户是否有实验室ID
  if (!data.user.laboratoryId) {
    return
  }
  
  request.get('/teacher/selectLaboratoryById/' + data.user.laboratoryId).then(res => {
    if (res.code === '200') {
      data.laboratoryLevel = res.data.type
    } else {
      ElMessage.error(res.msg)
    }
  }).catch(error => {
    console.error('获取实验室级别失败:', error)
    ElMessage.error('获取实验室信息失败')
  })
}

// 根据内容长度判断对齐方式的方法
const getContentAlignClass = (content) => {
  if (!content) return 'content-center'
  // 判断内容是否超过一行（这里以50个字符为基准，可根据实际情况调整）
  const isMultiLine = content.length > 50 || content.includes('\n')
  return isMultiLine ? 'content-justify' : 'content-center'
}


onMounted(() => {
  if (data.user.id) {
    getLaboratoryLevel()
  }
})

load()
loadProject()
</script>

<style scoped>
/* 内容居中对齐 */
.content-center {
  text-align: center;
}

/* 内容两端对齐 */
.content-justify {
  text-align: justify;
  text-justify: inter-ideograph; /* 中文字符间对齐 */
  line-height: 1.5;
}
</style>