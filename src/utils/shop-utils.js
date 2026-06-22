/**
 * 店铺相关工具函数
 */

const CATEGORY_ICONS = {
  '自助餐': '🍖',
  '海鲜': '🦐',
  '火锅': '🍲',
  '烧烤': '🥩',
  '日料': '🍣',
  '西餐': '🍝',
  '中餐': '🥢',
  '其他': '🍽️'
}

export function getShopTier(count) {
  if (count >= 10) return 'shop-tier--gold'
  if (count >= 5) return 'shop-tier--silver'
  if (count >= 1) return 'shop-tier--bronze'
  return ''
}

export function getShopTierByShopId(shopId, records) {
  const count = records.filter(r => r.shopId === shopId && r.status === '已完成').length
  return getShopTier(count)
}

export function isRecent(dateStr) {
  if (!dateStr) return false
  const daysSince = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  return daysSince <= 7
}

export function getCategoryIcon(category) {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS['其他']
}

const SHOP_NAME_ICONS = {
  '自助餐': '🍖',
  '海鲜': '🦐',
  '火锅': '🍲',
  '烧烤': '🥩',
  '日料': '🍣',
  'default': '🍽️'
}

export function getShopIcon(shopName) {
  return SHOP_NAME_ICONS[shopName] || SHOP_NAME_ICONS['default']
}

export { CATEGORY_ICONS }
