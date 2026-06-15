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
    uni.setStorageSync(this.key, list)
    this._cache = list
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

  clear() {
    uni.removeStorageSync(this.key)
    this._cache = null
  }

  exportAll() {
    return JSON.stringify(this.getAll(), null, 2)
  }

  importAll(jsonString) {
    const data = JSON.parse(jsonString)
    this._writeToStorage(data)
  }
}
