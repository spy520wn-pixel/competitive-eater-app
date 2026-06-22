import { Storage } from './storage'
import { createShop, createTier, createMenuItem } from './models'

const shopStorage = new Storage('shops')

export const shopStore = {
  getAll() {
    return shopStorage.getAll()
  },

  getById(id) {
    return shopStorage.getById(id)
  },

  create(shopData) {
    const shop = createShop(shopData)
    shopStorage.save(shop)
    return shop
  },

  update(id, updates) {
    shopStorage.update(id, updates)
  },

  remove(id) {
    shopStorage.remove(id)
  },

  search(keyword) {
    const all = shopStorage.getAll()
    if (!keyword) return all
    const kw = keyword.toLowerCase()
    return all.filter(s =>
      s.name.toLowerCase().includes(kw) ||
      s.city.toLowerCase().includes(kw)
    )
  },

  getByCity(city) {
    const normalized = city.replace(/市$/, '')
    return shopStorage.getAll().filter(s => {
      const shopCity = (s.city || '').replace(/市$/, '')
      return shopCity === normalized
    })
  },

  // 档位管理
  addTier(shopId, tierName) {
    const shop = shopStorage.getById(shopId)
    if (!shop) return { success: false, error: '店铺不存在' }
    const tier = createTier({ shopId, name: tierName })
    const newTiers = [...shop.tiers, tier]
    shopStorage.update(shopId, { tiers: newTiers, hasTiers: true })
    return { success: true, data: tier }
  },

  removeTier(shopId, tierId) {
    const shop = shopStorage.getById(shopId)
    if (!shop) return { success: false, error: '店铺不存在' }
    const newTiers = shop.tiers.filter(t => t.id !== tierId)
    shopStorage.update(shopId, { tiers: newTiers, hasTiers: newTiers.length > 0 })
    return { success: true }
  },

  updateTier(shopId, tierId, updates) {
    const shop = shopStorage.getById(shopId)
    if (!shop) return { success: false, error: '店铺不存在' }
    const newTiers = shop.tiers.map(t => t.id === tierId ? { ...t, ...updates } : t)
    shopStorage.update(shopId, { tiers: newTiers })
    return { success: true }
  },

  // 菜单管理
  addMenuItem(shopId, itemData, tierId = null) {
    const shop = shopStorage.getById(shopId)
    if (!shop) return { success: false, error: '店铺不存在' }
    const item = createMenuItem({ ...itemData, shopId, tierId: tierId || '' })
    if (tierId) {
      const newTiers = shop.tiers.map(t => {
        if (t.id === tierId) return { ...t, menu: [...t.menu, item] }
        return t
      })
      shopStorage.update(shopId, { tiers: newTiers })
    } else {
      const newMenu = [...shop.menu, item]
      shopStorage.update(shopId, { menu: newMenu })
    }
    return { success: true, data: item }
  },

  removeMenuItem(shopId, itemId, tierId = null) {
    const shop = shopStorage.getById(shopId)
    if (!shop) return { success: false, error: '店铺不存在' }
    if (tierId) {
      const newTiers = shop.tiers.map(t => {
        if (t.id === tierId) return { ...t, menu: t.menu.filter(m => m.id !== itemId) }
        return t
      })
      shopStorage.update(shopId, { tiers: newTiers })
    } else {
      const newMenu = shop.menu.filter(m => m.id !== itemId)
      shopStorage.update(shopId, { menu: newMenu })
    }
    return { success: true }
  },

  updateMenuItem(shopId, itemId, updates, tierId = null) {
    const shop = shopStorage.getById(shopId)
    if (!shop) return { success: false, error: '店铺不存在' }
    if (tierId) {
      const newTiers = shop.tiers.map(t => {
        if (t.id === tierId) return { ...t, menu: t.menu.map(m => m.id === itemId ? { ...m, ...updates } : m) }
        return t
      })
      shopStorage.update(shopId, { tiers: newTiers })
    } else {
      const newMenu = shop.menu.map(m => m.id === itemId ? { ...m, ...updates } : m)
      shopStorage.update(shopId, { menu: newMenu })
    }
    return { success: true }
  },

  getMenu(shopId, tierId = null) {
    const shop = shopStorage.getById(shopId)
    if (!shop) return []
    if (tierId) {
      const tier = shop.tiers.find(t => t.id === tierId)
      return tier ? tier.menu : []
    }
    return shop.menu
  },

  batchAddMenuItems(shopId, items, tierId = null) {
    shopStorage.batchUpdate(list => {
      const shop = list.find(s => s.id === shopId)
      if (!shop) return
      // Deep clone nested structures before mutation
      if (tierId) {
        shop.tiers = shop.tiers.map(t => ({ ...t, menu: [...t.menu] }))
      } else {
        shop.menu = [...shop.menu]
      }
      items.forEach(itemData => {
        const item = createMenuItem({ ...itemData, shopId, tierId: tierId || '' })
        if (tierId) {
          shop.tiers = shop.tiers.map(t => {
            if (t.id === tierId) return { ...t, menu: [...t.menu, item] }
            return t
          })
        } else {
          shop.menu = [...shop.menu, item]
        }
      })
    })
  },

  replaceShopContent(shopId, tiers, menu) {
    shopStorage.batchUpdate(list => {
      const shop = list.find(s => s.id === shopId)
      if (!shop) return
      shop.tiers = tiers
      shop.menu = menu
      shop.hasTiers = tiers.length > 0
    })
  },

  createWithContent(shopData, tiers, menu) {
    const shop = createShop(shopData)
    shop.tiers = tiers
    shop.menu = menu
    shop.hasTiers = tiers.length > 0
    shopStorage.save(shop)
    return shop
  }
}
