<template>
  <view class="radar-chart">
    <!-- Canvas 2D (现代 API) -->
    <canvas
      v-if="!useLegacyCanvas"
      type="2d"
      id="radar"
      class="radar-canvas"
      :style="{ width: canvasSize + 'px', height: canvasSize + 'px' }"
    />
    <!-- 旧版 Canvas (兼容方案) -->
    <canvas
      v-else
      canvas-id="radar"
      id="radar-legacy"
      class="radar-canvas"
      :style="{ width: canvasSize + 'px', height: canvasSize + 'px' }"
    />
  </view>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { getCategoryCanvasColor } from '@/utils/category-constants.js'
import { CANVAS_COLORS } from '@/constants/canvas-colors.js'

const props = defineProps({
  data: { type: Object, default: () => ({}) },
  theme: { type: String, default: 'dark' }
})

const canvasSize = ref(300)

watch(() => props.theme, () => {
  resetAndAnimate()
})

onMounted(() => {
  // 延迟初始化，确保容器尺寸已计算
  setTimeout(() => initCanvas(), 150)
})

onUnmounted(() => {
  stopAnimation()
})

// ── Constants ──
const CATEGORIES = ['肉类', '海鲜', '主食', '甜点', '饮品', '其他']

const ENTRY_DURATION = 420
const STAGGER_DELAY = 80
const BREATHING_PERIOD = 3200

// ── Animation state ──
let animFrame = null
let animStartTime = 0
let ctx = null
let canvasNode = null
let canvasW = 0
let canvasH = 0
let dpr = 1
const useLegacyCanvas = ref(false)
let vertexState = CATEGORIES.map(() => ({ current: 0, target: 0, appeared: false }))

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function easeOutExpo(t) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

function stopAnimation() {
  if (animFrame) {
    cancelAnimationFrame(animFrame)
    animFrame = null
  }
}

function initCanvas(retryCount) {
  if (retryCount === undefined) retryCount = 0

  // 先尝试 Canvas 2D API（type="2d"）
  if (!useLegacyCanvas.value) {
    const query = uni.createSelectorQuery()
    query.select('#radar')
      .fields({ node: true, size: true })
      .exec((res) => {
        // 检查是否成功获取到 canvas node
        if (res && res[0] && res[0].node) {
          initWithCanvas2D(res[0])
        } else {
          // Canvas 2D 不可用，回退到旧版 API
          useLegacyCanvas.value = true
          initWithLegacyCanvas(retryCount)
        }
      })
  } else {
    // 已经标记使用旧版 API
    initWithLegacyCanvas(retryCount)
  }
}

// Canvas 2D 初始化
function initWithCanvas2D(result) {
  const canvas = result.node
  canvasNode = canvas

  dpr = uni.getSystemInfoSync().pixelRatio || 2
  const rawW = result.width || 300
  const s = rawW > 0 ? rawW : 300

  // 设置 canvas 物理尺寸（与 CSS 尺寸一致，不使用高清渲染）
  canvas.width = s
  canvas.height = s

  // 设置 CSS 尺寸（逻辑像素）
  canvasSize.value = s
  canvasW = s
  canvasH = s

  ctx = canvas.getContext('2d')
  if (!ctx) {
    useLegacyCanvas.value = true
    initWithLegacyCanvas(0)
    return
  }

  startRender()
}

// 旧版 Canvas API 初始化（兼容方案）
function initWithLegacyCanvas(retryCount) {
  const query = uni.createSelectorQuery()
  query.select('.radar-chart').boundingClientRect(rect => {
    const rawW = rect ? Math.floor(rect.width) : 0
    const s = rawW > 0 ? rawW : 300

    canvasSize.value = s
    canvasW = s
    canvasH = s

    setTimeout(() => {
      ctx = uni.createCanvasContext('radar')

      if (!ctx) {
        if (retryCount < 3) {
          setTimeout(() => initWithLegacyCanvas(retryCount + 1), 200)
        }
        return
      }

      useLegacyCanvas.value = true
      startRender()
    }, 50)
  }).exec()
}

function startRender() {
  const reducedMotion = typeof matchMedia !== 'undefined'
    && matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reducedMotion) {
    CATEGORIES.forEach((cat, i) => {
      vertexState[i].current = props.data[cat] || 0
      vertexState[i].target = props.data[cat] || 0
      vertexState[i].appeared = true
    })
    renderFrame(0, true)
  } else {
    startAnimation()
  }
}

function resetAndAnimate() {
  stopAnimation()
  if (!ctx) {
    initCanvas()
    return
  }

  const reducedMotion = typeof matchMedia !== 'undefined'
    && matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reducedMotion) {
    CATEGORIES.forEach((cat, i) => {
      vertexState[i].current = props.data[cat] || 0
      vertexState[i].target = props.data[cat] || 0
      vertexState[i].appeared = true
    })
    renderFrame(0, true)
    return
  }

  startAnimation()
}

function startAnimation() {
  stopAnimation()

  // Update targets
  CATEGORIES.forEach((cat, i) => {
    const val = props.data[cat] || 0
    vertexState[i].target = val
    if (!vertexState[i].appeared) {
      vertexState[i].current = 0
    }
  })

  animStartTime = Date.now()

  function loop() {
    const elapsed = Date.now() - animStartTime
    const entryEnd = (CATEGORIES.length - 1) * STAGGER_DELAY + ENTRY_DURATION

    // Update vertex values
    CATEGORIES.forEach((_, i) => {
      const delay = i * STAGGER_DELAY
      const localElapsed = Math.max(0, elapsed - delay)
      const progress = Math.min(localElapsed / ENTRY_DURATION, 1)
      const eased = easeOutExpo(progress)

      if (progress >= 1) {
        vertexState[i].current = vertexState[i].target
        vertexState[i].appeared = true
      } else if (!vertexState[i].appeared) {
        vertexState[i].current = vertexState[i].target * eased
      }
    })

    renderFrame(elapsed, false)

    // 持续运行动画以保持呼吸效果
    animFrame = requestAnimationFrame(loop)
  }

  animFrame = requestAnimationFrame(loop)
}

// Shallow watch: only trigger when data values actually change
watch(() => {
  const d = props.data
  return d ? Object.values(d).join(',') : ''
}, () => {
  resetAndAnimate()
})

// ── Synchronous render (no async queries) ──
function renderFrame(elapsed, isStatic) {
  if (!ctx) {
    return
  }

  const s = canvasW
  const halfS = s / 2

  const isLight = props.theme === 'light'
  const colors = isLight ? CANVAS_COLORS.light : CANVAS_COLORS.dark
  const center = s / 2
  const labelPad = Math.max(16, s * 0.06)
  const radius = center - labelPad
  const maxVal = Math.max(...vertexState.map(v => v.target), 1)
  const dotR = Math.max(3, s / 100)

  const entryEnd = (CATEGORIES.length - 1) * STAGGER_DELAY + ENTRY_DURATION
  const inEntry = elapsed < entryEnd
  const breathPhase = (elapsed % BREATHING_PERIOD) / BREATHING_PERIOD
  const breathVal = Math.sin(breathPhase * Math.PI * 2)

  // Helper: 设置颜色（兼容两种 API）
  function setStroke(color) {
    if (useLegacyCanvas.value) {
      ctx.setStrokeStyle(color)
    } else {
      ctx.strokeStyle = color
    }
  }

  function setFill(color) {
    if (useLegacyCanvas.value) {
      ctx.setFillStyle(color)
    } else {
      ctx.fillStyle = color
    }
  }

  function setLineWidth(w) {
    if (useLegacyCanvas.value) {
      ctx.setLineWidth(w)
    } else {
      ctx.lineWidth = w
    }
  }

  function setFont(size) {
    if (useLegacyCanvas.value) {
      ctx.setFontSize(size)
    } else {
      ctx.font = `${size}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
    }
  }

  function drawText(text, x, y) {
    if (useLegacyCanvas.value) {
      ctx.setTextAlign('center')
      ctx.fillText(text, x, y + fontSize * 0.4)
    } else {
      ctx.fillText(text, x, y)
    }
  }

  // Clear - 使用物理像素尺寸
  ctx.clearRect(0, 0, canvasNode.width, canvasNode.height)

  // ── Grid ──
  for (let level = 1; level <= 5; level++) {
    const r = (radius * level) / 5
    ctx.beginPath()
    CATEGORIES.forEach((_, i) => {
      const angle = (Math.PI * 2 * i) / CATEGORIES.length - Math.PI / 2
      const x = center + r * Math.cos(angle)
      const y = center + r * Math.sin(angle)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.closePath()
    const gridAlpha = isLight ? (0.38 + level * 0.04) : (0.08 + level * 0.02)
    const gridBase = isLight ? '0, 0, 0' : '255, 255, 255'
    setStroke(`rgba(${gridBase}, ${gridAlpha})`)
    setLineWidth(1)
    ctx.stroke()
  }

  // ── Axis lines ──
  CATEGORIES.forEach((_, i) => {
    const angle = (Math.PI * 2 * i) / CATEGORIES.length - Math.PI / 2
    ctx.beginPath()
    ctx.moveTo(center, center)
    ctx.lineTo(center + radius * Math.cos(angle), center + radius * Math.sin(angle))
    setStroke(colors.axisLine)
    setLineWidth(1)
    ctx.stroke()
  })

  // ── Filled polygon (breathing) ──
  const values = vertexState.map(v => v.current)
  const hasData = values.some(v => v > 0)

  if (hasData) {
    console.log('[RadarChart] Drawing polygon, fillAlpha:', isLight ? 0.5 : 0.4)
    ctx.beginPath()
    CATEGORIES.forEach((_, i) => {
      const angle = (Math.PI * 2 * i) / CATEGORIES.length - Math.PI / 2
      const r = (radius * values[i]) / maxVal
      const x = center + r * Math.cos(angle)
      const y = center + r * Math.sin(angle)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.closePath()

    if (isStatic) {
      setFill(colors.polygonFill)
      ctx.fill()
      setStroke(colors.polygonStroke)
    } else {
      // 呼吸效果：透明度在基础值上下波动
      const baseFillAlpha = isLight ? 0.25 : 0.2
      const baseStrokeAlpha = isLight ? 0.85 : 0.7
      const breathAmplitude = isLight ? 0.08 : 0.1

      const fillAlpha = inEntry
        ? baseFillAlpha
        : baseFillAlpha + breathVal * breathAmplitude
      const strokeAlpha = inEntry
        ? baseStrokeAlpha
        : baseStrokeAlpha + breathVal * 0.15

      const accentRgb = isLight ? '192, 64, 24' : '255, 107, 53'
      setFill(`rgba(${accentRgb}, ${fillAlpha})`)
      ctx.fill()
      const strokeRgb = isLight ? '160, 54, 16' : '255, 107, 53'
      setStroke(`rgba(${strokeRgb}, ${strokeAlpha})`)
    }
    setLineWidth(isLight ? 3 : 2.5)
    ctx.stroke()
  }

  // ── Data vertices (staggered entry + glow breathing) ──
  CATEGORIES.forEach((cat, i) => {
    const angle = (Math.PI * 2 * i) / CATEGORIES.length - Math.PI / 2
    const r = (radius * values[i]) / maxVal
    const x = center + r * Math.cos(angle)
    const y = center + r * Math.sin(angle)
    const color = getCategoryCanvasColor(cat, isLight ? 'light' : 'dark')

    const delay = i * STAGGER_DELAY
    const localElapsed = Math.max(0, elapsed - delay)
    const entryProgress = Math.min(localElapsed / ENTRY_DURATION, 1)

    if (isStatic || entryProgress <= 0) {
      if (isStatic && values[i] > 0) {
        ctx.beginPath()
        ctx.arc(x, y, dotR, 0, Math.PI * 2)
        setFill(color)
        ctx.fill()
      }
      return
    }

    // Entry flash burst (first 300ms after vertex reaches target)
    const flashElapsed = localElapsed - ENTRY_DURATION
    if (flashElapsed >= 0 && flashElapsed < 300 && !isStatic) {
      const flashProgress = flashElapsed / 300
      const flashR = dotR * (2 + flashProgress * 4)
      const flashAlpha = 0.3 * (1 - flashProgress)
      ctx.beginPath()
      ctx.arc(x, y, flashR, 0, Math.PI * 2)
      setFill(hexToRgba(color, flashAlpha))
      ctx.fill()
    }

    // Glow halo (continuous breathing, staggered per vertex)
    const glowPhaseOffset = i * 0.5
    const glowBreath = isStatic ? 0 : Math.sin(
      ((elapsed + glowPhaseOffset * BREATHING_PERIOD) % BREATHING_PERIOD)
      / BREATHING_PERIOD * Math.PI * 2
    )
    const glowBase = inEntry ? 2.0 : 2.5
    const glowR = dotR * (glowBase + glowBreath * 0.8)
    const glowAlpha = inEntry ? 0.15 : (0.18 + glowBreath * 0.1)

    ctx.beginPath()
    ctx.arc(x, y, glowR, 0, Math.PI * 2)
    setFill(hexToRgba(color, Math.max(0.06, glowAlpha)))
    ctx.fill()

    // Core dot
    ctx.beginPath()
    ctx.arc(x, y, dotR, 0, Math.PI * 2)
    setFill(color)
    ctx.fill()
  })

  // ── Labels ──
  const fontSize = Math.max(10, Math.min(13, s / 30))
  setFont(fontSize)
  CATEGORIES.forEach((cat, i) => {
    const angle = (Math.PI * 2 * i) / CATEGORIES.length - Math.PI / 2
    const labelR = radius + labelPad * 0.6
    const x = center + labelR * Math.cos(angle)
    const y = center + labelR * Math.sin(angle)
    const labelColor = getCategoryCanvasColor(cat, isLight ? 'light' : 'dark')
    setFill(isLight ? labelColor : hexToRgba(labelColor, 0.9))
    drawText(cat, x, y)
  })

  // 旧版 API 需要 draw() 来渲染
  if (useLegacyCanvas.value) {
    ctx.draw()
  }
}
</script>

<style lang="scss" scoped>
.radar-chart {
  display: flex;
  justify-content: center;
  width: 100%;
  position: relative;
}

.radar-canvas {
  display: block;
}
</style>
