import { Storage } from './storage'
import { createRecord, createRecordItem } from './models'
import { scoreToExp } from '../utils/level'

const recordStorage = new Storage('records')

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
    return record
  },

  addItem(recordId, itemData) {
    const record = recordStorage.getById(recordId)
    if (!record || record.status !== '进行中') return
    const item = createRecordItem(itemData)
    const existingIndex = record.items.findIndex(
      i => i.menuItemId === item.menuItemId
    )
    if (existingIndex !== -1) {
      record.items[existingIndex].quantity += item.quantity
    } else {
      record.items.push(item)
    }
    recordStorage.update(recordId, { items: record.items })
  },

  updateItemQuantity(recordId, menuItemId, quantity) {
    const record = recordStorage.getById(recordId)
    if (!record || record.status !== '进行中') return
    if (quantity <= 0) {
      record.items = record.items.filter(i => i.menuItemId !== menuItemId)
    } else {
      record.items = record.items.map(i =>
        i.menuItemId === menuItemId ? { ...i, quantity } : i
      )
    }
    recordStorage.update(recordId, { items: record.items })
  },

  finish(recordId, score) {
    const now = new Date().toISOString()
    const record = recordStorage.getById(recordId)
    if (!record) return
    const duration = Math.round((new Date(now) - new Date(record.startTime)) / 60000)
    recordStorage.update(recordId, {
      endTime: now,
      duration,
      status: '已完成',
      score
    })
  },

  abandon(recordId) {
    const now = new Date().toISOString()
    const record = recordStorage.getById(recordId)
    if (!record) return
    const duration = Math.round((new Date(now) - new Date(record.startTime)) / 60000)
    recordStorage.update(recordId, {
      endTime: now,
      duration,
      status: '已放弃'
    })
  },

  addPhoto(recordId, photoPath) {
    const record = recordStorage.getById(recordId)
    if (!record) return
    if (!record.photos) record.photos = []
    record.photos.push(photoPath)
    recordStorage.update(recordId, { photos: record.photos })
  },

  remove(recordId) {
    recordStorage.remove(recordId)
  },

  getStats() {
    const all = recordStorage.getAll()
    const completed = all.filter(r => r.status === '已完成')
    if (completed.length === 0) {
      return { totalRecords: 0, maxScore: 0, totalExp: 0, shopCount: 0, categoryTotals: {} }
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
    return {
      totalRecords: completed.length,
      maxScore,
      totalExp,
      shopCount: shopIds.size,
      categoryTotals
    }
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
