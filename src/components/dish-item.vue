<template>
  <view class="dish-item">
    <view class="dish-info">
      <text class="dish-name">{{ item.name }}</text>
      <text class="dish-unit">{{ item.unit }}</text>
    </view>
    <view class="quantity-control">
      <view
        class="qty-btn qty-btn--minus"
        :class="{ 'qty-btn--disabled': quantity <= 0 }"
        @tap="decrease"
      >
        <text class="qty-btn-text">-</text>
      </view>
      <view class="qty-display" @longpress="inputQuantity">
        <text class="qty-value" :class="{ 'qty-value--has': quantity > 0 }">{{ quantity }}</text>
      </view>
      <view class="qty-btn qty-btn--plus" @tap="increase">
        <text class="qty-btn-text">+</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  item: { type: Object, required: true },
  quantity: { type: Number, default: 0 },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:quantity'])

function increase() {
  if (props.disabled) return
  emit('update:quantity', props.quantity + 1)
}

function decrease() {
  if (props.disabled || props.quantity <= 0) return
  emit('update:quantity', Math.max(0, props.quantity - 1))
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

<style scoped>
.dish-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 28rpx;
  border-bottom: 1rpx solid #2D2D44;
}

.dish-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.dish-name {
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: 500;
  margin-bottom: 6rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dish-unit {
  font-size: 24rpx;
  color: #8888AA;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.qty-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2D2D44;
}

.qty-btn--plus {
  background: #FF6B35;
}

.qty-btn--disabled {
  opacity: 0.4;
}

.qty-btn-text {
  font-size: 34rpx;
  color: #FFFFFF;
  font-weight: 700;
  line-height: 1;
}

.qty-display {
  width: 80rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0F0F1A;
  border-radius: 12rpx;
}

.qty-value {
  font-size: 30rpx;
  color: #8888AA;
  font-weight: 600;
}

.qty-value--has {
  color: #FFD700;
}
</style>
