<template>
  <view class="radar-chart">
    <canvas
      canvas-id="radar"
      id="radar"
      :style="{ width: canvasSize + 'px', height: canvasSize + 'px' }"
    />
  </view>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  data: { type: Object, default: () => ({}) },
  theme: { type: String, default: 'dark' }
})

const canvasSize = ref(300)

function onThemeChange() {
  resetAndAnimate()
}

onMounted(() => {
  setTimeout(() => initCanvas(), 100)
  uni.$on('theme-apply', onThemeChange)
})

onUnmounted(() => {
  uni.$off('theme-apply', onThemeChange)
  stopAnimation()
})

// ── Constants ──
const CATEGORIES = ['肉类', '海鲜', '主食', '甜点', '饮料', '其他']

const CATEGORY_COLORS = {
  '肉类': { dark: '#E8453C', light: '#C03030' },
  '海鲜': { dark: '#3B82F6', light: '#2563EB' },
  '主食': { dark: '#F59E0B', light: '#B45309' },
  '甜点': { dark: '#EC4899', light: '#BE185D' },
  '饮料': { dark: '#8B5CF6', light: '#6D28D9' },
  '其他': { dark: '#9CA3AF', light: '#4B5563' }
}

const ENTRY_DURATION = 420
const STAGGER_DELAY = 80
const BREATHING_PERIOD = 3200

// ── Animation state ──
let animFrame = null
let animStartTime = 0
let ctx = null
let canvasW = 0
let canvasH = 0
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

function initCanvas() {
  const query = uni.createSelectorQuery()
  query.select('.radar-chart').boundingClientRect(rect => {
    if (!rect) return

    const s = Math.floor(rect.width)
    canvasSize.value = s
    canvasW = s
    canvasH = s

    nextTick(() => {
      ctx = uni.createCanvasContext('radar')
      if (!ctx) return

      // Check reduced motion
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
    })
  }).exec()
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
      } else {
        // Smooth interpolation for data changes
        vertexState[i].current += (vertexState[i].target - vertexState[i].current) * 0.12
      }
    })

    renderFrame(elapsed, false)
    animFrame = requestAnimationFrame(loop)
  }

  animFrame = requestAnimationFrame(loop)
}

watch(() => props.data, () => {
  resetAndAnimate()
}, { deep: true })

// ── Synchronous render (no async queries) ──
function renderFrame(elapsed, isStatic) {
  if (!ctx) return

  const s = canvasW
  const isLight = props.theme === 'light'
  const center = s / 2
  const labelPad = Math.max(16, s * 0.06)
  const radius = center - labelPad
  const maxVal = Math.max(...vertexState.map(v => v.target), 1)
  const dotR = Math.max(3, s / 100)

  const entryEnd = (CATEGORIES.length - 1) * STAGGER_DELAY + ENTRY_DURATION
  const inEntry = elapsed < entryEnd
  const breathPhase = (elapsed % BREATHING_PERIOD) / BREATHING_PERIOD
  const breathVal = Math.sin(breathPhase * Math.PI * 2)

  ctx.clearRect(0, 0, s, s)

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
    if (isLight) {
      ctx.setStrokeStyle(`rgba(0, 0, 0, ${0.38 + level * 0.04})`)
    } else {
      ctx.setStrokeStyle(`rgba(255, 255, 255, ${0.02 + level * 0.01})`)
    }
    ctx.setLineWidth(1)
    ctx.stroke()
  }

  // ── Axis lines ──
  CATEGORIES.forEach((_, i) => {
    const angle = (Math.PI * 2 * i) / CATEGORIES.length - Math.PI / 2
    ctx.beginPath()
    ctx.moveTo(center, center)
    ctx.lineTo(center + radius * Math.cos(angle), center + radius * Math.sin(angle))
    ctx.setStrokeStyle(isLight ? 'rgba(0, 0, 0, 0.42)' : 'rgba(255, 255, 255, 0.04)')
    ctx.setLineWidth(1)
    ctx.stroke()
  })

  // ── Filled polygon (breathing) ──
  const values = vertexState.map(v => v.current)
  const hasData = values.some(v => v > 0)

  if (hasData) {
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
      ctx.setFillStyle(isLight ? 'rgba(192, 64, 24, 0.25)' : 'rgba(255, 107, 53, 0.2)')
      ctx.fill()
      ctx.setStrokeStyle(isLight ? '#A03610' : 'rgba(255, 107, 53, 0.8)')
    } else {
      const fillAlpha = inEntry
        ? (isLight ? 0.22 : 0.17)
        : (isLight ? 0.22 + breathVal * 0.06 : 0.17 + breathVal * 0.06)
      const strokeAlpha = inEntry
        ? (isLight ? 0.85 : 0.7)
        : (isLight ? 0.85 + breathVal * 0.1 : 0.7 + breathVal * 0.1)

      ctx.setFillStyle(isLight
        ? `rgba(192, 64, 24, ${fillAlpha})`
        : `rgba(255, 107, 53, ${fillAlpha})`)
      ctx.fill()
      ctx.setStrokeStyle(isLight
        ? `rgba(160, 54, 16, ${strokeAlpha})`
        : `rgba(255, 107, 53, ${strokeAlpha})`)
    }
    ctx.setLineWidth(isLight ? 3 : 2.5)
    ctx.stroke()
  }

  // ── Data vertices (staggered entry + glow breathing) ──
  CATEGORIES.forEach((cat, i) => {
    const angle = (Math.PI * 2 * i) / CATEGORIES.length - Math.PI / 2
    const r = (radius * values[i]) / maxVal
    const x = center + r * Math.cos(angle)
    const y = center + r * Math.sin(angle)
    const catColor = CATEGORY_COLORS[cat] || CATEGORY_COLORS['其他']
    const color = isLight ? catColor.light : catColor.dark

    const delay = i * STAGGER_DELAY
    const localElapsed = Math.max(0, elapsed - delay)
    const entryProgress = Math.min(localElapsed / ENTRY_DURATION, 1)

    if (isStatic || entryProgress <= 0) {
      if (isStatic && values[i] > 0) {
        ctx.beginPath()
        ctx.arc(x, y, dotR, 0, Math.PI * 2)
        ctx.setFillStyle(color)
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
      ctx.setFillStyle(hexToRgba(color, flashAlpha))
      ctx.fill()
    }

    // Glow halo (continuous breathing, staggered per vertex)
    const glowPhaseOffset = i * 0.5
    const glowBreath = isStatic ? 0 : Math.sin(
      ((elapsed + glowPhaseOffset * BREATHING_PERIOD) % BREATHING_PERIOD)
      / BREATHING_PERIOD * Math.PI * 2
    )
    const glowBase = inEntry ? 1.5 : 1.8
    const glowR = dotR * (glowBase + glowBreath * 0.5)
    const glowAlpha = inEntry ? 0.12 : (0.12 + glowBreath * 0.06)

    ctx.beginPath()
    ctx.arc(x, y, glowR, 0, Math.PI * 2)
    ctx.setFillStyle(hexToRgba(color, Math.max(0.04, glowAlpha)))
    ctx.fill()

    // Core dot
    ctx.beginPath()
    ctx.arc(x, y, dotR, 0, Math.PI * 2)
    ctx.setFillStyle(color)
    ctx.fill()
  })

  // ── Labels ──
  const fontSize = Math.max(10, Math.min(13, s / 30))
  ctx.setFontSize(fontSize)
  ctx.setTextAlign('center')
  CATEGORIES.forEach((cat, i) => {
    const angle = (Math.PI * 2 * i) / CATEGORIES.length - Math.PI / 2
    const labelR = radius + labelPad * 0.6
    const x = center + labelR * Math.cos(angle)
    const y = center + labelR * Math.sin(angle)
    const catColor = CATEGORY_COLORS[cat] || CATEGORY_COLORS['其他']
    ctx.setFillStyle(isLight ? catColor.light : hexToRgba(catColor.dark, 0.9))
    ctx.fillText(cat, x, y + fontSize * 0.4)
  })

  ctx.draw()
}
</script>

<style lang="scss" scoped>
.radar-chart {
  display: flex;
  justify-content: center;
  width: 100%;
  position: relative;
}
</style>
