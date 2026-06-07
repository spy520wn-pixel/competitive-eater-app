<template>
  <view class="level-badge">
    <text class="icon">{{ level.icon }}</text>
    <text class="name">{{ level.name }}</text>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { getLevel } from '../utils/level'

const props = defineProps({ score: { type: Number, default: 0 } })
const level = computed(() => getLevel(props.score))
</script>

<style scoped>
.level-badge { display: flex; align-items: center; gap: 8rpx; }
.icon { font-size: 48rpx; }
.name { font-size: 32rpx; font-weight: bold; color: #FFD700; }
</style>
