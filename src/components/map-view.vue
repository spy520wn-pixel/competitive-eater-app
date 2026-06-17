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
// ECharts 按需引入
import * as echarts from 'echarts/core'
import { MapChart } from 'echarts/charts'
import { EffectScatterChart, ScatterChart } from 'echarts/charts'
import { GeoComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 注册必要的组件
echarts.use([MapChart, EffectScatterChart, ScatterChart, GeoComponent, TooltipComponent, CanvasRenderer])

// 地图数据缓存
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

let chartInstance = null
let lastTheme = null
let resizeBound = false
let currentMapName = 'china'

// City-level adcodes (Aliyun DataV API)
const cityAdcodes = {
  // 直辖市
  '北京': 110000, '上海': 310000, '天津': 120000, '重庆': 500000,
  // 广东
  '广州': 440100, '深圳': 440300, '东莞': 441900, '佛山': 440600, '珠海': 440400,
  '中山': 442000, '惠州': 441300, '江门': 440700, '汕头': 440500, '湛江': 440800,
  '肇庆': 441200, '茂名': 440900, '揭阳': 445200, '梅州': 441400, '清远': 441800,
  '韶关': 440200, '河源': 441600, '潮州': 445100, '阳江': 441700, '云浮': 445300,
  // 浙江
  '杭州': 330100, '宁波': 330200, '温州': 330300, '嘉兴': 330400, '湖州': 330500,
  '绍兴': 330600, '金华': 330700, '台州': 331000, '衢州': 330800, '丽水': 331100, '舟山': 330900,
  // 江苏
  '南京': 320100, '苏州': 320500, '无锡': 320200, '常州': 320400, '南通': 320600,
  '徐州': 320300, '扬州': 321000, '盐城': 320900, '镇江': 321100, '泰州': 321200,
  '淮安': 320800, '连云港': 320700, '宿迁': 321300,
  // 山东
  '济南': 370100, '青岛': 370200, '烟台': 370600, '潍坊': 370700, '临沂': 371300,
  '济宁': 370800, '淄博': 370300, '威海': 371000, '德州': 371400, '聊城': 371500,
  '泰安': 370900, '菏泽': 371700, '枣庄': 370400, '日照': 371100, '滨州': 371600, '东营': 370500,
  // 四川
  '成都': 510100, '绵阳': 510700, '德阳': 510600, '宜宾': 511500, '南充': 511300,
  '泸州': 510500, '达州': 511700, '乐山': 511100, '眉山': 511400, '遂宁': 510900,
  '内江': 511000, '广安': 511600, '自贡': 510300, '攀枝花': 510400, '广元': 510800,
  '雅安': 511800, '巴中': 511900, '资阳': 512000,
  // 湖北
  '武汉': 420100, '宜昌': 420500, '襄阳': 420600, '荆州': 421000, '黄冈': 421100,
  '十堰': 420300, '孝感': 420900, '荆门': 420800, '鄂州': 420700, '黄石': 420200,
  '咸宁': 421200, '随州': 421300, '恩施': 422800,
  // 湖南
  '长沙': 430100, '岳阳': 430600, '常德': 430700, '衡阳': 430400, '株洲': 430200,
  '湘潭': 430300, '邵阳': 430500, '益阳': 430900, '郴州': 431000, '永州': 431100,
  '怀化': 431200, '娄底': 431300, '张家界': 430800, '湘西': 433100,
  // 河南
  '郑州': 410100, '洛阳': 410300, '南阳': 411300, '许昌': 411000, '新乡': 410700,
  '周口': 411600, '商丘': 411400, '信阳': 411500, '驻马店': 411700, '焦作': 410800,
  '平顶山': 410400, '安阳': 410500, '开封': 410200, '濮阳': 410900, '鹤壁': 410600,
  '漯河': 411100, '三门峡': 411200,
  // 河北
  '石家庄': 130100, '唐山': 130200, '保定': 130600, '邯郸': 130400, '沧州': 130900,
  '廊坊': 131000, '邢台': 130500, '衡水': 131100, '秦皇岛': 130300, '张家口': 130700, '承德': 130800,
  // 福建
  '福州': 350100, '厦门': 350200, '泉州': 350500, '漳州': 350600, '龙岩': 350800,
  '莆田': 350300, '三明': 350400, '南平': 350700, '宁德': 350900,
  // 安徽
  '合肥': 340100, '芜湖': 340200, '蚌埠': 340300, '阜阳': 341200, '安庆': 340800,
  '六安': 341500, '马鞍山': 340500, '淮南': 340400, '淮北': 340600, '铜陵': 340700,
  '宣城': 341800, '池州': 341700, '黄山': 341000, '滁州': 341100, '亳州': 341600, '宿州': 341300,
  // 辽宁
  '沈阳': 210100, '大连': 210200, '鞍山': 210300, '抚顺': 210400, '本溪': 210500,
  '丹东': 210600, '锦州': 210700, '营口': 210800, '阜新': 210900, '辽阳': 211000,
  '盘锦': 211100, '铁岭': 211200, '朝阳': 211300, '葫芦岛': 211400,
  // 江西
  '南昌': 360100, '赣州': 360700, '九江': 360400, '上饶': 361100, '抚州': 361000,
  '宜春': 360900, '吉安': 360800, '萍乡': 360300, '景德镇': 360200, '新余': 360500, '鹰潭': 360600,
  // 陕西
  '西安': 610100, '咸阳': 610400, '宝鸡': 610300, '渭南': 610500, '汉中': 610700,
  '延安': 610600, '安康': 610900, '榆林': 610800, '商洛': 611000, '铜川': 610200,
  // 广西
  '南宁': 450100, '柳州': 450200, '桂林': 450300, '玉林': 450900, '梧州': 450400,
  '贵港': 450800, '百色': 451000, '河池': 451200, '钦州': 450700, '北海': 450500,
  '防城港': 450600, '崇左': 451400, '来宾': 451300, '贺州': 451100,
  // 云南
  '昆明': 530100, '曲靖': 530300, '大理': 532900, '玉溪': 530400, '红河': 532500,
  '昭通': 530600, '楚雄': 532300, '文山': 532600, '保山': 530500, '普洱': 530800,
  '丽江': 530700, '临沧': 530900,
  // 贵州
  '贵阳': 520100, '遵义': 520300, '毕节': 520500, '黔南': 522700, '黔东南': 522600,
  '铜仁': 520600, '六盘水': 520200, '黔西南': 522300, '安顺': 520400,
  // 山西
  '太原': 140100, '大同': 140200, '临汾': 141000, '运城': 140800, '长治': 140400,
  '晋城': 140500, '忻州': 140900, '晋中': 140700, '朔州': 140600, '阳泉': 140300, '吕梁': 141100,
  // 吉林
  '长春': 220100, '吉林': 220200, '四平': 220300, '通化': 220500, '松原': 220700,
  '延边': 222400, '白城': 220800, '白山': 220600, '辽源': 220400,
  // 黑龙江
  '哈尔滨': 230100, '大庆': 230600, '齐齐哈尔': 230200, '牡丹江': 231000, '绥化': 231200,
  '佳木斯': 230800, '鸡西': 230300, '双鸭山': 230500, '鹤岗': 230400, '黑河': 231100,
  '伊春': 230700, '七台河': 230900, '大兴安岭': 232700,
  // 甘肃
  '兰州': 620100, '天水': 620500, '酒泉': 620900, '庆阳': 621000, '平凉': 620800,
  '白银': 620400, '武威': 620600, '张掖': 620700, '定西': 621100, '陇南': 621200,
  '嘉峪关': 620200, '金昌': 620300, '临夏': 622900, '甘南': 623000,
  // 内蒙古
  '呼和浩特': 150100, '包头': 150200, '鄂尔多斯': 150600, '赤峰': 150400, '通辽': 150500,
  '呼伦贝尔': 150700, '乌兰察布': 150900, '巴彦淖尔': 150800, '乌海': 150300,
  '兴安盟': 152200, '锡林郭勒盟': 152500, '阿拉善盟': 152900,
  // 新疆
  '乌鲁木齐': 650100, '昌吉': 652300, '伊犁': 654000, '阿克苏': 652900, '喀什': 653100,
  '巴音郭楞': 652800, '哈密': 652200, '吐鲁番': 652100, '和田': 653200, '塔城': 654200,
  '阿勒泰': 654300, '克拉玛依': 650200, '博尔塔拉': 652700, '克孜勒苏': 653000,
  // 海南
  '海口': 460100, '三亚': 460200, '儋州': 460400, '琼海': 469002, '万宁': 469006, '文昌': 469005,
  // 宁夏
  '银川': 640100, '石嘴山': 640200, '吴忠': 640300, '固原': 640400, '中卫': 640500,
  // 青海
  '西宁': 630100, '海东': 630200, '海西': 632800, '海北': 632200, '海南州': 632500,
  '黄南': 632300, '果洛': 632600, '玉树': 632700,
  // 西藏
  '拉萨': 540100, '日喀则': 540200, '林芝': 540400, '昌都': 540300, '山南': 540500,
  '那曲': 540600, '阿里': 542500
}

// Cache loaded maps (内存缓存)
const mapCache = new Set(['china'])

async function ensureMap(cityName) {
  if (!cityName || cityName === '全国') {
    currentMapName = 'china'
    return
  }

  const adcode = cityAdcodes[cityName]
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

export default {
  methods: {
    async onDataChange(newValue, oldValue, ownerInstance, instance) {
      if (!newValue || !newValue.city) return

      await loadChinaMap()
      await ensureMap(newValue.city)

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
      const isCity = !!cityAdcodes[city] && city !== '全国'
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
              name: cityAdcodes[data.city] ? data.city : '',
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
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  shops: { type: Array, default: () => [] },
  records: { type: Array, default: () => [] },
  city: { type: String, default: '北京' }
})

const emit = defineEmits(['markerTap'])

const chartId = 'mapChart-' + Date.now()
const currentTheme = ref('dark')
const themeVersion = ref(0)

function onThemeChange(theme) {
  currentTheme.value = theme
  themeVersion.value++
}

function readThemeFromStorage() {
  try {
    var s = uni.getStorageSync('eater_settings') || {}
    currentTheme.value = s.theme || 'dark'
  } catch (e) {}
}

onMounted(() => {
  readThemeFromStorage()
  uni.$on('tabbar-theme-change', onThemeChange)
  uni.$on('theme-apply', onThemeChange)
})

onUnmounted(() => {
  uni.$off('tabbar-theme-change', onThemeChange)
  uni.$off('theme-apply', onThemeChange)
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
  border-color: rgba(255, 107, 53, 0.5);
  box-shadow: 0 2rpx 8rpx rgba(255, 107, 53, 0.15);
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
  border-top-color: rgba(255, 107, 53, 0.5);
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
  border: 1rpx solid rgba(255, 107, 53, 0.10);
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
