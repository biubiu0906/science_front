import request from '@/utils/request.js'

let schoolsPromise = null
let schoolsCacheTime = 0
const CACHE_DURATION = 30 * 1000 // 缓存过期时间：30秒

/**
 * 获取并缓存学校列表数据，避免多个页面重复请求
 * @returns {Promise<Array>} 学校列表数组
 */
export const getSchools = () => {
  const now = Date.now()
  // 如果缓存不存在，或者已经超过了过期时间，则重新发起请求
  if (!schoolsPromise || (now - schoolsCacheTime > CACHE_DURATION)) {
    schoolsPromise = request.get('/school/selectAll').then(res => {
      if (res.code === '200') {
        schoolsCacheTime = Date.now() // 请求成功，更新缓存时间戳
        return res.data || []
      }
      // 如果请求失败（但HTTP状态码是200），也抛出异常以便重试
      return Promise.reject(new Error(res.msg || '获取学校列表失败'))
    }).catch(err => {
      schoolsPromise = null // 失败时清空缓存，以便下次可以重试
      schoolsCacheTime = 0
      throw err
    })
  }
  return schoolsPromise
}

// 可选：提供一个手动清除缓存的方法，以备需要刷新数据时调用
export const clearSchoolsCache = () => {
  schoolsPromise = null
  schoolsCacheTime = 0
}
