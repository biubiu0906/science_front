<template>
  <div style="margin: 30px;">
    <div class="card" style="padding: 20px;">
      <el-table stripe :data="data.tableData" :header-cell-style="{ backgroundColor: '#e9edf2' }" class="table-center" empty-text="暂无数据" @row-click="showNotificationDetail" :row-style="{ cursor: 'pointer' }">
        <el-table-column type="index" :index="indexMethod" width="80" />
        <el-table-column prop="creatorUsername" label="发起者" width="150" sortable>
          <template v-slot="scope">
            <div class="content-center">
              {{ scope.row.creatorUsername }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="通知" min-width="200" sortable>
          <template v-slot="scope">
            <div :class="getContentAlignClass(scope.row.title)">
              {{ scope.row.title }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="通知时间" width="150" sortable>
          <template v-slot="scope">
            <div class="content-center">
              {{ formatDate(scope.row.createTime) }}
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>



    <!-- 通知详情弹窗 -->
    <el-dialog 
      v-model="data.notificationDetailVisible" 
      width="800px"
      :before-close="() => data.notificationDetailVisible = false"
    >
      <div style="padding: 0 15px;">
        <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #333">
          {{ data.currentNotification.title }}
        </div>
        <div style="font-size: 12px; color: #999; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px">
          {{ data.currentNotification.creatorUsername }} | {{ formatDate(data.currentNotification.createTime) }}
        </div>
        <div style="line-height: 1.8; color: #666; text-align: justify">
          {{ data.currentNotification.content }}
        </div>
        
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="data.notificationDetailVisible = false" size="small">关闭</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>

import {reactive, ref} from "vue";
import request from "@/utils/request.js";
import {ElMessage} from "@/utils/element-plus";

const data = reactive({
  tableData: [],
  total: 0,
  notificationDetailVisible: false,
  currentNotification: {}
})

const indexMethod = (index) => {
  return index + 1
}

const load = () => {
  request.get('/notification/selectCurrent').then(res => {
    if (res.code === '200') {
      data.tableData = res.data || []
      data.total = res.data?.length || 0
    }
  }).catch(err => {
    console.error('获取通知失败:', err)
    ElMessage.error('获取通知失败')
  })
}

// 格式化日期，只显示年月日
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 显示通知详情
const showNotificationDetail = (row) => {
  data.currentNotification = row
  data.notificationDetailVisible = true
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

</style>