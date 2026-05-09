<template>
  <div>
    <div class="card" style="margin-bottom: 5px">
      <el-input v-model="data.title" :prefix-icon="Search" style="width: 240px; margin-right: 10px" placeholder="请输入公告标题查询"></el-input>
      <el-input v-model="data.content" :prefix-icon="Search" style="width: 260px; margin-right: 10px" placeholder="请输入公告内容查询"></el-input>
      <el-input v-model="data.file" :prefix-icon="Search" style="width: 200px; margin-right: 10px" placeholder="请输入附件查询"></el-input>
      <el-button type="info" plain size="small" @click="search">查询</el-button>
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
            <div class="notice-cell-ellipsis">{{ scope.row.title || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="公告内容" min-width="300" sortable>
          <template v-slot="scope">
            <div class="notice-cell-ellipsis">{{ scope.row.content || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="file" label="附件" width="150" sortable>
          <template v-slot="scope">
            <div v-if="scope.row.file" class="link-cell">
              <el-tooltip :content="scope.row.file" placement="top" effect="light">
                <el-button 
                  type="primary" 
                  link 
                  size="small" 
                  @click="openLink(scope.row.file)"
                  class="link-btn"
                >
                  <el-icon><Link /></el-icon>
                  访问链接
                </el-button>
              </el-tooltip>
            </div>
            <span v-else class="no-file">无附件</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发布时间" width="160" sortable />
        <el-table-column label="操作" width="140" fixed="right">
          <template v-slot="scope">
            <el-tooltip content="查看详情" placement="bottom" effect="light">
              <el-button @click="handleView(scope.row)" size="small" type="primary" circle :icon="View"></el-button>
            </el-tooltip>
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

    <el-dialog title="公告信息" v-model="data.formVisible" width="40%" destroy-on-close>
      <el-form ref="form" :model="data.form" label-width="70px" style="padding: 5px 20px 0 20px">
        <el-form-item prop="title" label="公告标题">
          <el-input
            v-model="data.form.title"
            :maxlength="NOTICE_TITLE_MAX_LENGTH"
            show-word-limit
            :placeholder="`请输入公告标题，最多${NOTICE_TITLE_MAX_LENGTH}个字符`"
          ></el-input>
        </el-form-item>
        <el-form-item prop="content" label="公告内容">
          <el-input
            type="textarea"
            :rows="4"
            v-model="data.form.content"
            :maxlength="NOTICE_CONTENT_MAX_LENGTH"
            show-word-limit
            :placeholder="`请输入公告内容，最多${NOTICE_CONTENT_MAX_LENGTH}个字符`"
          ></el-input>
        </el-form-item>
        <el-form-item prop="file" label="附件">
          <el-input 
            v-model="data.form.file" 
            placeholder="请输入网址"
            clearable
          >
            <template #prepend>
              <el-icon><Link /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button size="small" @click="data.formVisible = false">取 消</el-button>
        <el-button type="primary" size="small" @click="save">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog title="公告详情" v-model="data.detailVisible" width="45%">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="公告标题">{{ data.detail.title || '-' }}</el-descriptions-item>
        <el-descriptions-item label="公告内容">
          <div class="notice-detail-content">{{ data.detail.content || '-' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="附件">
          <el-button
            v-if="data.detail.file"
            type="primary"
            link
            size="small"
            @click="openLink(data.detail.file)"
          >
            <el-icon><Link /></el-icon>
            访问链接
          </el-button>
          <span v-else>无附件</span>
        </el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ data.detail.createTime || '-' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button size="small" @click="data.detailVisible = false">关 闭</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>

import {reactive} from "vue";
import request from "@/utils/request.js";
import { usePaginationQuery } from '@/utils/paginationQuery.js';
import { clearTableQuery, tableQueryParams } from '@/utils/tableQuery.js';
import {ElMessage, ElMessageBox} from "@/utils/element-plus";
import {Delete, Edit, Link, Search, View} from "@element-plus/icons-vue";

const NOTICE_TITLE_MAX_LENGTH = 100
const NOTICE_CONTENT_MAX_LENGTH = 10000
const queryFields = ['title', 'content', 'file']

const data = reactive({
  formVisible: false,
  detailVisible: false,
  form: {
    file: null
  },
  detail: {},
  tableData: [],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  title: null,
  content: null,
  file: null,
  ids: []
})

const paginationQuery = usePaginationQuery(data)

const indexMethod = (index) => {
  return (data.pageNum - 1) * data.pageSize + index + 1
}

const load = () => {
  paginationQuery.sync()
  request.get('/notice/selectPage', {
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
const handleView = (row) => {
  data.detail = JSON.parse(JSON.stringify(row))
  data.detailVisible = true
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

const validateNoticeForm = () => {
  if (data.form.title && data.form.title.length > NOTICE_TITLE_MAX_LENGTH) {
    ElMessage.warning(`公告标题不能超过${NOTICE_TITLE_MAX_LENGTH}个字符`)
    return false
  }
  if (data.form.content && data.form.content.length > NOTICE_CONTENT_MAX_LENGTH) {
    ElMessage.warning(`公告内容不能超过${NOTICE_CONTENT_MAX_LENGTH}个字符`)
    return false
  }
  return true
}

const save = () => {
  if (!validateNoticeForm()) return
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

const search = () => {
  paginationQuery.reset()
  load()
}

const reset = () => {
  clearTableQuery(data, queryFields)
  paginationQuery.reset()
  load()
}

// 链接相关方法

const openLink = (url) => {
  if (!url) {
    ElMessage.warning('链接地址不存在')
    return
  }
  // 验证链接格式
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    ElMessage.warning('请输入有效的网址链接（需要以 http:// 或 https:// 开头）')
    return
  }
  // 在新窗口中打开链接
  window.open(url, '_blank')
  ElMessage.success('正在打开链接')
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

.notice-cell-ellipsis {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notice-detail-content {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
  max-height: 420px;
  overflow-y: auto;
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
