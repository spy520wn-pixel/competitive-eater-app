import { settingsStore } from '@/store/settings-store.js'

export function applyNavigationBarTheme() {
  try {
    const settings = settingsStore.get()
    const isLight = settings.theme === 'light'

    const p = uni.setNavigationBarColor({
      frontColor: isLight ? '#000000' : '#ffffff',
      backgroundColor: isLight ? '#F4F1EC' : '#0A0A12'
    })
    if (p && p.catch) p.catch(() => {})
  } catch (e) {
    // 忽略页面未找到的错误
  }
}
