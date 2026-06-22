<template>
  <view v-if="visible" class="tier-picker-mask" @tap="close" @keydown.esc="close">
    <view class="tier-picker" @tap.stop role="dialog" aria-modal="true" tabindex="-1">
      <!-- Glass highlight -->
      <view class="picker-glass" />

      <view class="picker-header">
        <view class="header-dot" />
        <text class="picker-title">选择档位</text>
      </view>

      <view class="picker-body">
        <view
          v-for="(tier, index) in tiers"
          :key="tier.id"
          class="tier-card"
          :class="{ 'tier-card--selected': selectedId === tier.id }"
          :style="{ animationDelay: index * 80 + 'ms' }"
          role="button"
          tabindex="0"
          :aria-label="'选择档位 ' + tier.name"
          @tap="onSelect(tier)"
          @keydown.enter="onSelect(tier)"
        >
          <view class="tier-card__left">
            <text class="tier-card__name">{{ tier.name }}</text>
            <text class="tier-card__count">{{ tier.menu.length }} 道菜品</text>
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
        <view class="btn-cancel" role="button" tabindex="0" aria-label="取消" @tap="close" @keydown.enter="close">
          <text class="btn-cancel__text">取消</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
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

<style lang="scss" scoped>
.tier-picker-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--c-overlay, $glass-black-60);
  backdrop-filter: blur(12rpx);
  -webkit-backdrop-filter: blur(12rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $z-modal;
  animation: fadeIn $dur-fast $ease-out-expo;
}

.tier-picker {
  width: 90vw;
  max-width: 620rpx;
  background: var(--c-surface-1, $surface-1);
  border-radius: $radius-3xl;
  overflow: hidden;
  border: 1rpx solid var(--c-hairline, $hairline);
  position: relative;
  animation: scaleIn $dur-normal $ease-out-expo;
  box-shadow: var(--c-shadow-2xl, $shadow-2xl);
}

.picker-glass {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200rpx;
  background: linear-gradient(180deg, var(--c-surface-3, $glass-white-3) 0%, transparent 100%);
  pointer-events: none;
}

.picker-header {
  padding: 32rpx 36rpx;
  border-bottom: 1rpx solid var(--c-border-subtle, $hairline-subtle);
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.header-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: var(--c-accent, $accent-orange);
  box-shadow: 0 0 16rpx var(--c-accent-glow-strong, $glow-orange-strong);
}

.picker-title {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--c-text-primary, $text-primary);
  letter-spacing: $tracking-normal;
}

.picker-body {
  padding: 28rpx;
  max-height: 600rpx;
  overflow-y: auto;
}

.tier-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  margin-bottom: 18rpx;
  background: var(--c-surface-3, $glass-white-3);
  border-radius: $radius-xl;
  border: 1rpx solid var(--c-border-subtle, $hairline-subtle);
  transition: transform $dur-normal $ease-spring, background $dur-normal $ease-spring, border-color $dur-normal $ease-spring, box-shadow $dur-normal $ease-spring;
  animation: fadeInUp $dur-entrance $ease-out-expo both;
}

.tier-card:active {
  transform: scale(0.97);
}

.tier-card--selected {
  border-color: rgba(255, 107, 53, 0.35);
  background: var(--c-accent-soft, $glow-orange-soft);
  box-shadow: 0 0 32rpx var(--c-accent-glow, $glow-orange);
}

.tier-card__left {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.tier-card__name {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--c-text-primary, $text-primary);
  letter-spacing: $tracking-normal;
}

.tier-card__count {
  font-size: 24rpx;
  color: var(--c-text-tertiary, $text-tertiary);
  letter-spacing: $tracking-wide;
}

.tier-card__check {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--c-accent, $accent-orange), var(--c-accent-light, $accent-orange-light));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-glow-orange;
}

.check-icon {
  font-size: 28rpx;
  color: var(--c-text-on-accent, #FFFFFF);
  font-weight: 700;
}

.empty-tip {
  padding: 64rpx 0;
  text-align: center;
}

.empty-tip__text {
  font-size: 28rpx;
  color: var(--c-text-tertiary, $text-tertiary);
}

.picker-footer {
  padding: 18rpx 28rpx 32rpx;
  border-top: 1rpx solid var(--c-border-subtle, $hairline-subtle);
}

.btn-cancel {
  padding: 18rpx;
  text-align: center;
  background: var(--c-surface-4, $glass-white-4);
  border-radius: $radius-xl;
  border: 1rpx solid var(--c-border-subtle, $hairline-subtle);
  transition: background $dur-fast $ease-spring, transform $dur-fast $ease-spring;
}

.btn-cancel:active {
  background: var(--c-surface-8, $glass-white-8);
  transform: scale(0.97);
}

.btn-cancel__text {
  font-size: 30rpx;
  color: var(--c-text-secondary, $text-secondary);
  letter-spacing: $tracking-normal;
}
</style>
