import { describe, it, expect } from 'vitest'
import { createShop, createTier, createMenuItem, createRecord, createRecordItem } from '../../src/store/models'

describe('数据模型', () => {
  it('createShop 创建店铺对象', () => {
    const shop = createShop({ name: 'XX自助', category: '自助餐', city: '北京' })
    expect(shop.id).toBeDefined()
    expect(shop.name).toBe('XX自助')
    expect(shop.hasTiers).toBe(false)
    expect(shop.tiers).toEqual([])
    expect(shop.menu).toEqual([])
    expect(shop.mealTimeLimit).toBe(90)
  })

  it('createTier 创建档位对象', () => {
    const tier = createTier({ shopId: 's1', name: '豪华档' })
    expect(tier.id).toBeDefined()
    expect(tier.shopId).toBe('s1')
    expect(tier.name).toBe('豪华档')
    expect(tier.menu).toEqual([])
  })

  it('createMenuItem 创建菜单项', () => {
    const item = createMenuItem({ shopId: 's1', name: '肥牛卷', category: '肉类', unit: '盘' })
    expect(item.id).toBeDefined()
    expect(item.shopId).toBe('s1')
    expect(item.tierId).toBe('')
    expect(item.category).toBe('肉类')
  })

  it('createRecord 创建战绩记录', () => {
    const record = createRecord({ shopId: 's1', shopName: 'XX自助' })
    expect(record.id).toBeDefined()
    expect(record.shopId).toBe('s1')
    expect(record.status).toBe('进行中')
    expect(record.items).toEqual([])
    expect(record.score).toBe(0)
  })

  it('createRecordItem 创建点餐明细', () => {
    const item = createRecordItem({ menuItemId: 'm1', name: '肥牛卷', category: '肉类', quantity: 2, unit: '盘' })
    expect(item.menuItemId).toBe('m1')
    expect(item.quantity).toBe(2)
  })
})
