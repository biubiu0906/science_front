
import { clearLaboratoryLevelCache } from "@/utils/laboratoryLevel.js";

export function ensureLogoutIfClosed() {
  const flagKey = 'xm-will-logout'
  const tabAliveKey = 'xm-tab-alive'
  const hasFlag = localStorage.getItem(flagKey)

  if (!hasFlag) {
    try {
      sessionStorage.setItem(tabAliveKey, '1')
    } catch (_) {}
    return
  }

  let isSameTabReload = false
  try {
    isSameTabReload = sessionStorage.getItem(tabAliveKey) === '1'
  } catch (_) {
    isSameTabReload = false
  }

  if (isSameTabReload) {
    localStorage.removeItem(flagKey)
    return
  }

  localStorage.removeItem('xm-user')
  clearLaboratoryLevelCache()
  localStorage.removeItem(flagKey)
  try {
    sessionStorage.setItem(tabAliveKey, '1')
  } catch (_) {}
}

export function registerAutoLogoutOnClose(router) { 
  const state = {
    isNavigating: false
  }

  // 路由跳转标记，站内跳转不应触发退出
  router.beforeEach((to, from, next) => {
    state.isNavigating = true
    next()
  })
  router.afterEach(() => {
    Promise.resolve().then(() => { state.isNavigating = false })
  })

  // 页面关闭处理：仅在非跳转时执行
  const onBeforeUnload = () => {
    if (state.isNavigating) return
    try {
      localStorage.setItem('xm-will-logout', '1')
    } catch (_) { /* 忽略异常 */ }
  }

  const onPageHide = (e) => {
    if (e && e.persisted) return
    onBeforeUnload()
  }

  // 注册事件监听
  window.addEventListener('beforeunload', onBeforeUnload)
  window.addEventListener('pagehide', onPageHide)

  // 返回清理函数
  return () => {
    window.removeEventListener('beforeunload', onBeforeUnload)
    window.removeEventListener('pagehide', onPageHide)
  }
}
