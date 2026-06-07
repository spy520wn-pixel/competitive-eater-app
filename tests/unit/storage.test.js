import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock uni.storage
const storage = {}
global.uni = {
  setStorageSync: vi.fn((key, value) => { storage[key] = JSON.stringify(value) }),
  getStorageSync: vi.fn((key) => {
    const val = storage[key]
    return val ? JSON.parse(val) : null
  }),
  removeStorageSync: vi.fn((key) => { delete storage[key] })
}

import { Storage } from '../../src/store/storage'

describe('Storage 封装', () => {
  let store

  beforeEach(() => {
    Object.keys(storage).forEach(k => delete storage[k])
    store = new Storage('test')
  })

  it('getAll 返回空数组当无数据时', () => {
    expect(store.getAll()).toEqual([])
  })

  it('save 和 getAll 正确存取数据', () => {
    const item = { id: '1', name: '测试' }
    store.save(item)
    expect(store.getAll()).toEqual([item])
  })

  it('getById 正确查找', () => {
    store.save({ id: '1', name: 'A' })
    store.save({ id: '2', name: 'B' })
    expect(store.getById('2')).toEqual({ id: '2', name: 'B' })
  })

  it('update 正确更新', () => {
    store.save({ id: '1', name: 'A' })
    store.update('1', { name: 'B' })
    expect(store.getById('1').name).toBe('B')
  })

  it('remove 正确删除', () => {
    store.save({ id: '1', name: 'A' })
    store.remove('1')
    expect(store.getAll()).toEqual([])
  })
})
