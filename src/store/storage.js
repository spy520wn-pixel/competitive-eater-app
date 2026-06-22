export class Storage {
  constructor(key) {
    this.key = `eater_${key}`
    this._cache = null
  }

  _readFromStorage() {
    try {
      return uni.getStorageSync(this.key) || []
    } catch {
      return []
    }
  }

  _writeToStorage(list) {
    try {
      uni.setStorageSync(this.key, list)
      this._cache = list
    } catch (e) {
      console.error(`[Storage] 写入失败 (${this.key}):`, e.message)
      throw new Error('存储空间不足，请清理数据后重试')
    }
  }

  getAll() {
    if (this._cache === null) {
      this._cache = this._readFromStorage()
    }
    return this._cache
  }

  getById(id) {
    return this.getAll().find(item => item.id === id) || null
  }

  save(item) {
    const list = [...this.getAll(), item]
    this._writeToStorage(list)
  }

  update(id, updates) {
    const list = this.getAll()
    const index = list.findIndex(item => item.id === id)
    if (index !== -1) {
      const newList = [...list]
      newList[index] = { ...newList[index], ...updates }
      this._writeToStorage(newList)
    }
  }

  remove(id) {
    const list = this.getAll().filter(item => item.id !== id)
    this._writeToStorage(list)
  }

  batchUpdate(fn) {
    const list = [...this.getAll().map(item => ({ ...item }))]
    fn(list)
    this._writeToStorage(list)
  }

  invalidateCache() {
    this._cache = null
  }

  clear() {
    uni.removeStorageSync(this.key)
    this._cache = null
  }

  exportAll() {
    return JSON.stringify(this.getAll(), null, 2)
  }

  importAll(jsonString) {
    let data
    try {
      data = JSON.parse(jsonString)
    } catch {
      throw new Error('导入数据格式错误：不是有效的 JSON')
    }
    if (!Array.isArray(data)) {
      throw new Error('导入数据格式错误：应为数组')
    }
    this._writeToStorage(data)
  }
}
