<template>
  <view class="bar-chart">
    <view v-for="item in sortedData" :key="item.name" class="bar-row">
      <text class="bar-label">{{ item.name }}</text>
      <view class="bar-track">
        <view class="bar-fill" :style="{ width: item.percent + '%' }" />
      </view>
      <text class="bar-value">{{ item.value }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Object, default: () => ({}) }
})

const sortedData = computed(() => {
  const entries = Object.entries(props.data).map(([name, value]) => ({ name, value }))
  entries.sort((a, b) => b.value - a.value)
  const max = Math.max(...entries.map(e => e.value), 1)
  return entries.map(e => ({ ...e, percent: (e.value / max) * 100 }))
})
</script>

<style scoped>
.bar-chart { padding: 16rpx; }
.bar-row { display: flex; align-items: center; margin-bottom: 20rpx; }
.bar-label { width: 80rpx; font-size: 24rpx; color: #AAAAAA; }
.bar-track { flex: 1; height: 28rpx; background: #1A1A2E; border-radius: 14rpx; margin: 0 16rpx; overflow: hidden; }
.bar-fill {
  height: 100%; border-radius: 14rpx;
  background: linear-gradient(90deg, #FF6B35, #FFD700);
  transition: width 0.6s ease;
}
.bar-value { width: 60rpx; text-align: right; font-size: 24rpx; color: #FFD700; font-weight: bold; }
</style>
