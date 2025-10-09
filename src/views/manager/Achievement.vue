<template>
  <div>
    <div class="card" style="margin-bottom: 5px">
      <el-input v-model="data.projectCode" prefix-icon="Search" style="width: 240px; margin-right: 10px"
        placeholder="请输入项目编号查询"></el-input>
      <el-input v-model="data.projectName" prefix-icon="Search" style="width: 240px; margin-right: 10px"
        placeholder="请输入项目名称查询"></el-input>
      <el-button size="small" type="info" plain @click="load">查询</el-button>
      <el-button size="small" type="warning" plain style="margin: 0 10px" @click="reset">重置</el-button>
    </div>

    <div class="card" style="margin-bottom: 5px">
      <div style="margin-bottom: 10px; margin-left: 10px;">
        <el-button v-if="data.laboratoryLevel === 2" type="primary" plain size="small" @click="handleAdd">新增</el-button>
        <el-button v-if="data.user.role === 'ADMIN'" type="danger" plain size="small" @click="delBatch">批量删除</el-button>
      </div>
      <el-table stripe :data="data.tableData" @selection-change="handleSelectionChange" :header-cell-style="{ backgroundColor: '#e9edf2' }" class="table-center">
        <el-table-column type="index" label="序号" width="80" />
        <el-table-column v-if="data.user.role === 'ADMIN'" type="selection" width="55" />
        <el-table-column prop="projectName" label="项目名称" min-width="150"show-overflow-tooltip sortable />
        <el-table-column prop="code" label="立项编号" min-width="120" show-overflow-tooltip sortable />
        <el-table-column prop="typeName" label="成果类型" min-width="110" show-overflow-tooltip sortable />
        <el-table-column prop="name" label="成果名称" min-width="110" sortable>
          <template v-slot="scope">
            <div :class="getContentAlignClass(scope.row.name)">
              {{ scope.row.name }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="成果描述" min-width="110" sortable>
          <template v-slot="scope">
            <div :class="getContentAlignClass(scope.row.description)">
              {{ scope.row.description }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="teacherName" label="教师" min-width="100" sortable />
        <el-table-column prop="process" label="科研过程" min-width="110" sortable>
          <template v-slot="scope">
            <el-button type="primary" size="small" @click="navTo('/manager/processLine?id=' + scope.row.projectId)">查看</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="openFile" label="立项文件" min-width="120" sortable>
          <template v-slot="scope">
            <el-button type="primary" size="small" @click="down(scope.row.openFile)">下载文件</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="closeFile" label="结项文件" min-width="120" sortable>
          <template v-slot="scope">
            <el-button type="primary" size="small" @click="down(scope.row.closeFile)">下载文件</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="file" label="附件" min-width="120" sortable>
          <template v-slot="scope">
            <el-button type="primary" size="small" @click="down(scope.row.file)">下载文件</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="审核状态" min-width="120" sortable>
          <template v-slot="scope">
            <el-tag v-if="scope.row.status === '审核通过'" type="success">{{ scope.row.status }}</el-tag>
            <el-tag v-if="scope.row.status === '待审核'" type="warning">{{ scope.row.status }}</el-tag>
            <el-tag v-if="scope.row.status === '不通过'" type="danger">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="审核原因" min-width="110" sortable>
          <template v-slot="scope">
            <div :class="getContentAlignClass(scope.row.reason)">
              {{ scope.row.reason }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="审核时间" min-width="110" show-overflow-tooltip sortable />
        <el-table-column label="操作" width="100" fixed="right">
          <template v-slot="scope">
            <el-button v-if="data.user.role === 'KEY_LABORATORY' && scope.row.status === '待审核'" type="primary" circle
              :icon="Edit" size="small" @click="handleEdit(scope.row)"></el-button>
            <el-button v-if="data.user.role === 'ADMIN'" type="primary" circle size="small" :icon="View"
              @click="handleCheck(scope.row)"></el-button>
            <el-button type="danger" circle size="small" :icon="Delete" @click="del(scope.row.id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="card" v-if="data.total">
      <el-pagination @current-change="load" background layout="prev, pager, next" :page-size="data.pageSize"
        v-model:current-page="data.pageNum" :total="data.total" />
    </div>

    <el-dialog title="科研成果提交" v-model="data.formVisible" width="40%" destroy-on-close>
      <el-form ref="formRef" :rules="rules" :model="data.form" label-width="80px" style="padding: 20px">
        <el-form-item prop="openFile" label="立项文件">
          <el-upload :action="baseUrl + '/files/upload'" :on-success="handleOpenFileUpload">
            <el-button type="primary" size="small" >点击上传</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item prop="closeFile" label="结项文件">
          <el-upload :action="baseUrl + '/files/upload'" :on-success="handleCloseFileUpload">
            <el-button type="primary" size="small" >点击上传</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item prop="file" label="附件">
          <el-upload :action="baseUrl + '/files/upload'" :on-success="handleFileUpload">
            <el-button type="primary" size="small" >点击上传</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item prop="projectId" label="科研项目">
          <el-select v-model="data.form.projectId" placeholder="请选择科研项目">
            <el-option v-for="item in data.projectData" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="typeId" label="成果类型">
          <el-select v-model="data.form.typeId" placeholder="请选择成果类型">
            <el-option v-for="item in data.typeData" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="name" label="成果名称">
          <el-input v-model="data.form.name" placeholder="请输入成果名称"></el-input>
        </el-form-item>
        <el-form-item prop="description" label="成果描述">
          <el-input type="textarea" :rows="4" v-model="data.form.description" placeholder="请输入成果描述"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="data.formVisible = false" size="small">取 消</el-button>
          <el-button type="primary" @click="save" size="small">确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog title="科研项目审核" v-model="data.checkVisible" width="40%" destroy-on-close>
      <el-form :model="data.form" label-width="70px" style="padding: 20px">
        <el-form-item prop="status" label="提交状态">
          <el-select v-model="data.form.status" placeholder="请选择审核结果">
            <el-option label="待审核" value="待审核"></el-option>
            <el-option label="审核通过" value="审核通过"></el-option>
            <el-option label="不通过" value="不通过"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="reason" label="审核理由">
          <el-input v-model="data.form.reason" placeholder="请输入审核理由"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="data.checkVisible = false" size="small">取 消</el-button>
          <el-button type="primary" @click="submit" size="small">提 交</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>

import { reactive, ref, onMounted } from "vue";
import request from "@/utils/request.js";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete, Edit, View } from "@element-plus/icons-vue";
import router from "@/router/index.js";
const baseUrl = import.meta.env.VITE_BASE_URL
const formRef = ref()
const data = reactive({
  user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
  formVisible: false,
  checkVisible: false,
  form: {},
  tableData: [],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  projectCode: null,
  projectName: null,
  projectData: [],
  typeData: [],
  ids: [],
  laboratoryLevel: null
})

const rules = reactive({
  openFile: [
    { required: true, message: '请上传立项文件', trigger: 'blur' },
  ],
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
  ],
  closeFile: [
    { required: true, message: '请上传结项文件', trigger: 'blur' },
  ],
  projectId: [
    { required: true, message: '请选择科研项目', trigger: 'blur' },
  ],
})
const navTo = (url) => {
  location.href = url
}
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
const loadType = () => {
  request.get('/type/selectAll').then(res => {
    if (res.code === '200') {
      data.typeData = res.data
    } else {
      ElMessage.error(res.msg)
    }
  })
}
const load = () => {
  request.get('/achievement/selectPage', {
    params: {
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      projectCode: data.projectCode,
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
const handleCheck = (row) => {
  data.form = JSON.parse(JSON.stringify(row))
  data.checkVisible = true
}
const add = () => {
  request.post('/achievement/add', data.form).then(res => {
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
  request.put('/achievement/update', data.form).then(res => {
    if (res.code === '200') {
      ElMessage.success('操作成功')
      data.formVisible = false
      load()
    }
  })
}

const save = () => {
  formRef.value.validate(valid => {
    if (valid) {
      data.form.id ? update() : add()
    }
  })
}

const submit = () => {
  request.put('/achievement/check', data.form).then(res => {
    if (res.code === '200') {
      ElMessage.success('操作成功')
      data.checkVisible = false
      load()
    } else {
      ElMessage.error(res.msg)
    }
  })
}

const del = (id) => {
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', { type: 'warning' }).then(res => {
    request.delete('/achievement/delete/' + id).then(res => {
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
    request.delete("/achievement/delete/batch", { data: data.ids }).then(res => {
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
  data.projectCode = null
  data.projectName = null
  load()
}

const handleFileUpload = (res) => {
  data.form.file = res.data
}
const handleOpenFileUpload = (res) => {
  data.form.openFile = res.data
}
const handleCloseFileUpload = (res) => {
  data.form.closeFile = res.data
}
const down = (url) => {
  window.open(url)
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


// 根据内容是否会换行动态设置文本对齐方式
const getContentAlignClass = (content) => {
  if (!content) return 'content-center'
  
  // 如果内容包含换行符，直接判断为多行
  if (content.includes('\n')) {
    return 'content-justify'
  }
  
  // 估算内容在表格列中是否会换行
  // 考虑中文字符宽度约为英文字符的2倍，表格列宽度约为110px
  // 一般情况下，超过15-20个中文字符或30-40个英文字符会换行
  const chineseCharCount = (content.match(/[\u4e00-\u9fa5]/g) || []).length
  const otherCharCount = content.length - chineseCharCount
  const estimatedWidth = chineseCharCount * 2 + otherCharCount
  
  // 如果估算宽度超过阈值，认为会换行，使用两端对齐
  if (estimatedWidth > 25) {
    return 'content-justify'
  }
  
  // 否则使用居中对齐
  return 'content-center'
}

onMounted(() => {
  if (data.user.id) {
    getLaboratoryLevel()
  }
})

load()
loadProject()
loadType()
</script>

<style scoped>
/* 条件文本对齐样式 */
.content-center {
  text-align: center;
}

.content-justify {
  text-align: justify;
  text-justify: inter-ideograph;
  line-height: 1.5;
}
</style>