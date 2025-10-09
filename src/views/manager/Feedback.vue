<template>
  <div>
    <div class="card" style="margin-bottom: 5px">
      <el-input v-model="data.teacherName" prefix-icon="Search" style="width: 240px; margin-right: 10px" placeholder="请输入教师名称查询"></el-input>
      <el-button type="info" plain size="small" @click="load">查询</el-button>
        <el-button type="warning" plain size="small" style="margin: 0 10px" @click="reset">重置</el-button>
      </div>

    <div class="card" style="margin-bottom: 5px">
      <div style="margin-bottom: 10px; margin-left: 10px;">
        <el-button type="danger" plain size="small" @click="delBatch">批量删除</el-button>
      </div>
      <el-table stripe :data="data.tableData" @selection-change="handleSelectionChange" :header-cell-style="{backgroundColor: '#e9edf2'}" :row-style="{height: 'auto'}" class="table-center">
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="80" />
        <el-table-column prop="teacherName" label="反馈人" width="100" sortable />
        <el-table-column prop="content" label="反馈内容" min-width="200" sortable>
          <template v-slot="scope">
            <div class="content-scroll" :class="getContentAlignClass(scope.row.content)" style="word-wrap: break-word; word-break: break-all; white-space: pre-wrap; line-height: 1.5; max-height: 100px; overflow-y: auto;">
              {{ scope.row.content }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="发布时间" width="120" sortable />
        <el-table-column prop="replyContent" label="回复内容" min-width="200" sortable>
          <template v-slot="scope">
            <div v-if="scope.row.replyContent" class="content-scroll" :class="getContentAlignClass(scope.row.replyContent)" style="word-wrap: break-word; word-break: break-all; white-space: pre-wrap; line-height: 1.5; max-height: 100px; overflow-y: auto;">
              {{ scope.row.replyContent }}
            </div>
            <span v-else style="color: #999; font-style: italic; text-align: center; display: block;">暂无回复</span>
          </template>
        </el-table-column>
        <el-table-column prop="replyName" label="回复人" width="100" sortable />
        <el-table-column prop="replyTime" label="回复时间" width="120" sortable />
        <el-table-column label="操作" width="200" fixed="right">
          <template v-slot="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">回复</el-button>
            <el-button type="danger" size="small" @click="del(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="card" v-if="data.total">
      <el-pagination @current-change="load" background layout="prev, pager, next" :page-size="data.pageSize" v-model:current-page="data.pageNum" :total="data.total" />
    </div>

    <el-dialog title="回复信息" v-model="data.formVisible" width="40%" destroy-on-close>
      <el-form ref="form" :model="data.form" label-width="70px" style="padding: 20px">
        <el-form-item prop="replyContent" label="回复内容">
          <el-input type="textarea" :rows="4" v-model="data.form.replyContent" placeholder="请输入回复内容"></el-input>
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

import {reactive} from "vue";
import request from "@/utils/request.js";
import {ElMessage, ElMessageBox} from "element-plus";
import {Delete, Edit} from "@element-plus/icons-vue";


const data = reactive({
  formVisible: false,
  form: {},
  tableData: [],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  teacherName: null,
  ids: []
})

const load = () => {
  request.get('/feedback/selectPage', {
    params: {
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      teacherName: data.teacherName
    }
  }).then(res => {
    if (res.code === '200') {
      data.tableData = res.data?.list || []
      data.total = res.data?.total
    }
  })
}
const handleEdit = (row) => {
  data.form = JSON.parse(JSON.stringify(row))
  data.formVisible = true
}

const update = () => {
  request.put('/feedback/update', data.form).then(res => {
    if (res.code === '200') {
      ElMessage.success('操作成功')
      data.formVisible = false
      load()
    }
  })
}

const save = () => {
  update()
}

const del = (id) => {
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', { type: 'warning' }).then(res => {
    request.delete('/feedback/delete/' + id).then(res => {
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
    request.delete("/feedback/delete/batch", {data: data.ids}).then(res => {
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
  data.teacherName = null
  load()
}

// 根据内容长度判断对齐方式的方法
const getContentAlignClass = (content) => {
  if (!content) return 'content-center'
  // 判断内容是否超过一行（这里以50个字符为基准，可根据实际情况调整）
  const isMultiLine = content.length > 50 || content.includes('\n')
  return isMultiLine ? 'content-justify' : 'content-center'
}

load()
</script>

<style scoped>
/* 隐藏滚动条但保持滚动功能 */
.content-scroll {
  /* 对于 Webkit 浏览器（Chrome, Safari, Edge） */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 和 Edge */
}

.content-scroll::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

/* 内容居中对齐 */
.content-center {
  text-align: center;
}

/* 内容两端对齐 */
.content-justify {
  text-align: justify;
  text-justify: inter-ideograph; /* 中文字符间对齐 */
}
</style>