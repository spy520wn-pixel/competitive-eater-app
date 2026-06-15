<script setup>
import { onLaunch } from '@dcloudio/uni-app'
import { settingsStore } from '@/store/settings-store.js'
import { listenForCrossWebviewThemeChange } from '@/utils/apply-page-theme.js'

// 浅色主题 CSS 变量（使用单一选择器避免重复）
const LIGHT_THEME_CSS = `
:root, page {
  --c-bg: #F4F1EC;
  --c-bg-elevated: #FAF8F5;
  --c-surface-0: #FFFFFF;
  --c-surface-1: #FAF8F5;
  --c-surface-2: #F0EDEA;
  --c-surface-3: rgba(0, 0, 0, 0.03);
  --c-surface-4: rgba(0, 0, 0, 0.04);
  --c-surface-5: rgba(0, 0, 0, 0.05);
  --c-surface-6: rgba(0, 0, 0, 0.06);
  --c-surface-8: rgba(0, 0, 0, 0.08);
  --c-surface-10: rgba(0, 0, 0, 0.10);
  --c-surface-12: rgba(0, 0, 0, 0.12);
  --c-surface-15: rgba(0, 0, 0, 0.15);
  --c-text-primary: #181820;
  --c-text-secondary: #3C3C54;
  --c-text-tertiary: #545468;
  --c-text-muted: #606078;
  --c-text-ghost: #8A8AA0;
  --c-accent: #D94F1E;
  --c-accent-light: #F06830;
  --c-accent-deep: #C04018;
  --c-accent-soft: rgba(217, 79, 30, 0.06);
  --c-accent-glow: rgba(217, 79, 30, 0.08);
  --c-accent-glow-strong: rgba(217, 79, 30, 0.15);
  --c-gold: #C08B10;
  --c-gold-deep: #A07508;
  --c-gold-soft: rgba(192, 139, 16, 0.06);
  --c-gold-glow: rgba(192, 139, 16, 0.08);
  --c-gold-glow-strong: rgba(192, 139, 16, 0.15);
  --c-danger: #CC2D20;
  --c-danger-soft: rgba(204, 45, 32, 0.08);
  --c-emerald: #16A36A;
  --c-violet: #7C3AED;
  --c-border: rgba(0, 0, 0, 0.06);
  --c-border-light: rgba(0, 0, 0, 0.03);
  --c-border-subtle: rgba(0, 0, 0, 0.02);
  --c-border-active: rgba(217, 79, 30, 0.25);
  --c-card-bg: linear-gradient(165deg, #FFFFFF 0%, #FDFCFA 100%);
  --c-card-bg-elevated: linear-gradient(165deg, #FFFFFF 0%, #FFFFFF 100%);
  --c-card-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04), 0 8rpx 32rpx rgba(0, 0, 0, 0.06);
  --c-card-shadow-elevated: 0 4rpx 12rpx rgba(0, 0, 0, 0.05), 0 16rpx 48rpx rgba(0, 0, 0, 0.08);
  --c-glass: rgba(0, 0, 0, 0.02);
  --c-glass-strong: rgba(0, 0, 0, 0.04);
  --c-hairline: rgba(0, 0, 0, 0.05);
  --c-glow-accent: rgba(217, 79, 30, 0.08);
  --c-glow-gold: rgba(192, 139, 16, 0.06);
  --c-input-bg: rgba(0, 0, 0, 0.025);
  --c-input-border: rgba(0, 0, 0, 0.06);
  --c-overlay: rgba(0, 0, 0, 0.25);
  --c-inner-highlight: inset 0 1rpx 2rpx rgba(255, 255, 255, 0.8);
  --c-noise-opacity: 0.025;
  --c-shadow-inner: inset 0 1rpx 2rpx rgba(0, 0, 0, 0.04);
  --c-shadow-sm: 0 1rpx 4rpx rgba(0, 0, 0, 0.06);
  --c-shadow-md: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  --c-shadow-lg: 0 8rpx 32rpx rgba(0, 0, 0, 0.10);
  --c-shadow-xl: 0 12rpx 48rpx rgba(0, 0, 0, 0.12);
  --c-shadow-2xl: 0 24rpx 64rpx rgba(0, 0, 0, 0.16);
}
`

let themeStyleEl = null

// 浅色主题 CSS 变量键值对（用于直接设置到 DOM 元素）
const LIGHT_THEME_VARS = {
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

function applyTheme(theme) {
  const themeChanged = theme !== currentAppliedTheme
  currentAppliedTheme = theme

  // APP-PLUS：通过事件通知各页面在自己的 webview 上下文中应用主题
  // H5：直接在当前上下文设置（所有页面共享同一 DOM）
  // #ifdef H5
  applyThemeToDOM(theme)
  // #endif

  if (themeChanged) {
    uni.$emit('tabbar-theme-change', theme)
  }

  // 每次都通知（页面跳转后需要重新应用）
  uni.$emit('theme-apply', theme)

  // 导航栏颜色
  try {
    const navPromise = theme === 'light'
      ? uni.setNavigationBarColor({ frontColor: '#000000', backgroundColor: '#F4F1EC' })
      : uni.setNavigationBarColor({ frontColor: '#ffffff', backgroundColor: '#0A0A12' })
    if (navPromise && navPromise.catch) navPromise.catch(() => {})
  } catch (e) {}
}

// 将主题应用到当前 DOM（必须在页面自己的 webview 上下文中调用）
function applyThemeToDOM(theme) {
  try {
    document.documentElement.setAttribute('data-theme', theme)
  } catch (e) {}

  // #ifdef APP-PLUS
  try {
    const root = document.documentElement
    if (theme === 'light') {
      for (const [key, value] of Object.entries(LIGHT_THEME_VARS)) {
        root.style.setProperty(key, value)
      }
    } else {
      for (const key of Object.keys(LIGHT_THEME_VARS)) {
        root.style.removeProperty(key)
      }
    }
  } catch (e) {}
  // #endif
}

// 缓存当前主题，避免重复应用
let currentAppliedTheme = null

// 导出供页面调用
uni.$applyTheme = applyTheme
uni.$applyThemeToDOM = applyThemeToDOM

function applyNavBarColor(theme) {
  const frontColor = theme === 'light' ? '#000000' : '#ffffff'
  const backgroundColor = theme === 'light' ? '#F4F1EC' : '#0A0A12'
  try {
    const p = uni.setNavigationBarColor({ frontColor, backgroundColor })
    if (p && p.catch) p.catch(() => {})
  } catch (e) {}
  // #ifdef APP-PLUS
  // Android 原生 titleNView 按钮颜色兼容
  try {
    const wv = plus.webview.currentWebview()
    if (wv) {
      wv.setTitleNViewButtonStyle({ color: frontColor })
    }
  } catch (e) {}
  // #endif
}

// 拦截页面跳转，每次页面显示时都应用主题
const interceptors = ['navigateTo', 'switchTab', 'redirectTo', 'navigateBack']
interceptors.forEach(method => {
  uni.addInterceptor(method,
    {
      success() {
        const settings = settingsStore.get()
        const theme = settings.theme || 'dark'
        applyTheme(theme)
        // 延迟后重新通知（等新页面 webview 加载完成）
        setTimeout(() => {
          uni.$emit('theme-apply', theme)
          applyNavBarColor(theme)
        }, 200)
        setTimeout(() => applyNavBarColor(theme), 400)
      }
    }
  )
})

onLaunch(() => {
  console.log('大胃王APP 启动')

  const settings = settingsStore.get()
  const theme = settings.theme || 'dark'

  // 立即应用主题
  applyTheme(theme)
  // 延迟重试确保导航栏颜色生效
  setTimeout(() => applyNavBarColor(theme), 100)
  setTimeout(() => applyNavBarColor(theme), 500)

  // APP 端：监听来自其他 webview 的主题切换广播
  listenForCrossWebviewThemeChange()
})
</script>

<style lang="scss">
@import './theme-light.css';

/* ═══ Font Loading (only weights actually used by design system) ═══ */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;700&family=JetBrains+Mono:wght@400&display=swap');

/* ═══ Global Reset & Foundation ═══ */
page {
  background-color: var(--c-bg, $void-black);
  font-family: $font-family;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--c-text-primary, $text-primary);
  line-height: 1.5;
  letter-spacing: $tracking-normal;
}

/* ═══ Scrollbar Styling (H5 — Refined) ═══ */
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 999px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.12);
}

[data-theme="light"] ::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
}

[data-theme="light"] ::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.18);
}

/* ═══ Entrance Animation Keyframes (Physics-Based) ═══ */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUpSoft {
  from {
    opacity: 0;
    transform: translateY(24rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes pulseGlow {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.06); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10rpx); }
}

@keyframes floatSlow {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  33% { transform: translateY(-6rpx) rotate(0.5deg); }
  66% { transform: translateY(4rpx) rotate(-0.5deg); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-20rpx);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.88);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes slideInBottom {
  from {
    opacity: 0;
    transform: translateY(60rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes breathe {
  0%, 100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.08);
  }
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes shimmerGold {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

/* ═══ Grain Texture Overlay (H5 only — too expensive on APP WebView) ═══ */
/* #ifdef H5 */
page::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 998;
  pointer-events: none;
  opacity: var(--c-noise-opacity, 0.02);
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 256px 256px;
  mix-blend-mode: overlay;
}
/* #endif */

/* ═══ Focus Ring (Premium) ═══ */
:focus-visible {
  outline: 2rpx solid rgba(255, 107, 53, 0.4);
  outline-offset: 4rpx;
  border-radius: 8rpx;
}

[data-theme="light"] :focus-visible {
  outline-color: rgba(217, 79, 30, 0.3);
}

/* ═══ Selection Color ═══ */
::selection {
  background: rgba(255, 107, 53, 0.18);
  color: $text-primary;
}

[data-theme="light"] ::selection {
  background: rgba(217, 79, 30, 0.12);
}

/* ═══ Reduced Motion ═══ */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* ═══ Utility: Hardware-Accelerated Transitions ═══ */
.gpu-accelerated {
  transform: translateZ(0);
}
</style>
