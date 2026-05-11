import forge from 'node-forge'
import request from '@/utils/request'

const STORAGE_KEY = 'rsa_public_key'
// 提前缓冲时间（10分钟），单位毫秒
const BUFFER_TIME = 10 * 60 * 1000

const clearStoredPublicKey = () => {
  localStorage.removeItem(STORAGE_KEY)
}

// 生成随机 nonce
const generateNonce = (length = 16) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 获取并缓存公钥
export const getPublicKey = async (forceRefresh = false) => {
  let stored = null
  try {
    stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
  } catch (_) {
    clearStoredPublicKey()
  }
  const now = Date.now()

  // 检查缓存是否存在且未过期（保留缓冲时间）
  if (!forceRefresh && stored && stored.expireAt && (new Date(stored.expireAt).getTime() - now > BUFFER_TIME)) {
    return stored
  }

  // 刷新公钥
  try {
    const res = await request.get('/security/rsa/publicKey')
    if (res.code === '200' && res.data) {
      stored = res.data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
      return stored
    }
  } catch (e) {
    if (forceRefresh) clearStoredPublicKey()
    console.error('Failed to fetch public key', e)
  }
  if (forceRefresh) clearStoredPublicKey()
  return null
}

// 清除公钥缓存
export const removePublicKey = () => {
  clearStoredPublicKey()
}

// 加密函数 (使用 node-forge 以兼容 HTTP 环境)
export const encrypt = async (text) => {
  if (!text) return text
  
  const keyData = await getPublicKey()
  if (!keyData) {
    throw new Error('无法获取加密公钥')
  }

  try {
    // 1. 从 PEM 导入公钥
    const publicKey = forge.pki.publicKeyFromPem(keyData.publicKeyPem)

    // 2. 将字符串转换为 UTF-8 字节
    // forge.util.createBuffer 默认处理 raw string，指定 'utf8' 确保中文等多字节字符正确
    const buffer = forge.util.createBuffer(text, 'utf8')

    // 3. 使用 RSA-OAEP + SHA-256 加密
    const encrypted = publicKey.encrypt(buffer.getBytes(), 'RSA-OAEP', {
      md: forge.md.sha256.create(),
      // mgf1: forge.mgf.mgf1.create(forge.md.sha256.create()) // 某些后端可能需要显式指定 MGF1 哈希，通常默认跟随 md
    })

    // 4. Base64 编码
    return `rsa:${forge.util.encode64(encrypted)}`
  } catch (e) {
    console.error('RSA Encryption error:', e)
    throw new Error('密码加密失败: ' + e.message)
  }
}

// 获取安全参数 (ts, nonce, keyId)
export const getSecurityParams = async () => {
  const keyData = await getPublicKey()
  return {
    keyId: keyData ? keyData.keyId : '',
    ts: Date.now(),
    nonce: generateNonce()
  }
}
