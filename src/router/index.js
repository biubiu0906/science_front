import { createRouter, createWebHistory } from 'vue-router'
import axios from 'axios'

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
        { path: 'teacher', meta: { name: '教师信息', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'NORMAL_LABORATORY', 'KEY_LABORATORY'] }, component: () => import('@/views/manager/Teacher.vue') },
        { path: 'project', meta: { name: '科研项目', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'KEY_LABORATORY', 'TEACHER'], labLevel: 2, labLevelRoles: ['TEACHER'] }, component: () => import('@/views/manager/Project.vue') },
        // 新增实验室申请
        { path: 'labApply', meta: { name: '任务书', roles: ['NORMAL_LABORATORY'] }, component: () => import('@/views/manager/LabApply.vue') },
        // 新增研究基地申请
        { path: 'researchBaseApply', meta: { name: '重点研究基地申请', roles: ['NORMAL_LABORATORY'] }, component: () => import('@/views/manager/ResearchBaseApply.vue') },
        { path: 'innovationTeamApply', meta: { name: '优秀创新团队申请', roles: ['NORMAL_LABORATORY'] }, component: () => import('@/views/manager/InnovationTeamApply.vue') },
        { path: 'labMember', meta: { name: '组织成员管理', roles: ['SUPER_ADMIN', 'KEY_LABORATORY'] }, component: () => import('@/views/manager/LabMember.vue') },
        { path: 'labSelect', meta: { name: '重点组织审核', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'] }, component: () => import('@/views/manager/LabSelect.vue') },
        { path: 'process', meta: { name: '科研过程', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'KEY_LABORATORY', 'TEACHER'], labLevel: 2, labLevelRoles: ['TEACHER'] }, component: () => import('@/views/manager/Process.vue') },
        { path: 'type', meta: { name: '成果分类', roles: ['SUPER_ADMIN'] }, component: () => import('@/views/manager/Type.vue') },
        { path: 'achievement', meta: { name: '科研成果', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'KEY_LABORATORY', 'TEACHER'], labLevel: 2, labLevelRoles: ['TEACHER'] }, component: () => import('@/views/manager/Achievement.vue') },
        { path: 'processLine', meta: { name: '科研过程线', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'] }, component: () => import('@/views/manager/ProcessLine.vue') },
        { path: 'teacherFeedback', meta: { name: '教师反馈', roles: ['TEACHER'] }, component: () => import('@/views/manager/TeacherFeedback.vue') },
        { path: 'feedback', meta: { name: '教师反馈', roles: ['SUPER_ADMIN'] }, component: () => import('@/views/manager/Feedback.vue') },
        { path: 'activity', meta: { name: '学术活动', roles: ['SUPER_ADMIN'] }, component: () => import('@/views/manager/Activity.vue') },
        { path: 'teacherActivity', meta: { name: '学术活动', roles: ['KEY_LABORATORY'] }, component: () => import('@/views/manager/TeacherActivity.vue') },
        { path: 'apply', meta: { name: '我的申请', roles: ['KEY_LABORATORY', 'SUPER_ADMIN', 'TEACHER'] }, component: () => import('@/views/manager/Apply.vue') },
        { path: 'log', meta: { name: '日志管理', roles: ['SUPER_ADMIN'] }, component: () => import('@/views/manager/Log.vue') },
        { path: 'dashboard', meta: { name: '数据统计', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'KEY_LABORATORY'] }, component: () => import('@/views/manager/Dashboard.vue') },
        //{ path: 'entityProfile', meta: { name: '学校/组织画像', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'] }, component: () => import('@/views/manager/EntityProfile.vue') },
        { path: 'laboratory', meta: { name: '组织信息', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'] }, component: () => import('@/views/manager/Laboratory.vue') },
        { path: 'report', meta: { name: '报告信息' }, component: () => import('@/views/manager/Report.vue') },
        { path: 'notification', meta: { name: '通知管理', roles: ['SUPER_ADMIN'] }, component: () => import('@/views/manager/Notification.vue') },
        { path: 'myNotification', meta: { name: '我的消息', roles: ['TEACHER', 'NORMAL_LABORATORY'] }, component: () => import('@/views/manager/MyNotification.vue') },
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

const getCachedLaboratoryLevel = () => {
  const cached = localStorage.getItem('xm-laboratory-level')
  if (!cached) return null
  const n = Number(cached)
  return Number.isFinite(n) ? n : null
}

let laboratoryLevelPromise = null
const fetchLaboratoryLevel = async (laboratoryId, token) => {
  if (!laboratoryId) return null
  if (!laboratoryLevelPromise) {
    laboratoryLevelPromise = axios
      .get(`${import.meta.env.VITE_BASE_URL}/teacher/selectLaboratoryById/${laboratoryId}`, {
        headers: { token: token || '' }
      })
      .then((res) => {
        const data = res?.data
        if (data && data.code === '200') {
          const level = data?.data?.type
          if (level !== undefined && level !== null) {
            localStorage.setItem('xm-laboratory-level', String(level))
            return Number(level)
          }
        }
        return null
      })
      .catch(() => null)
      .finally(() => {
        laboratoryLevelPromise = null
      })
  }
  return laboratoryLevelPromise
}

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

  const allowedRoles = to.meta && Array.isArray(to.meta.roles) ? to.meta.roles : null
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return next({ path: '/403', query: { code: '403' } })
  }

  const requiredLabLevel = to.meta && to.meta.labLevel !== undefined ? Number(to.meta.labLevel) : null
  const labLevelRoles = to.meta && Array.isArray(to.meta.labLevelRoles) ? to.meta.labLevelRoles : null
  const shouldCheckLabLevel = requiredLabLevel !== null && (!labLevelRoles || labLevelRoles.includes(user.role))
  if (shouldCheckLabLevel) {
    const cached = getCachedLaboratoryLevel()
    if (cached !== null) {
      if (cached !== requiredLabLevel) return next({ path: '/403', query: { code: '403' } })
      return next()
    }
    fetchLaboratoryLevel(user.laboratoryId, user.token).then((level) => {
      if (level === null || level !== requiredLabLevel) return next({ path: '/403', query: { code: '403' } })
      next()
    })
    return
  }

  // 已登录：正常放行
  next()
})

export default router
