<template>
  <view v-if="visible" class="tier-picker-mask" @tap="close">
    <view class="tier-picker" @tap.stop>
      <view class="picker-header">
        <text class="picker-title">选择档位</text>
      </view>
      <view class="picker-body">
        <view
          v-for="tier in tiers"
          :key="tier.id"
          class="tier-card"
          :class="{ 'tier-card--selected': selectedId === tier.id }"
          @tap="onSelect(tier)"
        >
          <view class="tier-card__left">
            <text class="tier-card__name">{{ tier.name }}</text>
            <text class="tier-card__count">{{ tier.menu.length }}道菜品</text>
          </view>
          <view v-if="selectedId === tier.id" class="tier-card__check">
            <text class="check-icon">✓</text>
          </view>
        </view>
        <view v-if="tiers.length === 0" class="empty-tip">
          <text class="empty-tip__text">暂无档位</text>
        </view>
      </view>
      <view class="picker-footer">
        <view class="btn-cancel" @tap="close">
          <text class="btn-cancel__text">取消</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  tiers: { type: Array, default: () => [] },
  selectedId: { type: String, default: '' }
})

const emit = defineEmits(['update:visible', 'select'])

function close() {
  emit('update:visible', false)
}

function onSelect(tier) {
  emit('select', tier)
  close()
}
</script>

<style scoped>
.tier-picker-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.tier-picker {
  width: 600rpx;
  background: #1A1A2E;
  border-radius: 24rpx;
  overflow: hidden;
}

.picker-header {
  padding: 32rpx;
  border-bottom: 1rpx solid #2D2D44;
}

.picker-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.picker-body {
  padding: 24rpx;
  max-height: 600rpx;
  overflow-y: auto;
}

.tier-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 24rpx;
  margin-bottom: 16rpx;
  background: #2D2D44;
  border-radius: 16rpx;
  border: 2rpx solid transparent;
  transition: all 0.2s;
}

.tier-card--selected {
  border-color: #FF6B35;
  background: rgba(255, 107, 53, 0.1);
}

.tier-card__left {
  display: flex;
  flex-direction: column;
}

.tier-card__name {
  font-size: 30rpx;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 6rpx;
}

.tier-card__count {
  font-size: 24rpx;
  color: #8888AA;
}

.tier-card__check {
  width: 44rpx;
  height: 44rpx;
  border-radius: 22rpx;
  background: #FF6B35;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-icon {
  font-size: 26rpx;
  color: #FFFFFF;
  font-weight: 700;
}

.empty-tip {
  padding: 60rpx 0;
  text-align: center;
}

.empty-tip__text {
  font-size: 28rpx;
  color: #8888AA;
}

.picker-footer {
  padding: 20rpx 24rpx 32rpx;
  border-top: 1rpx solid #2D2D44;
}

.btn-cancel {
  padding: 20rpx;
  text-align: center;
  background: #2D2D44;
  border-radius: 16rpx;
}

.btn-cancel__text {
  font-size: 30rpx;
  color: #8888AA;
}
</style>
