export class Storage {
  constructor(key) {
    this.key = `eater_${key}`
  }

  getAll() {
    try {
      return uni.getStorageSync(this.key) || []
    } catch {
      return []
    }
  }

  getById(id) {
    return this.getAll().find(item => item.id === id) || null
  }

  save(item) {
    const list = this.getAll()
    list.push(item)
    uni.setStorageSync(this.key, list)
  }

  update(id, updates) {
    const list = this.getAll()
    const index = list.findIndex(item => item.id === id)
    if (index !== -1) {
      list[index] = { ...list[index], ...updates }
      uni.setStorageSync(this.key, list)
    }
  }

  remove(id) {
    const list = this.getAll().filter(item => item.id !== id)
    uni.setStorageSync(this.key, list)
  }

  clear() {
    uni.removeStorageSync(this.key)
  }

  exportAll() {
    return JSON.stringify(this.getAll(), null, 2)
  }

  importAll(jsonString) {
    const data = JSON.parse(jsonString)
    uni.setStorageSync(this.key, data)
  }
}
