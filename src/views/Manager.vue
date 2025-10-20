<template>
  <div class="manager-container">
    <!-- 整体布局：侧边栏 + 右侧内容区 -->
    <div class="layout-wrapper">
      <!-- 侧边栏：占满屏幕高度 -->
      <div class="manager-main-left" :class="{ 'collapsed': isCollapse }">
        <el-menu 
          :default-active="router.currentRoute.value.path" 
          :collapse="isCollapse"
          :default-openeds="['1','2']"
          router>
          <!-- 菜单头部区域 -->
          <div class="menu-header">
            <img src="@/assets/imgs/logo.png" alt="">
            <div class="title" v-show="!isCollapse">科研管理系统</div>
          </div>
          <el-menu-item index="/manager/dashboard" v-if="data.user.role === 'ADMIN' || data.user.role === 'KEY_LABORATORY'">
            <el-icon>
              <Odometer />
            </el-icon>
            <span>数据统计</span>
          </el-menu-item>
          <el-menu-item index="/manager/home">
            <el-icon>
              <HomeFilled />
            </el-icon>
            <span>系统公告</span>
          </el-menu-item>
          <el-sub-menu index="1" v-if="data.user.role !== 'TEACHER'">
            <template #title>
              <el-icon>
                <Menu />
              </el-icon>
              <span>信息管理</span>
            </template>
            <el-menu-item index="/manager/labApply" v-if="data.user.role !== 'ADMIN' && data.user.role === 'NORMAL_LABORATORY'">重点实验室申请</el-menu-item>
            <!-- 先测试 -->
            <el-menu-item index="/manager/labSelect" v-if="data.user.role === 'ADMIN'">重点实验室审核</el-menu-item>

            <!-- 泪飙 -->
            <el-menu-item index="/manager/project" v-if="data.user.role !== 'NORMAL_LABORATORY'">科研项目管理</el-menu-item>
            <el-menu-item index="/manager/process" v-if="data.user.role !== 'NORMAL_LABORATORY'">科研过程管理</el-menu-item>
            <el-menu-item index="/manager/type" v-if="data.user.role === 'ADMIN'">成果类型管理</el-menu-item>
            <el-menu-item index="/manager/achievement"
              v-if="data.user.role !== 'NORMAL_LABORATORY'">科研成果管理</el-menu-item>
            <!--<el-menu-item index="/manager/teacherFeedback"
              v-if="data.laboratoryLevel === 2">教师反馈提交</el-menu-item>-->
            <!--<el-menu-item index="/manager/feedback" v-if="data.user.role === 'ADMIN'">教师反馈回复</el-menu-item>-->
            <!-- 先修改 -->
            <!-- <el-menu-item index="/manager/activity" v-if="data.user.role === 'ADMIN'">学术活动管理</el-menu-item>
            <el-menu-item index="/manager/teacherActivity"
              v-if="data.user.role === 'KEY_LABORATORY'">学术活动报名</el-menu-item>
            <el-menu-item index="/manager/apply" v-if="data.user.role === 'KEY_LABORATORY'">我的活动申请</el-menu-item> -->


            <!-- <el-menu-item index="/manager/apply" v-if="data.user.role === 'ADMIN'">活动申请审核</el-menu-item> -->
            <!--<el-menu-item index="/manager/log" v-if="data.user.role === 'ADMIN'">操作日志管理</el-menu-item>-->
            <el-menu-item index="/manager/report">报告信息管理</el-menu-item>
            <el-menu-item index="/manager/notice" v-if="data.user.role === 'ADMIN'">系统公告管理</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="1" v-else>
            <template #title>
              <el-icon>
                <Menu />
              </el-icon>
              <span>信息管理</span>
            </template>
            <!-- 泪飙 -->
            <el-menu-item index="/manager/project" v-if="data.laboratoryLevel === 2">科研项目管理</el-menu-item>
            <el-menu-item index="/manager/process" v-if="data.laboratoryLevel === 2">科研过程管理</el-menu-item>
            <el-menu-item index="/manager/achievement" v-if="data.laboratoryLevel === 2">科研成果管理</el-menu-item>
            <el-menu-item index="/manager/report">报告信息管理</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="2" v-if="data.user.role === 'ADMIN'">
            <template #title>
              <el-icon>
                <Menu />
              </el-icon>
              <span>用户管理</span>
            </template>
            <el-menu-item index="/manager/teacher">教师信息</el-menu-item>
            <el-menu-item index="/manager/laboratory">实验室信息</el-menu-item>
            <el-menu-item index="/manager/admin">管理员信息</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="2" v-if="data.user.role === 'NORMAL_LABORATORY' || data.user.role === 'KEY_LABORATORY' ">
            <template #title>
              <el-icon>
                <Menu />
              </el-icon>
              <span>用户管理</span>
            </template>
            <el-menu-item index="/manager/teacher">教师信息</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </div>
      <!-- 右侧内容区 -->
      <div class="manager-main-right" :class="{ 'sidebar-collapsed': isCollapse }">
        <!-- 头部区域 -->
        <div class="manager-header" :class="{ 'collapsed': isCollapse }">
          <div class="manager-header-left" @click="isCollapse = !isCollapse">
            <div v-if="isCollapse"><el-icon><Fold /></el-icon></div>
            <div v-else><el-icon><Expand /></el-icon></div>
          </div>
          <div class="manager-header-center">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="data.user.role === 'ADMIN' || data.user.role === 'KEY_LABORATORY' ? '/manager/dashboard' : '/manager/home'">首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ router.currentRoute.value.meta.name }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="manager-header-right">
            <el-dropdown style="cursor: pointer">
              <div style="padding-right: 20px; display: flex; align-items: center">
                <img style="width: 30px; height: 30px; border-radius: 50%;" :src="data.user.avatar || '/avatar.png'" alt="">
                <span style="margin-left: 5px">{{ data.user.name }}</span><el-icon color="#fff"><arrow-down /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="router.push('/manager/person')">个人资料</el-dropdown-item>
                  <el-dropdown-item @click="router.push('/manager/password')">修改密码</el-dropdown-item>
                  <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        <!-- 主要内容区域 -->
        <div class="content-area">
          <RouterView @updateUser="updateUser" />
        </div>
      </div>
    </div>


  </div>
</template>

<script setup>
import { reactive, onMounted, ref } from "vue";
import router from "@/router/index.js";
import { ElMessage } from "@/utils/element-plus";
import request from "@/utils/request.js";
// 按需引入 Element Plus 图标
import { Odometer, HomeFilled, Menu, Fold, Expand, ArrowDown } from "@element-plus/icons-vue";

const data = reactive({
  user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
  laboratoryLevel: null
})

// 侧边栏折叠状态，初始为展开
const isCollapse = ref(false)

const logout = () => {
  localStorage.removeItem('xm-user')
  router.push('/login')
}


const getLaboratoryLevel = () => {
  // 检查用户是否有实验室ID
  if (!data.user.laboratoryId) {
    return
  }
  
  request.get('/teacher/selectLaboratoryById/' + data.user.laboratoryId).then(res => {
    if (res.code === '200') {
      data.laboratoryLevel = res.data.type
    } else {
      ElMessage.error(res.msg)
    }
  }).catch(error => {
    console.error('获取实验室级别失败:', error)
    ElMessage.error('获取实验室信息失败')
  })
}

const updateUser = () => {
  data.user = JSON.parse(localStorage.getItem('xm-user') || '{}')
}

onMounted(() => {
  if (data.user.id) {
    getLaboratoryLevel()
  }
})

if (!data.user.id) {
  logout()
  ElMessage.error('请登录！')
}
</script>

<style scoped>
@import "@/assets/css/manager.css";
</style>