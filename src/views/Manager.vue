<template>
  <div class="manager-container">
    <!-- 整体布局：侧边栏 + 右侧内容区 -->
    <div class="layout-wrapper">
      <!-- 侧边栏：占满屏幕高度 -->
      <div class="manager-main-left" :class="{ 'collapsed': isCollapse }">
        <el-menu 
          :default-active="$route.path" 
          :collapse="isCollapse"
          :default-openeds="[]"
          unique-opened
          router>
          <!-- 菜单头部区域 -->
          <div class="menu-header">
            <img src="@/assets/imgs/logo.png" alt="">
            <div class="title" v-show="!isCollapse">科研管理系统</div>
          </div>
          <el-menu-item index="/manager/dashboard" v-if="data.user.role === 'SUPER_ADMIN' || data.user.role === 'KEY_LABORATORY' || data.user.role === 'SCHOOL_ADMIN'">
            <el-icon>
              <DataAnalysis />
            </el-icon>
            <span>数据统计</span>
          </el-menu-item>
          <!--<el-menu-item index="/manager/home">
            <el-icon>
              <HomeFilled />
            </el-icon>
            <span>系统公告</span>
          </el-menu-item>-->
          <el-menu-item index="/manager/myNotification" v-if="data.user.role === 'TEACHER' || data.user.role === 'NORMAL_LABORATORY'">
            <el-icon>
              <Bell />
            </el-icon>
            <span>消息</span>
          </el-menu-item>
          <el-sub-menu index="4">
            <template #title>
              <el-icon>
                <OfficeBuilding />
              </el-icon>
              <span>机构信息</span>
            </template>
            <el-menu-item index="/manager/institutionBasic">基本信息</el-menu-item>
            <el-menu-item index="/manager/institutionSettings">基础设施</el-menu-item>
            <el-menu-item index="/manager/institutionOrganization">组织建设</el-menu-item>
            <el-menu-item index="/manager/institutionDigital">信息化建设</el-menu-item>
            <el-menu-item index="/manager/institutionResearchDepartment">科研管理部门</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="3" v-if="data.user.role === 'SUPER_ADMIN' || data.user.role === 'SCHOOL_ADMIN'">
            <template #title>
              <el-icon>
                <User />
              </el-icon>
              <span>成员管理</span>
            </template>
            <el-menu-item index="/manager/teacher">聘任人员</el-menu-item>
            <el-menu-item index="/manager/laboratory">组织信息</el-menu-item>
            <el-menu-item index="/manager/school" v-if="data.user.role === 'SUPER_ADMIN'">学校信息</el-menu-item>
            <el-menu-item index="/manager/schoolAdmin" v-if="data.user.role === 'SUPER_ADMIN'">学校管理员信息</el-menu-item>
            <el-menu-item index="/manager/admin" v-if="data.user.role === 'SUPER_ADMIN'">超级管理员信息</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="3" v-if="data.user.role === 'NORMAL_LABORATORY' || data.user.role === 'KEY_LABORATORY' ">
            <template #title>
              <el-icon>
                <User />
              </el-icon>
              <span>成员管理</span>
            </template>
            <el-menu-item index="/manager/teacher">聘任人员</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="5">
            <template #title>
              <el-icon>
                <Memo />
              </el-icon>
              <span>科研课题</span>
            </template>
            <el-menu-item index="/manager/verticalTopic">纵向课题</el-menu-item>
            <el-menu-item index="/manager/horizontalTopic">横向课题</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="2" v-if="data.user.role !== 'TEACHER'">
            <template #title>
              <el-icon>
                <Memo />
              </el-icon>
              <span>信息管理</span>
            </template>
            <el-menu-item index="/manager/labApply" v-if="data.user.role === 'NORMAL_LABORATORY' && data.laboratoryHierarchy === '实验室'">任务书</el-menu-item>
            <el-menu-item index="/manager/researchBaseApply" v-if="data.user.role === 'NORMAL_LABORATORY' && data.laboratoryHierarchy === '基地'">重点研究基地申请</el-menu-item>
            <el-menu-item index="/manager/innovationTeamApply" v-if="data.user.role === 'NORMAL_LABORATORY' && data.laboratoryHierarchy === '团队'">优秀创新团队申请</el-menu-item>
            <el-menu-item index="/manager/labStageApply" v-if="data.user.role === 'KEY_LABORATORY'">阶段报告</el-menu-item>

            <el-menu-item index="/manager/entityProfile" v-if="data.user.role === 'SUPER_ADMIN' || data.user.role === 'SCHOOL_ADMIN'">学校/组织画像</el-menu-item>
            <el-menu-item index="/manager/labSelect" v-if="data.user.role === 'SUPER_ADMIN' || data.user.role === 'SCHOOL_ADMIN'">重点组织审核</el-menu-item>
            <el-menu-item index="/manager/labStage" v-if="data.user.role === 'SUPER_ADMIN' || data.user.role === 'SCHOOL_ADMIN'">阶段报告</el-menu-item>  <!--管理员端-->
            

            <el-menu-item index="/manager/project">科研项目</el-menu-item>
            <el-menu-item index="/manager/achievement">科研成果</el-menu-item>
            <!--<el-menu-item index="/manager/teacherFeedback"
              v-if="data.laboratoryLevel === 2">教师反馈提交</el-menu-item>-->
            <!--<el-menu-item index="/manager/feedback" v-if="data.user.role === 'SUPER_ADMIN'">教师反馈回复</el-menu-item>-->
            <!-- 先修改 -->
            <!-- <el-menu-item index="/manager/activity" v-if="data.user.role === 'SUPER_ADMIN'">学术活动管理</el-menu-item>
            <el-menu-item index="/manager/teacherActivity"
              v-if="data.user.role === 'KEY_LABORATORY'">学术活动报名</el-menu-item>
            <el-menu-item index="/manager/apply" v-if="data.user.role === 'KEY_LABORATORY'">我的活动申请</el-menu-item> -->


            <!-- <el-menu-item index="/manager/apply" v-if="data.user.role === 'SUPER_ADMIN'">活动申请审核</el-menu-item> -->
            <!--<el-menu-item index="/manager/log" v-if="data.user.role === 'SUPER_ADMIN'">操作日志管理</el-menu-item>-->
            <el-menu-item index="/manager/report">科研报告</el-menu-item>
            <el-menu-item index="/manager/type" v-if="data.user.role === 'SUPER_ADMIN'">成果类型</el-menu-item>
          </el-sub-menu>
          <!--教师的信息管理-->
          <el-sub-menu index="2" v-else>
            <template #title>
              <el-icon>
                <Memo />
              </el-icon>
              <span>信息管理</span>
            </template>
            <!-- 泪飙 -->
            <el-menu-item index="/manager/project" v-if="data.laboratoryLevel === 2">科研项目</el-menu-item>
            <el-menu-item index="/manager/achievement" v-if="data.laboratoryLevel === 2">科研成果</el-menu-item>
            <el-menu-item index="/manager/report">科研报告</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="6">
            <template #title>
              <el-icon>
                <DataAnalysis />
              </el-icon>
              <span>成果管理</span>
            </template>
            <el-menu-item index="/manager/academicAchievement">学术成果</el-menu-item>
            <el-menu-item index="/manager/intellectualProperty">知识产权</el-menu-item>
            <el-menu-item index="/manager/advisoryService">咨政服务</el-menu-item>
            <el-menu-item index="/manager/academicExchange">学术交流</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="7">
            <template #title>
              <el-icon>
                <DataAnalysis />
              </el-icon>
              <span>获奖/荣誉</span>
            </template>
            <el-menu-item index="/manager/talentHonor">人才称号与荣誉</el-menu-item>
            <el-menu-item index="/manager/achievementAward">成果获奖</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="8">
            <template #title>
              <el-icon>
                <DataAnalysis />
              </el-icon>
              <span>机构经费</span>
            </template>
            <el-menu-item index="/manager/labConstructionFund">实验室建设经费</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="9">
            <template #title>
              <el-icon>
                <Memo />
              </el-icon>
              <span>管理工作</span>
            </template>
            <el-menu-item index="/manager/labSummary">实验室总结</el-menu-item>
            <el-menu-item index="/manager/labPlan">实验室规划</el-menu-item>
            <el-menu-item index="/manager/workAchievementBrief">工作/成果简报</el-menu-item>
            <el-menu-item index="/manager/rulesRegulations">规章制度</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="10">
            <template #title>
              <el-icon>
                <Memo />
              </el-icon>
              <span>科研规划</span>
            </template>
            <el-menu-item index="/manager/planningTopicList">课题列表</el-menu-item>
            <el-menu-item index="/manager/planningChangeApply">变更申请</el-menu-item>
          </el-sub-menu>
          <el-menu-item index="/manager/recycleBin">
            <el-icon>
              <Delete />
            </el-icon>
            <span>回收站</span>
          </el-menu-item>
          <el-sub-menu index="1" v-if="data.user.role === 'SUPER_ADMIN'">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item index="/manager/notice" v-if="data.user.role === 'SUPER_ADMIN'">公告管理</el-menu-item>
            <el-menu-item index="/manager/notification" v-if="data.user.role === 'SUPER_ADMIN'">通知管理</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </div>
      <!-- 右侧内容区 -->
      <div class="manager-main-right">
        <!-- 头部区域 -->
        <div class="manager-header" :class="{ 'collapsed': isCollapse }">
          <div class="manager-header-left" @click="isCollapse = !isCollapse">
            <div v-if="isCollapse"><el-icon><Fold /></el-icon></div>
            <div v-else><el-icon><Expand /></el-icon></div>
          </div>
          <div class="manager-header-center">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="data.user.role === 'SUPER_ADMIN' || data.user.role === 'KEY_LABORATORY' ? '/manager/dashboard' : '/manager/myNotification'">首页</el-breadcrumb-item>
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
                  <el-dropdown-item @click="showPersonDialog = true">个人资料</el-dropdown-item>
                  <el-dropdown-item @click="showPasswordDialog = true">修改密码</el-dropdown-item>
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

    <!-- 个人资料对话框 -->
    <PersonDialog v-model="showPersonDialog" @updateUser="updateUser" />
    
    <!-- 修改密码对话框 -->
    <PasswordDialog v-model="showPasswordDialog" />

  </div>
</template>

<script setup>
import { reactive, onMounted, onUnmounted, ref } from "vue";
import router from "@/router/index.js";
import { ElMessage } from "@/utils/element-plus";
import {
  clearLaboratoryLevelCache,
  fetchLaboratoryInfo,
  getCachedLaboratoryHierarchy,
  getCachedLaboratoryLevel,
  getUserLaboratoryId
} from "@/utils/laboratoryLevel.js";
// 关闭标签页/浏览器自动退出注册函数
import { registerAutoLogoutOnClose, ensureLogoutIfClosed } from "@/utils/autoLogout.js";
// 按需引入 Element Plus 图标
import { DataAnalysis, Bell, Menu, Fold, Expand, ArrowDown, Setting, User, Memo, OfficeBuilding, Delete } from "@element-plus/icons-vue";
// 引入个人资料对话框组件
import PersonDialog from "@/views/manager/Person.vue";
// 引入修改密码对话框组件
import PasswordDialog from "@/views/manager/Password.vue";

const currentUser = JSON.parse(localStorage.getItem('xm-user') || '{}')
const currentLaboratoryId = getUserLaboratoryId(currentUser)
const data = reactive({
  user: currentUser,
  laboratoryLevel: getCachedLaboratoryLevel(currentLaboratoryId) ?? currentUser.type ?? null,
  laboratoryHierarchy: getCachedLaboratoryHierarchy(currentLaboratoryId) || currentUser.laboratoryHierarchy || null
})

// 页面加载即检查：若上次关闭时已标记退出且此次为“重新打开”（非刷新），则清理登录态
ensureLogoutIfClosed()

// 侧边栏折叠状态，初始为展开
const isCollapse = ref(false)
// 个人资料对话框显示状态
const showPersonDialog = ref(false)
// 修改密码对话框显示状态
const showPasswordDialog = ref(false)

const logout = () => {
  localStorage.removeItem('xm-user')
  clearLaboratoryLevelCache()
  router.push('/login')
}

// 注册“关闭标签页/浏览器时自动退出”，不影响站内跳转与刷新
// 关键节点：页面挂载时注册，卸载时清理，避免内存泄漏
const cleanupAutoLogout = registerAutoLogoutOnClose(router)
onUnmounted(() => cleanupAutoLogout())


const getLaboratoryLevel = () => {
  const laboratoryId = getUserLaboratoryId(data.user)
  if (!laboratoryId) {
    return
  }

  const cached = getCachedLaboratoryLevel(laboratoryId)
  if (cached !== null) {
    data.laboratoryLevel = cached
  }
  const cachedHierarchy = getCachedLaboratoryHierarchy(laboratoryId)
  if (cachedHierarchy) {
    data.laboratoryHierarchy = cachedHierarchy
  }
  if (cached !== null && cachedHierarchy) {
    return
  }

  fetchLaboratoryInfo(laboratoryId, data.user.token).then(info => {
    if (!info) return
    if (info.type !== null && info.type !== undefined) data.laboratoryLevel = Number(info.type)
    if (info.laboratoryHierarchy) data.laboratoryHierarchy = info.laboratoryHierarchy
  })
}

const updateUser = () => {
  data.user = JSON.parse(localStorage.getItem('xm-user') || '{}')
  const laboratoryId = getUserLaboratoryId(data.user)
  data.laboratoryLevel = getCachedLaboratoryLevel(laboratoryId) ?? data.user.type ?? null
  data.laboratoryHierarchy = getCachedLaboratoryHierarchy(laboratoryId) || data.user.laboratoryHierarchy || null
}

if (!data.user.id) {
  logout()
  ElMessage.error('请登录！')
}

getLaboratoryLevel()

</script>

<style scoped>
@import "@/assets/css/manager.css";
</style>
