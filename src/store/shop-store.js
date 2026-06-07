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
    return shopStorage.getAll().filter(s => s.city === city)
  },

  // 档位管理
  addTier(shopId, tierName) {
    const shop = shopStorage.getById(shopId)
    if (!shop) return null
    const tier = createTier({ shopId, name: tierName })
    shop.tiers = [...shop.tiers, tier]
    shop.hasTiers = true
    shopStorage.update(shopId, { tiers: shop.tiers, hasTiers: true })
    return tier
  },

  removeTier(shopId, tierId) {
    const shop = shopStorage.getById(shopId)
    if (!shop) return
    shop.tiers = shop.tiers.filter(t => t.id !== tierId)
    if (shop.tiers.length === 0) shop.hasTiers = false
    shopStorage.update(shopId, { tiers: shop.tiers, hasTiers: shop.hasTiers })
  },

  updateTier(shopId, tierId, updates) {
    const shop = shopStorage.getById(shopId)
    if (!shop) return
    shop.tiers = shop.tiers.map(t => t.id === tierId ? { ...t, ...updates } : t)
    shopStorage.update(shopId, { tiers: shop.tiers })
  },

  // 菜单管理
  addMenuItem(shopId, itemData, tierId = null) {
    const shop = shopStorage.getById(shopId)
    if (!shop) return null
    const item = createMenuItem({ ...itemData, shopId, tierId: tierId || '' })
    if (tierId) {
      shop.tiers = shop.tiers.map(t => {
        if (t.id === tierId) return { ...t, menu: [...t.menu, item] }
        return t
      })
      shopStorage.update(shopId, { tiers: shop.tiers })
    } else {
      shop.menu = [...shop.menu, item]
      shopStorage.update(shopId, { menu: shop.menu })
    }
    return item
  },

  removeMenuItem(shopId, itemId, tierId = null) {
    const shop = shopStorage.getById(shopId)
    if (!shop) return
    if (tierId) {
      shop.tiers = shop.tiers.map(t => {
        if (t.id === tierId) return { ...t, menu: t.menu.filter(m => m.id !== itemId) }
        return t
      })
      shopStorage.update(shopId, { tiers: shop.tiers })
    } else {
      shop.menu = shop.menu.filter(m => m.id !== itemId)
      shopStorage.update(shopId, { menu: shop.menu })
    }
  },

  updateMenuItem(shopId, itemId, updates, tierId = null) {
    const shop = shopStorage.getById(shopId)
    if (!shop) return
    if (tierId) {
      shop.tiers = shop.tiers.map(t => {
        if (t.id === tierId) return { ...t, menu: t.menu.map(m => m.id === itemId ? { ...m, ...updates } : m) }
        return t
      })
      shopStorage.update(shopId, { tiers: shop.tiers })
    } else {
      shop.menu = shop.menu.map(m => m.id === itemId ? { ...m, ...updates } : m)
      shopStorage.update(shopId, { menu: shop.menu })
    }
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
    items.forEach(itemData => {
      this.addMenuItem(shopId, itemData, tierId)
    })
  }
}
