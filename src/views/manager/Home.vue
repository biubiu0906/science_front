<template>
  <div>
    <div class="card" style="margin-bottom: 5px">您好！{{ data.user?.name }}，欢迎使用本系统！</div>
    <div style="display: flex">
      <div class="card" style="flex: 50%; max-height: 600px; overflow-y: auto; ">
        <div style="font-weight: bold; font-size: 18px; padding: 10px 0 30px 10px">系统公告</div>
        <el-timeline style="max-width: 600px">
          <el-timeline-item
              v-for="(item, index) in data.noticeData"
              :key="index"
              :timestamp="item.time"
          >
            {{ item.content }}
          </el-timeline-item>
        </el-timeline>
      </div>
      <div style="flex: 50%"></div>
    </div>
  </div>
</template>

<script setup>

import {reactive, onMounted} from "vue";
import request from "@/utils/request.js";
import {ElMessage} from "element-plus";

const data = reactive({
  user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
  noticeData: [],
  laboratoryLevel: null
})

const loadNotice = () => {
  request.get('/notice/selectAll').then(res => {
    if (res.code === '200') {
      data.noticeData = res.data
    } else {
      ElMessage.error(res.msg)
    }
  })
}

const getLaboratoryLevel = () => {
  // 检查用户是否有实验室ID
  if (!data.user.laboratoryId) {
    return
  }
  
  request.get('/teacher/selectLaboratoryById/' + data.user.laboratoryId).then(res => {
    if (res.code === '200') {
      data.laboratoryLevel = res.data.type
      
      if (data.laboratoryLevel === 1) {
        ElMessage({
          message: '您所在的实验室还不是重点实验室，请联系实验室管理员申请为重点实验室',
          type: 'warning',
          duration: 10000,
        })
      }
    } else {
      ElMessage.error(res.msg)
    }
  }).catch(error => {
    console.error('获取实验室级别失败:', error)
    ElMessage.error('获取实验室信息失败')
  })
}


onMounted(() => {
  if (data.user.id) {
    getLaboratoryLevel()
  }
})
loadNotice()
</script>
