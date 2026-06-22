import { ref, onMounted, onUnmounted } from 'vue'
import { settingsStore } from '@/store/settings-store.js'

const theme = ref('dark')

function updateFromStorage() {
  const settings = settingsStore.get()
  theme.value = settings.theme || 'dark'
}

function onThemeChange(newTheme) {
  theme.value = newTheme
}

export function useTheme() {
  onMounted(() => {
    updateFromStorage()
    uni.$on('theme-apply', onThemeChange)
    uni.$on('tabbar-theme-change', onThemeChange)
  })

  onUnmounted(() => {
    uni.$off('theme-apply', onThemeChange)
    uni.$off('tabbar-theme-change', onThemeChange)
  })

  return { theme }
}
