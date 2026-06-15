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
    uni.setStorageSync(SETTINGS_KEY, { ...current, ...updates })
  },

  reset() {
    uni.setStorageSync(SETTINGS_KEY, { ...defaultSettings })
  }
}
