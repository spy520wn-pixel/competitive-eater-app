<script setup>
import { onLaunch } from '@dcloudio/uni-app'
import { settingsStore } from '@/store/settings-store.js'
import { applyPageTheme, listenForCrossWebviewThemeChange, broadcastThemeChange } from '@/utils/apply-page-theme.js'

// 缓存当前主题，避免重复应用
let currentAppliedTheme = null

function applyTheme(theme) {
  const themeChanged = theme !== currentAppliedTheme
  currentAppliedTheme = theme

  // 统一使用 applyPageTheme 注入内联样式
  applyPageTheme(theme)

  if (themeChanged) {
    uni.$emit('tabbar-theme-change', theme)
  }

  // 每次都通知（页面跳转后需要重新应用）
  uni.$emit('theme-apply', theme)

  // 导航栏颜色
  applyNavBarColor(theme)
}

// 导出供页面调用
uni.$applyTheme = applyTheme

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

// 拦截页面跳转，确保新页面也能正确应用主题
// 注意：在 APP-PLUS 中，拦截器在当前页面 webview 执行，
// 新页面需要通过自己的 onMounted/onShow 来应用主题
const interceptors = ['navigateTo', 'switchTab', 'redirectTo', 'navigateBack']
interceptors.forEach(method => {
  uni.addInterceptor(method,
    {
      success() {
        const settings = settingsStore.get()
        const theme = settings.theme || 'dark'
        applyTheme(theme)
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
  // 延迟重试确保导航栏颜色和 CSS 变量生效
  setTimeout(() => {
    applyTheme(theme)
    applyNavBarColor(theme)
  }, 100)
  setTimeout(() => applyNavBarColor(theme), 500)

  // APP 端：监听来自其他 webview 的主题切换广播
  listenForCrossWebviewThemeChange()
})
</script>

<style lang="scss">
@import './theme-light.css';

/* ═══ CSS Custom Properties — Theme Variables ═══ */
/* 直接在 App.vue 全局样式中定义，绕过 uni.scss 被 scoped 破坏的问题 */
:root,
[data-theme="dark"] {
  --c-bg: #030306;
  --c-bg-elevated: #0A0A14;
  --c-surface-0: #131320;
  --c-surface-1: #1A1A2E;
  --c-surface-2: #22223A;
  --c-surface-3: rgba(255, 255, 255, 0.03);
  --c-surface-4: rgba(255, 255, 255, 0.04);
  --c-surface-5: rgba(255, 255, 255, 0.05);
  --c-surface-6: rgba(255, 255, 255, 0.06);
  --c-surface-8: rgba(255, 255, 255, 0.08);
  --c-surface-10: rgba(255, 255, 255, 0.10);
  --c-surface-12: rgba(255, 255, 255, 0.12);
  --c-surface-15: rgba(255, 255, 255, 0.15);
  --c-text-primary: #F0F0F5;
  --c-text-secondary: #9E9EB8;
  --c-text-tertiary: #8080A0;
  --c-text-muted: #7575A0;
  --c-text-ghost: #4A4A68;
  --c-accent: #FF6B35;
  --c-accent-light: #FF8F60;
  --c-accent-deep: #E85520;
  --c-accent-soft: rgba(255, 107, 53, 0.06);
  --c-accent-glow: rgba(255, 107, 53, 0.12);
  --c-accent-glow-strong: rgba(255, 107, 53, 0.25);
  --c-text-on-accent: #FFFFFF;
  --c-gold: #FFD700;
  --c-gold-deep: #D4A017;
  --c-gold-soft: rgba(255, 215, 0, 0.05);
  --c-gold-glow: rgba(255, 215, 0, 0.10);
  --c-gold-glow-strong: rgba(255, 215, 0, 0.20);
  --c-danger: #FF3B30;
  --c-danger-soft: rgba(255, 59, 48, 0.08);
  --c-success: #34D399;
  --c-success-soft: rgba(52, 211, 153, 0.08);
  --c-warning: #F59E0B;
  --c-warning-soft: rgba(245, 158, 11, 0.08);
  --c-info: #3B82F6;
  --c-info-soft: rgba(59, 130, 246, 0.08);
  --c-emerald: #34D399;
  --c-violet: #8B5CF6;
  /* Category colors (dark: vibrant on dark bg) */
  --c-cat-meat: #E8453C;
  --c-cat-seafood: #3B82F6;
  --c-cat-staples: #F59E0B;
  --c-cat-dessert: #EC4899;
  --c-cat-drinks: #8B5CF6;
  --c-cat-other: #9CA3AF;
  --c-cat-meat-glow: rgba(232, 69, 60, 0.25);
  --c-cat-seafood-glow: rgba(59, 130, 246, 0.25);
  --c-cat-staples-glow: rgba(245, 158, 11, 0.25);
  --c-cat-dessert-glow: rgba(236, 72, 153, 0.25);
  --c-cat-drinks-glow: rgba(139, 92, 246, 0.25);
  --c-cat-other-glow: rgba(156, 163, 175, 0.25);
  --c-border: rgba(255, 255, 255, 0.10);
  --c-border-light: rgba(255, 255, 255, 0.05);
  --c-border-subtle: rgba(255, 255, 255, 0.03);
  --c-border-active: rgba(255, 107, 53, 0.35);
  --c-card-bg: linear-gradient(165deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.02) 100%);
  --c-card-bg-elevated: linear-gradient(165deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.04) 100%);
  --c-card-shadow: 0 12rpx 48rpx rgba(0, 0, 0, 0.6), 0 4rpx 16rpx rgba(0, 0, 0, 0.35);
  --c-card-shadow-elevated: 0 20rpx 64rpx rgba(0, 0, 0, 0.65), 0 8rpx 24rpx rgba(0, 0, 0, 0.4);
  --c-glass: rgba(255, 255, 255, 0.04);
  --c-glass-strong: rgba(255, 255, 255, 0.08);
  --c-hairline: rgba(255, 255, 255, 0.06);
  --c-glow-accent: rgba(255, 107, 53, 0.15);
  --c-glow-gold: rgba(255, 215, 0, 0.10);
  --c-input-bg: rgba(255, 255, 255, 0.04);
  --c-input-border: rgba(255, 255, 255, 0.08);
  --c-overlay: rgba(0, 0, 0, 0.65);
  --c-inner-highlight: inset 0 1rpx 1rpx rgba(255, 255, 255, 0.08);
  --c-noise-opacity: 0.02;
  --c-shadow-inner: inset 0 1rpx 2rpx rgba(255, 255, 255, 0.06);
  --c-shadow-sm: 0 2rpx 8rpx rgba(0, 0, 0, 0.35), 0 1rpx 2rpx rgba(0, 0, 0, 0.15);
  --c-shadow-md: 0 4rpx 20rpx rgba(0, 0, 0, 0.4), 0 2rpx 6rpx rgba(0, 0, 0, 0.2);
  --c-shadow-lg: 0 8rpx 36rpx rgba(0, 0, 0, 0.45), 0 4rpx 10rpx rgba(0, 0, 0, 0.25);
  --c-shadow-xl: 0 16rpx 56rpx rgba(0, 0, 0, 0.5), 0 8rpx 20rpx rgba(0, 0, 0, 0.3);
  --c-shadow-2xl: 0 24rpx 80rpx rgba(0, 0, 0, 0.55), 0 12rpx 28rpx rgba(0, 0, 0, 0.35);

  /* Typography tokens */
  --text-display-size: #{$type-display-size};
  --text-display-weight: #{$type-display-weight};
  --text-display-lh: #{$type-display-lh};
  --text-display-ls: #{$type-display-ls};

  --text-headline-size: #{$type-headline-size};
  --text-headline-weight: #{$type-headline-weight};
  --text-headline-lh: #{$type-headline-lh};
  --text-headline-ls: #{$type-headline-ls};

  --text-title-size: #{$type-title-size};
  --text-title-weight: #{$type-title-weight};
  --text-title-lh: #{$type-title-lh};
  --text-title-ls: #{$type-title-ls};

  --text-body-size: #{$type-body-size};
  --text-body-weight: #{$type-body-weight};
  --text-body-lh: #{$type-body-lh};
  --text-body-ls: #{$type-body-ls};

  --text-label-size: #{$type-label-size};
  --text-label-weight: #{$type-label-weight};
  --text-label-lh: #{$type-label-lh};
  --text-label-ls: #{$type-label-ls};

  --text-caption-size: #{$type-caption-size};
  --text-caption-weight: #{$type-caption-weight};
  --text-caption-lh: #{$type-caption-lh};
  --text-caption-ls: #{$type-caption-ls};
}

[data-theme="light"] {
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
  --c-text-on-accent: #FFFFFF;
  --c-gold: #9A7008;
  --c-gold-deep: #7A5806;
  --c-gold-soft: rgba(154, 112, 8, 0.06);
  --c-gold-glow: rgba(154, 112, 8, 0.08);
  --c-gold-glow-strong: rgba(154, 112, 8, 0.15);
  --c-danger: #CC2D20;
  --c-danger-soft: rgba(204, 45, 32, 0.08);
  --c-success: #16A36A;
  --c-success-soft: rgba(22, 163, 106, 0.08);
  --c-warning: #D97706;
  --c-warning-soft: rgba(217, 119, 6, 0.08);
  --c-info: #2563EB;
  --c-info-soft: rgba(37, 99, 235, 0.08);
  --c-emerald: #16A36A;
  --c-violet: #7C3AED;
  /* Category colors (light: deeper/muted on light bg) */
  --c-cat-meat: #C03030;
  --c-cat-seafood: #2563EB;
  --c-cat-staples: #B45309;
  --c-cat-dessert: #BE185D;
  --c-cat-drinks: #6D28D9;
  --c-cat-other: #4B5563;
  --c-cat-meat-glow: rgba(192, 48, 48, 0.15);
  --c-cat-seafood-glow: rgba(37, 99, 235, 0.15);
  --c-cat-staples-glow: rgba(180, 83, 9, 0.15);
  --c-cat-dessert-glow: rgba(190, 24, 93, 0.15);
  --c-cat-drinks-glow: rgba(109, 40, 217, 0.15);
  --c-cat-other-glow: rgba(75, 85, 99, 0.15);
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

/* ═══ Font Loading (only weights actually used by design system) ═══ */
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;700&family=JetBrains+Mono:wght@400&display=swap');

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

/* ═══ Premium Animation Keyframes ═══ */
@keyframes revealSlide {
  from {
    opacity: 0;
    transform: translateY(48rpx) scale(0.97);
    filter: blur(4rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

@keyframes badgePop {
  0% {
    opacity: 0;
    transform: scale(0.4);
  }
  60% {
    opacity: 1;
    transform: scale(1.12);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes glowPulse {
  0%, 100% {
    box-shadow: 0 0 20rpx rgba(255, 107, 53, 0.15);
  }
  50% {
    box-shadow: 0 0 40rpx rgba(255, 107, 53, 0.3);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30rpx);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleUp {
  from {
    opacity: 0;
    transform: scale(0.85);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes shimmerSlide {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* ═══ Reduced Motion ═══ */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
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
