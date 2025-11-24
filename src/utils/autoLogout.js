
export function ensureLogoutIfClosed() {
  const flagKey = 'xm-will-logout'
  const hasFlag = localStorage.getItem(flagKey)
  if (!hasFlag) return

  let navType = 'navigate'
  try {
    const entry = performance.getEntriesByType && performance.getEntriesByType('navigation')[0]
    if (entry && entry.type) navType = entry.type
  } catch (_) {}

  if (!navType && performance && performance.navigation) {
    navType = performance.navigation.type === 1 ? 'reload' : (performance.navigation.type === 2 ? 'back_forward' : 'navigate')
  }

  if (navType === 'reload') {
    // 刷新：不清理登录态，仅移除标记
    localStorage.removeItem(flagKey)
    return
  }

  // 关闭后重新打开：清理登录态
  localStorage.removeItem('xm-user')
  localStorage.removeItem(flagKey)
}

export function registerAutoLogoutOnClose(router) { 
  const state = {
    isNavigating: false,
    isRefreshing: false
  }

  // 键盘刷新检测
  const onKeydown = (e) => {
    if (e.key === 'F5' || (e.ctrlKey && e.key === 'F5') || (e.shiftKey && e.key === 'F5')) {
      state.isRefreshing = true
      return
    }
    // Ctrl+R 刷新
    if (e.ctrlKey && (e.key === 'r' || e.key === 'R')) {
      state.isRefreshing = true
    }
  }

  // 路由跳转标记，站内跳转不应触发退出
  router.beforeEach((to, from, next) => {
    state.isNavigating = true
    next()
  })
  router.afterEach(() => {
    Promise.resolve().then(() => { state.isNavigating = false })
  })

  // 页面关闭处理：仅在非跳转且非刷新时执行
  const onBeforeUnload = () => {
    if (state.isNavigating || state.isRefreshing) return

    try {
      localStorage.setItem('xm-will-logout', '1')
    } catch (_) { /* 忽略异常 */ }
  }

  // 注册事件监听
  window.addEventListener('keydown', onKeydown, { passive: true })
  window.addEventListener('beforeunload', onBeforeUnload)

  // 返回清理函数
  return () => {
    window.removeEventListener('keydown', onKeydown)
    window.removeEventListener('beforeunload', onBeforeUnload)
  }
}