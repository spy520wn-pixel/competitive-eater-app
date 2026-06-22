<template>
  <view class="search-bar">
    <text class="search-icon">🔍</text>
    <input
      class="search-input"
      :placeholder="placeholder"
      placeholder-class="search-placeholder"
      :value="modelValue"
      @input="onInput"
      :aria-label="ariaLabel"
    />
    <text
      v-if="modelValue"
      class="search-clear"
      @tap="onClear"
      role="button"
      aria-label="清除搜索"
    >✕</text>
    <slot name="extra" />
  </view>
</template>

<script setup>
import { onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '搜索...' },
  ariaLabel: { type: String, default: '搜索' },
  debounce: { type: Number, default: 200 }
})

const emit = defineEmits(['update:modelValue'])

let timer = null

function onInput(e) {
  const value = e.detail.value
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    emit('update:modelValue', value)
  }, props.debounce)
}

function onClear() {
  if (timer) clearTimeout(timer)
  timer = null
  emit('update:modelValue', '')
}

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})
</script>

<style lang="scss" scoped>
.search-bar {
  display: flex;
  align-items: center;
  background: var(--c-surface-3, $glass-white-3);
  border: 1rpx solid var(--c-surface-5, $glass-white-5);
  border-radius: $radius-lg;
  padding: 22rpx 28rpx;
  margin-bottom: $section-gap;
  position: relative;
  z-index: 1;
  letter-spacing: $tracking-wide;
  animation: fadeInUp $dur-slow $ease-out-expo both;
}

.search-icon {
  font-size: 28rpx;
  margin-right: $intra-group;
  opacity: 0.5;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: var(--c-text-primary, $text-primary);
  background: transparent;
  border: none;
  padding: 0;
  height: 100%;
}

.search-placeholder {
  color: var(--c-text-muted, $text-muted);
}

.search-clear {
  font-size: 28rpx;
  color: var(--c-text-muted, $text-muted);
  padding: 16rpx 20rpx;
  margin-left: 8rpx;
  opacity: 0.6;
  transition: opacity $dur-micro $ease-out-expo;

  &:active {
    opacity: 1;
  }
}
</style>
