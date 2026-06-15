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
      <view class="tab-indicator" />
      <text class="tab-text">{{ cat }}</text>
    </view>
  </view>
</template>

<script setup>
defineProps({
  categories: { type: Array, default: () => [] },
  modelValue: { type: String, default: '' }
})

defineEmits(['update:modelValue'])
</script>

<style lang="scss" scoped>
.category-tabs {
  display: flex;
  flex-direction: column;
  background: var(--c-surface-0, #08080F);
  width: 200rpx;
  padding-top: 8rpx;
  border-right: 1rpx solid var(--c-border-subtle, $hairline-subtle);
}

.tab-item {
  display: flex;
  align-items: center;
  min-height: 88rpx;
  padding: 30rpx 18rpx;
  position: relative;
  transition: background $dur-normal $ease-spring, transform $dur-fast $ease-spring;
  animation: fadeInLeft $dur-entrance $ease-out-expo both;
}

.tab-item:active {
  transform: scale(0.98);
}

.tab-item--active {
  background: var(--c-surface-4, $glass-white-4);
}

.tab-indicator {
  width: 6rpx;
  height: 38rpx;
  border-radius: 3rpx;
  background: transparent;
  margin-right: 18rpx;
  transform: scaleY(0);
  transform-origin: top;
  transition: transform $dur-normal $ease-spring, background $dur-normal $ease-spring, box-shadow $dur-normal $ease-spring;
}

.tab-item--active .tab-indicator {
  transform: scaleY(1);
  background: linear-gradient(180deg, var(--c-accent, $accent-orange), var(--c-accent-light, $accent-orange-light));
  box-shadow: 0 0 16rpx var(--c-accent-glow, $glow-orange);
}

.tab-text {
  font-size: 28rpx;
  color: var(--c-text-tertiary, $text-tertiary);
  transition: color $dur-normal $ease-spring, font-weight $dur-normal $ease-spring;
  letter-spacing: $tracking-normal;
}

.tab-item--active .tab-text {
  color: var(--c-accent, $accent-orange);
  font-weight: 600;
}
</style>
