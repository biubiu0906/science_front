<template>
  <div>
    <div class="card" style="margin-bottom: 5px">
      <el-input v-model="data.title" prefix-icon="Search" style="width: 240px; margin-right: 10px" placeholder="请输入公告标题查询"></el-input>
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
        <el-table-column prop="title" label="标题" min-width="150" sortable>
          <template v-slot="scope">
            <div :class="getContentAlignClass(scope.row.title)">
              {{ scope.row.title }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="公告内容" min-width="300" sortable>
          <template v-slot="scope">
            <div :class="getContentAlignClass(scope.row.content)">
              {{ scope.row.content }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="file" label="附件" width="120" sortable>
          <template v-slot="scope">
            <div v-if="scope.row.file" class="file-cell">
              <el-tooltip :content="scope.row.file" placement="top" effect="light">
                <el-button 
                  type="primary" 
                  link 
                  size="small" 
                  @click="downloadFile(scope.row.file)"
                  class="file-download-btn"
                >
                  <el-icon><Download /></el-icon>
                  {{ getFileName(scope.row.file) }}
                </el-button>
              </el-tooltip>
            </div>
            <span v-else class="no-file">无附件</span>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="发布时间" width="160" sortable />
        <el-table-column label="操作" width="100" fixed="right">
          <template v-slot="scope">
            <el-tooltip content="编辑公告" placement="bottom" effect="light">
              <el-button type="primary" circle size="small" :icon="Edit" @click="handleEdit(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除公告" placement="bottom" effect="light">
              <el-button type="danger" circle size="small" :icon="Delete" @click="del(scope.row.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="card" v-if="data.total">
      <el-pagination @current-change="load" background layout="prev, pager, next" :page-size="data.pageSize" v-model:current-page="data.pageNum" :total="data.total" />
    </div>

    <el-dialog title="公告信息" v-model="data.formVisible" width="40%" destroy-on-close @opened="handleDialogOpened" @close="handleDialogClose">
      <el-form ref="form" :model="data.form" label-width="70px" style="padding: 20px">
        <el-form-item prop="title" label="公告标题">
          <el-input v-model="data.form.title" placeholder="请输入公告标题"></el-input>
        </el-form-item>
        <el-form-item prop="content" label="公告内容">
          <el-input type="textarea" :rows="4" v-model="data.form.content" placeholder="请输入公告内容"></el-input>
        </el-form-item>
        <el-form-item prop="file" label="附件">
          <div class="file-upload-container">
            <el-upload
              ref="uploadRef"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleFileChange"
              :before-upload="beforeUpload"
              :limit="1"
              :on-exceed="handleExceed"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
              drag
              class="file-upload"
            >
              <div class="upload-content">
                <el-icon class="upload-icon"><UploadFilled /></el-icon>
                <div class="upload-text">
                  <p>点击或拖拽文件到此区域上传</p>
                </div>
              </div>
            </el-upload>
            <div v-if="data.form.file" class="current-file">
              <div class="file-info">
                <el-icon><Document /></el-icon>
                <span class="file-name">{{ getFileName(data.form.file) }}</span>
                <el-button 
                  type="danger" 
                  link 
                  size="small" 
                  @click="removeFile"
                  class="remove-file-btn"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
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

import {reactive} from "vue";
import request from "@/utils/request.js";
import {ElMessage, ElMessageBox} from "@/utils/element-plus";
import {Delete, Edit, Download, UploadFilled, Document} from "@element-plus/icons-vue";
import SecurityAlert from "@/components/SecurityAlert.vue";
import { securityAlertManager } from "@/utils/securityAlert.js";


const data = reactive({
  formVisible: false,
  form: {
    file: null
  },
  tableData: [],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  title: null,
  ids: [],
  showSecurityAlert: false
})

const indexMethod = (index) => {
  return (data.pageNum - 1) * data.pageSize + index + 1
}

const load = () => {
  request.get('/notice/selectPage', {
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
const handleAdd = () => {
  data.form = {}
  data.formVisible = true
}
const handleEdit = (row) => {
  data.form = JSON.parse(JSON.stringify(row))
  data.formVisible = true
}
const add = () => {
  request.post('/notice/add', data.form).then(res => {
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
  request.put('/notice/update', data.form).then(res => {
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
    request.delete('/notice/delete/' + id).then(res => {
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
    request.delete("/notice/delete/batch", {data: data.ids}).then(res => {
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
  data.title = null
  load()
}

// 根据内容长度判断对齐方式的方法
const getContentAlignClass = (content) => {
  if (!content) return 'content-center'
  // 判断内容是否超过一行（这里以50个字符为基准，可根据实际情况调整）
  const isMultiLine = content.length > 50 || content.includes('\n')
  return isMultiLine ? 'content-justify' : 'content-center'
}

// 附件相关方法
const handleFileChange = (file) => {
  data.form.file = file.name
}

const handleExceed = () => {
  ElMessage.warning('只能上传一个文件')
}

const beforeUpload = (file) => {
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB!')
    return false
  }
  return true
}

const removeFile = () => {
  data.form.file = null
  ElMessage.success('文件已移除')
}

const getFileName = (filePath) => {
  if (!filePath) return ''
  return filePath.split('/').pop() || filePath.split('\\').pop() || filePath
}

const downloadFile = (filePath) => {
  if (!filePath) {
    ElMessage.warning('文件不存在')
    return
  }
  // 这里应该调用后端接口下载文件
  // 暂时使用模拟下载
  const link = document.createElement('a')
  link.href = filePath
  link.download = getFileName(filePath)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  ElMessage.success('开始下载文件')
}

// 对话框打开时的处理
const handleDialogOpened = () => {
  securityAlertManager.show()
}

// 对话框关闭时的处理
const handleDialogClose = () => {
  securityAlertManager.hide()
}

// 安全提醒确认处理
const handleSecurityConfirm = () => {
  data.showSecurityAlert = false
}

load()
</script>

<style scoped>
/* 内容居中对齐 */
.content-center {
  text-align: center;
}

/* 内容两端对齐 */
.content-justify {
  text-align: justify;
  text-justify: inter-ideograph;
  line-height: 1.5;
}

/* 附件相关样式 */
.file-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-download-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-download-btn:hover {
  color: #409eff;
  text-decoration: underline;
}

.no-file {
  color: #909399;
  font-size: 12px;
}

.file-upload-container {
  width: 100%;
}

.file-upload {
  width: 100%;
}

.file-upload :deep(.el-upload) {
  width: 100%;
}

.file-upload :deep(.el-upload-dragger) {
  width: 100%;
  height: 120px;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s;
}

.file-upload :deep(.el-upload-dragger:hover) {
  border-color: #409eff;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
}

.upload-icon {
  font-size: 28px;
  color: #8c939d;
  margin-bottom: 10px;
}

.upload-text {
  text-align: center;
}

.upload-text p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.upload-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 4px;
}

.current-file {
  margin-top: 10px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-info .el-icon {
  color: #409eff;
  font-size: 16px;
}

.file-name {
  flex: 1;
  color: #606266;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-file-btn {
  color: #f56c6c;
  padding: 0;
}

.remove-file-btn:hover {
  color: #f56c6c;
  background-color: transparent;
}
</style>