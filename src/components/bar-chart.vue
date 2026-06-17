<template>
  <view class="bar-chart">
    <view
      v-for="(item, index) in sortedData"
      :key="item.name"
      class="bar-row"
      :style="{ animationDelay: index * 100 + 'ms' }"
    >
      <text class="bar-label" :style="{ color: getCategoryColor(item.name) }">{{ item.name }}</text>
      <view class="bar-track">
        <view class="bar-fill" :style="{ transform: 'scaleX(' + item.percent / 100 + ')', background: getCategoryColor(item.name) }" />
        <view class="bar-glow" :style="{ transform: 'scaleX(' + item.percent / 100 + ')', background: getCategoryGlow(item.name) }" />
      </view>
      <text class="bar-value" :style="{ color: getCategoryColor(item.name) }">{{ item.value }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { CATEGORY_CSS } from '@/utils/category-constants.js'

const props = defineProps({
  data: { type: Object, default: () => ({}) }
})

function getCategoryColor(name) {
  return (CATEGORY_CSS[name] || CATEGORY_CSS['其他']).color
}

function getCategoryGlow(name) {
  return (CATEGORY_CSS[name] || CATEGORY_CSS['其他']).glow
}

const sortedData = computed(() => {
  const entries = Object.entries(props.data).map(([name, value]) => ({ name, value }))
  entries.sort((a, b) => b.value - a.value)
  const top6 = entries.slice(0, 6)
  const max = Math.max(...top6.map(e => e.value), 1)
  return top6.map(e => ({ ...e, percent: (e.value / max) * 100 }))
})
</script>

<style lang="scss" scoped>
.bar-chart {
  padding: 8rpx 0;
}

.bar-row {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  animation: fadeInUpSoft $dur-slow $ease-out-expo both;
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
  transition: transform 1s $ease-out-expo;
  will-change: transform;
  position: relative;
  z-index: 2;
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
  transition: transform 1s $ease-out-expo;
  z-index: 1;
}

.bar-value {
  width: 52rpx;
  text-align: right;
  font-size: 22rpx;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
  letter-spacing: $tracking-tight;
}
</style>
