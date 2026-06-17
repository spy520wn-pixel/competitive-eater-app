<template>
  <view class="category-tabs" role="tablist">
    <view
      v-for="(cat, index) in categories"
      :key="cat"
      class="tab-item"
      :class="{ 'tab-item--active': modelValue === cat }"
      :style="{ animationDelay: index * 50 + 'ms' }"
      :aria-selected="modelValue === cat"
      role="tab"
      @tap="$emit('update:modelValue', cat)"
    >
      <view class="tab-indicator" :style="modelValue === cat ? { background: getCategoryColor(cat), boxShadow: '0 0 24rpx ' + getCategoryGlow(cat) } : {}" />
      <text class="tab-text" :style="modelValue === cat ? { color: getCategoryColor(cat) } : {}">{{ cat }}</text>
    </view>
  </view>
</template>

<script setup>
import { CATEGORY_CSS } from '@/utils/category-constants.js'

defineProps({
  categories: { type: Array, default: () => [] },
  modelValue: { type: String, default: '' }
})

defineEmits(['update:modelValue'])

function getCategoryColor(name) {
  return (CATEGORY_CSS[name] || CATEGORY_CSS['其他']).color
}

function getCategoryGlow(name) {
  return (CATEGORY_CSS[name] || CATEGORY_CSS['其他']).glow
}
</script>

<style lang="scss" scoped>
.category-tabs {
  display: flex;
  flex-direction: column;
  background: var(--c-surface-0, #08080F);
  width: 220rpx;
  padding-top: 8rpx;
  border-right: 2rpx solid rgba(255, 107, 53, 0.12);
}

.tab-item {
  display: flex;
  align-items: center;
  min-height: 100rpx;
  padding: 30rpx 22rpx;
  position: relative;
  transition: background $dur-normal $ease-spring, transform $dur-fast $ease-spring;
  animation: fadeInLeft $dur-entrance $ease-out-expo both;
}

.tab-item:active {
  transform: scale(0.97);
}

.tab-item--active {
  background: rgba(255, 107, 53, 0.08);
}

.tab-indicator {
  width: 8rpx;
  height: 42rpx;
  border-radius: 4rpx;
  background: transparent;
  margin-right: 20rpx;
  transform: scaleY(0);
  transform-origin: center;
  transition: transform $dur-slow $ease-out-expo, background $dur-slow $ease-out-expo, box-shadow $dur-slow $ease-out-expo;
}

.tab-item--active .tab-indicator {
  transform: scaleY(1);
  background: var(--c-accent, $accent-orange);
  box-shadow: 0 0 24rpx var(--c-accent-glow, $glow-orange);
  animation: indicatorGlow 2s $ease-in-out-smooth infinite;
}

@keyframes indicatorGlow {
  0%, 100% { box-shadow: 0 0 20rpx var(--c-accent-glow, $glow-orange); }
  50% { box-shadow: 0 0 36rpx var(--c-accent-glow-strong, $glow-orange-strong); }
}

.tab-text {
  font-size: 30rpx;
  color: var(--c-text-tertiary, $text-tertiary);
  transition: color $dur-normal $ease-spring, font-weight $dur-normal $ease-spring;
  letter-spacing: $tracking-normal;
}

.tab-item--active .tab-text {
  color: var(--c-accent, $accent-orange);
  font-weight: 700;
}
</style>
