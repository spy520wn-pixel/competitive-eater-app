<template>
  <view class="map-viz">
    <!-- ECharts container -->
    <view class="chart-wrap" :prop="chartData" :change:prop="echartsModule.onDataChange">
      <view :id="chartId" class="chart-dom" />
    </view>

    <!-- Legend -->
    <view class="legend">
      <view class="legend-item">
        <view class="legend-bubble legend-bubble--challenged">
          <text class="legend-bubble-text">店铺</text>
        </view>
        <view class="legend-arrow legend-arrow--challenged" />
        <text class="legend-label">已挑战</text>
      </view>
      <view class="legend-item">
        <view class="legend-bubble legend-bubble--unchallenged">
          <text class="legend-bubble-text">店铺</text>
        </view>
        <view class="legend-arrow legend-arrow--unchallenged" />
        <text class="legend-label">未挑战</text>
      </view>
    </view>

    <!-- Unlocated challenged shops -->
    <view v-if="unlocatedChallenged.length > 0" class="unlocated">
      <text class="unlocated-title">以下店铺未设置定位：</text>
      <view v-for="shop in unlocatedChallenged" :key="shop.id" class="unlocated-item" @tap="$emit('markerTap', shop.id)">
        <text class="unlocated-name">{{ shop.name }}</text>
        <text class="unlocated-score">{{ shop._bestScore }}分</text>
      </view>
    </view>
  </view>
</template>

<script module="echartsModule" lang="renderjs">
// ═══════════════════════════════════════════════════════
// 1. ECharts 注册
// ═══════════════════════════════════════════════════════
import * as echarts from 'echarts/core'
import { MapChart } from 'echarts/charts'
import { EffectScatterChart, ScatterChart } from 'echarts/charts'
import { GeoComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 注册必要的组件
echarts.use([MapChart, EffectScatterChart, ScatterChart, GeoComponent, TooltipComponent, CanvasRenderer])

// ═══════════════════════════════════════════════════════
// 2. 地图加载工具函数
// ═══════════════════════════════════════════════════════

let chinaLoaded = false

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    if (typeof fetch === 'function') {
      fetch(url)
        .then(resp => {
          if (!resp.ok) throw new Error('HTTP ' + resp.status)
          return resp.json()
        })
        .then(resolve)
        .catch(reject)
    } else {
      // XMLHttpRequest fallback for older webviews
      const xhr = new XMLHttpRequest()
      xhr.open('GET', url, true)
      xhr.responseType = 'json'
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response || JSON.parse(xhr.responseText))
        } else {
          reject(new Error('HTTP ' + xhr.status))
        }
      }
      xhr.onerror = () => reject(new Error('Network error'))
      xhr.send()
    }
  })
}

async function loadChinaMap() {
  if (chinaLoaded) return

  try {
    const json = await fetchJSON('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
    echarts.registerMap('china', json)
    chinaLoaded = true
  } catch (e) {
    console.error('[Map] Failed to load china map:', e)
  }
}

// ═══════════════════════════════════════════════════════
// 3. 图表实例管理 & 配置构建
// ═══════════════════════════════════════════════════════

let chartInstance = null
let lastTheme = null
let resizeBound = false
let currentMapName = 'china'

// ── 地图缓存 ──
const mapCache = new Set(['china'])

async function ensureMap(cityName, adcodes) {
  if (!cityName || cityName === '全国') {
    currentMapName = 'china'
    return
  }

  const adcode = adcodes[cityName]
  if (!adcode) {
    currentMapName = 'china'
    return
  }

  const mapKey = 'city_' + adcode
  if (currentMapName === mapKey) return

  if (mapCache.has(mapKey)) {
    currentMapName = mapKey
    return
  }

  try {
    const geoJson = await fetchJSON(`https://geo.datav.aliyun.com/areas_v3/bound/${adcode}_full.json`)
    echarts.registerMap(mapKey, geoJson)
    mapCache.add(mapKey)
    currentMapName = mapKey
  } catch (e) {
    console.error('[Map] Failed to load GeoJSON for', cityName, e)
    currentMapName = 'china'
  }
}

// ═══════════════════════════════════════════════════════
// 4. 导出方法（renderjs → Vue 通信）
// ═══════════════════════════════════════════════════════

export default {
  methods: {
    async onDataChange(newValue, oldValue, ownerInstance, instance) {
      if (!newValue || !newValue.city) return

      await loadChinaMap()
      await ensureMap(newValue.city, newValue.adcodes)

      // 确保 DOM 已就绪（APP 端可能有延迟）
      const tryInit = (retries) => {
        const dom = document.getElementById(newValue.chartId)
        if (dom) {
          this.initChart(newValue, ownerInstance)
        } else if (retries > 0) {
          setTimeout(() => tryInit(retries - 1), 100)
        }
      }
      tryInit(5)
    },

    initChart(data, ownerInstance) {
      const dom = document.getElementById(data.chartId)
      if (!dom) return

      const option = this.buildOption(data)

      // 判断是否需要重建：首次创建、主题变化、geo 地图变化
      let needsRebuild = !chartInstance
      if (chartInstance) {
        const prevOption = chartInstance.getOption()
        const geoMapChanged = prevOption && prevOption.geo && prevOption.geo[0] && prevOption.geo[0].map !== option.geo.map
        const themeChanged = lastTheme && data.theme !== lastTheme
        needsRebuild = geoMapChanged || themeChanged
      }

      if (needsRebuild) {
        if (chartInstance) chartInstance.dispose()
        chartInstance = echarts.init(dom, null, { renderer: 'canvas' })
        if (!resizeBound) {
          resizeBound = true
          let resizeTimer = null
          window.addEventListener('resize', () => {
            if (resizeTimer) clearTimeout(resizeTimer)
            resizeTimer = setTimeout(() => {
              if (chartInstance) chartInstance.resize()
            }, 150)
          })
        }
      }

      lastTheme = data.theme
      chartInstance.setOption(option, true)

      chartInstance.off('click')
      chartInstance.on('click', (params) => {
        if (params.componentType === 'series' && params.data && params.data.shopId) {
          ownerInstance.callMethod('onMarkerTap', params.data.shopId)
        }
      })
    },

    buildOption(data) {
      const { city, shops } = data
      const adcodes = data.adcodes || {}
      const isCity = !!adcodes[city] && city !== '全国'
      const theme = data.theme || document.documentElement.getAttribute('data-theme') || 'dark'
      const isLight = theme === 'light'

      // Scatter data
      const scatterData = shops
        .filter(s => s.lng != null && s.lat != null)
        .map(s => ({
          name: s.name,
          value: [s.lng, s.lat, s.bestScore || 1],
          shopId: s.id,
          bestScore: s.bestScore || 0,
          count: s.count || 0,
          category: s.category || ''
        }))

      const challengedData = scatterData.filter(d => d.count > 0)
      const unchallengedData = scatterData.filter(d => d.count === 0)

      const series = []

      // Challenged: effectScatter with bubble label
      series.push({
          type: 'effectScatter',
          coordinateSystem: 'geo',
          data: challengedData,
          symbolSize: 10,
          showEffectOn: 'render',
          rippleEffect: {
            brushType: 'stroke',
            scale: 3,
            period: 3.5,
            number: 2
          },
          label: {
            show: true,
            formatter: (p) => {
              const name = p.data.name.length > 6 ? p.data.name.slice(0, 6) + '…' : p.data.name
              return `{name|${name}}\n{arrow|▼}`
            },
            position: 'top',
            distance: 10,
            rich: {
              name: {
                color: isLight ? '#181820' : '#F0F0F5',
                fontSize: 11,
                fontWeight: 600,
                fontFamily: 'Manrope, Noto Sans SC, sans-serif',
                backgroundColor: isLight ? '#FFFFFF' : 'rgba(26, 26, 46, 0.95)',
                borderColor: isLight ? 'rgba(217, 79, 30, 0.4)' : 'rgba(255, 107, 53, 0.5)',
                borderWidth: 1.5,
                borderRadius: 6,
                padding: [6, 10, 4, 10],
                shadowColor: isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.4)',
                shadowBlur: 8,
                shadowOffsetY: 2
              },
              arrow: {
                color: isLight ? 'rgba(217, 79, 30, 0.4)' : 'rgba(255, 107, 53, 0.5)',
                fontSize: 10,
                padding: [-4, 0, 0, 0]
              }
            }
          },
          itemStyle: {
            color: {
              type: 'radial',
              x: 0.5, y: 0.5, r: 0.5,
              colorStops: isLight ? [
                { offset: 0, color: '#F06830' },
                { offset: 0.7, color: '#D94F1E' },
                { offset: 1, color: 'rgba(217, 79, 30, 0.7)' }
              ] : [
                { offset: 0, color: '#FF8F60' },
                { offset: 0.7, color: '#FF6B35' },
                { offset: 1, color: 'rgba(255, 107, 53, 0.6)' }
              ]
            },
            shadowColor: isLight ? 'rgba(217, 79, 30, 0.35)' : 'rgba(255, 107, 53, 0.5)',
            shadowBlur: 12
          },
          zlevel: 2
        })

      // Unchallenged: subtle bubble label
      series.push({
          type: 'scatter',
          coordinateSystem: 'geo',
          data: unchallengedData,
          symbolSize: 7,
          label: {
            show: true,
            formatter: (p) => {
              const name = p.data.name.length > 6 ? p.data.name.slice(0, 6) + '…' : p.data.name
              return `{name|${name}}\n{arrow|▼}`
            },
            position: 'top',
            distance: 10,
            rich: {
              name: {
                color: isLight ? 'rgba(24, 24, 32, 0.6)' : 'rgba(240, 240, 245, 0.5)',
                fontSize: 10,
                fontWeight: 500,
                fontFamily: 'Manrope, Noto Sans SC, sans-serif',
                backgroundColor: isLight ? 'rgba(255, 255, 255, 0.7)' : 'rgba(26, 26, 46, 0.6)',
                borderColor: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                borderRadius: 5,
                padding: [4, 8, 3, 8],
                shadowColor: 'transparent',
                shadowBlur: 0
              },
              arrow: {
                color: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)',
                fontSize: 8,
                padding: [-3, 0, 0, 0]
              }
            }
          },
          itemStyle: {
            color: isLight ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.2)',
            shadowColor: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)',
            shadowBlur: 4
          },
          zlevel: 1
        })

      return {
        backgroundColor: 'transparent',
        geo: {
          map: currentMapName,
          roam: true,
          scaleLimit: { min: 0.5, max: 12 },
          selectedMode: false,
          label: {
            show: isCity,
            color: isLight ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.12)',
            fontSize: 11
          },
          emphasis: {
            disabled: true
          },
          itemStyle: {
            areaColor: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: isLight ? [
                { offset: 0, color: '#E8E5E0' },
                { offset: 1, color: '#DDD9D3' }
              ] : [
                { offset: 0, color: '#181828' },
                { offset: 1, color: '#10101A' }
              ]
            },
            borderColor: isLight ? 'rgba(217, 79, 30, 0.15)' : 'rgba(255, 107, 53, 0.2)',
            borderWidth: 1.5,
            shadowColor: isLight ? 'rgba(217, 79, 30, 0.06)' : 'rgba(255, 107, 53, 0.1)',
            shadowBlur: 12
          },
          select: {
            disabled: true
          },
          // Highlight selected city area when viewing whole country
          ...(!isCity ? {
            regions: data.shops.length > 0 ? [{
              name: adcodes[data.city] ? data.city : '',
              itemStyle: {
                areaColor: {
                  type: 'linear',
                  x: 0, y: 0, x2: 0, y2: 1,
                  colorStops: isLight ? [
                    { offset: 0, color: 'rgba(217, 79, 30, 0.06)' },
                    { offset: 1, color: 'rgba(217, 79, 30, 0.02)' }
                  ] : [
                    { offset: 0, color: 'rgba(255, 107, 53, 0.08)' },
                    { offset: 1, color: 'rgba(255, 107, 53, 0.02)' }
                  ]
                },
                borderColor: isLight ? 'rgba(217, 79, 30, 0.3)' : 'rgba(255, 107, 53, 0.4)',
                borderWidth: 2,
                shadowColor: isLight ? 'rgba(217, 79, 30, 0.12)' : 'rgba(255, 107, 53, 0.2)',
                shadowBlur: 20
              }
            }] : []
          } : {})
        },
        animation: true,
        animationDuration: 1000,
        animationEasing: 'cubicOut',
        animationDelay: (idx) => idx * 50,
        series
      }
    }
  }
}
</script>

<script setup>
import { ref, computed, watch } from 'vue'
import { CITY_ADCODES } from '@/utils/map-adcodes.js'
import { useTheme } from '@/composables/useTheme.js'

const props = defineProps({
  shops: { type: Array, default: () => [] },
  records: { type: Array, default: () => [] },
  city: { type: String, default: '北京' }
})

const emit = defineEmits(['markerTap'])

const chartId = 'mapChart-' + Date.now()
const { theme } = useTheme()
const currentTheme = theme
const themeVersion = ref(0)

watch(theme, () => {
  themeVersion.value++
})

const enrichedShops = computed(() => {
  const completed = props.records.filter(r => r.status === '已完成')
  const statsMap = {}
  completed.forEach(r => {
    if (!statsMap[r.shopId]) statsMap[r.shopId] = { bestScore: 0, count: 0 }
    statsMap[r.shopId].count++
    if (r.score > statsMap[r.shopId].bestScore) statsMap[r.shopId].bestScore = r.score
  })
  return props.shops.map(s => ({
    ...s,
    _bestScore: statsMap[s.id]?.bestScore || 0,
    _count: statsMap[s.id]?.count || 0
  }))
})

const chartData = computed(() => {
  let list = enrichedShops.value
  if (props.city !== '全国') {
    const normalizedCity = props.city.replace(/市$/, '')
    list = list.filter(s => {
      const shopCity = (s.city || '').replace(/市$/, '')
      return shopCity === normalizedCity
    })
  }
  return {
    chartId,
    city: props.city,
    theme: currentTheme.value,
    adcodes: CITY_ADCODES,
    // themeVersion 变化强制产生新对象引用，触发 renderjs onDataChange
    _tv: themeVersion.value,
    shops: list.map(s => ({
      id: s.id,
      name: s.name,
      category: s.category,
      lng: s.location?.longitude,
      lat: s.location?.latitude,
      bestScore: s._bestScore,
      count: s._count
    }))
  }
})

const unlocatedChallenged = computed(() => {
  let list = enrichedShops.value
  if (props.city !== '全国') {
    const normalizedCity = props.city.replace(/市$/, '')
    list = list.filter(s => {
      const shopCity = (s.city || '').replace(/市$/, '')
      return shopCity === normalizedCity
    })
  }
  return list.filter(s => s._count > 0 && (!s.location || !s.location.latitude))
})

function onMarkerTap(shopId) {
  emit('markerTap', shopId)
}
</script>

<style lang="scss" scoped>
.map-viz {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.chart-wrap {
  width: 100%;
  border-radius: $radius-xl;
  overflow: hidden;
}

.chart-dom {
  width: 100%;
  height: 900rpx;
}

/* ── Legend ── */
.legend {
  display: flex;
  gap: 40rpx;
  justify-content: center;
  padding: 12rpx 0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.legend-bubble {
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  border-width: 2rpx;
  border-style: solid;
}

.legend-bubble--challenged {
  background: var(--c-surface-1, $surface-1);
  border-color: var(--c-border-active);
  box-shadow: 0 2rpx 8rpx var(--c-glow-accent);
}

.legend-bubble--unchallenged {
  background: var(--c-surface-3, $glass-white-3);
  border-color: var(--c-border-light, $hairline-subtle);
}

.legend-bubble-text {
  font-size: 18rpx;
  color: var(--c-text-primary, $text-primary);
  font-weight: 500;
}

.legend-arrow {
  width: 0;
  height: 0;
  border-left: 6rpx solid transparent;
  border-right: 6rpx solid transparent;
  border-top: 8rpx solid;
  margin-top: -2rpx;
}

.legend-arrow--challenged {
  border-top-color: var(--c-border-active);
}

.legend-arrow--unchallenged {
  border-top-color: var(--c-border-light, $hairline-subtle);
}

.legend-label {
  font-size: 20rpx;
  color: var(--c-text-muted, $text-muted);
  letter-spacing: $tracking-wide;
  margin-left: 4rpx;
}

/* ── Unlocated Shops ── */
.unlocated {
  margin-top: 4rpx;
  padding: 18rpx 22rpx;
  background: var(--c-accent-soft, $glow-orange-soft);
  border: 1rpx solid var(--c-accent-soft);
  border-radius: $radius-lg;
}

.unlocated-title {
  font-size: 22rpx;
  color: var(--c-accent, $accent-orange);
  font-weight: 500;
  margin-bottom: 12rpx;
  display: block;
  letter-spacing: $tracking-wide;
}

.unlocated-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10rpx 0;
}

.unlocated-name {
  font-size: 24rpx;
  color: var(--c-text-primary, $text-primary);
}

.unlocated-score {
  font-size: 22rpx;
  color: var(--c-gold, $accent-gold);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
</style>
