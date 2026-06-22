import { Storage } from './storage'
import { createRecord, createRecordItem } from './models'
import { scoreToExp } from '../utils/level'

const recordStorage = new Storage('records')
let _statsCache = null
let _statsDirty = true

function markDirty() {
  _statsDirty = true
}

export const recordStore = {
  getAll() {
    return recordStorage.getAll()
  },

  getById(id) {
    return recordStorage.getById(id)
  },

  getByShopId(shopId) {
    return recordStorage.getAll()
      .filter(r => r.shopId === shopId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },

  create(recordData) {
    const record = createRecord(recordData)
    recordStorage.save(record)
    markDirty()
    return record
  },

  addItem(recordId, itemData) {
    const record = recordStorage.getById(recordId)
    if (!record) return { success: false, error: '记录不存在' }
    if (record.status !== '进行中') return { success: false, error: '记录已结束' }
    const item = createRecordItem(itemData)
    const existingIndex = record.items.findIndex(
      i => i.menuItemId === item.menuItemId
    )
    let newItems
    if (existingIndex !== -1) {
      newItems = record.items.map((it, idx) =>
        idx === existingIndex ? { ...it, quantity: it.quantity + item.quantity } : it
      )
    } else {
      newItems = [...record.items, item]
    }
    recordStorage.update(recordId, { items: newItems })
    markDirty()
    return { success: true, data: item }
  },

  updateItemQuantity(recordId, menuItemId, quantity) {
    const record = recordStorage.getById(recordId)
    if (!record) return { success: false, error: '记录不存在' }
    if (record.status !== '进行中') return { success: false, error: '记录已结束' }
    const newItems = quantity <= 0
      ? record.items.filter(i => i.menuItemId !== menuItemId)
      : record.items.map(i =>
          i.menuItemId === menuItemId ? { ...i, quantity } : i
        )
    recordStorage.update(recordId, { items: newItems })
    markDirty()
    return { success: true }
  },

  finish(recordId, score) {
    const now = new Date().toISOString()
    const record = recordStorage.getById(recordId)
    if (!record) return { success: false, error: '记录不存在' }
    const duration = Math.round((new Date(now) - new Date(record.startTime)) / 60000)
    recordStorage.update(recordId, {
      endTime: now,
      duration,
      status: '已完成',
      score
    })
    markDirty()
    return { success: true }
  },

  abandon(recordId) {
    const now = new Date().toISOString()
    const record = recordStorage.getById(recordId)
    if (!record) return { success: false, error: '记录不存在' }
    const duration = Math.round((new Date(now) - new Date(record.startTime)) / 60000)
    recordStorage.update(recordId, {
      endTime: now,
      duration,
      status: '已放弃'
    })
    markDirty()
    return { success: true }
  },

  addPhoto(recordId, photoPath) {
    const record = recordStorage.getById(recordId)
    if (!record) return { success: false, error: '记录不存在' }
    const newPhotos = [...(record.photos || []), photoPath]
    recordStorage.update(recordId, { photos: newPhotos })
    markDirty()
    return { success: true }
  },

  remove(recordId) {
    recordStorage.remove(recordId)
    markDirty()
  },

  getStats() {
    if (!_statsDirty && _statsCache) return _statsCache
    const all = recordStorage.getAll()
    const completed = all.filter(r => r.status === '已完成')
    if (completed.length === 0) {
      _statsCache = { totalRecords: 0, maxScore: 0, totalExp: 0, shopCount: 0, categoryTotals: {} }
      _statsDirty = false
      return _statsCache
    }
    const maxScore = Math.max(...completed.map(r => r.score))
    const totalExp = completed.reduce((sum, r) => sum + scoreToExp(r.score), 0)
    const shopIds = new Set(completed.map(r => r.shopId))
    const categoryTotals = {}
    completed.forEach(r => {
      r.items.forEach(item => {
        if (!categoryTotals[item.category]) categoryTotals[item.category] = 0
        categoryTotals[item.category] += item.quantity
      })
    })
    _statsCache = {
      totalRecords: completed.length,
      maxScore,
      totalExp,
      shopCount: shopIds.size,
      categoryTotals
    }
    _statsDirty = false
    return _statsCache
  },

  getBestByShop(shopId) {
    const records = this.getByShopId(shopId)
    if (records.length === 0) return null
    return records.reduce((best, r) => r.score > best.score ? r : best)
  },

  exportAll() {
    return recordStorage.exportAll()
  },

  importAll(jsonString) {
    recordStorage.importAll(jsonString)
  }
}
