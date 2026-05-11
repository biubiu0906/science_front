import { clearLaboratoryLevelCache } from "@/utils/laboratoryLevel.js";

export const clearLoginState = () => {
  localStorage.removeItem('xm-user')
  localStorage.removeItem('xm-will-logout')
  localStorage.removeItem('rsa_public_key')
  clearLaboratoryLevelCache()
}

export const isTokenExpired = (token) => {
  if (!token || typeof token !== 'string') return true
  const parts = token.split('.')
  if (parts.length < 2) return true

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=')
    const payload = JSON.parse(atob(padded))
    if (!payload.exp) return false
    return payload.exp * 1000 <= Date.now()
  } catch (_) {
    return true
  }
}
