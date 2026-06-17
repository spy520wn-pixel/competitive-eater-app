<template>
  <view class="dish-item" :class="{ 'dish-item--active': quantity > 0 }">
    <view class="dish-info">
      <text class="dish-name">{{ item.name }}</text>
      <text class="dish-unit">{{ item.unit }}</text>
    </view>
    <view class="quantity-control">
      <view
        class="qty-btn qty-btn--minus"
        aria-label="减少数量"
        :class="{ 'qty-btn--disabled': quantity <= 0 }"
        @tap="decrease"
      >
        <text class="qty-btn-text">−</text>
      </view>
      <view class="qty-display" @longpress="inputQuantity">
        <text class="qty-value" :class="{ 'qty-value--has': quantity > 0, 'qty-value--bump': bumpKey }" :key="bumpKey">{{ quantity }}</text>
      </view>
      <view class="qty-btn qty-btn--plus" aria-label="增加数量" @tap="increase">
        <text class="qty-btn-text">+</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  item: { type: Object, required: true },
  quantity: { type: Number, default: 0 },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:quantity'])
const bumpKey = ref(0)

function increase() {
  if (props.disabled) return
  emit('update:quantity', props.quantity + 1)
  bumpKey.value++
  // #ifdef APP-PLUS
  uni.vibrateShort({ type: 'light' })
  // #endif
}

function decrease() {
  if (props.disabled || props.quantity <= 0) return
  emit('update:quantity', Math.max(0, props.quantity - 1))
  bumpKey.value++
  // #ifdef APP-PLUS
  uni.vibrateShort({ type: 'light' })
  // #endif
}

function inputQuantity() {
  if (props.disabled) return
  uni.showModal({
    title: '输入数量',
    editable: true,
    placeholderText: '支持小数，如 0.5',
    content: String(props.quantity),
    success(res) {
      if (res.confirm && res.content) {
        const val = parseFloat(res.content)
        if (!isNaN(val) && val >= 0) {
          emit('update:quantity', val)
        }
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.dish-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 36rpx 30rpx;
  border-bottom: 1rpx solid var(--c-border-subtle, $hairline-subtle);
  transition: background $dur-normal $ease-spring;
}

.dish-item--active {
  background: rgba(255, 107, 53, 0.10);
}

.dish-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.dish-name {
  font-size: 32rpx;
  color: var(--c-text-primary, $text-primary);
  font-weight: 600;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color $dur-normal $ease-spring;
  letter-spacing: $tracking-normal;
}

.dish-item--active .dish-name {
  color: var(--c-accent, $accent-orange);
}

.dish-unit {
  font-size: 22rpx;
  color: var(--c-text-tertiary, $text-tertiary);
  letter-spacing: $tracking-wide;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.qty-btn {
  width: 96rpx;
  height: 96rpx;
  border-radius: $radius-xl;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform $dur-fast $ease-spring, box-shadow $dur-normal $ease-spring;
}

.qty-btn:active {
  transform: scale(0.88);
}

.qty-btn--minus {
  background: var(--c-surface-5, $glass-white-5);
  border: 1rpx solid var(--c-hairline, $hairline);
}

.qty-btn--plus {
  background: linear-gradient(135deg, var(--c-accent, $accent-orange), var(--c-accent-light, $accent-orange-light));
  box-shadow: $shadow-glow-orange;
}

.qty-btn--plus:active {
  box-shadow: $shadow-glow-orange-strong;
}

.qty-btn--disabled {
  opacity: 0.25;
  pointer-events: none;
}

.qty-btn-text {
  font-size: 38rpx;
  color: var(--c-text-on-accent, #FFFFFF);
  font-weight: 600;
  line-height: 1;
}

.qty-display {
  width: 84rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--c-surface-3, $glass-white-3);
  border-radius: $radius-md;
  border: 1rpx solid var(--c-border-subtle, $hairline-subtle);
}

.qty-value {
  font-size: 30rpx;
  color: var(--c-text-tertiary, $text-tertiary);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  transition: color $dur-normal $ease-spring;
}

.qty-value--has {
  color: var(--c-gold, $accent-gold);
}

.qty-value--bump {
  animation: qtyBump 0.35s $ease-out-expo;
}

@keyframes qtyBump {
  0% { transform: scale(1); }
  30% { transform: scale(1.4); }
  60% { transform: scale(0.92); }
  100% { transform: scale(1); }
}
</style>
