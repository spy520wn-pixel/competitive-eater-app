// ═══════════════════════════════════════════════════════
// 主题切换核心工具
// 兼容 H5 和 APP-PLUS（多 WebView 架构）
//
// 关键发现：APP-PLUS (Vue 3) 中 JS 运行在 V8/JSCore 引擎，
// document 全局对象不存在，必须通过 plus.webview.evalJS()
// 将代码注入到 WebView 的 DOM 上下文执行。
// ═══════════════════════════════════════════════════════

// ── 深色主题变量 ──
const DARK_THEME_VARS = {
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
  '--c-text-tertiary': '#8080A0',
  '--c-text-muted': '#7575A0',
  '--c-text-ghost': '#4A4A68',
  '--c-accent': '#FF6B35',
  '--c-accent-light': '#FF8F60',
  '--c-accent-deep': '#E85520',
  '--c-accent-soft': 'rgba(255, 107, 53, 0.06)',
  '--c-accent-glow': 'rgba(255, 107, 53, 0.12)',
  '--c-accent-glow-strong': 'rgba(255, 107, 53, 0.25)',
  '--c-text-on-accent': '#FFFFFF',
  '--c-gold': '#FFD700',
  '--c-gold-deep': '#D4A017',
  '--c-gold-soft': 'rgba(255, 215, 0, 0.05)',
  '--c-gold-glow': 'rgba(255, 215, 0, 0.10)',
  '--c-gold-glow-strong': 'rgba(255, 215, 0, 0.20)',
  '--c-danger': '#FF3B30',
  '--c-danger-soft': 'rgba(255, 59, 48, 0.08)',
  '--c-success': '#34D399',
  '--c-success-soft': 'rgba(52, 211, 153, 0.08)',
  '--c-warning': '#F59E0B',
  '--c-warning-soft': 'rgba(245, 158, 11, 0.08)',
  '--c-info': '#3B82F6',
  '--c-info-soft': 'rgba(59, 130, 246, 0.08)',
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

// ── 浅色主题变量 ──
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
  '--c-text-on-accent': '#FFFFFF',
  '--c-gold': '#9A7008',
  '--c-gold-deep': '#7A5806',
  '--c-gold-soft': 'rgba(154, 112, 8, 0.06)',
  '--c-gold-glow': 'rgba(154, 112, 8, 0.08)',
  '--c-gold-glow-strong': 'rgba(154, 112, 8, 0.15)',
  '--c-danger': '#CC2D20',
  '--c-danger-soft': 'rgba(204, 45, 32, 0.08)',
  '--c-success': '#16A36A',
  '--c-success-soft': 'rgba(22, 163, 106, 0.08)',
  '--c-warning': '#D97706',
  '--c-warning-soft': 'rgba(217, 119, 6, 0.08)',
  '--c-info': '#2563EB',
  '--c-info-soft': 'rgba(37, 99, 235, 0.08)',
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

// ── 工具函数 ──

/**
 * 将 vars 对象转为 CSS 属性文本
 */
function buildCssProps(vars) {
  var result = ''
  for (var key in vars) {
    if (vars.hasOwnProperty(key)) {
      result += '    ' + key + ': ' + vars[key] + ';\n'
    }
  }
  return result
}

/**
 * 检测是否为 APP-PLUS 环境
 * #ifdef 是预处理指令不能用在函数内部，用 typeof document 判断
 */
function isAppPlus() {
  return typeof document === 'undefined'
}

// ── APP-PLUS 专用：通过 evalJS 注入主题到 WebView DOM ──

/**
 * 构建注入 WebView 的 JS 代码
 * CSS 变量已在 App.vue 全局定义，只需设置 data-theme 属性触发对应规则
 */
function buildWebviewThemeJs(themeValue) {
  var js =
    '(function() {' +
    '  try {' +
    '    document.documentElement.setAttribute("data-theme", "' + themeValue + '");' +
    '    if (document.body) document.body.setAttribute("data-theme", "' + themeValue + '");' +
    '    var pg = document.querySelector("page") || document.querySelector("uni-page");' +
    '    if (pg) pg.setAttribute("data-theme", "' + themeValue + '");' +
    '  } catch(e) {}' +
    '})()'
  return js
}

// ── 诊断状态 ──
var _wvDiag = {}

/**
 * 查找页面 webview（非 service 层）
 */
function findPageWebview() {
  // 方式1：getTopWebview
  try {
    var top = plus.webview.getTopWebview()
    if (top && top.id !== '__uniapp__service') return { wv: top, via: 'getTop' }
  } catch (e) {}

  // 方式2：遍历所有 webview，找非 service 的
  try {
    var all = plus.webview.all()
    for (var i = 0; i < all.length; i++) {
      var w = all[i]
      if (w.id !== '__uniapp__service' && w.id !== '__uniapp__tabbar') {
        return { wv: w, via: 'all[' + i + ']', id: w.id }
      }
    }
  } catch (e) {}

  // 方式3：currentWebview（最后尝试）
  try {
    var cur = plus.webview.currentWebview()
    if (cur) return { wv: cur, via: 'current', id: cur.id }
  } catch (e) {}

  return null
}

/**
 * APP-PLUS：通过 evalJS 设置 data-theme 属性
 * 直接发送，不使用防抖或缓存（简单可靠）
 */
function applyViaWebview(themeValue) {
  var jsCode = buildWebviewThemeJs(themeValue)

  try {
    var targets = []
    var cur = plus.webview.currentWebview()
    if (cur) targets.push(cur)
    var all = plus.webview.all()
    for (var i = 0; i < all.length; i++) {
      var dup = false
      for (var j = 0; j < targets.length; j++) {
        if (targets[j] === all[i]) { dup = true; break }
      }
      if (!dup) targets.push(all[i])
    }
    for (var k = 0; k < targets.length; k++) {
      try { targets[k].evalJS(jsCode) } catch (e) {}
    }
  } catch (e) {}
}

// ── H5 专用：直接操作 DOM ──

function applyViaDom(themeValue, vars) {
  try {
    // 注入 <style>
    var styleEl = document.getElementById('__theme_vars__')
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = '__theme_vars__'
      document.head.appendChild(styleEl)
    }
    styleEl.textContent = ':root,\n[data-theme="' + themeValue + '"] {\n' + buildCssProps(vars) + '}'

    // 设置 data-theme
    document.documentElement.setAttribute('data-theme', themeValue)
    if (document.body) document.body.setAttribute('data-theme', themeValue)
    var pg = document.querySelector('page') || document.querySelector('uni-page')
    if (pg) pg.setAttribute('data-theme', themeValue)

    // 强制重绘
    void document.body.offsetHeight
  } catch (e) { /* ignore */ }
}

// ── 主入口 ──

/**
 * 将主题应用到当前页面
 *
 * APP-PLUS: document 不存在，通过 evalJS 注入到 WebView DOM 上下文
 * H5: document 可用，直接操作 DOM
 */
export function applyPageTheme(theme) {
  var themeValue = theme || 'dark'
  var vars = themeValue === 'light' ? LIGHT_THEME_VARS : DARK_THEME_VARS

  if (typeof document === 'undefined') {
    applyViaWebview(themeValue)
  } else {
    applyViaDom(themeValue, vars)
  }
}

/**
 * 从存储中读取设置并应用主题（含导航栏颜色）
 * 每个页面在 onShow 中调用，确保主题和导航栏一致
 */
export function syncThemeFromStorage() {
  try {
    var settings = uni.getStorageSync('eater_settings') || {}
    var theme = settings.theme || 'dark'
    applyNavBarColor(theme)
    applyPageTheme(theme)
  } catch (e) { /* ignore */ }
}

/**
 * 设置顶部导航栏颜色（原生 API）
 * 与 evalJS 无关，直接调用 uni 原生接口
 */
export function applyNavBarColor(theme) {
  var frontColor = theme === 'light' ? '#000000' : '#ffffff'
  var backgroundColor = theme === 'light' ? '#F4F1EC' : '#0A0A12'
  try {
    var p = uni.setNavigationBarColor({ frontColor: frontColor, backgroundColor: backgroundColor })
    if (p && p.catch) p.catch(function() {})
  } catch (e) {}
  // APP-PLUS: Android titleNView 按钮颜色兼容
  if (typeof plus !== 'undefined') {
    try {
      var wv = plus.webview.currentWebview()
      if (wv && wv.setTitleNViewButtonStyle) {
        wv.setTitleNViewButtonStyle({ color: frontColor })
      }
    } catch (e) {}
  }
}

/**
 * 跨 webview 广播主题变更（APP-PLUS）
 */
export function broadcastThemeChange(theme) {
  if (typeof plus === 'undefined') return
  try {
    plus.runtime.sendMessage({ type: 'theme-change', data: { theme: theme } })

    var currentWv = plus.webview.currentWebview()
    var allWvs = plus.webview.all()
    var jsCode = buildWebviewThemeJs(theme)

    for (var i = 0; i < allWvs.length; i++) {
      if (allWvs[i].id !== currentWv.id) {
        allWvs[i].evalJS(jsCode)
      }
    }
  } catch (e) { /* ignore */ }
}

/**
 * 监听来自其他 webview 的主题变更（APP-PLUS）
 */
export function listenForCrossWebviewThemeChange() {
  if (typeof plus === 'undefined') return
  try {
    plus.runtime.onMessage(function(message) {
      if (message && message.type === 'theme-change' && message.data && message.data.theme) {
        applyPageTheme(message.data.theme)
        try {
          uni.$emit('theme-apply', message.data.theme)
        } catch (e) { /* ignore */ }
      }
    })
  } catch (e) { /* ignore */ }
}

// APP-PLUS: 暴露给 evalJS 调用的全局函数
if (typeof window !== 'undefined') {
  try {
    window.applyPageThemeFromBroadcast = function(theme) {
      applyPageTheme(theme)
      try {
        uni.$emit('theme-apply', theme)
        uni.$emit('tabbar-theme-change', theme)
      } catch (e) { /* ignore */ }
    }
  } catch (e) { /* ignore */ }
}
