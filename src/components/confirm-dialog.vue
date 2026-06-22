<template>
  <view v-if="visible" class="confirm-mask" @tap.self="$emit('cancel')" @keydown.esc="$emit('cancel')">
    <view class="confirm-dialog" role="dialog" aria-modal="true" :aria-label="title" @tap.stop tabindex="-1" ref="dialogRef">
      <view class="confirm-glow" />
      <view class="confirm-content">
        <text class="confirm-title">{{ title }}</text>
        <text v-if="description" class="confirm-desc">{{ description }}</text>
        <slot />
        <view class="confirm-actions">
          <view class="confirm-btn confirm-btn--cancel" role="button" tabindex="0" :aria-label="cancelText" @tap="$emit('cancel')" @keydown.enter="$emit('cancel')">
            <text class="confirm-btn-text">{{ cancelText }}</text>
          </view>
          <view
            class="confirm-btn confirm-btn--confirm"
            :class="{ 'confirm-btn--danger': danger }"
            role="button"
            tabindex="0"
            :aria-label="confirmText"
            @tap="$emit('confirm')"
            @keydown.enter="$emit('confirm')"
          >
            <text class="confirm-btn-text confirm-btn-text--confirm">{{ confirmText }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  confirmText: { type: String, default: '确认' },
  cancelText: { type: String, default: '取消' },
  danger: { type: Boolean, default: false }
})

defineEmits(['confirm', 'cancel'])

const dialogRef = ref(null)

watch(() => props.visible, (val) => {
  if (val) {
    nextTick(() => {
      if (dialogRef.value) {
        dialogRef.value.focus?.()
      }
    })
  }
})
</script>

<style lang="scss" scoped>
.confirm-mask {
  position: fixed;
  inset: 0;
  background: var(--c-overlay, $glass-black-60);
  backdrop-filter: blur(12rpx);
  -webkit-backdrop-filter: blur(12rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $z-modal;
  animation: fadeIn $dur-fast $ease-in-out-smooth;
}

.confirm-dialog {
  width: 90vw;
  max-width: 680rpx;
  background: var(--c-bg-elevated, $abyss);
  border: 1rpx solid var(--c-border, $hairline);
  border-radius: $radius-3xl;
  box-shadow: var(--c-card-shadow-elevated);
  overflow: hidden;
  animation: scaleIn $dur-normal $ease-out-expo;
  position: relative;
}

.confirm-glow {
  position: absolute;
  top: -50%;
  left: 50%;
  transform: translateX(-50%);
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  background: radial-gradient(ellipse, var(--c-accent-glow, $glow-orange) 0%, transparent 70%);
  pointer-events: none;
}

.confirm-content {
  padding: $section-gap $card-pad-inner;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $intra-group;
  position: relative;
}

.confirm-title {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--c-text-primary, $text-primary);
  text-align: center;
}

.confirm-desc {
  font-size: 26rpx;
  color: var(--c-text-secondary, $text-secondary);
  text-align: center;
}

.confirm-actions {
  display: flex;
  gap: $intra-group;
  width: 100%;
  margin-top: $intra-group;
}

.confirm-btn {
  flex: 1;
  height: 100rpx;
  border-radius: $radius-xl;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform $dur-fast $ease-spring;
}

.confirm-btn:active {
  transform: scale(0.97);
}

.confirm-btn--cancel {
  background: var(--c-surface-4, $glass-white-4);
  border: 1rpx solid var(--c-hairline, $hairline);
}

.confirm-btn--confirm {
  background: linear-gradient(135deg, var(--c-accent, $accent-orange), var(--c-accent-light, $accent-orange-light));
  box-shadow: $shadow-glow-orange;
}

.confirm-btn--danger {
  background: linear-gradient(135deg, var(--c-danger, $accent-danger), $accent-danger-light);
  box-shadow: $shadow-glow-danger;
}

.confirm-btn-text {
  font-size: 30rpx;
  color: var(--c-text-secondary, $text-secondary);
  font-weight: 600;
  letter-spacing: $tracking-wide;
}

.confirm-btn-text--confirm {
  color: var(--c-text-on-accent, #FFFFFF);
}
</style>
