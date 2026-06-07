<template>
  <view class="map-container">
    <map
      :latitude="center.lat"
      :longitude="center.lng"
      :markers="markers"
      :scale="scale"
      class="map"
      @markertap="onMarkerTap"
    />
    <view class="map-controls">
      <picker :value="rangeIndex" :range="ranges" @change="onRangeChange">
        <text class="range-picker">{{ ranges[rangeIndex] }} ▼</text>
      </picker>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  shops: { type: Array, default: () => [] },
  records: { type: Array, default: () => [] }
})

const emit = defineEmits(['markerTap'])

const ranges = ['全国', '省', '城市']
const rangeIndex = ref(0)
const center = ref({ lat: 39.9042, lng: 116.4074 })
const scale = ref(5)

const markers = computed(() => {
  const shopIds = new Set(props.records.filter(r => r.status === '已完成').map(r => r.shopId))
  return props.shops
    .filter(s => shopIds.has(s.id) && s.location)
    .map(s => ({
      id: s.id,
      latitude: s.location.lat,
      longitude: s.location.lng,
      title: s.name,
      callout: { content: s.name, display: 'BYCLICK' }
    }))
})

function onRangeChange(e) {
  rangeIndex.value = e.detail.value
  scale.value = [5, 8, 11][e.detail.value]
}

function onMarkerTap(e) {
  emit('markerTap', e.markerId)
}
</script>

<style scoped>
.map-container { position: relative; }
.map { width: 100%; height: 400rpx; border-radius: 12rpx; }
.map-controls { position: absolute; top: 16rpx; right: 16rpx; }
.range-picker {
  background: #1A1A2E; padding: 8rpx 16rpx; border-radius: 8rpx;
  font-size: 24rpx; color: #FFD700; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.3);
}
</style>
