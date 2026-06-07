<template>
  <view class="radar-chart">
    <canvas canvas-id="radar" id="radar" class="canvas" />
  </view>
</template>

<script setup>
import { watch, onMounted } from 'vue'

const props = defineProps({
  data: { type: Object, default: () => ({}) },
  size: { type: Number, default: 300 }
})

onMounted(() => { draw() })
watch(() => props.data, () => { draw() }, { deep: true })

function draw() {
  const ctx = uni.createCanvasContext('radar')
  const center = props.size / 2
  const radius = props.size / 2 - 40
  const categories = ['肉类', '海鲜', '主食', '甜点', '饮料', '其他']
  const values = categories.map(c => props.data[c] || 0)
  const maxVal = Math.max(...values, 1)

  ctx.clearRect(0, 0, props.size, props.size)

  // Draw background grid (5 levels)
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
    ctx.setStrokeStyle('#2D2D44')
    ctx.setLineWidth(1)
    ctx.stroke()
  }

  // Draw axis lines
  categories.forEach((_, i) => {
    const angle = (Math.PI * 2 * i) / categories.length - Math.PI / 2
    ctx.beginPath()
    ctx.moveTo(center, center)
    ctx.lineTo(center + radius * Math.cos(angle), center + radius * Math.sin(angle))
    ctx.setStrokeStyle('#2D2D44')
    ctx.setLineWidth(1)
    ctx.stroke()
  })

  // Draw data area (filled polygon)
  ctx.beginPath()
  categories.forEach((_, i) => {
    const angle = (Math.PI * 2 * i) / categories.length - Math.PI / 2
    const r = (radius * values[i]) / maxVal
    const x = center + r * Math.cos(angle)
    const y = center + r * Math.sin(angle)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.closePath()
  ctx.setFillStyle('rgba(255, 107, 53, 0.3)')
  ctx.fill()
  ctx.setStrokeStyle('#FF6B35')
  ctx.setLineWidth(2)
  ctx.stroke()

  // Draw data points (glowing dots)
  categories.forEach((_, i) => {
    const angle = (Math.PI * 2 * i) / categories.length - Math.PI / 2
    const r = (radius * values[i]) / maxVal
    const x = center + r * Math.cos(angle)
    const y = center + r * Math.sin(angle)
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.setFillStyle('#FF6B35')
    ctx.fill()
  })

  // Draw labels
  ctx.setFontSize(12)
  ctx.setFillStyle('#AAAAAA')
  ctx.setTextAlign('center')
  categories.forEach((cat, i) => {
    const angle = (Math.PI * 2 * i) / categories.length - Math.PI / 2
    const x = center + (radius + 20) * Math.cos(angle)
    const y = center + (radius + 20) * Math.sin(angle)
    ctx.fillText(cat, x, y + 4)
  })

  ctx.draw()
}
</script>

<style scoped>
.radar-chart { display: flex; justify-content: center; }
.canvas { width: 300px; height: 300px; }
</style>
