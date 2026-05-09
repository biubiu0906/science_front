export const tableQueryParams = (source, keys) => {
  return keys.reduce((params, key) => {
    const value = source[key]
    if (value !== null && value !== undefined && value !== '') {
      params[key] = value
    }
    return params
  }, {})
}

export const clearTableQuery = (source, keys) => {
  keys.forEach(key => {
    source[key] = null
  })
}
