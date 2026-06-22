<template>
  <view class="bar-chart" role="list" aria-label="品类统计">
    <view
      v-for="(item, index) in sortedData"
      :key="item.name"
      class="bar-row"
      role="listitem"
      :aria-label="item.name + ' ' + item.value + '份'"
      :class="{ 'bar-row--entering': isEntering }"
      :style="{ '--bar-delay': index * 80 + 'ms', '--bar-percent': item.percent / 100, animationDelay: index * 80 + 'ms' }"
    >
      <text class="bar-label" :style="{ color: getCategoryColor(item.name) }">{{ item.name }}</text>
      <view class="bar-track" role="meter" :aria-valuenow="item.percent" aria-valuemin="0" aria-valuemax="100">
        <view class="bar-fill" :style="{ background: getCategoryColor(item.name) }" />
        <view class="bar-glow" :style="{ background: getCategoryGlow(item.name) }" />
      </view>
      <text class="bar-value" :style="{ color: getCategoryColor(item.name) }">{{ item.value }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getCategoryColor, getCategoryGlow } from '@/utils/category-constants.js'

const props = defineProps({
  data: { type: Object, default: () => ({}) }
})

const isEntering = ref(false)

const sortedData = computed(() => {
  const entries = Object.entries(props.data).map(([name, value]) => ({ name, value }))
  entries.sort((a, b) => b.value - a.value)
  const top6 = entries.slice(0, 6)
  const max = Math.max(...top6.map(e => e.value), 1)
  return top6.map(e => ({ ...e, percent: (e.value / max) * 100 }))
})

function triggerEnterAnimation() {
  isEntering.value = false
  // 下一帧开始动画
  requestAnimationFrame(() => {
    isEntering.value = true
  })
}

onMounted(() => {
  triggerEnterAnimation()
})

// 数据变化时也触发动画
watch(() => props.data, () => {
  triggerEnterAnimation()
}, { deep: true })
</script>

<style lang="scss" scoped>
.bar-chart {
  padding: 8rpx 0;
}

.bar-row {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  opacity: 0;
  transform: translateY(8rpx);
}

.bar-row--entering {
  animation: barEnter $dur-slow $ease-out-expo both;
  animation-delay: var(--bar-delay, 0ms);
}

@keyframes barEnter {
  from {
    opacity: 0;
    transform: translateY(8rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bar-label {
  width: 64rpx;
  font-size: 22rpx;
  color: var(--c-text-secondary, $text-secondary);
  flex-shrink: 0;
  letter-spacing: $tracking-normal;
}

.bar-track {
  flex: 1;
  height: 24rpx;
  background: var(--c-surface-3, $glass-white-3);
  border-radius: 12rpx;
  margin: 0 16rpx;
  overflow: hidden;
  position: relative;
  border: 1rpx solid var(--c-border-subtle, $hairline-subtle);
}

.bar-fill {
  height: 100%;
  width: 100%;
  border-radius: 12rpx;
  transform-origin: left;
  transform: scaleX(0);
  position: relative;
  z-index: 2;
}

.bar-row--entering .bar-fill {
  animation: barFillGrow 0.8s $ease-out-expo both;
  animation-delay: calc(var(--bar-delay, 0ms) + 150ms);
}

@keyframes barFillGrow {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(var(--bar-percent, 1));
  }
}

.bar-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
  filter: blur(10rpx);
  transform-origin: left;
  transform: scaleX(0);
  z-index: 1;
}

.bar-row--entering .bar-glow {
  animation: barFillGrow 0.8s $ease-out-expo both;
  animation-delay: calc(var(--bar-delay, 0ms) + 150ms);
}

.bar-value {
  width: 52rpx;
  text-align: right;
  font-size: 22rpx;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
  letter-spacing: $tracking-tight;
  opacity: 0;
}

.bar-row--entering .bar-value {
  animation: barValueReveal 0.4s $ease-out-expo both;
  animation-delay: calc(var(--bar-delay, 0ms) + 500ms);
}

@keyframes barValueReveal {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

// Reduced motion support
@media (prefers-reduced-motion: reduce) {
  .bar-row {
    opacity: 1;
    transform: none;
  }

  .bar-row--entering,
  .bar-row--entering .bar-fill,
  .bar-row--entering .bar-glow,
  .bar-row--entering .bar-value {
    animation: none;
  }

  .bar-fill,
  .bar-glow {
    transform: scaleX(var(--bar-percent, 1));
  }

  .bar-value {
    opacity: 1;
  }
}
</style>
