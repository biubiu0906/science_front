import { onScopeDispose } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const toPositiveInteger = (value, fallback) => {
  const n = Number(value)
  if (!Number.isInteger(n) || n < 1) return fallback
  return n
}

export const usePaginationQuery = (pagination, options = {}) => {
  const route = useRoute()
  const router = useRouter()
  const ownerPath = route.path
  let active = true
  const pageKey = options.pageKey || 'pageNum'
  const pageSizeKey = options.pageSizeKey || 'pageSize'
  const defaultPageNum = toPositiveInteger(options.defaultPageNum || pagination.pageNum, 1)
  const defaultPageSize = toPositiveInteger(options.defaultPageSize || pagination.pageSize, 10)

  onScopeDispose(() => {
    active = false
  })

  pagination.pageNum = toPositiveInteger(route.query[pageKey], defaultPageNum)
  if (pageSizeKey) {
    pagination.pageSize = toPositiveInteger(route.query[pageSizeKey], defaultPageSize)
  }

  const replaceQuery = (patch) => {
    if (!active || router.currentRoute.value.path !== ownerPath) return
    const query = { ...router.currentRoute.value.query }
    Object.entries(patch).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        delete query[key]
      } else {
        query[key] = String(value)
      }
    })
    router.replace({ path: ownerPath, query })
  }

  const sync = () => {
    const patch = { [pageKey]: toPositiveInteger(pagination.pageNum, defaultPageNum) }
    if (pageSizeKey) {
      patch[pageSizeKey] = toPositiveInteger(pagination.pageSize, defaultPageSize)
    }
    replaceQuery(patch)
  }

  const reset = () => {
    pagination.pageNum = defaultPageNum
    sync()
  }

  const setPage = (pageNum) => {
    pagination.pageNum = toPositiveInteger(pageNum, defaultPageNum)
    sync()
  }

  const setPageSize = (pageSize) => {
    pagination.pageSize = toPositiveInteger(pageSize, defaultPageSize)
    pagination.pageNum = defaultPageNum
    sync()
  }

  return { sync, reset, setPage, setPageSize, replaceQuery }
}
