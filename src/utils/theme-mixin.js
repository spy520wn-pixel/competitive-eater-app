// 主题 mixin - 用于页面级别的主题切换
// 在 APP 端，通过动态修改 CSS 变量来实现主题切换

import { settingsStore } from '../store/settings-store'

// 浅色主题 CSS 变量值
const LIGHT_VARS = {
  '--c-bg': '#F4F1EC',
  '--c-bg-elevated': '#FAF8F5',
  '--c-surface-0': '#FFFFFF',
  '--c-surface-1': '#FAF8F5',
  '--c-surface-2': '#F0EDEA',
  '--c-surface-3': 'rgba(0, 0, 0, 0.03)',
  '--c-surface-4': 'rgba(0, 0, 0, 0.04)',
  '--c-surface-5': 'rgba(0, 0, 0, 0.05)',
  '--c-surface-6': 'rgba(0, 0, 0, 0.06)',
  '--c-surface-8': 'rgba(0, 0, 0, 0.08)',
  '--c-surface-10': 'rgba(0, 0, 0, 0.10)',
  '--c-surface-12': 'rgba(0, 0, 0, 0.12)',
  '--c-surface-15': 'rgba(0, 0, 0, 0.15)',
  '--c-text-primary': '#181820',
  '--c-text-secondary': '#3C3C54',
  '--c-text-tertiary': '#545468',
  '--c-text-muted': '#606078',
  '--c-text-ghost': '#8A8AA0',
  '--c-accent': '#D94F1E',
  '--c-accent-light': '#F06830',
  '--c-accent-deep': '#C04018',
  '--c-accent-soft': 'rgba(217, 79, 30, 0.06)',
  '--c-accent-glow': 'rgba(217, 79, 30, 0.08)',
  '--c-accent-glow-strong': 'rgba(217, 79, 30, 0.15)',
  '--c-gold': '#C08B10',
  '--c-gold-deep': '#A07508',
  '--c-gold-soft': 'rgba(192, 139, 16, 0.06)',
  '--c-gold-glow': 'rgba(192, 139, 16, 0.08)',
  '--c-gold-glow-strong': 'rgba(192, 139, 16, 0.15)',
  '--c-danger': '#CC2D20',
  '--c-danger-soft': 'rgba(204, 45, 32, 0.08)',
  '--c-emerald': '#16A36A',
  '--c-violet': '#7C3AED',
  '--c-border': 'rgba(0, 0, 0, 0.06)',
  '--c-border-light': 'rgba(0, 0, 0, 0.03)',
  '--c-border-subtle': 'rgba(0, 0, 0, 0.02)',
  '--c-border-active': 'rgba(217, 79, 30, 0.25)',
  '--c-card-bg': 'linear-gradient(165deg, #FFFFFF 0%, #FDFCFA 100%)',
  '--c-card-bg-elevated': 'linear-gradient(165deg, #FFFFFF 0%, #FFFFFF 100%)',
  '--c-card-shadow': '0 2rpx 8rpx rgba(0, 0, 0, 0.04), 0 8rpx 32rpx rgba(0, 0, 0, 0.06)',
  '--c-card-shadow-elevated': '0 4rpx 12rpx rgba(0, 0, 0, 0.05), 0 16rpx 48rpx rgba(0, 0, 0, 0.08)',
  '--c-glass': 'rgba(0, 0, 0, 0.02)',
  '--c-glass-strong': 'rgba(0, 0, 0, 0.04)',
  '--c-hairline': 'rgba(0, 0, 0, 0.05)',
  '--c-glow-accent': 'rgba(217, 79, 30, 0.08)',
  '--c-glow-gold': 'rgba(192, 139, 16, 0.06)',
  '--c-input-bg': 'rgba(0, 0, 0, 0.025)',
  '--c-input-border': 'rgba(0, 0, 0, 0.06)',
  '--c-overlay': 'rgba(0, 0, 0, 0.25)',
  '--c-inner-highlight': 'inset 0 1rpx 2rpx rgba(255, 255, 255, 0.8)',
  '--c-noise-opacity': '0.025',
  '--c-shadow-inner': 'inset 0 1rpx 2rpx rgba(0, 0, 0, 0.04)',
  '--c-shadow-sm': '0 1rpx 4rpx rgba(0, 0, 0, 0.06)',
  '--c-shadow-md': '0 4rpx 16rpx rgba(0, 0, 0, 0.08)',
  '--c-shadow-lg': '0 8rpx 32rpx rgba(0, 0, 0, 0.10)',
  '--c-shadow-xl': '0 12rpx 48rpx rgba(0, 0, 0, 0.12)',
  '--c-shadow-2xl': '0 24rpx 64rpx rgba(0, 0, 0, 0.16)'
}

// 深色主题 CSS 变量值
const DARK_VARS = {
  '--c-bg': '#030306',
  '--c-bg-elevated': '#0A0A14',
  '--c-surface-0': '#131320',
  '--c-surface-1': '#1A1A2E',
  '--c-surface-2': '#22223A',
  '--c-surface-3': 'rgba(255, 255, 255, 0.03)',
  '--c-surface-4': 'rgba(255, 255, 255, 0.04)',
  '--c-surface-5': 'rgba(255, 255, 255, 0.05)',
  '--c-surface-6': 'rgba(255, 255, 255, 0.06)',
  '--c-surface-8': 'rgba(255, 255, 255, 0.08)',
  '--c-surface-10': 'rgba(255, 255, 255, 0.10)',
  '--c-surface-12': 'rgba(255, 255, 255, 0.12)',
  '--c-surface-15': 'rgba(255, 255, 255, 0.15)',
  '--c-text-primary': '#F0F0F5',
  '--c-text-secondary': '#9E9EB8',
  '--c-text-tertiary': '#6B6B85',
  '--c-text-muted': '#7575A0',
  '--c-text-ghost': '#4A4A68',
  '--c-accent': '#FF6B35',
  '--c-accent-light': '#FF8F60',
  '--c-accent-deep': '#E85520',
  '--c-accent-soft': 'rgba(255, 107, 53, 0.06)',
  '--c-accent-glow': 'rgba(255, 107, 53, 0.12)',
  '--c-accent-glow-strong': 'rgba(255, 107, 53, 0.25)',
  '--c-gold': '#FFD700',
  '--c-gold-deep': '#D4A017',
  '--c-gold-soft': 'rgba(255, 215, 0, 0.05)',
  '--c-gold-glow': 'rgba(255, 215, 0, 0.10)',
  '--c-gold-glow-strong': 'rgba(255, 215, 0, 0.20)',
  '--c-danger': '#FF3B30',
  '--c-danger-soft': 'rgba(255, 59, 48, 0.08)',
  '--c-emerald': '#34D399',
  '--c-violet': '#8B5CF6',
  '--c-border': 'rgba(255, 255, 255, 0.10)',
  '--c-border-light': 'rgba(255, 255, 255, 0.05)',
  '--c-border-subtle': 'rgba(255, 255, 255, 0.03)',
  '--c-border-active': 'rgba(255, 107, 53, 0.35)',
  '--c-card-bg': 'linear-gradient(165deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.02) 100%)',
  '--c-card-bg-elevated': 'linear-gradient(165deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.04) 100%)',
  '--c-card-shadow': '0 12rpx 48rpx rgba(0, 0, 0, 0.6), 0 4rpx 16rpx rgba(0, 0, 0, 0.35)',
  '--c-card-shadow-elevated': '0 20rpx 64rpx rgba(0, 0, 0, 0.65), 0 8rpx 24rpx rgba(0, 0, 0, 0.4)',
  '--c-glass': 'rgba(255, 255, 255, 0.04)',
  '--c-glass-strong': 'rgba(255, 255, 255, 0.08)',
  '--c-hairline': 'rgba(255, 255, 255, 0.06)',
  '--c-glow-accent': 'rgba(255, 107, 53, 0.15)',
  '--c-glow-gold': 'rgba(255, 215, 0, 0.10)',
  '--c-input-bg': 'rgba(255, 255, 255, 0.04)',
  '--c-input-border': 'rgba(255, 255, 255, 0.08)',
  '--c-overlay': 'rgba(0, 0, 0, 0.65)',
  '--c-inner-highlight': 'inset 0 1rpx 1rpx rgba(255, 255, 255, 0.08)',
  '--c-noise-opacity': '0.02',
  '--c-shadow-inner': 'inset 0 1rpx 2rpx rgba(255, 255, 255, 0.06)',
  '--c-shadow-sm': '0 2rpx 8rpx rgba(0, 0, 0, 0.35), 0 1rpx 2rpx rgba(0, 0, 0, 0.15)',
  '--c-shadow-md': '0 4rpx 20rpx rgba(0, 0, 0, 0.4), 0 2rpx 6rpx rgba(0, 0, 0, 0.2)',
  '--c-shadow-lg': '0 8rpx 36rpx rgba(0, 0, 0, 0.45), 0 4rpx 10rpx rgba(0, 0, 0, 0.25)',
  '--c-shadow-xl': '0 16rpx 56rpx rgba(0, 0, 0, 0.5), 0 8rpx 20rpx rgba(0, 0, 0, 0.3)',
  '--c-shadow-2xl': '0 24rpx 80rpx rgba(0, 0, 0, 0.55), 0 12rpx 28rpx rgba(0, 0, 0, 0.35)'
}

// 应用主题到页面
export function applyThemeToPage(pageEl, theme) {
  if (!pageEl) return

  const vars = theme === 'light' ? LIGHT_VARS : DARK_VARS
  const root = pageEl.$el || pageEl

  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}

// 获取当前主题
export function getCurrentTheme() {
  const settings = settingsStore.get()
  return settings.theme || 'dark'
}

// Vue 组合式 API 的主题 hook
export function useTheme() {
  const { ref, onMounted, onUnmounted } = require('vue')

  const theme = ref(getCurrentTheme())

  let themeChangeHandler = null

  onMounted(() => {
    themeChangeHandler = (newTheme) => {
      theme.value = newTheme
    }
    uni.$on('theme-change', themeChangeHandler)
  })

  onUnmounted(() => {
    if (themeChangeHandler) {
      uni.$off('theme-change', themeChangeHandler)
    }
  })

  return theme
}
