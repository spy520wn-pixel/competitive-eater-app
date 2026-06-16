import { ref } from 'vue'

const SETTINGS_KEY = 'eater_settings'

const defaultSettings = {
  defaultCity: '',
  mapRange: '城市',
  countdownWarning: true,
  countdownWarningMinutes: 10,
  longPressInput: true,
  aiServiceUrl: '',
  aiApiKey: '',
  aiModel: 'gpt-4o-mini',
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
      return { ...defaultSettings, ...(uni.getStorageSync(SETTINGS_KEY) || {}) }
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
