<template>
  <div class="manager-container">
    <div class="manager-header">
      <div class="manager-header-left">
        <img src="@/assets/imgs/logo.png" alt="">
        <div class="title">科研管理系统</div>
      </div>
      <div class="manager-header-center">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/manager/home' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>{{ router.currentRoute.value.meta.name }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="manager-header-right">
        <el-dropdown style="cursor: pointer">
          <div style="padding-right: 20px; display: flex; align-items: center">
            <img style="width: 40px; height: 40px; border-radius: 50%;" :src="data.user.avatar" alt="">
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
    <!-- 下面部分开始 -->
    <div style="display: flex">
      <div class="manager-main-left">
        <el-menu :default-active="router.currentRoute.value.path" :default-openeds="['1', '2']" router>
          <el-menu-item index="/manager/home">
            <el-icon>
              <HomeFilled />
            </el-icon>
            <span>系统首页</span>
          </el-menu-item>
          <el-menu-item index="/manager/dashboard" v-if="data.user.role === 'ADMIN' || data.user.role === 'KEY_LABORATORY'">
            <el-icon>
              <Odometer />
            </el-icon>
            <span>数据统计</span>
          </el-menu-item>
          <el-sub-menu index="1" v-if="data.laboratoryLevel !== 1">
            <template #title>
              <el-icon>
                <Menu />
              </el-icon>
              <span>信息管理</span>
            </template>
            <el-menu-item index="/manager/labApply" v-if="data.user.role !== 'ADMIN' && data.laboratoryLevel !== 2">重点实验室申请</el-menu-item>
            <!-- 先测试 -->
            <el-menu-item index="/manager/labSelect" v-if="data.user.role === 'ADMIN'">重点实验室审核</el-menu-item>

            <!-- 泪飙 -->
            <el-menu-item index="/manager/project" v-if="data.user.role !== 'NORMAL_LABORATORY'">科研项目管理</el-menu-item>
            <el-menu-item index="/manager/process" v-if="data.user.role !== 'NORMAL_LABORATORY'">科研过程管理</el-menu-item>
            <el-menu-item index="/manager/type" v-if="data.user.role === 'ADMIN'">成果类型管理</el-menu-item>
            <el-menu-item index="/manager/achievement"
              v-if="data.user.role !== 'NORMAL_LABORATORY'">科研成果管理</el-menu-item>
            <el-menu-item index="/manager/teacherFeedback"
              v-if="data.user.role === 'KEY_LABORATORY'">教师反馈提交</el-menu-item>
            <!--<el-menu-item index="/manager/feedback" v-if="data.user.role === 'ADMIN'">教师反馈回复</el-menu-item>-->
            <!-- 先修改 -->
            <!-- <el-menu-item index="/manager/activity" v-if="data.user.role === 'ADMIN'">学术活动管理</el-menu-item>
            <el-menu-item index="/manager/teacherActivity"
              v-if="data.user.role === 'KEY_LABORATORY'">学术活动报名</el-menu-item>
            <el-menu-item index="/manager/apply" v-if="data.user.role === 'KEY_LABORATORY'">我的活动申请</el-menu-item> -->


            <!-- <el-menu-item index="/manager/apply" v-if="data.user.role === 'ADMIN'">活动申请审核</el-menu-item> -->
            <!--<el-menu-item index="/manager/log" v-if="data.user.role === 'ADMIN'">操作日志管理</el-menu-item>-->
            <el-menu-item index="/manager/notice" v-if="data.user.role === 'ADMIN'">系统公告</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="2" v-if="data.user.role === 'ADMIN'">
            <template #title>
              <el-icon>
                <Menu />
              </el-icon>
              <span>用户管理</span>
            </template>
            <el-menu-item index="/manager/admin">管理员信息</el-menu-item>
            <el-menu-item index="/manager/teacher">教师信息</el-menu-item>
            <el-menu-item index="/manager/laboratory">实验室信息</el-menu-item>
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
      <div class="manager-main-right">
        <RouterView @updateUser="updateUser" />
      </div>
    </div>
    <!-- 下面部分结束 -->


  </div>
</template>

<script setup>
import { reactive, onMounted } from "vue";
import router from "@/router/index.js";
import { ElMessage } from "element-plus";
import request from "@/utils/request.js";

const data = reactive({
  user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
  laboratoryLevel: null
})

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