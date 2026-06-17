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
  ocrApiKey: 'sk-dm2wMzpI3zhFLhb2bDW2wEtF4lu95fVYQWj4jHQi1vhUqXbK',
  ocrModel: 'agnes-2.0-flash',
  // 生图大模型
  aiServiceUrl: 'https://apihub.agnes-ai.com/v1/images/generations',
  aiApiKey: 'sk-dm2wMzpI3zhFLhb2bDW2wEtF4lu95fVYQWj4jHQi1vhUqXbK',
  aiModel: 'agnes-image-2.0-flash',
  // 视频大模型
  videoServiceUrl: 'https://apihub.agnes-ai.com/v1/videos',
  videoApiKey: 'sk-dm2wMzpI3zhFLhb2bDW2wEtF4lu95fVYQWj4jHQi1vhUqXbK',
  videoModel: 'agnes-video-v2.0',
  // 高德地图
  amapKey: 'cc91515d50ab91e20bc1ac6c8ca69600',
  theme: 'dark'
}

// 全局响应式主题，供所有组件监听
export const currentTheme = ref('dark')

// 初始化：从 storage 读取
try {
  const s = uni.getStorageSync(SETTINGS_KEY) || {}
  currentTheme.value = s.theme || 'dark'
} catch (e) { /* ignore */ }

export const settingsStore = {
  get() {
    try {
      const stored = uni.getStorageSync(SETTINGS_KEY) || {}
      // 迁移：如果存储中没有 ocrServiceUrl（新字段），说明是旧版配置，需要用新默认值覆盖 AI 系列
      if (!stored.ocrServiceUrl && stored.aiServiceUrl !== undefined) {
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
        // 写回 storage
        try { uni.setStorageSync(SETTINGS_KEY, stored) } catch (e) { /* ignore */ }
      }
      return { ...defaultSettings, ...stored }
    } catch {
      return { ...defaultSettings }
    }
  },

  update(updates) {
    const current = this.get()
    const merged = { ...current, ...updates }
    uni.setStorageSync(SETTINGS_KEY, merged)
    // 同步响应式变量
    if (updates.theme !== undefined) {
      currentTheme.value = updates.theme
    }
  },

  reset() {
    uni.setStorageSync(SETTINGS_KEY, { ...defaultSettings })
    currentTheme.value = defaultSettings.theme
  }
}
