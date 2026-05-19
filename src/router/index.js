import { createRouter, createWebHistory } from 'vue-router'
import {
  fetchLaboratoryInfo,
  getCachedLaboratoryInfo,
  getUserLaboratoryId,
  setCachedLaboratoryInfo
} from '@/utils/laboratoryLevel.js'
import { clearLoginState, isTokenExpired } from '@/utils/auth.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: () => {
        let user
        try {
          user = JSON.parse(localStorage.getItem('xm-user') || '{}')
        } catch (_) {
          user = null
        }
        if (!user || !user.id) return '/login'
        if (['SUPER_ADMIN', 'SCHOOL_ADMIN', 'KEY_LABORATORY'].includes(user.role)) return '/manager/dashboard'
        if (['TEACHER', 'NORMAL_LABORATORY'].includes(user.role)) return '/manager/myNotification'
        return '/manager/home'
      }
    },
    {
      path: '/manager',
      component: () => import('@/views/Manager.vue'),
      children: [
        { path: 'home', meta: { name: '系统公告' }, component: () => import('@/views/manager/Home.vue') },
        { path: 'admin', meta: { name: '管理员信息', roles: ['SUPER_ADMIN'] }, component: () => import('@/views/manager/Admin.vue') },
        { path: 'notice', meta: { name: '系统公告', roles: ['SUPER_ADMIN'] }, component: () => import('@/views/manager/Notice.vue') },
        { path: 'person', meta: { name: '个人资料' }, component: () => import('@/views/manager/Person.vue') },
        { path: 'password', meta: { name: '修改密码' }, component: () => import('@/views/manager/Password.vue') },
        { path: 'teacher', meta: { name: '聘任人员', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'NORMAL_LABORATORY', 'KEY_LABORATORY'] }, component: () => import('@/views/manager/Teacher.vue') },
        { path: 'project', meta: { name: '科研项目', roles: ['ADMIN', 'SUPER_ADMIN', 'SCHOOL_ADMIN', 'KEY_LABORATORY', 'NORMAL_LABORATORY', 'TEACHER'], labLevel: 2, labLevelRoles: ['TEACHER'] }, component: () => import('@/views/manager/Project.vue') },
        // 新增实验室申请
        { path: 'labApply', meta: { name: '任务书', roles: ['NORMAL_LABORATORY'], labHierarchy: '实验室' }, component: () => import('@/views/manager/LabApply.vue') },
        // 新增研究基地申请
        { path: 'researchBaseApply', meta: { name: '重点研究基地申请', roles: ['NORMAL_LABORATORY'], labHierarchy: '基地' }, component: () => import('@/views/manager/ResearchBaseApply.vue') },
        { path: 'innovationTeamApply', meta: { name: '优秀创新团队申请', roles: ['NORMAL_LABORATORY'], labHierarchy: '团队' }, component: () => import('@/views/manager/InnovationTeamApply.vue') },
        { path: 'labMember', meta: { name: '组织成员管理', roles: ['SUPER_ADMIN', 'KEY_LABORATORY'] }, component: () => import('@/views/manager/LabMember.vue') },
        { path: 'labSelect', meta: { name: '重点组织审核', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'] }, component: () => import('@/views/manager/LabSelect.vue') },
        { path: 'type', meta: { name: '成果分类', roles: ['SUPER_ADMIN'] }, component: () => import('@/views/manager/Type.vue') },
        { path: 'achievement', meta: { name: '科研成果', roles: ['ADMIN', 'SUPER_ADMIN', 'SCHOOL_ADMIN', 'KEY_LABORATORY', 'NORMAL_LABORATORY', 'TEACHER'], labLevel: 2, labLevelRoles: ['TEACHER'] }, component: () => import('@/views/manager/Achievement.vue') },
        { path: 'processLine', meta: { name: '科研过程线', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'] }, component: () => import('@/views/manager/ProcessLine.vue') },
        { path: 'teacherFeedback', meta: { name: '教师反馈', roles: ['TEACHER'] }, component: () => import('@/views/manager/TeacherFeedback.vue') },
        { path: 'feedback', meta: { name: '教师反馈', roles: ['SUPER_ADMIN'] }, component: () => import('@/views/manager/Feedback.vue') },
        { path: 'activity', meta: { name: '学术活动', roles: ['SUPER_ADMIN'] }, component: () => import('@/views/manager/Activity.vue') },
        { path: 'teacherActivity', meta: { name: '学术活动', roles: ['KEY_LABORATORY'] }, component: () => import('@/views/manager/TeacherActivity.vue') },
        { path: 'apply', meta: { name: '我的申请', roles: ['KEY_LABORATORY', 'SUPER_ADMIN', 'TEACHER'] }, component: () => import('@/views/manager/Apply.vue') },
        { path: 'log', meta: { name: '日志管理', roles: ['SUPER_ADMIN'] }, component: () => import('@/views/manager/Log.vue') },
        { path: 'dashboard', meta: { name: '数据统计', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'KEY_LABORATORY'] }, component: () => import('@/views/manager/Dashboard.vue') },
        { path: 'entityProfile', meta: { name: '学校/组织画像', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'] }, component: () => import('@/views/manager/EntityProfile.vue') },
        { path: 'report', meta: { name: '报告信息' }, component: () => import('@/views/manager/Report.vue') },
        { path: 'notification', meta: { name: '通知管理', roles: ['SUPER_ADMIN'] }, component: () => import('@/views/manager/Notification.vue') },
        { path: 'myNotification', meta: { name: '我的消息', roles: ['TEACHER', 'NORMAL_LABORATORY'] }, component: () => import('@/views/manager/MyNotification.vue') },
        { path: 'institutionBasic', meta: { name: '基本信息' }, component: () => import('@/views/manager/InstitutionBasicInfo.vue') },
        { path: 'institutionSettings', meta: { name: '基础设施' }, component: () => import('@/views/manager/InstitutionInfrastructure.vue') },
        { path: 'institutionOrganization', meta: { name: '组织建设' }, component: () => import('@/views/manager/InstitutionOrganization.vue') },
        { path: 'institutionDigital', meta: { name: '信息化建设' }, component: () => import('@/views/manager/InstitutionDigital.vue') },
        { path: 'institutionResearchDepartment', meta: { name: '科研管理部门' }, component: () => import('@/views/manager/InstitutionResearchDept.vue') },
        { path: 'verticalTopic', meta: { name: '纵向课题' }, component: () => import('@/views/manager/VerticalTopic.vue') },
        { path: 'horizontalTopic', meta: { name: '横向课题' }, component: () => import('@/views/manager/HorizontalTopic.vue') },
        {
          path: 'academicAchievement/:category?',
          meta: {
            name: '学术成果',
            parent: '成果管理',
            categoryNames: {
              journal: '期刊论文',
              conference: '会议论文',
              collection: '文集文章',
              book: '书籍著作',
              report: '研究报告',
              software: '软件研发',
              database: '数据库建设',
              digital: '音像/数字作品',
              other: '其他成果'
            }
          },
          component: () => import('@/views/manager/AcademicAchievement.vue')
        },
        {
          path: 'intellectualProperty/:category?',
          meta: {
            name: '知识产权',
            parent: '成果管理',
            categoryNames: {
              patent: '专利',
              copyright: '著作权'
            }
          },
          component: () => import('@/views/manager/IntellectualProperty.vue')
        },
        {
          path: 'academicExchange/:category?',
          meta: {
            name: '学术交流',
            parent: '成果管理',
            categoryNames: {
              hostedConference: '主办学术会议',
              attendedConference: '参加学术会议',
              internationalActivity: '国际交流活动',
              publication: '主办刊物',
              lecture: '学术讲座'
            }
          },
          component: () => import('@/views/manager/AcademicExchange.vue')
        },
        { path: 'talentHonor', meta: { name: '人才称号与荣誉', parent: '获奖/荣誉' }, component: () => import('@/views/manager/TalentHonor.vue') },
        { path: 'achievementAward', meta: { name: '成果获奖', parent: '获奖/荣誉' }, component: () => import('@/views/manager/AchievementAward.vue') },
        { path: 'labConstructionFund', meta: { name: '实验室建设经费', parent: '机构经费' }, component: () => import('@/views/manager/LabConstructionFund.vue') },
        { path: 'labSummary', meta: { name: '实验室总结', parent: '管理工作' }, component: () => import('@/views/manager/LabSummary.vue') },
        { path: 'labPlan', meta: { name: '实验室规划', parent: '管理工作' }, component: () => import('@/views/manager/LabPlan.vue') },
        { path: 'workAchievementBrief', meta: { name: '成果/工作简报', parent: '管理工作' }, component: () => import('@/views/manager/WorkAchievementBrief.vue') },
        { path: 'rulesRegulations', meta: { name: '规章制度', parent: '管理工作' }, component: () => import('@/views/manager/RulesRegulations.vue') },
        { path: 'planningTopicList', meta: { name: '课题列表', parent: '科研规划' }, component: () => import('@/views/manager/PlanningTopicList.vue') },
        { path: 'planningChangeApply', meta: { name: '变更申请', parent: '科研规划' }, component: () => import('@/views/manager/PlanningChangeApply.vue') },
        {
          path: 'recycleBin/:category?',
          meta: {
            name: '回收站',
            parent: '回收站',
            categoryNames: {
              topic: '课题',
              achievement: '成果'
            }
          },
          component: () => import('@/views/manager/RecycleBin.vue')
        },
        { path: 'labStage', meta: { name: '阶段报告', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'] }, component: () => import('@/views/manager/labStage.vue') },
        { path: 'labStageApply', meta: { name: '阶段报告', roles: ['KEY_LABORATORY'] }, component: () => import('@/views/manager/labStageApply.vue') },
        { path: 'school', meta: { name: '学校信息', roles: ['SUPER_ADMIN'] }, component: () => import('@/views/manager/School.vue') },
        { path: 'schoolAdmin', meta: { name: '学校管理员信息', roles: ['SUPER_ADMIN'] }, component: () => import('@/views/manager/SchoolAdmin.vue') },
      ]
    },
    {
      path: '/front',
      component: () => import('@/views/Front.vue'),
      children: [
        { path: 'home', component: () => import('@/views/front/Home.vue') },
        { path: 'person', component: () => import('@/views/front/Person.vue') }
      ]
    },
    { path: '/login', component: () => import('@/views/Login.vue') },
    { path: '/register', component: () => import('@/views/Register.vue') },
    { path: '/403', component: () => import('@/views/404.vue') },
    { path: '/404', component: () => import('@/views/404.vue') },
    { path: '/:pathMatch(.*)', redirect: '/404' }
  ]
})

// 全局路由守卫：未登录时强制跳转到登录页
router.beforeEach((to, from, next) => {
  // 白名单路由直接放行
  const whiteList = ['/login', '/register', '/404', '/403']
  if (whiteList.includes(to.path)) {
    return next()
  }

  // 读取本地登录态
  let user
  try {
    user = JSON.parse(localStorage.getItem('xm-user') || '{}')
  } catch (_) {
    user = null
  }

  // 未登录：统一跳转到登录页
  if (!user || !user.id) {
    return next('/login')
  }

  if (isTokenExpired(user.token)) {
    clearLoginState()
    return next('/login')
  }

  const allowedRoles = to.meta && Array.isArray(to.meta.roles) ? to.meta.roles : null
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return next({ path: '/403', query: { code: '403' } })
  }

  const laboratoryId = getUserLaboratoryId(user)
  const userLaboratoryInfo = {
    id: laboratoryId,
    type: user.type,
    laboratoryHierarchy: user.laboratoryHierarchy
  }
  if (laboratoryId && (user.type !== undefined || user.laboratoryHierarchy)) {
    setCachedLaboratoryInfo(laboratoryId, userLaboratoryInfo)
  }

  const requiredLabLevel = to.meta && to.meta.labLevel !== undefined ? Number(to.meta.labLevel) : null
  const requiredLabHierarchy = to.meta && to.meta.labHierarchy !== undefined ? String(to.meta.labHierarchy) : null
  const labLevelRoles = to.meta && Array.isArray(to.meta.labLevelRoles) ? to.meta.labLevelRoles : null
  const labHierarchyRoles = to.meta && Array.isArray(to.meta.labHierarchyRoles) ? to.meta.labHierarchyRoles : null
  const shouldCheckLabLevel = requiredLabLevel !== null && (!labLevelRoles || labLevelRoles.includes(user.role))
  const shouldCheckLabHierarchy = requiredLabHierarchy !== null && (!labHierarchyRoles || labHierarchyRoles.includes(user.role))
  if (shouldCheckLabLevel || shouldCheckLabHierarchy) {
    const validateLaboratoryPermission = (info) => {
      if (!info) return false
      if (shouldCheckLabLevel && Number(info.type) !== requiredLabLevel) return false
      if (shouldCheckLabHierarchy && info.laboratoryHierarchy !== requiredLabHierarchy) return false
      return true
    }

    const cached = getCachedLaboratoryInfo(laboratoryId)
    const hasRequiredCachedInfo = cached
      && (!shouldCheckLabLevel || cached.type !== null && cached.type !== undefined)
      && (!shouldCheckLabHierarchy || !!cached.laboratoryHierarchy)
    if (hasRequiredCachedInfo) {
      if (!validateLaboratoryPermission(cached)) return next({ path: '/403', query: { code: '403' } })
      next()
      return
    }

    fetchLaboratoryInfo(laboratoryId, user.token).then((info) => {
      if (!validateLaboratoryPermission(info)) return next({ path: '/403', query: { code: '403' } })
      next()
    })
    return
  }

  // 已登录：正常放行
  next()
})

export default router
