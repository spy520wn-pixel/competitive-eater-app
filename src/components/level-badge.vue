<template>
  <view class="level-badge" :class="[sizeClass, layoutClass]">
    <view class="badge-glow" />
    <view class="badge-inner">
      <text class="icon">{{ level.icon }}</text>
      <view class="badge-text">
        <text class="name">{{ level.name }}</text>
        <text class="tier" v-if="level.levelText">{{ level.levelText }}</text>
      </view>
    </view>
    <view v-if="showExp" class="exp-bar-wrap">
      <view class="exp-bar">
        <view class="exp-bar-fill" :style="{ '--fill-scale': level.progress }" />
      </view>
      <text class="exp-text">{{ level.exp }}{{ level.nextExp ? ' / ' + level.nextExp : '' }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { getLevel } from '../utils/level'

const props = defineProps({
  exp: { type: Number, default: 0 },
  size: { type: String, default: 'md' },
  showExp: { type: Boolean, default: false },
  layout: { type: String, default: 'vertical' }
})

const level = computed(() => getLevel(props.exp))
const sizeClass = computed(() => `level-badge--${props.size}`)
const layoutClass = computed(() => `level-badge--${props.layout}`)
</script>

<style lang="scss" scoped>
.level-badge {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
}

/* Vertical layout (default) */
.level-badge--vertical {
  flex-direction: column;
}

/* Horizontal layout */
.level-badge--horizontal {
  flex-direction: row;
  gap: 24rpx;
  align-items: center;
}

.level-badge--horizontal .exp-bar-wrap {
  margin-top: 0;
  min-width: 200rpx;
}

.badge-glow {
  position: absolute;
  inset: -10rpx;
  border-radius: $radius-pill;
  background: radial-gradient(ellipse, var(--c-gold-glow-strong, $glow-gold-strong) 0%, transparent 70%);
  pointer-events: none;
  animation: glowPulse 3s $ease-in-out-smooth infinite;
  will-change: opacity, transform, box-shadow;
  contain: layout style paint;
}

.badge-inner {
  display: flex;
  align-items: center;
  gap: 10rpx;
  background: var(--c-surface-6, $glass-white-6);
  border: 1rpx solid var(--c-surface-10, $glass-white-10);
  border-radius: $radius-pill;
  padding: 10rpx 32rpx;
  position: relative;
  box-shadow: var(--c-shadow-inner, $shadow-inner);
  transition: transform $dur-normal $ease-spring;
  flex-shrink: 0;
}

.badge-inner:active {
  transform: scale(0.97);
}

/* Sizes */
.level-badge--sm .badge-inner {
  padding: 8rpx 18rpx;
  gap: 8rpx;
}
.level-badge--sm .icon { font-size: 28rpx; }
.level-badge--sm .name { font-size: 24rpx; }
.level-badge--sm .tier { font-size: 20rpx; }

.level-badge--md .badge-inner {
  padding: 12rpx 28rpx;
  gap: 12rpx;
}
.level-badge--md .icon { font-size: 36rpx; }
.level-badge--md .name { font-size: 28rpx; }
.level-badge--md .tier { font-size: 22rpx; }

.level-badge--lg .badge-inner {
  padding: 18rpx 40rpx;
  gap: 18rpx;
}
.level-badge--lg .icon { font-size: 52rpx; }
.level-badge--lg .name { font-size: 36rpx; }
.level-badge--lg .tier { font-size: 28rpx; }

.icon {
  line-height: 1;
  animation: iconPop 0.6s $ease-out-expo both;
}

@keyframes iconPop {
  0% { transform: scale(0.5); opacity: 0; }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}

.badge-text {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.name {
  font-weight: 700;
  color: var(--c-gold, $accent-gold);
  letter-spacing: $tracking-wide;
}

.tier {
  color: rgba(255, 215, 0, 0.45);
  font-weight: 500;
  letter-spacing: $tracking-wide;
}

/* Experience Bar */
.exp-bar-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  margin-top: 28rpx;
  width: 100%;
}

.exp-bar {
  width: 100%;
  height: 12rpx;
  background: var(--c-surface-6, $glass-white-6);
  border-radius: $radius-pill;
  overflow: hidden;
  border: 1rpx solid var(--c-surface-8, $glass-white-8);
}

.exp-bar-fill {
  height: 100%;
  width: 100%;
  background: linear-gradient(90deg, var(--c-gold-deep, $accent-gold-deep), var(--c-gold, $accent-gold));
  border-radius: $radius-pill;
  transform-origin: left;
  transform: scaleX(var(--fill-scale, 0));
  transition: transform 1.2s $ease-out-expo;
  box-shadow: 0 0 16rpx rgba(255, 215, 0, 0.35);
  animation: expShimmer 2s $ease-in-out-smooth infinite;
  background-size: 200% 100%;
}

@keyframes expShimmer {
  0% { background-position: 0% 0; }
  50% { background-position: 100% 0; }
  100% { background-position: 0% 0; }
}

.exp-text {
  font-size: 20rpx;
  color: var(--c-text-muted, $text-muted);
  font-variant-numeric: tabular-nums;
}

@keyframes breathe {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.08); }
}
</style>
