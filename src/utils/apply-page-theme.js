const LIGHT_VARS_CSS = ':root,page,uni-page{--c-bg:#F4F1EC;--c-bg-elevated:#FAF8F5;--c-surface-0:#FFFFFF;--c-surface-1:#FAF8F5;--c-surface-2:#F0EDEA;--c-surface-3:rgba(0,0,0,0.03);--c-surface-4:rgba(0,0,0,0.04);--c-surface-5:rgba(0,0,0,0.05);--c-surface-6:rgba(0,0,0,0.06);--c-surface-8:rgba(0,0,0,0.08);--c-surface-10:rgba(0,0,0,0.10);--c-surface-12:rgba(0,0,0,0.12);--c-surface-15:rgba(0,0,0,0.15);--c-text-primary:#181820;--c-text-secondary:#3C3C54;--c-text-tertiary:#545468;--c-text-muted:#606078;--c-text-ghost:#8A8AA0;--c-accent:#D94F1E;--c-accent-light:#F06830;--c-accent-deep:#C04018;--c-accent-soft:rgba(217,79,30,0.06);--c-accent-glow:rgba(217,79,30,0.08);--c-accent-glow-strong:rgba(217,79,30,0.15);--c-text-on-accent:#FFFFFF;--c-gold:#C08B10;--c-gold-deep:#A07508;--c-gold-soft:rgba(192,139,16,0.06);--c-gold-glow:rgba(192,139,16,0.08);--c-gold-glow-strong:rgba(192,139,16,0.15);--c-danger:#CC2D20;--c-danger-soft:rgba(204,45,32,0.08);--c-success:#16A36A;--c-success-soft:rgba(22,163,106,0.08);--c-warning:#D97706;--c-warning-soft:rgba(217,119,6,0.08);--c-info:#2563EB;--c-info-soft:rgba(37,99,235,0.08);--c-emerald:#16A36A;--c-violet:#7C3AED;--c-border:rgba(0,0,0,0.06);--c-border-light:rgba(0,0,0,0.03);--c-border-subtle:rgba(0,0,0,0.02);--c-border-active:rgba(217,79,30,0.25);--c-card-bg:linear-gradient(165deg,#FFFFFF 0%,#FDFCFA 100%);--c-card-bg-elevated:linear-gradient(165deg,#FFFFFF 0%,#FFFFFF 100%);--c-glass:rgba(0,0,0,0.02);--c-glass-strong:rgba(0,0,0,0.04);--c-hairline:rgba(0,0,0,0.05);--c-glow-accent:rgba(217,79,30,0.08);--c-glow-gold:rgba(192,139,16,0.06);--c-input-bg:rgba(0,0,0,0.025);--c-input-border:rgba(0,0,0,0.06);--c-overlay:rgba(0,0,0,0.25);--c-inner-highlight:inset 0 1rpx 2rpx rgba(255,255,255,0.8);--c-noise-opacity:0.025;--c-shadow-inner:inset 0 1rpx 2rpx rgba(0,0,0,0.04);--c-shadow-sm:0 1rpx 4rpx rgba(0,0,0,0.06);--c-shadow-md:0 4rpx 16rpx rgba(0,0,0,0.08);--c-shadow-lg:0 8rpx 32rpx rgba(0,0,0,0.10);--c-shadow-xl:0 12rpx 48rpx rgba(0,0,0,0.12);--c-shadow-2xl:0 24rpx 64rpx rgba(0,0,0,0.16)}'

let diagShown = 0

function showDiag(title, content) {
  diagShown++
  if (diagShown <= 3) {
    try {
      uni.showModal({ title: title, content: content, showCancel: false })
    } catch (e) {}
  }
}

export function applyPageTheme(theme) {
  const isLight = theme === 'light'

  // #ifdef APP-PLUS
  try {
    const wv = plus.webview.currentWebview()
    if (!wv) {
      showDiag('主题', 'wv is null')
      return
    }

    // 构造在 WebView 内执行的 JS
    let js = 'try{'
    js += 'document.documentElement.setAttribute("data-theme","' + (theme || 'dark') + '");'
    js += 'var o=document.getElementById("pt-s");if(o)o.remove();'
    if (isLight) {
      // 用 base64 编码避免引号转义问题
      js += 'var s=document.createElement("style");s.id="pt-s";'
      js += 's.textContent=decodeURIComponent("' + encodeURIComponent(LIGHT_VARS_CSS) + '");'
      js += 'document.head.appendChild(s);'
    }
    // 读回变量验证
    js += 'var bg=getComputedStyle(document.documentElement).getPropertyValue("--c-bg");'
    js += '"OK theme="+document.documentElement.getAttribute("data-theme")+" bg="+(bg||"").trim()'
    js += '}catch(e){"ERR:"+e.message}'

    wv.evalJS(js, function(result) {
      showDiag('evalJS回调', 'theme=' + theme + '\nresult=' + result)
    })
  } catch (e) {
    showDiag('主题异常', e.message)
  }
  // #endif

  // #ifdef H5
  try {
    document.documentElement.setAttribute('data-theme', theme || 'dark')
    const root = document.documentElement
    if (isLight) {
      for (const [key, value] of Object.entries(LIGHT_VARS)) {
        root.style.setProperty(key, value)
      }
    } else {
      for (const key of Object.keys(LIGHT_VARS)) {
        root.style.removeProperty(key)
      }
    }
  } catch (e) {}
  // #endif
}

// #ifdef H5
const LIGHT_VARS = {
  '--c-bg': '#F4F1EC', '--c-bg-elevated': '#FAF8F5',
  '--c-surface-0': '#FFFFFF', '--c-surface-1': '#FAF8F5', '--c-surface-2': '#F0EDEA',
  '--c-surface-3': 'rgba(0,0,0,0.03)', '--c-surface-4': 'rgba(0,0,0,0.04)', '--c-surface-5': 'rgba(0,0,0,0.05)',
  '--c-surface-6': 'rgba(0,0,0,0.06)', '--c-surface-8': 'rgba(0,0,0,0.08)', '--c-surface-10': 'rgba(0,0,0,0.10)',
  '--c-surface-12': 'rgba(0,0,0,0.12)', '--c-surface-15': 'rgba(0,0,0,0.15)',
  '--c-text-primary': '#181820', '--c-text-secondary': '#3C3C54', '--c-text-tertiary': '#545468',
  '--c-text-muted': '#606078', '--c-text-ghost': '#8A8AA0',
  '--c-accent': '#D94F1E', '--c-accent-light': '#F06830', '--c-accent-deep': '#C04018',
  '--c-accent-soft': 'rgba(217,79,30,0.06)', '--c-accent-glow': 'rgba(217,79,30,0.08)', '--c-accent-glow-strong': 'rgba(217,79,30,0.15)',
  '--c-text-on-accent': '#FFFFFF',
  '--c-gold': '#C08B10', '--c-gold-deep': '#A07508', '--c-gold-soft': 'rgba(192,139,16,0.06)', '--c-gold-glow': 'rgba(192,139,16,0.08)',
  '--c-danger': '#CC2D20', '--c-danger-soft': 'rgba(204,45,32,0.08)',
  '--c-success': '#16A36A', '--c-success-soft': 'rgba(22,163,106,0.08)',
  '--c-emerald': '#16A36A', '--c-violet': '#7C3AED',
  '--c-border': 'rgba(0,0,0,0.06)', '--c-border-light': 'rgba(0,0,0,0.03)', '--c-border-subtle': 'rgba(0,0,0,0.02)', '--c-border-active': 'rgba(217,79,30,0.25)',
  '--c-card-bg': 'linear-gradient(165deg,#FFFFFF 0%,#FDFCFA 100%)', '--c-card-bg-elevated': 'linear-gradient(165deg,#FFFFFF 0%,#FFFFFF 100%)',
  '--c-glass': 'rgba(0,0,0,0.02)', '--c-glass-strong': 'rgba(0,0,0,0.04)', '--c-hairline': 'rgba(0,0,0,0.05)',
  '--c-glow-accent': 'rgba(217,79,30,0.08)', '--c-glow-gold': 'rgba(192,139,16,0.06)',
  '--c-input-bg': 'rgba(0,0,0,0.025)', '--c-input-border': 'rgba(0,0,0,0.06)',
  '--c-overlay': 'rgba(0,0,0,0.25)', '--c-noise-opacity': '0.025',
  '--c-shadow-inner': 'inset 0 1rpx 2rpx rgba(0,0,0,0.04)',
  '--c-shadow-sm': '0 1rpx 4rpx rgba(0,0,0,0.06)', '--c-shadow-md': '0 4rpx 16rpx rgba(0,0,0,0.08)',
  '--c-shadow-lg': '0 8rpx 32rpx rgba(0,0,0,0.10)', '--c-shadow-xl': '0 12rpx 48rpx rgba(0,0,0,0.12)', '--c-shadow-2xl': '0 24rpx 64rpx rgba(0,0,0,0.16)'
}
// #endif

export function syncThemeFromStorage() {
  try {
    const settings = uni.getStorageSync('eater_settings') || {}
    const theme = settings.theme || 'dark'
    applyPageTheme(theme)
  } catch (e) {}
}

export function broadcastThemeChange(theme) {
  // #ifdef APP-PLUS
  try {
    plus.runtime.sendMessage('theme-change', { theme }, () => {}, () => {})
  } catch (e) {}
  // #endif
}

export function listenForCrossWebviewThemeChange() {
  // #ifdef APP-PLUS
  try {
    plus.runtime.onMessage((message) => {
      if (message && message.type === 'theme-change' && message.data && message.data.theme) {
        applyPageTheme(message.data.theme)
      }
    })
  } catch (e) {}
  // #endif
}
