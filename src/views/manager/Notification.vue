<template>
  <div>
    <div class="card" style="margin-bottom: 5px">
      <el-input v-model="data.title" :prefix-icon="Search" style="width: 240px; margin-right: 10px" placeholder="请输入通知标题查询"></el-input>
      <el-button type="info" plain size="small" @click="load">查询</el-button>
        <el-button type="warning" plain size="small" style="margin: 0 10px" @click="reset">重置</el-button>
      </div>

    <div class="card" style="margin-bottom: 5px">
      <div style="margin-bottom: 10px; margin-left: 10px;">
        <el-button type="primary" plain size="small" @click="handleAdd">新增</el-button>
        <el-button type="danger" plain size="small" @click="delBatch">批量删除</el-button>
      </div>
      <el-table stripe :data="data.tableData" @selection-change="handleSelectionChange" :header-cell-style="{ backgroundColor: '#e9edf2' }" class="table-center" empty-text="暂无数据">
        <el-table-column type="selection" width="35" />
        <el-table-column type="index" label="序号" :index="indexMethod" width="60" />
        <el-table-column prop="title" label="标题" width="150" sortable>
          <template v-slot="scope">
            <div :class="getContentAlignClass(scope.row.title)">
              {{ scope.row.title }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="通知内容" min-width="250" sortable>
          <template v-slot="scope">
            <div :class="getContentAlignClass(scope.row.content)">
              {{ scope.row.content }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="laboratoryNames" label="通知对象" width="200" sortable>
          <template v-slot="scope">
            <div>
              <template v-if="Array.isArray(scope.row.laboratoryNames)">
                <el-tag 
                  v-for="(lab, index) in scope.row.laboratoryNames" 
                  :key="index" 
                  type="success"
                  size="small"
                  class="lab-type-tag"
                  style="margin: 1px 2px 1px 0;"
                >
                  {{ lab }}
                </el-tag>
              </template>
              <template v-else>
                <el-tag 
                  type="success"
                  size="small"
                  class="lab-type-tag"
                >
                  {{ scope.row.laboratoryNames }}
                </el-tag>
              </template>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="informTime" label="通知时间" width="160" sortable>
          <template v-slot="scope">
            <div v-if="!(scope.row.startTime || scope.row.endTime)">
              暂无信息
            </div>
            <div v-else>
              {{ scope.row.startTime }} 至 {{ scope.row.endTime }}
            </div>
            
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发布时间" width="160" sortable />
        <el-table-column label="操作" width="100" fixed="right">
          <template v-slot="scope">
            <el-tooltip content="编辑通知" placement="bottom" effect="light">
              <el-button type="primary" circle size="small" :icon="Edit" @click="handleEdit(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除通知" placement="bottom" effect="light">
              <el-button type="danger" circle size="small" :icon="Delete" @click="del(scope.row.notificationId)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="card" v-if="data.total">
      <el-pagination @current-change="load" background layout="prev, pager, next" :page-size="data.pageSize" v-model:current-page="data.pageNum" :total="data.total" />
    </div>

    <el-dialog title="通知信息" v-model="data.formVisible" width="40%" destroy-on-close>
      <el-form ref="form" :model="data.form" :rules="data.rules" label-width="80px" style="padding: 5px 25px 0 25px">
        <el-form-item prop="title" label="通知标题">
          <el-input v-model="data.form.title" placeholder="请输入通知标题"></el-input>
        </el-form-item>
        <el-form-item prop="content" label="通知内容">
          <el-input type="textarea" :rows="4" v-model="data.form.content" placeholder="请输入通知内容"></el-input>
        </el-form-item>
        <el-form-item prop="laboratoryUsername" label="通知对象">
          <el-tree-select 
            v-model="data.form.laboratoryUsername" 
            :data="[data.laboratoryOptions]" 
            :render-after-expand="false" 
            default-expand-all
            show-checkbox
            multiple
            placeholder="请选择通知对象"
            style="width: 100%" 
          />
        </el-form-item>
        <el-form-item prop="startTime" label="开始时间">
          <el-date-picker 
            v-model="data.form.startTime" 
            type="datetime" 
            placeholder="请选择开始时间" 
            format="YYYY-MM-DD HH:mm:ss" 
            value-format="YYYY-MM-DD HH:mm:ss"
            date-format="YYYY年MM月DD日" 
            time-format="HH:mm:ss"
            style="width: 100%;"
            placement="top-start"
            popper-class="date-picker-top"
            :teleported="false"
          />
        </el-form-item>
        <el-form-item prop="endTime" label="结束时间">
          <el-date-picker 
            v-model="data.form.endTime" 
            type="datetime" 
            placeholder="请选择结束时间" 
            format="YYYY-MM-DD HH:mm:ss" 
            value-format="YYYY-MM-DD HH:mm:ss"
            date-format="YYYY年MM月DD日" 
            time-format="HH:mm:ss"
            style="width: 100%;"
            placement="top-start"
            popper-class="date-picker-top"
            :teleported="false"
          />
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
import {ElMessage, ElMessageBox} from "@/utils/element-plus";
import {Delete, Edit, Search} from "@element-plus/icons-vue";

// 创建表单引用
const form = ref()

const data = reactive({
  formVisible: false,
  form: {},
  tableData: [],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  title: null,
  ids: [],
  laboratoryOptions: {
    value: 'all',
    label: '全部',
    children: []
  },
  // 表单验证规则
  rules: {
    title: [
      { required: true, message: '请输入通知标题', trigger: 'blur' },
    ],
    content: [
      { required: true, message: '请输入通知内容', trigger: 'blur' },
    ],
    laboratoryUsername: [
      { required: true, message: '请选择通知对象', trigger: 'change' },
      { type: 'array', min: 1, message: '至少选择一个通知对象', trigger: 'change' }
    ],
    startTime: [
      { required: true, message: '请选择开始时间', trigger: 'change' }
    ],
    endTime: [
      { required: true, message: '请选择结束时间', trigger: 'change' },
      { 
        validator: (rule, value, callback) => {
          if (value && data.form.startTime) {
            if (new Date(value) <= new Date(data.form.startTime)) {
              callback(new Error('结束时间必须晚于开始时间'))
            } else {
              callback()
            }
          } else {
            callback()
          }
        }, 
        trigger: 'change' 
      }
    ]
  }
})

const indexMethod = (index) => {
  return (data.pageNum - 1) * data.pageSize + index + 1
}

const load = () => {
  // 根据是否有搜索条件决定使用哪个接口
  const endpoint = data.title ? '/notification/search' : '/notification/selectPageGrouped'
  console.log("endpoint",endpoint)
  console.log("title",data.title)

  request.get(endpoint, {
    params: {
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      title: data.title
    }
  }).then(res => {
    if (res.code === '200') {
      data.tableData = res.data?.list || []
      data.total = res.data?.total
    }
  })
}

// 获取实验室列表
const loadLaboratories = () => {
  request.get('/notification/laboratories').then(res => {
    if (res.code === '200') {
      // 将实验室数据转换为 el-tree-select 需要的格式，并放入children数组中
      data.laboratoryOptions.children = res.data.map(lab => ({
        value: lab.userName,
        label: lab.laboratoryName
      }))
    } else {
      ElMessage.error(res.msg || '获取实验室列表失败')
    }
  }).catch(err => {
    console.error('获取实验室列表失败:', err)
    ElMessage.error('获取实验室列表失败')
  })
}
const handleAdd = () => {
  data.form = {
    laboratoryUsername: [],
    startTime: null,
    endTime: null
  }
  data.formVisible = true
  loadLaboratories()
}
const handleEdit = (row) => {
  data.form = JSON.parse(JSON.stringify(row))
  // 处理通知对象字段，使用 laboratoryUsernames 字段
  if (data.form.laboratoryUsernames) {
    // 如果已经是数组，直接使用
    if (Array.isArray(data.form.laboratoryUsernames)) {
      data.form.laboratoryUsername = data.form.laboratoryUsernames
    }
    // 其他情况转换为数组
    else {
      data.form.laboratoryUsername = [data.form.laboratoryUsernames]
    }
  } else {
    data.form.laboratoryUsername = []
  }
  
  // 确保时间字段存在
  if (!data.form.startTime) data.form.startTime = null
  if (!data.form.endTime) data.form.endTime = null
  
  data.formVisible = true
  loadLaboratories()
}
const add = () => {
  // 创建副本并处理数据格式
  const formData = JSON.parse(JSON.stringify(data.form))
  // 确保laboratoryUsername为数组格式发送给后端
  if (!Array.isArray(formData.laboratoryUsername)) {
    formData.laboratoryUsername = formData.laboratoryUsername ? [formData.laboratoryUsername] : []
  }

  // 创建addData对象，包含指定的字段
  const addData = {
    title: formData.title,
    content: formData.content,
    laboratoryUsernames: formData.laboratoryUsername,
    startTime: formData.startTime,
    endTime: formData.endTime
  }
  
  request.post('/notification/add', addData).then(res => {
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
  // 创建副本并处理数据格式
  const formData = JSON.parse(JSON.stringify(data.form))
  // 确保laboratoryUsername为数组格式发送给后端，并重命名为 laboratoryUsernames
  if (!Array.isArray(formData.laboratoryUsername)) {
    formData.laboratoryUsernames = formData.laboratoryUsername ? [formData.laboratoryUsername] : []
  } else {
    formData.laboratoryUsernames = formData.laboratoryUsername
  }
  // 删除旧字段名
  delete formData.laboratoryUsername
  
  request.put(`/notification/updateGroup/${formData.notificationId}`, formData).then(res => {
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
  // 表单验证
  if (!form.value) {
    ElMessage.error('表单引用未找到')
    return
  }
  
  form.value.validate((valid) => {
    if (valid) {
      // 验证通过，执行保存操作
      data.form.notificationId ? update() : add()
    } else {
      // 验证失败，显示错误信息
      ElMessage.error('请填写完整的必填信息')
      return false
    }
  })
}

const del = (notificationId) => {
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', { type: 'warning', buttonSize: 'small' }).then(res => {
    request.delete('/notification/deleteGroup/' + notificationId).then(res => {
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
    request.delete("/notification/deleteGroupBatch", {data: data.ids}).then(res => {
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
  data.ids = rows.map(v => v.notificationId)
}

const reset = () => {
  data.title = null
  load()
}

// 根据内容长度判断对齐方式的方法
const getContentAlignClass = (content) => {
  if (!content) return 'content-center'
  
  // 如果是数组，判断数组长度和内容
  if (Array.isArray(content)) {
    // 如果数组有多个元素，使用两端对齐
    if (content.length > 1) return 'content-justify'
    // 如果只有一个元素，判断该元素的长度
    if (content.length === 1) {
      const singleContent = content[0]
      const isMultiLine = singleContent && (singleContent.length > 30 || singleContent.includes('\n'))
      return isMultiLine ? 'content-justify' : 'content-center'
    }
    return 'content-center'
  }
  
  // 如果是字符串，判断内容是否超过一行（这里以30个字符为基准，可根据实际情况调整）
  const isMultiLine = content.length > 30 || content.includes('\n')
  return isMultiLine ? 'content-justify' : 'content-center'
}

load()
</script>

<style scoped>
/* 内容居中对齐 */
.content-center {
  text-align: center !important;
}

/* 内容两端对齐 */
.content-justify {
  text-align: justify !important;
  text-justify: inter-ideograph;
  line-height: 1.5;
  word-break: break-all;
  word-wrap: break-word;
}
</style>

<style>
/* 日期选择器全局样式 */
.el-date-range-picker__content {
  padding: 5px !important;
}

.el-picker-panel {
  line-height: 15px !important;
}

/* 时间选择器顶部弹出样式 */
.date-picker-top {
  z-index: 9999 !important;
}

.date-picker-top .el-popper__arrow {
  display: block !important;
}

/* 重点实验室tag样式 */
.lab-type-tag {
  font-weight: 500;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
}

.lab-type-tag.el-tag--success {
  background-color: #f0f9ff;
  border-color: #c6f6d5;
  color: #38a169;
}

</style>