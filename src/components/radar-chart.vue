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
  if (drawTimer) clearTimeout(drawTimer)
  drawTimer = setTimeout(() => draw(), 150)
}

onMounted(() => {
  setTimeout(() => draw(), 100)
  uni.$on('theme-apply', onThemeChange)
})

onUnmounted(() => {
  uni.$off('theme-apply', onThemeChange)
  if (drawTimer) {
    clearTimeout(drawTimer)
    drawTimer = null
  }
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
})

let drawTimer = null
let animationFrame = null
let currentValues = [0, 0, 0, 0, 0, 0]

watch(() => props.data, () => {
  if (drawTimer) clearTimeout(drawTimer)
  drawTimer = setTimeout(() => {
    nextTick(() => animateDraw())
  }, 100)
}, { deep: true })

function animateDraw() {
  const categories = ['肉类', '海鲜', '主食', '甜点', '饮料', '其他']
  const targetValues = categories.map(c => props.data[c] || 0)
  const startValues = [...currentValues]
  const startTime = Date.now()
  const duration = 800

  function animate() {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)

    currentValues = startValues.map((start, i) => {
      return start + (targetValues[i] - start) * eased
    })

    draw(currentValues)

    if (progress < 1) {
      animationFrame = requestAnimationFrame(animate)
    }
  }

  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
  animate()
}

function draw(values = null) {
  const query = uni.createSelectorQuery()
  query.select('.radar-chart').boundingClientRect(rect => {
    if (!rect) return

    const containerW = rect.width
    const s = Math.floor(containerW)
    canvasSize.value = s

    nextTick(() => {
      const ctx = uni.createCanvasContext('radar')
      if (!ctx) return

      const isLight = props.theme === 'light'

      const center = s / 2
      const labelPad = Math.max(16, s * 0.06)
      const radius = center - labelPad
      const categories = ['肉类', '海鲜', '主食', '甜点', '饮料', '其他']
      const drawValues = values || categories.map(c => props.data[c] || 0)
      const maxVal = Math.max(...drawValues, 1)

      ctx.clearRect(0, 0, s, s)

      // Background grid
      for (let level = 1; level <= 5; level++) {
        const r = (radius * level) / 5
        ctx.beginPath()
        categories.forEach((_, i) => {
          const angle = (Math.PI * 2 * i) / categories.length - Math.PI / 2
          const x = center + r * Math.cos(angle)
          const y = center + r * Math.sin(angle)
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.closePath()
        if (isLight) {
          ctx.setStrokeStyle(`rgba(0, 0, 0, ${0.06 + level * 0.03})`)
        } else {
          ctx.setStrokeStyle(`rgba(255, 255, 255, ${0.02 + level * 0.01})`)
        }
        ctx.setLineWidth(1)
        ctx.stroke()
      }

      // Axis lines
      categories.forEach((_, i) => {
        const angle = (Math.PI * 2 * i) / categories.length - Math.PI / 2
        ctx.beginPath()
        ctx.moveTo(center, center)
        ctx.lineTo(center + radius * Math.cos(angle), center + radius * Math.sin(angle))
        ctx.setStrokeStyle(isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.04)')
        ctx.setLineWidth(1)
        ctx.stroke()
      })

      // Data area
      ctx.beginPath()
      categories.forEach((_, i) => {
        const angle = (Math.PI * 2 * i) / categories.length - Math.PI / 2
        const r = (radius * drawValues[i]) / maxVal
        const x = center + r * Math.cos(angle)
        const y = center + r * Math.sin(angle)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.closePath()
      ctx.setFillStyle(isLight ? 'rgba(217, 79, 30, 0.18)' : 'rgba(255, 107, 53, 0.2)')
      ctx.fill()
      ctx.setStrokeStyle(isLight ? '#C04018' : 'rgba(255, 107, 53, 0.8)')
      ctx.setLineWidth(2.5)
      ctx.stroke()

      // Data points
      const dotR = Math.max(3, s / 100)
      categories.forEach((_, i) => {
        const angle = (Math.PI * 2 * i) / categories.length - Math.PI / 2
        const r = (radius * drawValues[i]) / maxVal
        const x = center + r * Math.cos(angle)
        const y = center + r * Math.sin(angle)

        ctx.beginPath()
        ctx.arc(x, y, dotR * 2, 0, Math.PI * 2)
        ctx.setFillStyle(isLight ? 'rgba(217, 79, 30, 0.15)' : 'rgba(255, 107, 53, 0.15)')
        ctx.fill()

        ctx.beginPath()
        ctx.arc(x, y, dotR, 0, Math.PI * 2)
        ctx.setFillStyle(isLight ? '#B83810' : '#FF6B35')
        ctx.fill()
      })

      // Labels
      const fontSize = Math.max(10, Math.min(13, s / 30))
      ctx.setFontSize(fontSize)
      ctx.setFillStyle(isLight ? '#3C3C54' : '#8888AA')
      ctx.setTextAlign('center')
      categories.forEach((cat, i) => {
        const angle = (Math.PI * 2 * i) / categories.length - Math.PI / 2
        const labelR = radius + labelPad * 0.6
        const x = center + labelR * Math.cos(angle)
        const y = center + labelR * Math.sin(angle)
        ctx.fillText(cat, x, y + fontSize * 0.4)
      })

      ctx.draw()
    })
  }).exec()
}
</script>

<style lang="scss" scoped>
.radar-chart {
  display: flex;
  justify-content: center;
  width: 100%;
}
</style>
