/**
 * 高德地图 POI 搜索服务
 * 用于搜索城市内的自助餐店铺
 */

import { settingsStore } from '../store/settings-store'

const DEFAULT_AMAP_KEY = ''
const AMAP_BASE_URL = 'https://restapi.amap.com/v3'

function getAmapKey() {
  const settings = settingsStore.get()
  return settings.amapKey || DEFAULT_AMAP_KEY
}

/**
 * 搜索城市内的自助餐店铺
 * @param {string} city - 城市名称（如"北京"）
 * @param {number} page - 页码（从1开始）
 * @param {number} pageSize - 每页数量（最大25）
 * @returns {Promise<{pois: Array, total: number}>}
 */
export async function searchBuffetShops(city, page = 1, pageSize = 25) {
  const params = {
    key: getAmapKey(),
    keywords: '自助餐',
    city: city,
    citylimit: 'true',
    offset: String(pageSize),
    page: String(page),
    extensions: 'all',
    fields: 'business,photos'
  }

  // 拼接 query string（兼容 APP 端 URLSearchParams 可能不可用的情况）
  const qs = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')
  const url = `${AMAP_BASE_URL}/place/text?${qs}`

  try {
    const response = await new Promise((resolve, reject) => {
      uni.request({
        url,
        method: 'GET',
        timeout: 15000,
        dataType: 'json',
        success: (res) => {
          // APP 端 res.data 可能是字符串，需要二次解析
          let data = res.data
          if (typeof data === 'string') {
            try { data = JSON.parse(data) } catch (e) {}
          }
          if (res.statusCode === 200 && data && data.status === '1') {
            resolve(data)
          } else {
            const errMsg = data?.info || `HTTP ${res.statusCode}`
            reject(new Error(errMsg))
          }
        },
        fail: (err) => {
          reject(new Error(err.errMsg || '网络请求失败'))
        }
      })
    })

    const pois = (response.pois || []).map(formatPoi)
    const total = parseInt(response.count || '0', 10)

    return { pois, total }
  } catch (error) {
    console.error('[Amap] Search failed:', error.message)
    throw error
  }
}

/**
 * 格式化 POI 数据为店铺格式
 */
function formatPoi(poi) {
  // 解析经纬度
  const [lng, lat] = (poi.location || '0,0').split(',').map(Number)

  // 提取分类
  const category = extractCategory(poi.type || poi.typecode || '')

  // 提取地址
  const address = poi.address || poi.cityname + poi.adname + (poi.name || '')

  // 提取电话
  const phone = poi.tel || ''

  // 提取营业时间
  const businessHours = poi.business?.business_time || ''

  // 提取图片
  const photos = (poi.photos || []).slice(0, 3).map(p => p.url)

  return {
    id: poi.id,
    name: poi.name || '未知店铺',
    address,
    category,
    city: poi.cityname || '',
    district: poi.adname || '',
    location: {
      longitude: lng,
      latitude: lat
    },
    phone,
    businessHours,
    photos,
    // 高德评分
    rating: poi.biz_ext?.rating || '',
    // 人均消费
    cost: poi.biz_ext?.cost || '',
    // 原始数据，用于去重
    _source: 'amap',
    _amapId: poi.id
  }
}

/**
 * 提取店铺分类
 */
function extractCategory(type) {
  const typeStr = String(type)

  // 高德分类码映射
  const categoryMap = {
    '05': '自助餐',
    '0501': '中餐厅',
    '0502': '外国餐厅',
    '0503': '火锅店',
    '0504': '快餐店',
    '0505': '休闲餐饮',
    '0506': '咖啡厅',
    '0507': '茶馆',
    '0508': '面包甜点',
    '0509': '冷饮店'
  }

  // 尝试匹配分类码
  for (const [code, name] of Object.entries(categoryMap)) {
    if (typeStr.startsWith(code)) {
      return name
    }
  }

  // 如果包含"自助"关键字
  if (typeStr.includes('自助')) {
    return '自助餐'
  }

  return '餐饮'
}

/**
 * 批量搜索（自动分页）
 * @param {string} city - 城市名称
 * @param {number} maxPages - 最大页数
 * @returns {Promise<Array>}
 */
export async function searchAllBuffetShops(city, maxPages = 4) {
  const allPois = []
  let page = 1
  let total = 0

  while (page <= maxPages) {
    try {
      const result = await searchBuffetShops(city, page, 25)
      allPois.push(...result.pois)
      total = result.total

      // 如果已经获取了所有结果，停止
      if (allPois.length >= total || result.pois.length === 0) {
        break
      }

      page++

      // 添加延迟，避免请求过快
      if (page <= maxPages) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    } catch (error) {
      console.error(`[Amap] Page ${page} failed:`, error)
      break
    }
  }

  return allPois
}

/**
 * 去重：检查店铺是否已存在
 * @param {Object} shop - 要检查的店铺
 * @param {Array} existingShops - 已存在的店铺列表
 * @returns {boolean} 是否重复
 */
export function isDuplicate(shop, existingShops) {
  return existingShops.some(existing => {
    // 名称匹配（忽略大小写和空格）
    const nameMatch = existing.name.toLowerCase().replace(/\s+/g, '') ===
                      shop.name.toLowerCase().replace(/\s+/g, '')

    // 位置匹配（经纬度相近，误差范围约100米）
    const locationMatch = existing.location &&
                          shop.location &&
                          Math.abs(existing.location.longitude - shop.location.longitude) < 0.001 &&
                          Math.abs(existing.location.latitude - shop.location.latitude) < 0.001

    // 名称+位置都匹配才算重复
    return nameMatch && locationMatch
  })
}
