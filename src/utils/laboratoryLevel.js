import axios from "axios";

const CACHE_KEY = 'xm-laboratory-level'
const laboratoryLevelPromises = new Map()

export const getUserLaboratoryId = (user = {}) => {
  if (user.laboratoryId) return user.laboratoryId
  if (user.role === 'NORMAL_LABORATORY' || user.role === 'KEY_LABORATORY') return user.id
  return null
}

const normalizeLevel = (level) => {
  const n = Number(level)
  return Number.isFinite(n) ? n : null
}

const readCache = () => {
  const cached = localStorage.getItem(CACHE_KEY)
  if (!cached) return null
  try {
    return JSON.parse(cached)
  } catch (_) {
    return cached
  }
}

export const getCachedLaboratoryInfo = (laboratoryId) => {
  const cached = readCache()
  if (!cached) return null

  if (typeof cached === 'object') {
    if (laboratoryId && String(cached.laboratoryId) !== String(laboratoryId)) return null
    if (cached.info) return cached.info
    return {
      id: cached.laboratoryId || laboratoryId || null,
      type: normalizeLevel(cached.level),
      laboratoryHierarchy: cached.laboratoryHierarchy || null,
    }
  }

  if (laboratoryId) return null
  return {
    id: null,
    type: normalizeLevel(cached),
    laboratoryHierarchy: null,
  }
}

export const getCachedLaboratoryLevel = (laboratoryId) => {
  const cached = getCachedLaboratoryInfo(laboratoryId)
  return normalizeLevel(cached?.type)
}

export const getCachedLaboratoryHierarchy = (laboratoryId) => {
  const cached = getCachedLaboratoryInfo(laboratoryId)
  return cached?.laboratoryHierarchy || null
}

export const setCachedLaboratoryInfo = (laboratoryId, info = {}) => {
  const normalizedLevel = normalizeLevel(info.type)
  const cachedInfo = {
    ...info,
    id: info.id || laboratoryId || null,
    type: normalizedLevel,
  }

  localStorage.setItem(CACHE_KEY, JSON.stringify({
    laboratoryId: laboratoryId || null,
    level: normalizedLevel,
    laboratoryHierarchy: cachedInfo.laboratoryHierarchy || null,
    info: cachedInfo,
  }))
  return cachedInfo
}

export const setCachedLaboratoryLevel = (laboratoryId, level) => {
  const normalized = normalizeLevel(level)
  if (normalized === null) return null

  setCachedLaboratoryInfo(laboratoryId, { type: normalized })
  return normalized
}

export const clearLaboratoryLevelCache = () => {
  localStorage.removeItem(CACHE_KEY)
}

const handleUnauthorizedLaboratoryInfo = () => {
  localStorage.removeItem('xm-user')
  localStorage.removeItem('xm-will-logout')
  clearLaboratoryLevelCache()
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

export const fetchLaboratoryInfo = async (laboratoryId, token) => {
  if (!laboratoryId) return null

  const cached = getCachedLaboratoryInfo(laboratoryId)
  if (cached) return cached

  const promiseKey = String(laboratoryId)
  if (!laboratoryLevelPromises.has(promiseKey)) {
    laboratoryLevelPromises.set(promiseKey, axios
      .get(`${import.meta.env.VITE_BASE_URL}/teacher/selectLaboratoryById/${laboratoryId}`, {
        headers: { token: token || '' }
      })
      .then((res) => {
        const data = res?.data
        if (String(data?.code) === '401') {
          handleUnauthorizedLaboratoryInfo()
          return null
        }
        if (data?.code === '200') {
          return setCachedLaboratoryInfo(laboratoryId, data?.data || {})
        }
        return null
      })
      .catch((error) => {
        if (error?.response?.status === 401) {
          handleUnauthorizedLaboratoryInfo()
        }
        return null
      })
      .finally(() => {
        laboratoryLevelPromises.delete(promiseKey)
      }))
  }

  return laboratoryLevelPromises.get(promiseKey)
}

export const fetchLaboratoryLevel = async (laboratoryId, token) => {
  const info = await fetchLaboratoryInfo(laboratoryId, token)
  return normalizeLevel(info?.type)
}
