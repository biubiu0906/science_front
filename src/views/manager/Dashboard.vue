<template>
  <div style="height: calc(100vh - 89px); overflow: hidden; padding-right: 10px; padding-bottom: 0;">
    <div style="display: flex; margin-bottom: 10px;">
      <!-- 左侧：通知和公告 -->
      <div class="card" style="width: 50%; margin-right: 5px; height: 180px; padding: 0 15px 10px 15px; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <el-tabs v-model="data.activeNoticeTab">
            <!-- 通知标签页 -->
            <el-tab-pane label="通知" name="notification">
            </el-tab-pane>
          
            <!-- 公告标签页 -->
            <el-tab-pane label="公告" name="notice">
            </el-tab-pane>
          </el-tabs>
          <el-button 
            type="primary" 
            size="small" 
            text
            bg
            @click="handleViewAll"
            style="margin-left: 10px;"
          >
            查看全部
          </el-button>
        </div>
        
        <!-- 标签页内容区域 -->
        <div style="height: calc(100% - 50px);">
          <div v-if="data.activeNoticeTab === 'notification'" style="max-height: 100px; overflow-y: hidden">
            <div 
              v-for="(item, index) in (data.notificationData || []).slice(0, 3)" 
              :key="index"
              @click="showNotificationDetail(item)"
              style="
                padding: 4px 8px; 
                margin-bottom: 5px;
                border-left: 3px solid #67c23a; 
                background: #f5f7fa; 
                cursor: pointer;
                border-radius: 4px;
                transition: all 0.3s;
                display: flex;
                justify-content: space-between;
                align-items: center;
              "
              :style="{ 'background': hoveredNotification === index ? '#f0f9ff' : '#f5f7fa' }"
              @mouseenter="hoveredNotification = index"
              @mouseleave="hoveredNotification = -1"
            >
              <el-tooltip 
                :content="getNotificationTitle(item)" 
                placement="right"
                effect="light"
                popper-style="max-width: 400px;"
              >
                <el-text style="font-size: 12px; color: #333; font-weight: 500; flex: 1; margin-right: 8px;" line-clamp="1">
                  {{ getNotificationTitle(item) }}
                </el-text>
              </el-tooltip>
              <span style="font-size: 10px; color: #999; white-space: nowrap;">
                {{ formatDate(item.createTime) }}
              </span>
            </div>
            <div v-if="(data.notificationData || []).length === 0" style="text-align: center; color: #999; padding: 20px">
              暂无通知
            </div>
          </div>
          
          <div v-if="data.activeNoticeTab === 'notice'" style="max-height: 100px; overflow-y: hidden">
            <div 
              v-for="(item, index) in (data.noticeData || []).slice(0, 3)" 
              :key="index"
              @click="showNoticeDetail(item)"
              style="
                padding: 4px 8px; 
                margin-bottom: 5px;
                border-left: 3px solid #409eff; 
                background: #f5f7fa; 
                cursor: pointer;
                border-radius: 4px;
                transition: all 0.3s;
                display: flex;
                justify-content: space-between;
                align-items: center;
              "
              :style="{ 'background': hoveredNotice === index ? '#e6f7ff' : '#f5f7fa' }"
              @mouseenter="hoveredNotice = index"
              @mouseleave="hoveredNotice = -1"
            >
              <el-tooltip 
                :content="getNoticeTitle(item)" 
                placement="right"
                effect="light"
                popper-style="max-width: 400px;"
              >
                <el-text style="font-size: 12px; color: #333; font-weight: 500; flex: 1; margin-right: 8px;" line-clamp="1">
                  {{ getNoticeTitle(item) }}
                </el-text>
              </el-tooltip>
              <span style="font-size: 10px; color: #999; white-space: nowrap;">
                {{ formatDate(item.createTime) }}
              </span>
            </div>
            <div v-if="(data.noticeData || []).length === 0" style="text-align: center; color: #999; padding: 20px">
              暂无公告
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧：统计数据 -->
      <div style="width: 50%; margin-left: 5px; height: 180px; box-sizing: border-box;">
        <!-- 第一行：科研项目数、科研成果总数 -->
        <div style="display: flex; margin-bottom: 10px;">
          <div style="flex: 1; margin-right: 5px; display: flex; height: 85px; align-items: center" class="card">
            <div style="flex: 1;">
              <div style="
                width: 45px; 
                height: 45px; 
                border-radius: 50%; 
                background: linear-gradient(135deg, #e3f2fd, #bbdefb);
                display: flex; 
                align-items: center; 
                justify-content: center;
                margin: 0 auto;
                box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
              ">
                <el-icon size="20" color="#1976d2">
                  <Platform />
                </el-icon>
              </div>
            </div>
            <div style="flex: 1">
              <div style="font-size: 16px">科研项目数</div>
              <div style="font-size: 18px; margin-top: 5px; font-weight: bold">{{ data.baseData.project || 0 }}</div>
            </div>
          </div>
          <div style="flex: 1; margin-left: 5px; display: flex; height: 85px; align-items: center" class="card">
            <div style="flex: 1;">
              <div style="
                width: 45px; 
                height: 45px; 
                border-radius: 50%; 
                background: linear-gradient(135deg, #e8f5e8, #c8e6c9);
                display: flex; 
                align-items: center; 
                justify-content: center;
                margin: 0 auto;
                box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
              ">
                <el-icon size="20" color="#388e3c">
                  <HelpFilled />
                </el-icon>
              </div>
            </div>
            <div style="flex: 1">
              <div style="font-size: 16px">科研成果数</div>
              <div style="font-size: 18px; margin-top: 5px; font-weight: bold">{{ data.baseData.achievement || 0 }}</div>
            </div>
          </div>
        </div>
        
        <!-- 第二行：反馈总数、教师总数 -->
        <div style="display: flex;">
          <div style="flex: 1; margin-right: 5px; display: flex; height: 85px; align-items: center" class="card">
            <div style="flex: 1;">
              <div style="
                width: 45px; 
                height: 45px; 
                border-radius: 50%; 
                background: linear-gradient(135deg, #fff3e0, #ffcc80);
                display: flex; 
                align-items: center; 
                justify-content: center;
                margin: 0 auto;
                box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
              ">
                <el-icon size="20" color="#f57c00">
                  <Comment />
                </el-icon>
              </div>
            </div>
            <div style="flex: 1">
              <div style="font-size: 16px">实验室总数</div>
              <div style="font-size: 18px; margin-top: 5px; font-weight: bold">{{ data.baseData.lab || 0 }}</div>
            </div>
          </div>
          <div style="flex: 1; margin-left: 5px; display: flex; height: 85px; align-items: center" class="card">
            <div style="flex: 1;">
              <div style="
                width: 45px; 
                height: 45px; 
                border-radius: 50%; 
                background: linear-gradient(135deg, #f3e5f5, #ce93d8);
                display: flex; 
                align-items: center; 
                justify-content: center;
                margin: 0 auto;
                box-shadow: 0 4px 12px rgba(156, 39, 176, 0.3);
              ">
                <el-icon size="20" color="#7b1fa2">
                  <Avatar />
                </el-icon>
              </div>
            </div>
            <div style="flex: 1">
              <div style="font-size: 16px">教师总数</div>
              <div style="font-size: 18px; margin-top: 5px; font-weight: bold">{{ data.baseData.teacher || 0 }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 图表展示区域 - 使用 el-tabs 组件 -->
    <div style="margin-top: 12px; height: calc(100vh - 90px - 180px - 14px);" class="card">
      <el-tabs v-model="data.activeTab" type="border-card" @tab-change="handleTabChange" style="height: 100%;">
        <!-- 科研项目学科类别占比图 -->
        <el-tab-pane label="学科分布" name="subject">
          <div style="height: calc(100vh - 360px); display: flex;">
            <div id="pie" style="flex: 1; height: 100%;"></div>
          </div>
        </el-tab-pane>
        
        <!-- 系统中不同老师的科研项目数量 -->
        <el-tab-pane label="项目统计" name="project">
          <div style="height: calc(100vh - 320px); display: flex;">
            <div id="bar1" style="flex: 1; height: 100%;"></div>
          </div>
        </el-tab-pane>
        
        <!-- 系统中不同类型下的科研成果数量 -->
        <el-tab-pane label="成果统计" name="achievement">
          <div style="height: calc(100vh - 330px); display: flex;">
            <div id="bar2" style="flex: 1; height: 100%;"></div>
          </div>
        </el-tab-pane>
        
        <!-- 项目状态分布图 -->
        <el-tab-pane label="状态分布" name="status">
          <div style="height: calc(100vh - 360px); display: flex;">
            <div id="pie2" style="flex: 1; height: 100%;"></div>
          </div>
        </el-tab-pane>
        
        <!-- 科研项目Top5 -->
        <el-tab-pane label="项目排行" name="projectRank">
          <div style="height: calc(100% - 40px); padding: 0 20px 20px 20px; box-sizing: border-box; overflow-y: auto;">
            <div style="text-align: center; margin-bottom: 10px;">
              <div style="font-weight: bold; font-size: 18px; color: #333;">科研项目Top5</div>
              <div style="font-size: 12px; color: #666; margin-top: 5px;">
                <span v-if="data.user.role === 'ADMIN'">统计维度：实验室</span>
                <span v-else-if="data.user.role === 'KEY_LABORATORY'">统计维度：教师</span>
              </div>
            </div>
            <div style="background: #f8f9fa;">
              <!-- 无数据显示 -->
              <div v-if="!data.projectRanking || data.projectRanking.length === 0" 
                   style="text-align: center; color: #999; padding: 60px 20px; font-size: 14px;">
                暂无数据
              </div>
              
              <!-- 管理员角色：显示实验室排行 -->
              <div v-else-if="data.user.role === 'ADMIN'" 
                   v-for="(item, index) in data.projectRanking" 
                   :key="'project-lab-' + index"
                   style="
                     display: flex; 
                     align-items: center; 
                     justify-content: space-between;
                     padding:6px 16px; 
                     margin-bottom: 5px;
                     border-radius: 8px;
                   ">
                <div style="display: flex; align-items: center;">
                  <div style="
                    width: 20px; 
                    height: 20px; 
                    border-radius: 50%; 
                    background: linear-gradient(45deg, #409eff, #67c23a);
                    color: white; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center;
                    font-weight: bold;
                    margin-right: 30px;
                    margin-left: 30px;
                    font-size: 12px;
                  ">
                    {{ index + 1 }}
                  </div>
                  <div style="font-size: 15px; font-weight: 500; color: #333;">{{ item.name }}</div>
                </div>
                <div style="font-size: 16px; font-weight: bold; color: #409eff; margin-right: 30px;">{{ item.count }}</div>
              </div>
              
              <!-- 重点实验室角色：显示教师排行 -->
              <div v-else-if="data.user.role === 'KEY_LABORATORY'" 
                   v-for="(item, index) in data.projectRanking" 
                   :key="'project-teacher-' + index"
                   style="
                     display: flex; 
                     align-items: center; 
                     justify-content: space-between;
                     padding: 6px 16px; 
                     margin-bottom: 5px;
                     border-radius: 8px;
                   ">
                <div style="display: flex; align-items: center;">
                  <div style="
                    width: 20px; 
                    height: 20px; 
                    border-radius: 50%; 
                    background: linear-gradient(45deg, #409eff, #67c23a);
                    color: white; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center;
                    font-weight: bold;
                    margin-right: 30px;
                    margin-left: 30px;
                    font-size: 12px;
                  ">
                    {{ index + 1 }}
                  </div>
                  <div style="font-size: 15px; font-weight: 500; color: #333;">{{ item.name }}</div>
                </div>
                <div style="font-size: 16px; font-weight: bold; color: #409eff; margin-right: 30px;">{{ item.count }}</div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 科研成果Top5 -->
        <el-tab-pane label="成果排行" name="achievementRank">
          <div style="height: calc(100% - 40px); padding: 0 20px 20px 20px; box-sizing: border-box; overflow-y: auto;">
            <div style="text-align: center; margin-bottom: 10px;">
              <div style="font-weight: bold; font-size: 18px; color: #333;">科研成果Top5</div>
              <div style="font-size: 12px; color: #666; margin-top: 5px;">
                <span v-if="data.user.role === 'ADMIN'">统计维度：实验室</span>
                <span v-else-if="data.user.role === 'KEY_LABORATORY'">统计维度：教师</span>
              </div>
            </div>
            <div style="background: #f8f9fa;">
              <!-- 无数据显示 -->
              <div v-if="!data.achievementRanking || data.achievementRanking.length === 0" 
                   style="text-align: center; color: #999; padding: 60px 20px; font-size: 14px;">
                暂无数据
              </div>
              
              <!-- 管理员：显示实验室排行 -->
              <div v-else-if="data.user.role === 'ADMIN'" 
                   v-for="(item, index) in data.achievementRanking" 
                   :key="'achievement-lab-' + index"
                   style="
                     display: flex; 
                     align-items: center; 
                     justify-content: space-between;
                     padding: 6px 16px; 
                     margin-bottom: 5px;
                     border-radius: 8px;
                   ">
                <div style="display: flex; align-items: center;">
                  <div style="
                    width: 20px; 
                    height: 20px; 
                    border-radius: 50%; 
                    background: linear-gradient(45deg, #e6a23c, #f56c6c);
                    color: white; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center;
                    font-weight: bold;
                    margin-right: 30px;
                    margin-left: 30px;
                    font-size: 12px;
                  ">
                    {{ index + 1 }}
                  </div>
                  <div style="font-size: 15px; font-weight: 500; color: #333;">{{ item.name }}</div>
                </div>
                <div style="font-size: 16px; font-weight: bold; color: #e6a23c; margin-right: 30px;">{{ item.count }}</div>
              </div>
              
              <!-- 重点实验室角色：显示教师排行 -->
              <div v-else-if="data.user.role === 'KEY_LABORATORY'" 
                   v-for="(item, index) in data.achievementRanking" 
                   :key="'achievement-teacher-' + index"
                   style="
                     display: flex; 
                     align-items: center; 
                     justify-content: space-between;
                     padding: 6px 16px; 
                     margin-bottom: 5px;
                     border-radius: 8px;
                   ">
                <div style="display: flex; align-items: center;">
                  <div style="
                    width: 20px; 
                    height: 20px; 
                    border-radius: 50%; 
                    background: linear-gradient(45deg, #e6a23c, #f56c6c);
                    color: white; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center;
                    font-weight: bold;
                    margin-right: 30px;
                    margin-left: 30px;
                    font-size: 12px;
                  ">
                    {{ index + 1 }}
                  </div>
                  <div style="font-size: 15px; font-weight: 500; color: #333;">{{ item.name }}</div>
                </div>
                <div style="font-size: 16px; font-weight: bold; color: #e6a23c; margin-right: 30px;">{{ item.count }}</div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 公告详情弹窗 -->
    <el-dialog 
      v-model="data.noticeDetailVisible" 
      width="800px"
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

    <!-- 查看全部公告弹窗 -->
    <el-dialog 
      v-model="data.allNoticesVisible" 
      title="全部公告" 
      width="800px"
      :before-close="() => data.allNoticesVisible = false"
    >
      <el-table 
         :data="data.noticeData" 
         style="width: 100%"
         :show-header="false"
         @row-click="showNoticeDetailFromTable"
         :row-style="{ cursor: 'pointer' }"
       >
         <el-table-column 
           prop="title" 
           min-width="300"
         >
           <template #default="scope">
             <span style="color: #333; font-weight: 500;">
               {{ getNoticeTitle(scope.row) }}
             </span>
           </template>
         </el-table-column>
         <el-table-column 
           prop="createTime" 
           label="发布时间"
           width="100"
           align="center"
         >
           <template #default="scope">
             {{ formatDate(scope.row.createTime) }}
           </template>
         </el-table-column>
       </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="data.allNoticesVisible = false" size="small">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 通知详情弹窗 -->
    <el-dialog 
      v-model="data.notificationDetailVisible" 
      width="800px"
      :before-close="() => data.notificationDetailVisible = false"
    >
      <div style="padding: 0 15px;">
        <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #333">
          {{ getNotificationTitle(data.currentNotification) }}
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

    <!-- 查看全部通知弹窗 -->
    <el-dialog 
      v-model="data.allNotificationsVisible" 
      title="全部通知" 
      width="800px"
      :before-close="() => data.allNotificationsVisible = false"
    >
      <el-table 
         :data="data.notificationData" 
         style="width: 100%"
         :show-header="false"
         @row-click="showNotificationDetailFromTable"
         :row-style="{ cursor: 'pointer' }"
       >
         <el-table-column 
           prop="title" 
           min-width="300"
         >
           <template #default="scope">
             <span style="color: #333; font-weight: 500;">
               {{ getNotificationTitle(scope.row) }}
             </span>
           </template>
         </el-table-column>
         <el-table-column 
           prop="createTime" 
           label="发布时间"
           width="100"
           align="center"
         >
           <template #default="scope">
             {{ formatDate(scope.row.createTime) }}
           </template>
         </el-table-column>
       </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="data.allNotificationsVisible = false" size="small">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>

import {reactive, onMounted, nextTick} from "vue";
import request from "@/utils/request.js";
import {ElMessage} from "@/utils/element-plus";
import echarts from "@/utils/echarts.js";
// 导入图标组件
import { Platform, HelpFilled, Comment, Avatar, Paperclip, Document, Download, Link } from '@element-plus/icons-vue';

const data = reactive({
  user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
  baseData: {},
  noticeData: [], // 公告数据
  hoveredNotice: -1, // 鼠标悬停的公告索引
  noticeDetailVisible: false, // 公告详情弹窗显示状态
  currentNotice: {}, // 当前查看的公告详情
  allNoticesVisible: false, // 查看全部公告弹窗显示状态
  activeTab: 'subject', // 当前激活的tab页，默认为学科分布
  activeNoticeTab: 'notification', // 当前激活的通知/公告标签页，默认为通知
  // 通知相关数据
  notificationData: [], // 通知数据，从接口获取
  hoveredNotification: -1, // 鼠标悬停的通知索引
  notificationDetailVisible: false, // 通知详情弹窗显示状态
  currentNotification: {}, // 当前查看的通知详情
  allNotificationsVisible: false, // 查看全部通知弹窗显示状态
  // 排行榜模拟数据 - 管理员角色（实验室维度）
  projectRanking: [
  ],
  achievementRanking: [
  ],
})

const loadBaseData = () => {
  request.get('/dashboard/base').then(res => {
    if (res.code === '200') {
      data.baseData = res.data
    } else {
      ElMessage.error(res.msg)
    }
  })
}

// 加载公告数据
const loadNotice = () => {
  request.get('/notice/selectAll').then(res => {
    if (res.code === '200') {
      data.noticeData = res.data.list || []
    } else {
      ElMessage.error(res.msg)
    }
  }).catch(error => {
    console.error('加载公告数据失败:', error)
    data.noticeData = []
  })
}

// 加载通知数据
const loadNotification = () => {
  request.get('/notification/selectCurrent').then(res => {
    if (res.code === '200') {
      data.notificationData = res.data.list || []
    } else {
      ElMessage.error(res.msg)
    }
  }).catch(error => {
    console.error('加载通知数据失败:', error)
    data.notificationData = []
  })
}

// 获取公告标题（如果有title字段则使用，否则取content前几个字）
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

// 显示公告详情
const showNoticeDetail = (notice) => {
  data.currentNotice = notice
  data.noticeDetailVisible = true
}

// 显示全部公告
const showAllNotices = () => {
  data.allNoticesVisible = true
}

// 从表格中查看公告详情
const showNoticeDetailFromTable = (notice) => {
  data.allNoticesVisible = false // 关闭全部公告弹窗
  data.currentNotice = notice
  data.noticeDetailVisible = true // 打开公告详情弹窗
}

// 获取通知标题（如果有title字段则使用，否则取content前几个字）
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

// 显示通知详情
const showNotificationDetail = (notification) => {
  data.currentNotification = notification
  data.notificationDetailVisible = true
}

// 显示全部通知
const showAllNotifications = () => {
  // 直接显示已加载的通知数据
  data.allNotificationsVisible = true
}

// 从表格中查看通知详情
const showNotificationDetailFromTable = (notification) => {
  data.allNotificationsVisible = false // 关闭全部通知弹窗
  data.currentNotification = notification
  data.notificationDetailVisible = true // 打开通知详情弹窗
}

// 处理查看全部按钮点击事件
const handleViewAll = () => {
  if (data.activeNoticeTab === 'notification') {
    // 当前是通知标签页，调用显示全部通知
    showAllNotifications()
  } else if (data.activeNoticeTab === 'notice') {
    // 当前是公告标签页，调用显示全部公告
    showAllNotices()
  }
}

const loadRankingData = () => {
  request.get('/dashboard/rank').then(res => {
    if (res.code === '200') {
      data.projectRanking = res.data.projectRanking
      data.achievementRanking = res.data.achievementRanking
    }
  })
}

const loadBar1 = () => {
  const chartDom = document.getElementById('bar1')
  if (!chartDom) return // 如果DOM元素不存在，直接返回
  
  echarts.dispose(chartDom)
  request.get('/dashboard/bar1').then(res => {
    if (res.code === '200') {
      let myChart = echarts.init(chartDom)
      
      // 检查是否有数据
      if (!res.data.xAxis || !res.data.yAxis || res.data.xAxis.length === 0 || res.data.yAxis.length === 0) {
        // 无数据时显示空状态
        myChart.setOption({
          title: {
            text: '系统中不同老师的科研项目数量',
            subtext: '统计维度：教师',
            left: 'center'
          },
          graphic: {
            type: 'text',
            left: 'center',
            top: 'middle',
            style: {
              text: '暂无数据',
              fontSize: 14,
              fill: '#999'
            }
          }
        })
      } else {
        // 有数据时正常显示
        bar1Options.xAxis.data = res.data.xAxis
        bar1Options.series[0].data = res.data.yAxis
        myChart.setOption(bar1Options)
      }
      
      // 添加resize监听，确保图表能够响应容器大小变化
      window.addEventListener('resize', () => {
        myChart.resize()
      })
    }
  })
}
const loadBar2 = () => {
  const chartDom = document.getElementById('bar2')
  if (!chartDom) return // 如果DOM元素不存在，直接返回
  
  echarts.dispose(chartDom)
  request.get('/dashboard/bar2').then(res => {
    if (res.code === '200') {
      let myChart = echarts.init(chartDom)
      
      // 检查是否有数据
      if (!res.data.xAxis || !res.data.yAxis || res.data.xAxis.length === 0 || res.data.yAxis.length === 0) {
        // 无数据时显示空状态
        myChart.setOption({
          title: {
            text: '系统中不同老师的科研成果数量',
            subtext: '统计维度：教师',
            left: 'center',
            fontSize: 18
          },
          graphic: {
            type: 'text',
            left: 'center',
            top: 'middle',
            style: {
              text: '暂无数据',
              fontSize: 14,
              fill: '#999'
            }
          }
        })
      } else {
        // 有数据时正常显示
        bar2Options.xAxis.data = res.data.xAxis
        bar2Options.series[0].data = res.data.yAxis
        myChart.setOption(bar2Options)
      }
      
      // 添加resize监听，确保图表能够响应容器大小变化
      window.addEventListener('resize', () => {
        myChart.resize()
      })
    }
  })
}
const loadLine = () => {
  echarts.dispose(document.getElementById('line'))
  request.get('/dashboard/line').then(res => {
    if (res.code === '200') {
      let chartDom = document.getElementById('line')
      let myChart = echarts.init(chartDom)
      lineOptions.xAxis.data = res.data.xAxis
      lineOptions.series[0].data = res.data.yAxis
      myChart.setOption(lineOptions)
    }
  })
}

const loadPie = () => {
  const chartDom = document.getElementById('pie')
  if (!chartDom) return // 如果DOM元素不存在，直接返回
  
  echarts.dispose(chartDom)
  request.get('/dashboard/pie').then(res => {
    if (res.code === '200') {
      let myChart = echarts.init(chartDom)
      
      // 检查是否有数据或所有数据值都为0
      const hasValidData = res.data && res.data.length > 0 && 
        res.data.some(item => item.value && parseFloat(item.value) > 0)
      
      if (!hasValidData) {
        // 无数据或所有值都为0时显示空状态
        myChart.setOption({
          title: {
            text: '科研项目学科类别占比图',
            subtext: '统计维度：学科分类',
            left: 'center'
          },
          graphic: {
            type: 'text',
            left: 'center',
            top: 'middle',
            style: {
              text: '暂无数据',
              fontSize: 14,
              fill: '#999'
            }
          }
        })
      } else {
        // 有数据时正常显示
        pieOptions.series[0].data = res.data
        myChart.setOption(pieOptions)
      }
      
      // 添加resize监听，确保图表能够响应容器大小变化
      window.addEventListener('resize', () => {
        myChart.resize()
      })
    }
  })
}

const loadPie2 = () => {
  const chartDom = document.getElementById('pie2')
  if (!chartDom) return // 如果DOM元素不存在，直接返回
  
  echarts.dispose(chartDom)
  request.get('/dashboard/pie2').then(res => {
    if (res.code === '200') {
      let myChart = echarts.init(chartDom)
      
      // 检查是否有数据或所有数据值都为0
      const hasValidData = res.data && res.data.length > 0 && 
        res.data.some(item => item.value && parseFloat(item.value) > 0)
      
      if (!hasValidData) {
        // 无数据或所有值都为0时显示空状态
        myChart.setOption({
          title: {
            text: '科研项目状态分布图',
            subtext: '统计维度：项目状态',
            left: 'center'
          },
          graphic: {
            type: 'text',
            left: 'center',
            top: 'middle',
            style: {
              text: '暂无数据',
              fontSize: 14,
              fill: '#999'
            }
          }
        })
      } else {
        // 有数据时正常显示
        pieOptions2.series[0].data = res.data
        myChart.setOption(pieOptions2)
      }
      
      // 添加resize监听，确保图表能够响应容器大小变化
      window.addEventListener('resize', () => {
        myChart.resize()
      })
    }
  })
}

// 处理tab切换事件
const handleTabChange = (tabName) => {
  // 使用nextTick确保DOM已更新
  nextTick(() => {
    switch (tabName) {
      case 'subject':
        loadPie() // 科研项目学科类别占比图
        break
      case 'project':
        loadBar1() // 系统中不同老师的科研项目数量
        break
      case 'achievement':
        loadBar2() // 系统中不同类型下的科研成果数量
        break
      case 'status':
        loadPie2() // 项目状态分布图
        break
      case 'projectRank':
        // 项目排行榜不需要加载图表，数据已在data中
        break
      case 'achievementRank':
        // 成果排行榜不需要加载图表，数据已在data中
        break
    }
  })
}

loadBaseData()
loadNotice()
loadNotification()
loadRankingData()
onMounted(() => {
  // 初始加载默认tab的图表
  handleTabChange(data.activeTab)
})

// 饼图数据结构
let pieOptions = {
  title: {
    text: '科研项目学科类别占比图', // 主标题
    subtext: '统计维度：学科分类', // 副标题
    left: 'center',
    top: '2%',
    textStyle: {
      fontSize: 18
    }
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b} : {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: '5%',
    top: '20%',
    itemGap: 15,
    textStyle: {
      fontSize: 12
    }
  },
  series: [
    {
      name: '学科分布', // 鼠标移上去显示内容
      type: 'pie',
      radius: ['25%', '65%'], // 增大半径，充分利用空间
      center: ['50%', '55%'], // 调整位置，为图例留出空间
      itemStyle: {
        borderRadius: 8, // 扇区圆角
        borderColor: '#fff', // 扇区边框颜色
        borderWidth: 2 // 扇区边框宽度，形成间隙效果
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
    }
  ]
}

let bar1Options = {
  title: {
    text: '系统中不同老师的科研项目数量', // 主标题
    subtext: '统计维度：教师', // 副标题
    left: 'center',
    top: '1%',
    textStyle: {
      fontSize: 18
    }
  },
  grid: {
    left: '8%',
    right: '5%',
    bottom: '15%',
    top: '20%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], // 示例数据：统计的维度（横坐标）
    axisLabel: {    //重点在这一块，其余可以忽略
      interval: 0,   //这个一定要有，别忘记了
      rotate: 15,
      textStyle: {
        color: '#666666',
        fontSize: 11
      }
    },
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      textStyle: {
        fontSize: 11
      }
    }
  },
  tooltip: {
    trigger: 'item'
  },
  color: ['#1890ff', '#40a9ff', '#69c0ff', '#91d5ff', '#bae7ff', '#e6f7ff', '#f0f9ff'], 
  series: [
    {
      type: 'bar',
      itemStyle: {
        normal: {
          color: function(params) {
            const colors = ['#1890ff', '#40a9ff', '#69c0ff', '#91d5ff', '#bae7ff', '#e6f7ff', '#f0f9ff'];
            return colors[params.dataIndex % colors.length];
          }
        },
      },
    }
  ]
}

let bar2Options = {
  title: {
    text: '系统中不同类型下的科研成果数量', // 主标题
    subtext: '统计维度：成果类型', // 副标题
    left: 'center',
    top: '1%',
    textStyle: {
      fontSize: 18
    }
  },
  grid: {
    left: '8%',
    right: '5%',
    bottom: '15%',
    top: '20%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], // 示例数据：统计的维度（横坐标）
    axisLabel: {
      textStyle: {
        fontSize: 11
      }
    }
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      textStyle: {
        fontSize: 11
      }
    }
  },
  tooltip: {
    trigger: 'item'
  },
  color: ['#52c41a', '#73d13d', '#95de64', '#b7eb8f', '#d9f7be', '#f6ffed'], 
  series: [
    {
      type: 'bar',
      itemStyle: {
        normal: {
          color: function(params) {
            // 绿色系渐变色数组
            const colors = ['#52c41a', '#73d13d', '#95de64', '#b7eb8f', '#d9f7be', '#f6ffed'];
            return colors[params.dataIndex % colors.length];
          }
        },
      },
    }
  ]
}

let lineOptions = {
  title: {
    text: '项目完成情况分布', // 主标题
    subtext: '统计维度：项目', // 副标题
    left: 'center'
  },
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] // 示例数据：统计的维度（横坐标）
  },
  yAxis: {
    type: 'value'
  },
  tooltip: {
    trigger: 'item'
  },
  color: ['#fa8c16'], // 橙色主色调
  series: [
    {
      type: 'line',
      smooth: true,
      lineStyle: {
        color: '#fa8c16', // 线条颜色
        width: 3
      },
      itemStyle: {
        color: '#fa8c16', // 数据点颜色
        borderColor: '#fff',
        borderWidth: 2
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0, color: 'rgba(250, 140, 22, 0.3)' // 渐变起始颜色
          }, {
            offset: 1, color: 'rgba(250, 140, 22, 0.05)' // 渐变结束颜色
          }]
        }
      }
    }
  ]
}

let pieOptions2 = {
  title: {
    text: '项目状态分布图',
    subtext: '统计维度：项目状态',
    left: 'center',
    top: '2%',
    textStyle: {
      fontSize: 18
    }
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b} : {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: '5%',
    top: '20%',
    itemGap: 15,
    textStyle: {
      fontSize: 12
    }
  },
  series: [
    {
      name: '项目状态',
      type: 'pie',
      radius: ['25%', '65%'], // 增大半径，充分利用空间
      center: ['50%', '55%'], // 调整位置，为图例留出空间
      data: [
        { value: 1048, name: '在研' },
        { value: 735, name: '结项' },
        { value: 580, name: '未开始' }
      ],
      itemStyle: {
        borderRadius: 8, // 扇区圆角
        borderColor: '#fff', // 扇区边框颜色
        borderWidth: 2 // 扇区边框宽度，形成间隙效果
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
}

// 附件相关方法
const getFileName = (filePath) => {
  if (!filePath) return ''
  return filePath.split('/').pop() || filePath.split('\\').pop() || filePath
}

const openNoticeLink = (url) => {
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

// 格式化日期，只显示年月日
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
</script>

<style scoped>
/* 附件显示样式 */
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

:deep(.el-tabs__header) {
  margin: 5px !important;
}
</style>