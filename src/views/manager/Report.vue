<template>
    <div class="card" style="margin-bottom: 5px">
      <el-input v-model="data.taskId" :prefix-icon="Search" style="width: 220px; margin-right: 10px" placeholder="请输入编号查询" :disabled="data.loading" />
      <el-select v-model="data.type" placeholder="报告对象类型" clearable style="width: 140px; margin-right: 10px" :disabled="data.loading">
        <el-option label="教师" value="teacher" />
        <el-option label="组织" value="laboratory" />
      </el-select>
      <el-select v-model="data.status" placeholder="报告状态" clearable style="width: 130px; margin-right: 10px" :disabled="data.loading">
        <el-option label="排队中" value="CREATING" />
        <el-option label="生成中" value="RUNNING" />
        <el-option label="完成" value="COMPLETED" />
        <el-option label="生成失败" value="FAILED" />
      </el-select>
      <el-input v-model="data.comment" :prefix-icon="Search" style="width: 180px; margin-right: 10px" placeholder="请输入报告类型查询" :disabled="data.loading" />
      <el-button type="info" plain size="small" @click="search" :loading="data.loading">查询</el-button>
      <el-button type="warning" plain size="small" style="margin: 0 10px" @click="reset" :disabled="data.loading">重置</el-button>
    </div>
    <div 
      class="card report-table-card" 
      style="margin-bottom: 5px"
      v-loading="data.loading"
      element-loading-text="数据加载中..."
      element-loading-background="rgba(255, 255, 255, 0.78)"
    >
      <div style="margin-bottom: 10px; margin-left: 10px;">
        <el-button type="warning" plain size="small" @click="load" :disabled="data.loading">刷新</el-button>
        <el-button type="primary" plain size="small" v-if="data.user.role !== 'SUPER_ADMIN'" @click="creatMyReport" :disabled="data.loading">生成报告</el-button>
        <el-button type="danger" plain size="small" @click="delBatch" :disabled="data.loading">批量删除</el-button>
      </div>
      <el-table stripe :data="data.tableData" @selection-change="handleSelectionChange" :header-cell-style="{backgroundColor: '#e9edf2'}" class="table-center" empty-text="暂无数据">
        <el-table-column type="selection" width="35" />
        <el-table-column type="index" label="序号" :index="indexMethod" width="60" />
        <el-table-column prop="taskId" label="编号" min-width="200" sortable/>
        <el-table-column prop="url" label="报告内容" min-width="120" sortable>
          <template v-slot="scope">
            <span v-if="!scope.row.url">暂无数据</span>
            <el-button 
              v-else 
              type="primary" 
              size="small"
              @click="viewReport(scope.row.url)"
            >
              查看报告
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="subject" label="报告对象" min-width="100" sortable/>
        <el-table-column prop="comment" label="报告类型" min-width="100" sortable/>
        <el-table-column prop="status" label="报告状态" min-width="100" sortable>
          <template v-slot="scope">
            <el-tag 
              :type="scope.row.status === 'RUNNING' ? 'primary' : 
                     scope.row.status === 'FAILED' ? 'danger' : 
                     scope.row.status === 'CREATING' ? 'warning' : 
                     scope.row.status === 'COMPLETED' ? 'success' : 'info'"
              effect="light"
            >
              {{ scope.row.status === 'RUNNING' ? '生成中' : 
                 scope.row.status === 'FAILED' ? '生成失败' : 
                 scope.row.status === 'CREATING' ? '排队中' : 
                 scope.row.status === 'COMPLETED' ? '完成' : '未知状态' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" min-width="160" sortable/>
        <el-table-column label="操作" width="80" text-align="center" fixed="right">
          <template v-slot="scope">
            <el-tooltip content="删除报告" placement="bottom" effect="light">
              <el-button type="danger" circle  size="small" :icon="Delete"  @click="del(scope.row.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 10px; text-align: center;">
        <el-pagination
          @current-change="load"
          @size-change="(size) => (paginationQuery.setPageSize(size), load())"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[5, 10, 20, 50, 100]"
          v-model:page-size="data.pageSize"
          v-model:current-page="data.pageNum"
          :total="data.total"
          :disabled="data.loading"
        />
      </div>
    </div>

    <!-- 生成报告对话框 -->
    <el-dialog 
      title="生成报告" 
      v-model="data.reportFormVisible" 
      width="450px" 
      destroy-on-close
      :modal="true"
      :close-on-click-modal="false"
      append-to-body
    >
      <el-form ref="reportFormRef" :model="data.reportForm" :rules="reportRules" style="display: flex; flex-direction: column; align-items: center;">
        <el-form-item prop="beginTime" label="起始时间" style="text-align: center; margin-top: 5px;">
          <el-date-picker
            v-model="data.reportForm.beginTime"
            type="datetime"
            placeholder="请选择起始时间"
            format="YYYY-MM-DD HH:mm:ss"
            date-format="YYYY-MM-DD"
            time-format="HH:mm"
          />
        </el-form-item>
        <el-form-item prop="endTime" label="结束时间" style="text-align: center;">
          <el-date-picker
            v-model="data.reportForm.endTime"
            type="datetime"
            placeholder="请选择结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            date-format="YYYY-MM-DD"
            time-format="HH:mm"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button size="small" @click="data.reportFormVisible = false">取 消</el-button>
          <el-button type="primary" size="small" @click="createReport">确 定</el-button>
        </span>
      </template>
    </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from '@/utils/element-plus'
import request from '@/utils/request.js'
import { usePaginationQuery } from '@/utils/paginationQuery.js'
import { clearTableQuery, tableQueryParams } from '@/utils/tableQuery.js'
import { Delete, Search } from '@element-plus/icons-vue'

// 表单引用
const reportFormRef = ref(null)
const queryFields = ['taskId', 'type', 'status', 'comment', 'createdAt']

const data = reactive({
  user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
  reportFormVisible: false,
  reportForm: {},
  tableData: [],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  taskId: null,
  type: null,
  status: null,
  comment: null,
  createdAt: null,
  ids: [],
  loading: false,
})

const paginationQuery = usePaginationQuery(data)

// 报告表单验证规则
const reportRules = reactive({
  beginTime: [
    { required: true, message: '请选择起始时间', trigger: 'change' }
  ],
  endTime: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ],
})

const indexMethod = (index) => {
  return (data.pageNum - 1) * data.pageSize + index + 1
}

const handleSelectionChange = (rows) => {
  data.ids = rows.map(v => v.id)
}

const viewReport = (url) => {
  if (url) {
    window.open(url, '_blank')
  }
}

// 加载报告数据
const load = () => {
  paginationQuery.sync()
  data.loading = true
  request.get('/report/task/page', {
    params: {
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      ...tableQueryParams(data, queryFields),
    }
  }).then(res => {
    if (res.code === '200') {
      data.tableData = res.data.list
      data.total = res.data.total
      data.tableData.forEach(item => {
        getSubject(item.targetId, item.type).then(subject => {
          item.subject = subject
        })
      })
    } else {
      ElMessage.error(res.msg)
    }
  }).catch(error => {
    console.error(error)
    ElMessage.error('数据加载失败')
  }).finally(() => {
    data.loading = false
  })
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

// 获取报告对象
const getSubject = (id, type) => {
  if(type === 'teacher'){
    return request.get('/teacher/' + id).then(res => {
      if (res.code === '200') {
        return res.data.name
      } else {
        ElMessage.error(res.msg)
        return '未知教师'
      }
    }).catch(error => {
      console.error(error)
      ElMessage.error('获取教师信息失败')
      return '未知教师'
    })
  }else if(type === 'laboratory'){
    return request.get('/laboratory/selectById/' + id).then(res => {
      if (res.code === '200') {
        return res.data.laboratoryName
      } else {
        ElMessage.error(res.msg)
        return '未知实验室'
      }
    }).catch(error => {
      console.error(error)
      ElMessage.error('获取实验室信息失败')
      return '未知实验室'
    })
  }
  return Promise.resolve('未知对象')
}

// 删除单个报告
const del = (id) => {
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', { type: 'warning', buttonSize: 'small' }).then(() => {
    request.delete('/report/task/delete/' + id).then(res => {
      if (res.code === '200') {
        ElMessage.success("删除成功")
        load()
      } else {
        ElMessage.error(res.msg)
      }
    }).catch(error => {
      console.error(error)
      ElMessage.error('删除失败')
    })
  }).catch(() => {
    // 用户取消删除
  })
}

// 批量删除报告
const delBatch = () => {
  if (!data.ids.length) {
    ElMessage.warning("请选择数据")
    return
  }
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', { type: 'warning', buttonSize: 'small' }).then(res => {
    request.delete("/report/task/delete/batch", {data: data.ids}).then(res => {
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

// 打开生成报告对话框
const creatMyReport = () => {
  data.reportForm = {} // 清空表单数据
  data.reportFormVisible = true
  if(data.user.role === 'TEACHER'){
    data.reportForm.teacherId = data.user.id
  }
}

// 生成报告
const createReport = () => {
  if (!reportFormRef.value) return
  
  reportFormRef.value.validate((valid) => {
    if (valid) {
      // 格式化时间为 YYYY-MM-DD 格式
      const formatDate = (date) => {
        if (!date) return null
        const d = new Date(date)
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }

      // 准备发送的参数，包含格式化后的时间
      const requestParams = {
        ...data.reportForm,
        beginTime: formatDate(data.reportForm.beginTime),
        endTime: formatDate(data.reportForm.endTime)
      }

      // 验证通过，执行保存操作
      if(data.user.role === 'TEACHER'){
        request.get('/report/teacher', {
            params: requestParams
        }).then(res => {
            if (res.code === '200') {
            ElMessage.success('请求成功')
            data.reportFormVisible = false
            load() // 重新加载数据
            } else {
            ElMessage.error(res.msg)
            }
        }).catch(error => {
            console.error(error)
            ElMessage.error(error.response?.data?.error || '报告生成失败')
        })
      }else {
        request.get('/report/laboratory', {
            params: requestParams
        }).then(res => {
            if (res.code === '200') {
            ElMessage.success('请求成功')
            data.reportFormVisible = false
            load() // 重新加载数据
            } else {
            ElMessage.error(res.msg)
            }
        }).catch(error => {
            console.error(error)
            ElMessage.error(error.response?.data?.error || '报告生成失败')
        })
      }
    } else {
      // 验证失败，显示错误信息
      ElMessage.error('请填写完整的必填信息')
    }
  })
}

// 组件挂载时加载数据
onMounted(() => {
  load()
})
</script>

<style scoped>
.report-table-card {
  position: relative;
  min-height: 260px;
}

:deep(.report-table-card .el-loading-spinner .circular) {
  width: 42px;
  height: 42px;
}

:deep(.report-table-card .el-loading-text) {
  margin-top: 10px;
  color: #409eff;
  font-size: 14px;
}
</style>
