<template>
  <div>
    <div style="display: flex; margin-bottom: 10px">
      <!-- 左侧：系统公告 -->
      <div class="card" style="width: 50%; margin-right: 5px; height: 250px; padding: 20px; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="font-weight: bold; font-size: 18px; color: #333">系统公告</div>
          <el-button 
            type="primary" 
            size="small" 
            text
            bg
            @click="showAllNotices"
          >
            查看全部
          </el-button>
        </div>
        <div style="max-height: 180px; overflow-y: hidden">
          <div 
            v-for="(item, index) in data.noticeData.slice(0, 4)" 
            :key="index"
            @click="showNoticeDetail(item)"
            style="
              padding: 8px 12px; 
              margin-bottom: 8px;
              border-left: 3px solid #409eff; 
              background: #f5f7fa; 
              cursor: pointer;
              border-radius: 4px;
              transition: all 0.3s;
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
              <el-text style="font-size: 14px; color: #333; font-weight: 500" line-clamp="1">
                {{ getNoticeTitle(item) }}
              </el-text>
            </el-tooltip>
          </div>
          <div v-if="data.noticeData.length === 0" style="text-align: center; color: #999; padding: 20px">
            暂无公告
          </div>
        </div>
      </div>
      
      <!-- 右侧：统计数据 -->
      <div style="width: 50%; margin-left: 5px; height: 250px; box-sizing: border-box;">
        <!-- 第一行：科研项目数、科研成果总数 -->
        <div style="display: flex; margin-bottom: 10px">
          <div style="flex: 1; margin-right: 5px; display: flex; height: 120px; align-items: center" class="card">
            <div style="flex: 1; text-align: center">
              <div style="
                width: 60px; 
                height: 60px; 
                border-radius: 50%; 
                background: linear-gradient(135deg, #e3f2fd, #bbdefb);
                display: flex; 
                align-items: center; 
                justify-content: center;
                margin: 0 auto;
                box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
              ">
                <el-icon size="26" color="#1976d2">
                  <Platform />
                </el-icon>
              </div>
            </div>
            <div style="flex: 1">
              <div style="font-size: 20px">科研项目数</div>
              <div style="font-size: 20px; margin-top: 10px; font-weight: bold">{{ data.baseData.project }}</div>
            </div>
          </div>
          <div style="flex: 1; margin-left: 5px; display: flex; height: 120px; align-items: center" class="card">
            <div style="flex: 1; text-align: center">
              <div style="
                width: 60px; 
                height: 60px; 
                border-radius: 50%; 
                background: linear-gradient(135deg, #e8f5e8, #c8e6c9);
                display: flex; 
                align-items: center; 
                justify-content: center;
                margin: 0 auto;
                box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
              ">
                <el-icon size="26" color="#388e3c">
                  <HelpFilled />
                </el-icon>
              </div>
            </div>
            <div style="flex: 1">
              <div style="font-size: 20px">科研成果数</div>
              <div style="font-size: 20px; margin-top: 10px; font-weight: bold">{{ data.baseData.achievement }}</div>
            </div>
          </div>
        </div>
        
        <!-- 第二行：反馈总数、教师总数 -->
        <div style="display: flex">
          <div style="flex: 1; margin-right: 5px; display: flex; height: 120px; align-items: center" class="card">
            <div style="flex: 1; text-align: center">
              <div style="
                width: 60px; 
                height: 60px; 
                border-radius: 50%; 
                background: linear-gradient(135deg, #fff3e0, #ffcc80);
                display: flex; 
                align-items: center; 
                justify-content: center;
                margin: 0 auto;
                box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
              ">
                <el-icon size="26" color="#f57c00">
                  <Comment />
                </el-icon>
              </div>
            </div>
            <div style="flex: 1">
              <div style="font-size: 20px">反馈总数</div>
              <div style="font-size: 20px; margin-top: 10px; font-weight: bold">{{ data.baseData.feedback }}</div>
            </div>
          </div>
          <div style="flex: 1; margin-left: 5px; display: flex; height: 120px; align-items: center" class="card">
            <div style="flex: 1; text-align: center">
              <div style="
                width: 60px; 
                height: 60px; 
                border-radius: 50%; 
                background: linear-gradient(135deg, #f3e5f5, #ce93d8);
                display: flex; 
                align-items: center; 
                justify-content: center;
                margin: 0 auto;
                box-shadow: 0 4px 12px rgba(156, 39, 176, 0.3);
              ">
                <el-icon size="26" color="#7b1fa2">
                  <Avatar />
                </el-icon>
              </div>
            </div>
            <div style="flex: 1">
              <div style="font-size: 20px">教师总数</div>
              <div style="font-size: 20px; margin-top: 10px; font-weight: bold">{{ data.baseData.teacher }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div style="margin-top: 10px; display: flex">
      <div id="pie" style="flex: 1; margin-right: 5px; height: 400px" class="card"></div>
      <div id="bar1" style="flex: 1; margin-left: 5px; height: 400px" class="card"></div>
    </div>
    <div style="margin-top: 10px; display: flex">
      <div id="bar2" style="flex: 1; margin-right: 5px; height: 400px" class="card"></div>
      <div id="line" style="flex: 1; margin-left: 5px; height: 400px" class="card"></div>
    </div>
    
    <!-- 第五行：排行榜 -->
    <div style="margin-top: 10px; display: flex">
      <!-- 左侧排行榜：科研项目Top5 -->
      <div class="card" style="flex: 1; margin-right: 5px; height: 400px; padding: 20px; box-sizing: border-box;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-weight: bold; font-size: 18px; color: #333;">科研项目Top5</div>
          <div style="font-size: 12px; color: #666; margin-top: 5px;">
            <span v-if="data.user.role === 'ADMIN'">统计维度：实验室</span>
            <span v-else-if="data.user.role === 'KEY_LABORATORY'">统计维度：教师</span>
          </div>
        </div>
        <div>
          <!-- 管理员角色：显示实验室排行 -->
          <div v-if="data.user.role === 'ADMIN'" 
               v-for="(item, index) in data.projectRanking" 
               :key="'project-lab-' + index"
               style="
                 display: flex; 
                 align-items: center; 
                 justify-content: space-between;
                 padding: 12px 16px; 
                 margin-bottom: 8px;
                 border-radius: 8px;
               ">
            <div style="display: flex; align-items: center;">
              <div style="
                width: 30px; 
                height: 30px; 
                border-radius: 50%; 
                background: linear-gradient(45deg, #409eff, #67c23a);
                color: white; 
                display: flex; 
                align-items: center; 
                justify-content: center;
                font-weight: bold;
                margin-right: 30px;
                margin-left: 30px;
              ">
                {{ index + 1 }}
              </div>
              <div style="font-size: 16px; font-weight: 500; color: #333;">{{ item.name }}</div>
            </div>
            <div style="font-size: 18px; font-weight: bold; color: #409eff;">{{ item.count }}</div>
          </div>
          
          <!-- 重点实验室角色：显示教师排行 -->
          <div v-else-if="data.user.role === 'KEY_LABORATORY'" 
               v-for="(item, index) in data.projectRanking" 
               :key="'project-teacher-' + index"
               style="
                 display: flex; 
                 align-items: center; 
                 justify-content: space-between;
                 padding: 12px 16px; 
                 margin-bottom: 8px;
                 border-radius: 8px;
               ">
            <div style="display: flex; align-items: center;">
              <div style="
                width: 30px; 
                height: 30px; 
                border-radius: 50%; 
                background: linear-gradient(45deg, #409eff, #67c23a);
                color: white; 
                display: flex; 
                align-items: center; 
                justify-content: center;
                font-weight: bold;
                margin-right: 30px;
                margin-left: 30px;
              ">
                {{ index + 1 }}
              </div>
              <div style="font-size: 16px; font-weight: 500; color: #333;">{{ item.name }}</div>
            </div>
            <div style="font-size: 18px; font-weight: bold; color: #409eff; margin-right: 30px;">{{ item.count }}</div>
          </div>
        </div>
      </div>
      
      <!-- 右侧排行榜：科研成果Top5 -->
      <div class="card" style="flex: 1; margin-left: 5px; height: 400px; padding: 20px; box-sizing: border-box;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-weight: bold; font-size: 18px; color: #333;">科研成果Top5</div>
          <div style="font-size: 12px; color: #666; margin-top: 5px;">
            <span v-if="data.user.role === 'ADMIN'">统计维度：实验室</span>
            <span v-else-if="data.user.role === 'KEY_LABORATORY'">统计维度：教师</span>
          </div>
        </div>
        <div>
          <!-- 管理员：显示实验室排行 -->
          <div v-if="data.user.role === 'ADMIN'" 
               v-for="(item, index) in data.achievementRanking" 
               :key="'achievement-lab-' + index"
               style="
                 display: flex; 
                 align-items: center; 
                 justify-content: space-between;
                 padding: 12px 16px; 
                 margin-bottom: 8px;
                 border-radius: 8px;
               ">
            <div style="display: flex; align-items: center;">
              <div style="
                width: 30px; 
                height: 30px; 
                border-radius: 50%; 
                background: linear-gradient(45deg, #e6a23c, #f56c6c);
                color: white; 
                display: flex; 
                align-items: center; 
                justify-content: center;
                font-weight: bold;
                margin-right: 30px;
                margin-left: 30px;
              ">
                {{ index + 1 }}
              </div>
              <div style="font-size: 16px; font-weight: 500; color: #333;">{{ item.name }}</div>
            </div>
            <div style="font-size: 18px; font-weight: bold; color: #e6a23c; margin-right: 30px;">{{ item.count }}</div>
          </div>
          
          <!-- 重点实验室角色：显示教师排行 -->
          <div v-else-if="data.user.role === 'KEY_LABORATORY'" 
               v-for="(item, index) in data.achievementRanking" 
               :key="'achievement-teacher-' + index"
               style="
                 display: flex; 
                 align-items: center; 
                 justify-content: space-between;
                 padding: 12px 16px; 
                 margin-bottom: 8px;
                 border-radius: 8px;
               ">
            <div style="display: flex; align-items: center;">
              <div style="
                width: 30px; 
                height: 30px; 
                border-radius: 50%; 
                background: linear-gradient(45deg, #e6a23c, #f56c6c);
                color: white; 
                display: flex; 
                align-items: center; 
                justify-content: center;
                font-weight: bold;
                margin-right: 30px;
                margin-left: 30px;
              ">
                {{ index + 1 }}
              </div>
              <div style="font-size: 16px; font-weight: 500; color: #333;">{{ item.name }}</div>
            </div>
            <div style="font-size: 18px; font-weight: bold; color: #e6a23c; margin-right: 30px;">{{ item.count }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 公告详情弹窗 -->
    <el-dialog 
      v-model="data.noticeDetailVisible" 
      width="600px"
      :before-close="() => data.noticeDetailVisible = false"
    >
      <div style="padding: 20px">
        <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #333">
          {{ getNoticeTitle(data.currentNotice) }}
        </div>
        <div style="font-size: 12px; color: #999; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px">
          发布时间：{{ data.currentNotice.time }}
        </div>
        <div style="line-height: 1.8; color: #666; text-align: justify">
          {{ data.currentNotice.content }}
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
      title="公告" 
      width="800px"
      :before-close="() => data.allNoticesVisible = false"
    >
      <el-table 
         :data="data.noticeData" 
         style="width: 100%"
         :show-header="false"
       >
         <el-table-column 
           prop="title" 
           min-width="300"
         >
           <template #default="scope">
             <el-button 
               type="text" 
               style="color: #333; font-weight: 500;"
               @click="showNoticeDetailFromTable(scope.row)"
             >
               {{ getNoticeTitle(scope.row) }}
             </el-button>
           </template>
         </el-table-column>
         <el-table-column 
           prop="time" 
           width="180"
           align="center"
         >
         </el-table-column>
       </el-table>
      <div v-if="data.noticeData.length === 0" style="text-align: center; color: #999; padding: 40px">
        暂无公告
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="data.allNoticesVisible = false" size="small">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>

import {reactive, onMounted} from "vue";
import request from "@/utils/request.js";
import {ElMessage} from "element-plus";
import * as echarts from "echarts";
// 导入图标组件
import { Platform, HelpFilled, Comment, Avatar } from '@element-plus/icons-vue';

const data = reactive({
  user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
  baseData: {},
  noticeData: [], // 公告数据
  hoveredNotice: -1, // 鼠标悬停的公告索引
  noticeDetailVisible: false, // 公告详情弹窗显示状态
  currentNotice: {}, // 当前查看的公告详情
  allNoticesVisible: false, // 查看全部公告弹窗显示状态
  // 排行榜模拟数据 - 管理员角色（实验室维度）
  projectRanking: [
    { name: '人工智能实验室', count: 45 },
    { name: '大数据分析实验室', count: 38 },
    { name: '网络安全实验室', count: 32 },
    { name: '软件工程实验室', count: 28 },
    { name: '物联网实验室', count: 25 }
  ],
  achievementRanking: [
    { name: '人工智能实验室', count: 28 },
    { name: '大数据分析实验室', count: 24 },
    { name: '网络安全实验室', count: 20 },
    { name: '软件工程实验室', count: 18 },
    { name: '物联网实验室', count: 15 }
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
      data.noticeData = res.data
    } else {
      ElMessage.error(res.msg)
    }
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

const loadRankingData = () => {
  request.get('/dashboard/rank').then(res => {
    if (res.code === '200') {
      data.projectRanking = res.data.projectRanking
      data.achievementRanking = res.data.achievementRanking
    }
  })
}

const loadBar1 = () => {
  echarts.dispose(document.getElementById('bar1'))
  request.get('/dashboard/bar1').then(res => {
    if (res.code === '200') {
      let chartDom = document.getElementById('bar1')
      let myChart = echarts.init(chartDom)
      bar1Options.xAxis.data = res.data.xAxis
      bar1Options.series[0].data = res.data.yAxis
      myChart.setOption(bar1Options)
    }
  })
}
const loadBar2 = () => {
  echarts.dispose(document.getElementById('bar2'))
  request.get('/dashboard/bar2').then(res => {
    if (res.code === '200') {
      let chartDom = document.getElementById('bar2')
      let myChart = echarts.init(chartDom)
      bar2Options.xAxis.data = res.data.xAxis
      bar2Options.series[0].data = res.data.yAxis
      myChart.setOption(bar2Options)
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
  echarts.dispose(document.getElementById('pie'))
  request.get('/dashboard/pie').then(res => {
    if (res.code === '200') {
      let chartDom = document.getElementById('pie')
      let myChart = echarts.init(chartDom)
      pieOptions.series[0].data = res.data
      myChart.setOption(pieOptions)
    }
  })
}

loadBaseData()
loadNotice()
loadRankingData()
onMounted(() => {
  loadPie()
  loadBar1()
  loadBar2()
  loadLine()
})

// 饼图数据结构
let pieOptions = {
  title: {
    text: '科研项目学科类别占比图', // 主标题
    subtext: '统计维度：学科分类', // 副标题
    left: 'center'
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b} : {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [
    {
      name: '学科分布', // 鼠标移上去显示内容
      type: 'pie',
      radius: ['20%', '50%'], // 设置内外半径，形成环形图效果
      center: ['50%', '60%'],
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
    left: 'center'
  },
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], // 示例数据：统计的维度（横坐标）
    axisLabel: {    //重点在这一块，其余可以忽略
      interval: 0,   //这个一定要有，别忘记了
      rotate: 15,
      textStyle: {
        color: '#666666',
        fontSize: 10
      }
    },
  },
  yAxis: {
    type: 'value'
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
    subtext: '统计维度：成果分类', // 副标题
    left: 'center'
  },
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], // 示例数据：统计的维度（横坐标）
  },
  yAxis: {
    type: 'value'
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
    text: '最近七天的教师反馈数量', // 主标题
    subtext: '统计维度：教师', // 副标题
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
</script>