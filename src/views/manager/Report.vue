<template>
    <div class="card" style="margin-bottom: 5px">
      <div style="margin-bottom: 10px; margin-left: 10px;">
        <el-button type="warning" plain size="small" @click="load">刷新</el-button>
        <el-button type="primary" plain size="small" v-if="data.user.role !== 'ADMIN'" @click="creatMyReport">生成报告</el-button>
        <el-button type="danger" plain size="small" @click="delBatch">批量删除</el-button>
      </div>
      <el-table stripe :data="data.tableData" @selection-change="handleSelectionChange" :header-cell-style="{backgroundColor: '#e9edf2'}" class="table-center">
        <el-table-column type="selection" width="35" />
        <el-table-column type="index" label="序号" :index="indexMethod" width="60" />
        <el-table-column prop="taskId" label="编号" min-width="200" />
        <el-table-column prop="url" label="报告内容" min-width="120">
          <template v-slot="scope">
            <span v-if="!scope.row.url">暂无数据</span>
            <el-link 
              v-else 
              :href="scope.row.url" 
              target="_blank" 
              type="primary"
              :underline="false"
            >
              点击查看报告
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="subject" label="报告对象" min-width="100" />
        <el-table-column prop="comment" label="报告类型" min-width="100" />
        <el-table-column prop="status" label="报告状态" min-width="100">
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
        <el-table-column prop="createdAt" label="创建时间" min-width="160"/>
        <el-table-column label="操作" width="80" text-align="center" fixed="right">
          <template v-slot="scope">
            <el-tooltip content="删除报告" placement="bottom" effect="light">
              <el-button type="danger" circle  size="small" :icon="Delete"  @click="del(scope.row.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 10px; text-align: center;">
        <el-pagination @current-change="load" background layout="prev, pager, next" :page-size="data.pageSize" v-model:current-page="data.pageNum" :total="data.total" />
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
            date-format="MMM DD, YYYY"
            time-format="HH:mm"
          />
        </el-form-item>
        <el-form-item prop="endTime" label="结束时间" style="text-align: center;">
          <el-date-picker
            v-model="data.reportForm.endTime"
            type="datetime"
            placeholder="请选择结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            date-format="MMM DD, YYYY"
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
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request.js'
import { Delete } from '@element-plus/icons-vue'

// 表单引用
const reportFormRef = ref(null)

const data = reactive({
  user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
  reportFormVisible: false,
  reportForm: {},
  tableData: [],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  ids: [],
})

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

// 加载报告数据
const load = () => {
  request.get('/report/task/page', {
    params: {
      pageNum: data.pageNum,
      pageSize: data.pageSize,
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
  })
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
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', { type: 'warning' }).then(() => {
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
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', { type: 'warning' }).then(res => {
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