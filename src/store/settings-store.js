import { ref } from 'vue'

const SETTINGS_KEY = 'eater_settings'

const defaultSettings = {
  defaultCity: '',
  mapRange: '城市',
  countdownWarning: true,
  countdownWarningMinutes: 10,
  longPressInput: true,
  // 识图大模型
  ocrServiceUrl: 'https://apihub.agnes-ai.com/v1/chat/completions',
  ocrApiKey: '',
  ocrModel: 'agnes-2.0-flash',
  // 生图大模型
  aiServiceUrl: 'https://apihub.agnes-ai.com/v1/images/generations',
  aiApiKey: '',
  aiModel: 'agnes-image-2.0-flash',
  // 视频大模型
  videoServiceUrl: 'https://apihub.agnes-ai.com/v1/videos',
  videoApiKey: '',
  videoModel: 'agnes-video-v2.0',
  // 高德地图
  amapKey: '',
  theme: 'dark'
}

// 全局响应式主题，供所有组件监听
export const currentTheme = ref('dark')

// 初始化：从 storage 读取
try {
  const s = uni.getStorageSync(SETTINGS_KEY) || {}
  currentTheme.value = s.theme || 'dark'
} catch (e) { /* ignore */ }

// uni.showModal 确认按钮颜色（原生 API 不支持 CSS 变量，需 JS 解析）
export function getConfirmColor() {
  return currentTheme.value === 'light' ? '#D94F1E' : '#FF6B35'
}

export function getDangerColor() {
  return currentTheme.value === 'light' ? '#CC2D20' : '#FF3B30'
}

let _cache = null
let _migrationDone = false

export const settingsStore = {
  get() {
    if (_cache) return _cache
    try {
      const stored = uni.getStorageSync(SETTINGS_KEY) || {}
      // 迁移：仅首次执行
      if (!_migrationDone && !stored.ocrServiceUrl && stored.aiServiceUrl !== undefined) {
        stored.ocrServiceUrl = defaultSettings.ocrServiceUrl
        stored.ocrApiKey = defaultSettings.ocrApiKey
        stored.ocrModel = defaultSettings.ocrModel
        stored.aiServiceUrl = defaultSettings.aiServiceUrl
        stored.aiApiKey = defaultSettings.aiApiKey
        stored.aiModel = defaultSettings.aiModel
        stored.videoServiceUrl = defaultSettings.videoServiceUrl
        stored.videoApiKey = defaultSettings.videoApiKey
        stored.videoModel = defaultSettings.videoModel
        stored.amapKey = stored.amapKey || defaultSettings.amapKey
        try { uni.setStorageSync(SETTINGS_KEY, stored) } catch (e) { /* ignore */ }
      }
      _migrationDone = true
      _cache = { ...defaultSettings, ...stored }
      return _cache
    } catch {
      _cache = { ...defaultSettings }
      return _cache
    }
  },

  update(updates) {
    const current = { ...this.get() }
    const merged = { ...current, ...updates }
    uni.setStorageSync(SETTINGS_KEY, merged)
    _cache = merged
    if (updates.theme !== undefined) {
      currentTheme.value = updates.theme
    }
  },

  reset() {
    const defaults = { ...defaultSettings }
    uni.setStorageSync(SETTINGS_KEY, defaults)
    _cache = defaults
    currentTheme.value = defaultSettings.theme
  }
}
