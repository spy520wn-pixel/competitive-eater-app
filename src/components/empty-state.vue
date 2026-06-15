<template>
  <view class="empty-state">
    <view class="empty-plate">
      <text class="empty-icon">{{ icon }}</text>
    </view>
    <text class="empty-title">{{ title }}</text>
    <text v-if="description" class="empty-desc">{{ description }}</text>
    <view v-if="actionText" class="empty-action" @tap="$emit('action')">
      <text class="empty-action__text">{{ actionText }}</text>
    </view>
    <text v-if="hint" class="empty-hint">{{ hint }}</text>
  </view>
</template>

<script setup>
defineProps({
  icon: { type: String, default: '🍽️' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  actionText: { type: String, default: '' },
  hint: { type: String, default: '' }
})

defineEmits(['action'])
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx;
  animation: fadeInUp $dur-entrance $ease-out-expo $dur-fast both;
}

.empty-plate {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: linear-gradient(165deg, var(--c-surface-6, $glass-white-6) 0%, var(--c-surface-3, $glass-white-3) 100%);
  border: 1rpx solid var(--c-hairline, $hairline);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $intra-group;
  box-shadow: var(--c-shadow-md, $shadow-md), var(--c-shadow-inner, $shadow-inner);
  animation: emptyFloat 4s $ease-in-out-smooth infinite;
}

.empty-icon {
  font-size: 64rpx;
  animation: emptyBounce 2s $ease-in-out-smooth infinite;
}

.empty-title {
  font-size: var(--text-headline-size, $type-headline-size);
  font-weight: var(--text-headline-weight, $type-headline-weight);
  line-height: var(--text-headline-lh, $type-headline-lh);
  color: var(--c-text-primary, $text-primary);
  margin-bottom: $intra-tight;
  letter-spacing: var(--text-headline-ls, $type-headline-ls);
}

.empty-desc {
  font-size: var(--text-body-size, $type-body-size);
  font-weight: var(--text-body-weight, $type-body-weight);
  line-height: var(--text-body-lh, $type-body-lh);
  color: var(--c-text-tertiary, $text-tertiary);
  margin-bottom: $section-gap;
  text-align: center;
  max-width: 480rpx;
}

.empty-action {
  background: linear-gradient(135deg, var(--c-accent, $accent-orange) 0%, var(--c-accent-light, $accent-orange-light) 100%);
  border-radius: $radius-pill;
  padding: 28rpx 64rpx;
  box-shadow: $shadow-glow-orange-strong;
  transition: transform $dur-normal $ease-spring, box-shadow $dur-normal $ease-spring;
  margin-bottom: $intra-group;
}

.empty-action:active {
  transform: scale(0.96);
  box-shadow: $shadow-glow-orange;
}

.empty-action__text {
  font-size: var(--text-title-size, $type-title-size);
  font-weight: var(--text-title-weight, $type-title-weight);
  line-height: var(--text-title-lh, $type-title-lh);
  color: var(--c-text-on-accent, #FFFFFF);
  letter-spacing: var(--text-title-ls, $type-title-ls);
}

.empty-hint {
  font-size: var(--text-label-size, $type-label-size);
  font-weight: var(--text-label-weight, $type-label-weight);
  line-height: var(--text-label-lh, $type-label-lh);
  color: var(--c-text-muted, $text-muted);
  text-align: center;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes emptyFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12rpx); }
}

@keyframes emptyBounce {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.05) rotate(-3deg); }
  75% { transform: scale(1.05) rotate(3deg); }
}
</style>
