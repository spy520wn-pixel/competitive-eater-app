<template>
  <view class="category-tabs">
    <view
      v-for="cat in categories"
      :key="cat"
      class="tab-item"
      :class="{ 'tab-item--active': modelValue === cat }"
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

<style scoped>
.category-tabs {
  display: flex;
  flex-direction: column;
  background: #1A1A2E;
  width: 180rpx;
  padding-top: 16rpx;
}

.tab-item {
  display: flex;
  align-items: center;
  padding: 28rpx 20rpx;
  position: relative;
  transition: background 0.2s;
}

.tab-item--active {
  background: rgba(255, 107, 53, 0.12);
}

.tab-indicator {
  width: 6rpx;
  height: 0;
  border-radius: 3rpx;
  background: transparent;
  margin-right: 16rpx;
  transition: all 0.2s;
}

.tab-item--active .tab-indicator {
  height: 32rpx;
  background: #FF6B35;
}

.tab-text {
  font-size: 28rpx;
  color: #8888AA;
  transition: color 0.2s;
}

.tab-item--active .tab-text {
  color: #FF6B35;
  font-weight: 600;
}
</style>
