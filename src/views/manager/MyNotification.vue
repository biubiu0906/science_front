<template>
  <div style="height: calc(100vh - 89px); overflow: hidden; padding: 30px; box-sizing: border-box;">
    <div style="display: flex; gap: 20px; height: 100%;">
      <!-- 左侧：通知卡片 -->
      <div class="card" style="width: 50%; height: 100%; padding: 20px; box-sizing: border-box; display: flex; flex-direction: column;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 20px; color: #333; font-weight: 600;">
            <el-icon style="margin-right: 5px; color: #67c23a; font-size: 17px;"><Bell /></el-icon>
            通知消息
          </h2>
          <el-button 
            type="success" 
            size="small" 
            text
            bg
            @click="handleViewAllNotifications"
          >
            查看全部
          </el-button>
        </div>
        
        <!-- 通知列表 -->
        <div style="flex: 1; overflow-y: auto;">
          <div 
            v-for="(item, index) in data.notificationData" 
            :key="index"
            @click="showNotificationDetail(item)"
            style="
              padding: 12px 16px; 
              margin-bottom: 12px;
              background: #f5f7fa; 
              cursor: pointer;
              border-radius: 6px;
              transition: all 0.3s;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            "
            :style="{ 'background': hoveredNotification === index ? '#f0f9f0' : '#f5f7fa', 'transform': hoveredNotification === index ? 'translateY(-2px)' : 'translateY(0)' }"
            @mouseenter="hoveredNotification = index"
            @mouseleave="hoveredNotification = -1"
          >
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="flex: 1; margin-right: 12px;">
                <div style="font-size: 14px; color: #333; font-weight: 500; margin-bottom: 8px; line-height: 1.4; display: flex; align-items: flex-start;">
                  <span style="width: 8px; height: 8px; background-color: #67c23a; border-radius: 50%; margin-right: 8px; flex-shrink: 0; margin-top: 6px;"></span>
                  {{ getNotificationTitle(item).substring(0, 50) + (getNotificationTitle(item).length > 50 ? '...' : '') }}
                </div>
                <div style="font-size: 12px; color: #666; line-height: 1.3;" v-if="item.content">
                  {{ item.content.length > 100 ? item.content.substring(0, 100) + '...' : item.content }}
                </div>
              </div>
              <div style="display: flex; align-items: center; flex-direction: column;">
                <div v-if="item.isVisible">
                  <el-icon style="color: red; font-size: 16px;"><WarningFilled /></el-icon>
                </div>
                <span style="font-size: 11px; color: #999; white-space: nowrap;">
                  {{ formatDate(item.createTime) }}
                </span>
              </div>
            </div>
          </div>
          <div v-if="data.notificationData.length === 0" style="text-align: center; color: #999; padding: 60px 20px; font-size: 14px;">
            <el-icon size="48" style="color: #ddd; margin-bottom: 16px;"><Bell /></el-icon>
            <div>暂无通知消息</div>
          </div>
        </div>
      </div>
      
      <!-- 右侧：公告卡片 -->
      <div class="card" style="width: 50%; height: 100%; padding: 20px; box-sizing: border-box; display: flex; flex-direction: column;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 20px; color: #333; font-weight: 600;">
            <el-icon style="margin-right: 5px; color: #ff8c00; font-size: 18px;"><Document /></el-icon>
            公告信息
          </h2>
          <el-button 
            type="warning" 
            size="small" 
            text
            bg
            @click="handleViewAllNotices"
          >
            查看全部
          </el-button>
        </div>
        
        <!-- 公告列表 -->
        <div style="flex: 1; overflow-y: auto;">
          <div 
            v-for="(item, index) in data.noticeData" 
            :key="index"
            @click="showNoticeDetail(item)"
            style="
              padding: 12px 16px; 
              margin-bottom: 12px;
              background: #f5f7fa; 
              cursor: pointer;
              border-radius: 6px;
              transition: all 0.3s;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            "
            :style="{ 'background': hoveredNotice === index ? '#fff7e6' : '#f5f7fa', 'transform': hoveredNotice === index ? 'translateY(-2px)' : 'translateY(0)' }"
            @mouseenter="hoveredNotice = index"
            @mouseleave="hoveredNotice = -1"
          >
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="flex: 1; margin-right: 12px;">
                <div style="font-size: 14px; color: #333; font-weight: 500; margin-bottom: 8px; line-height: 1.4; display: flex; align-items: flex-start;">
                  <span style="width: 8px; height: 8px; background-color: #ff8c00; border-radius: 50%; margin-right: 8px; flex-shrink: 0; margin-top: 6px;"></span>
                  {{ getNoticeTitle(item).substring(0, 50) + (getNoticeTitle(item).length > 50 ? '...' : '') }}
                </div>
                <div style="font-size: 12px; color: #666; line-height: 1.3;" v-if="item.content">
                  {{ item.content.length > 100 ? item.content.substring(0, 100) + '...' : item.content }}
                </div>
              </div>
              <div style="display: flex; align-items: center;">
                <span style="font-size: 11px; color: #999; white-space: nowrap;">
                  {{ formatDate(item.createTime) }}
                </span>
              </div>
            </div>
          </div>
          <div v-if="data.noticeData.length === 0" style="text-align: center; color: #999; padding: 60px 20px; font-size: 14px;">
            <el-icon size="48" style="color: #ddd; margin-bottom: 16px;"><Document /></el-icon>
            <div>暂无公告信息</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 通知详情弹窗 -->
    <el-dialog 
      v-model="data.notificationDetailVisible" 
      width="700px"
      :before-close="() => data.notificationDetailVisible = false"
    >
      <div style="padding: 0 15px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
          <div style="font-size: 18px; font-weight: bold; color: #333; flex: 1;">
            {{ getNotificationTitle(data.currentNotification) }}
          </div>
        </div>
        <div style="font-size: 12px; color: #999; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px">
          发布时间：{{ formatDate(data.currentNotification.createTime) }}
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

    <!-- 公告详情弹窗 -->
    <el-dialog 
      v-model="data.noticeDetailVisible" 
      width="700px"
      :before-close="() => data.noticeDetailVisible = false"
    >
      <div style="padding: 0 15px;">
        <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #333">
          {{ getNoticeTitle(data.currentNotice) }}
        </div>
        <div style="font-size: 12px; color: #999; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px">
          发布时间：{{ formatDate(data.currentNotice.createTime) }}
        </div>
        <div style="line-height: 1.8; color: #666; text-align: justify">
          {{ data.currentNotice.content }}
        </div>
        
        <!-- 附件显示区域 -->
        <div v-if="data.currentNotice.file" style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee;">
          <div style="font-size: 14px; font-weight: 500; color: #333; margin-bottom: 10px;">
            <el-icon style="margin-right: 5px;"><Link /></el-icon>
            附件
          </div>
          <div class="notice-link">
            <div class="link-item">
              <div class="link-info">
                <el-icon class="link-icon"><Link /></el-icon>
                <span class="link-url">{{ data.currentNotice.file }}</span>
              </div>
              <el-button 
                type="primary" 
                size="small" 
                @click="openNoticeLink(data.currentNotice.file)"
                class="open-link-btn"
              >
                访问链接
              </el-button>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="data.noticeDetailVisible = false" size="small">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看全部通知弹窗 -->
    <el-dialog 
      v-model="data.allNotificationVisible" 
      width="700px"
      title="全部通知"
      :before-close="() => data.allNotificationVisible = false"
    >
      <div style="max-height: 500px; overflow-y: auto;">
        <div 
          v-for="(item, index) in data.allNotificationData" 
          :key="index"
          @click="showNotificationDetail(item)"
          style="
            padding: 12px 16px; 
            margin-bottom: 8px;
            background: #f5f7fa; 
            cursor: pointer;
            border-radius: 6px;
            transition: all 0.3s;
          "
          :style="{ 'background': hoveredAllNotification === index ? '#f0f9f0' : '#f5f7fa' }"
          @mouseenter="hoveredAllNotification = index"
          @mouseleave="hoveredAllNotification = -1"
        >
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="flex: 1; margin-right: 12px;">
              <div style="font-size: 14px; color: #333; font-weight: 500; margin-bottom: 4px; display: flex; align-items: flex-start;">
                <span style="width: 8px; height: 8px; background-color: #67c23a; border-radius: 50%; margin-right: 8px; flex-shrink: 0; margin-top: 6px;"></span>
                {{ getNotificationTitle(item) }}
              </div>
              <div style="font-size: 12px; color: #666;" v-if="item.content">
                {{ item.content.length > 80 ? item.content.substring(0, 80) + '...' : item.content }}
              </div>
            </div>
            <div style="display: flex; align-items: center; flex-direction: column;">
                <div v-if="item.isVisible">
                  <el-icon style="color: red; font-size: 16px;"><WarningFilled /></el-icon>
                </div>
              <span style="font-size: 11px; color: #999; white-space: nowrap;">
                {{ formatDate(item.createTime) }}
              </span>
            </div>
          </div>
        </div>
        <div v-if="data.allNotificationData.length === 0" style="text-align: center; color: #999; padding: 40px;">
          暂无通知数据
        </div>
      </div>
    </el-dialog>

    <!-- 查看全部公告弹窗 -->
    <el-dialog 
      v-model="data.allNoticeVisible" 
      width="700px"
      title="全部公告"
      :before-close="() => data.allNoticeVisible = false"
    >
      <div style="max-height: 500px; overflow-y: auto;">
        <div 
          v-for="(item, index) in data.allNoticeData" 
          :key="index"
          @click="showNoticeDetail(item)"
          style="
            padding: 12px 16px; 
            margin-bottom: 8px;
            background: #f5f7fa; 
            cursor: pointer;
            border-radius: 6px;
            transition: all 0.3s;
          "
          :style="{ 'background': hoveredAllNotice === index ? '#fff7e6' : '#f5f7fa' }"
          @mouseenter="hoveredAllNotice = index"
          @mouseleave="hoveredAllNotice = -1"
        >
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="flex: 1; margin-right: 12px;">
              <div style="font-size: 14px; color: #333; font-weight: 500; margin-bottom: 4px; display: flex; align-items: flex-start;">
                <span style="width: 8px; height: 8px; background-color: #ff8c00; border-radius: 50%; margin-right: 8px; flex-shrink: 0; margin-top: 6px;"></span>
                {{ getNoticeTitle(item) }}
              </div>
              <div style="font-size: 12px; color: #666;" v-if="item.content">
                {{ item.content.length > 80 ? item.content.substring(0, 80) + '...' : item.content }}
              </div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: center; gap: 4px;">
              <span style="font-size: 11px; color: #999; white-space: nowrap;">
                {{ formatDate(item.createTime) }}
              </span>
            </div>
          </div>
        </div>
        <div v-if="data.allNoticeData.length === 0" style="text-align: center; color: #999; padding: 40px;">
          暂无公告数据
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Bell, Document, Link, WarningFilled } from '@element-plus/icons-vue'
import request from '@/utils/request.js'

// 响应式数据
const data = reactive({
  notificationData: [],
  noticeData: [],
  allNotificationData: [],
  allNoticeData: [],
  currentNotification: {},
  currentNotice: {},
  notificationDetailVisible: false,
  noticeDetailVisible: false,
  allNotificationVisible: false,
  allNoticeVisible: false,
  user: JSON.parse(localStorage.getItem('user') || '{}')
})

// 悬停状态
const hoveredNotification = ref(-1)
const hoveredNotice = ref(-1)
const hoveredAllNotification = ref(-1)
const hoveredAllNotice = ref(-1)

// 获取通知标题的方法 - 与 Dashboard.vue 保持一致
const getNotificationTitle = (notification) => {
  if (notification.title && notification.title.trim()) {
    return notification.title
  }
  // 如果没有标题，取内容的前20个字符作为标题
  if (notification.content) {
    return notification.content.length > 20 ? notification.content.substring(0, 20) + '...' : notification.content
  }
  return '无标题'
}

// 获取公告标题的方法 - 与 Dashboard.vue 保持一致
const getNoticeTitle = (notice) => {
  if (notice.title && notice.title.trim()) {
    return notice.title
  }
  // 如果没有标题，取内容的前20个字符作为标题
  if (notice.content) {
    return notice.content.length > 20 ? notice.content.substring(0, 20) + '...' : notice.content
  }
  return '无标题'
}

// 格式化日期的方法 - 与 Dashboard.vue 保持一致，只显示年月日
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 显示通知详情
const showNotificationDetail = (item) => {
  data.currentNotification = item
  data.notificationDetailVisible = true
  data.allNotificationVisible = false
}

// 显示公告详情
const showNoticeDetail = (item) => {
  data.currentNotice = item
  data.noticeDetailVisible = true
  data.allNoticeVisible = false
}

// 打开公告链接
const openNoticeLink = (url) => {
  if (!url) {
    ElMessage.warning('链接地址不存在')
    return
  }
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    ElMessage.warning('请输入有效的网址链接（需要以 http:// 或 https:// 开头）')
    return
  }
  window.open(url, '_blank')
  ElMessage.success('正在打开链接')
}

// 查看全部通知
const handleViewAllNotifications = () => {
  data.allNotificationVisible = true
}

// 查看全部公告
const handleViewAllNotices = () => {
  data.allNoticeVisible = true
}

// 加载通知数据 - 使用与 Dashboard.vue 相同的接口
const loadNotifications = () => {
  request.get('/notification/selectCurrent').then(res => {
    if (res.code === '200') {
      data.notificationData = res.data.list || []
      data.allNotificationData = res.data.list || [] // 同时更新全部通知数据
    } else {
      ElMessage.error(res.msg)
    }
  }).catch(error => {
    console.error('加载通知数据失败:', error)
    data.notificationData = []
    data.allNotificationData = []
  })
}

// 加载公告数据 - 使用与 Dashboard.vue 相同的接口
const loadNotices = () => {
  request.get('/notice/selectAll').then(res => {
    if (res.code === '200') {
      data.noticeData = res.data.list || []
      data.allNoticeData = res.data.list || [] // 同时更新全部公告数据
    } else {
      ElMessage.error(res.msg)
    }
  }).catch(error => {
    console.error('加载公告数据失败:', error)
    data.noticeData = []
    data.allNoticeData = []
  })
}

// 组件挂载时加载数据
onMounted(() => {
  loadNotifications()
  loadNotices()
})
</script>

<style scoped>
/* 重点实验室标签样式 */
.lab-type-tag {
  font-weight: 500;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 11px;
}

.lab-type-tag.el-tag--success {
  background-color: #f0f9ff;
  border-color: #67c23a;
  color: #67c23a;
}

/* 附件链接显示样式 */
.notice-link {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 5px;
  border: 1px solid #e9ecef;
}

.link-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.link-info {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 8px;
}

.link-icon {
  color: #409eff;
  font-size: 18px;
}

.link-url {
  color: #606266;
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
}

.open-link-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  padding: 6px 12px;
}

.open-link-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

/* 卡片样式 */
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #ebeef5;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>