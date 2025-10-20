<template>
  <div style="display: flex; flex-direction: column; justify-content: center; align-items: center;;">
    <div class="card header-card">
      <div style="
        width: 35px; 
        height: 35px; 
        border-radius: 50%; 
        background: linear-gradient(135deg, #ffebee, #ffcdd2);
        display: flex; 
        align-items: center; 
        justify-content: center;
        margin-right: 15px;
        margin-left: 11px;
        box-shadow: 0 3px 8px rgba(244, 67, 54, 0.3);
      ">
        <el-icon size="18" color="#d32f2f">
          <BellFilled />
        </el-icon>
      </div>
      您好！{{ data.user?.name }}，欢迎使用本系统！
    </div>
    <div class="card notice-box">
      <div class="notice-header">
        <div style="display: flex; align-items: center;">
          <div style="
            width: 35px; 
            height: 35px; 
            border-radius: 50%; 
            background: linear-gradient(135deg, #e3f2fd, #bbdefb);
            display: flex; 
            align-items: center; 
            justify-content: center;
            margin-right: 15px;
            margin-bottom: 5px;
            margin-top: 5px;
            box-shadow: 0 3px 8px rgba(33, 150, 243, 0.3);
          ">
            <el-icon size="18" color="#1976d2">
              <List />
            </el-icon>
          </div>
          系统公告
        </div>
        <div style="color: #333; font-size: 13px; font-weight: normal;">
          共 {{ data.noticeData.length }} 条公告
        </div>
      </div>
      <div class="notice-content">
        <el-timeline style="margin-top: 16px; margin-right: 45px; padding-bottom: 20px;">
          <el-timeline-item
              v-for="(item, index) in data.noticeData"
              :key="index"
              :timestamp="item.time"
              :color="index < 1 ? '#f62323' : null"
          >
            <div style="font-weight: bold; font-size: 16px; margin-bottom: 10px; display: flex; align-items: center;">
              {{ item.title }}
              <span v-if="index === 0" style="
                color: #f62323; 
                font-weight: 900; 
                font-style: italic; 
                margin-left: 10px; 
                font-size: 12px; 
                display: inline-block;
              ">NEW</span>
            </div>
            <div style="font-size: 14px; line-height: 22px;">{{ item.content }}</div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>
  </div>
</template>

<script setup>

import {reactive, onMounted} from "vue";
import request from "@/utils/request.js";
import {ElMessage} from "@/utils/element-plus";
import {List, BellFilled, StarFilled} from "@element-plus/icons-vue";

const data = reactive({
  user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
  noticeData: [],
  laboratoryLevel: null,
  totalNotice: null
})

const loadNotice = () => {
  request.get('/notice/selectAll').then(res => {
    if (res.code === '200') {
      data.noticeData = res.data.list
      data.totalNotice = res.data.total
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

<style scoped>
.header-card {
  margin-bottom: 10px; 
  margin-top: 15px; 
  width: 85%; 
  font-weight: bold; 
  font-size: 18px; 
  display: flex; 
  align-items: center; 
  padding-top: 10px; 
  padding-bottom: 10px; 
  background-color: #4176b8;
}

.notice-box {
  max-height: calc(100vh - 170px);
  width: 85%; 
  display: flex;
  flex-direction: column;
  background: linear-gradient(to bottom,#326db3 0%, #5f8ec4 10%, #fff 30%);
}

.notice-header {
  flex-shrink: 0;
  font-weight: bold; 
  font-size: 18px; 
  margin-left: 10px;
  margin-right: 10px;
  display: flex; 
  align-items: center; 
  justify-content: space-between;
  position: sticky; 
  top: 0; 
  z-index: 10;
  padding: 10px 0;
}

.notice-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.notice-content ul {
  padding-bottom: 0 !important;
}

/* 自定义滚动条样式 */
.notice-content::-webkit-scrollbar {
  width: 6px;
}

.notice-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.notice-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.notice-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>