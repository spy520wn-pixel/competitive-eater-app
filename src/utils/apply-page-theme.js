// ═══════════════════════════════════════════════════════
// 主题切换核心工具
// 兼容 H5 和 APP-PLUS（多 WebView 架构）
//
// 关键发现：APP-PLUS (Vue 3) 中 JS 运行在 V8/JSCore 引擎，
// document 全局对象不存在，必须通过 plus.webview.evalJS()
// 将代码注入到 WebView 的 DOM 上下文执行。
//
// 变量定义见 src/theme-vars.js，此处通过 import 导入。
// ═══════════════════════════════════════════════════════

import { DARK_THEME_VARS, LIGHT_THEME_VARS } from '../theme-vars'

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
 * 双重保障：注入 <style> 元素 + 设置 data-theme 属性
 */
function buildWebviewThemeJs(themeValue, vars) {
  var cssProps = buildCssProps(vars)
  var cssContent = ':root,\n[data-theme="' + themeValue + '"] {\n' + cssProps + '}'

  var js =
    '(function() {' +
    '  try {' +
    '    var s = document.getElementById("__theme_vars__");' +
    '    if (!s) { s = document.createElement("style"); s.id = "__theme_vars__"; document.head.appendChild(s); }' +
    '    s.textContent = ' + JSON.stringify(cssContent) + ';' +
    '    document.documentElement.setAttribute("data-theme", "' + themeValue + '");' +
    '    if (document.body) document.body.setAttribute("data-theme", "' + themeValue + '");' +
    '    var pg = document.querySelector("page") || document.querySelector("uni-page");' +
    '    if (pg) pg.setAttribute("data-theme", "' + themeValue + '");' +
    '  } catch(e) {}' +
    '})()'
  return js
}

/**
 * 向所有 webview 注入主题 JS（APP-PLUS 公共逻辑）
 * @param {string} jsCode - 要注入的 JS 代码
 * @param {object} [excludeWv] - 要排除的 webview（可选）
 */
function injectThemeToWebviews(jsCode, excludeWv) {
  try {
    var targets = []
    var cur = plus.webview.currentWebview()
    if (cur) targets.push(cur)
    var all = plus.webview.all()
    for (var i = 0; i < all.length; i++) {
      if (excludeWv && all[i].id === excludeWv.id) continue
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
function applyViaWebview(themeValue, vars) {
  var jsCode = buildWebviewThemeJs(themeValue, vars)
  injectThemeToWebviews(jsCode)
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
    applyViaWebview(themeValue, vars)
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
 * 设置顶部导航栏和底部 tabbar 颜色（原生 API）
 */
export function applyNavBarColor(theme) {
  var frontColor = theme === 'light' ? '#000000' : '#ffffff'
  var backgroundColor = theme === 'light' ? '#F4F1EC' : '#0A0A12'
  try {
    var p = uni.setNavigationBarColor({ frontColor: frontColor, backgroundColor: backgroundColor })
    if (p && p.catch) p.catch(function() {})
  } catch (e) {}
  // 底部原生 tabbar 颜色
  try {
    uni.setTabBarStyle({
      color: theme === 'light' ? '#8A8AA0' : '#8888A8',
      selectedColor: theme === 'light' ? '#D94F1E' : '#FF6B35',
      backgroundColor: theme === 'light' ? '#FAF8F5' : '#0B0B14',
      borderStyle: theme === 'light' ? 'black' : 'white'
    })
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
    var vars = theme === 'light' ? LIGHT_THEME_VARS : DARK_THEME_VARS
    var jsCode = buildWebviewThemeJs(theme, vars)
    injectThemeToWebviews(jsCode, currentWv)
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
