<template>
  <view class="page">
    <!-- Profile Card — Double-Bezel -->
    <view class="profile-shell">
      <view class="profile-core">
        <view class="profile-glow" />
        <view class="profile-card">
          <view class="profile-card__avatar">
            <view class="avatar-ring" :class="'avatar-ring--' + level.tier" />
            <text class="avatar-icon">{{ level.icon }}</text>
          </view>
          <view class="profile-card__info">
            <text class="profile-name">大胃王选手</text>
            <view class="level-row">
              <text class="level-icon">{{ level.icon }}</text>
              <text class="level-text">{{ level.name }}</text>
              <text class="level-tier" v-if="level.levelText">{{ level.levelText }}</text>
            </view>
            <view class="exp-bar-row">
              <view class="exp-bar">
                <view class="exp-bar-fill" :style="{ '--fill-scale': level.progress }" />
              </view>
              <text class="exp-text">{{ stats.totalExp }}{{ level.nextExp ? ' / ' + level.nextExp : '' }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Stats Banner — Double-Bezel -->
    <view class="stats-shell">
      <view class="stats-core">
        <view class="stat-item">
          <text class="stat-item__num">{{ stats.totalRecords }}</text>
          <text class="stat-item__label">挑战次数</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item">
          <text class="stat-item__num">{{ stats.shopCount }}</text>
          <text class="stat-item__label">已挑战</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item">
          <text class="stat-item__num">{{ stats.maxScore }}</text>
          <text class="stat-item__label">最高分</text>
        </view>
      </view>
    </view>

    <!-- Menu List — Glass Cards -->
    <view class="menu-section">
      <view
        v-for="(item, index) in menuItems"
        :key="item.path"
        class="menu-item"
        role="button"
        :aria-label="item.label"
        :style="{ animationDelay: index * 80 + 'ms' }"
        @tap="goTo(item.path)"
      >
        <view class="menu-item__left">
          <view class="menu-item__icon-wrap">
            <text class="menu-item__icon">{{ item.icon }}</text>
          </view>
          <text class="menu-item__text">{{ item.label }}</text>
        </view>
        <view class="menu-item__arrow-wrap">
          <text class="menu-item__arrow">›</text>
        </view>
      </view>
    </view>

    <!-- About Dialog -->
    <view v-if="showAboutDialog" class="dialog-mask" @tap="showAboutDialog = false">
      <view class="dialog" @tap.stop>
        <view class="dialog-header">
          <text class="dialog-title">关于大胃王</text>
          <view class="dialog-close" @tap="showAboutDialog = false">
            <text class="dialog-close-text">✕</text>
          </view>
        </view>
        <view class="dialog-body">
          <text class="dialog-icon">🍽️</text>
          <text class="dialog-app-name">大胃王 v1.0.0</text>
          <text class="dialog-desc">记录你的每一餐挑战！</text>
          <text class="dialog-copy">© 2024 Competitive Eater</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getLevel } from '@/utils/level.js'
import { recordStore } from '@/store/record-store.js'

const level = ref({ tier: 1, name: '青铜', icon: '🥉' })
const showAboutDialog = ref(false)
const stats = reactive({
  totalRecords: 0,
  maxScore: 0,
  totalExp: 0,
  shopCount: 0,
  categoryTotals: {}
})

const menuItems = [
  { icon: '📋', label: '我的店铺', path: '/pages/mine/shops' },
  { icon: '📦', label: '数据备份', path: '/pages/mine/backup' },
  { icon: '⚙️', label: '设置', path: '/pages/mine/settings' },
  { icon: 'ℹ️', label: '关于', path: '__about__' }
]

function loadStats() {
  const s = recordStore.getStats()
  Object.assign(stats, s)
  level.value = getLevel(s.totalExp)
}

onShow(() => {
  loadStats()
})

function goTo(url) {
  if (url === '__about__') {
    showAbout()
    return
  }
  uni.navigateTo({ url })
}

function showAbout() {
  showAboutDialog.value = true
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--c-bg, $void-black);
  padding: $page-pad-y $page-pad-x;
  position: relative;
  overflow: hidden;
}

/* ── Profile Card (Double-Bezel) ── */
.profile-shell {
  background: linear-gradient(165deg, var(--c-surface-8, $glass-white-8) 0%, var(--c-surface-3, $glass-white-3) 100%);
  border: 1rpx solid var(--c-surface-12, $glass-white-12);
  border-radius: $radius-3xl;
  box-shadow: var(--c-shadow-xl, $shadow-xl), var(--c-shadow-inner, $shadow-inner);
  backdrop-filter: blur(12rpx);
  -webkit-backdrop-filter: blur(12rpx);
  margin-bottom: $section-gap;
  position: relative;
  z-index: 1;
  animation: fadeInUp $dur-slow $ease-out-expo both;
  overflow: hidden;
}

.profile-core {
  background: linear-gradient(165deg, var(--c-accent-soft, $glow-orange-soft) 0%, transparent 50%);
  padding: 44rpx 36rpx;
  position: relative;
  overflow: hidden;
}

.profile-glow {
  position: absolute;
  top: -60rpx;
  right: -60rpx;
  width: 240rpx;
  height: 240rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 107, 53, 0.10) 0%, transparent 70%);
  pointer-events: none;
  animation: breathe 6s $ease-in-out-smooth infinite;
}

.profile-card {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
}

.profile-card__avatar {
  width: 136rpx;
  height: 136rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--c-accent, #{$accent-orange}) 0%, #{var(--c-accent-light, $accent-orange-light)} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: $intra-group;
  flex-shrink: 0;
  position: relative;
  box-shadow: $shadow-glow-orange;
}

.avatar-ring {
  position: absolute;
  inset: -8rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(255, 107, 53, 0.18);
}

.avatar-ring--1 { border-color: rgba(205, 127, 50, 0.3); } /* 青铜 */
.avatar-ring--2 { border-color: rgba(192, 192, 192, 0.4); } /* 白银 */
.avatar-ring--3 { border-color: rgba(255, 215, 0, 0.4); } /* 黄金 */
.avatar-ring--4 { border-color: rgba(0, 191, 255, 0.4); } /* 铂金 */
.avatar-ring--5 { border-color: rgba(0, 191, 255, 0.5); } /* 钻石 */
.avatar-ring--6 { border-color: rgba(138, 43, 226, 0.5); } /* 大师 */
.avatar-ring--7 { border-color: rgba(255, 107, 53, 0.6); } /* 传奇 */

.avatar-icon {
  font-size: 56rpx;
}

.profile-card__info {
  flex: 1;
}

.profile-name {
  font-size: var(--text-headline-size, $type-headline-size);
  font-weight: var(--text-headline-weight, $type-headline-weight);
  line-height: var(--text-headline-lh, $type-headline-lh);
  color: var(--c-text-primary, $text-primary);
  margin-bottom: $intra-tight;
  letter-spacing: var(--text-headline-ls, $type-headline-ls);
}

.level-row {
  display: flex;
  align-items: center;
  gap: $intra-tight;
  margin-bottom: $intra-group;
}

.level-icon {
  font-size: 28rpx;
}

.level-text {
  font-size: var(--text-title-size, $type-title-size);
  font-weight: var(--text-headline-weight, $type-headline-weight);
  line-height: var(--text-title-lh, $type-title-lh);
  color: var(--c-gold, $accent-gold);
  letter-spacing: var(--text-title-ls, $type-title-ls);
}

.level-tier {
  font-size: var(--text-label-size, $type-label-size);
  font-weight: var(--text-label-weight, $type-label-weight);
  line-height: var(--text-label-lh, $type-label-lh);
  color: rgba(255, 215, 0, 0.45);
  letter-spacing: var(--text-label-ls, $type-label-ls);
}

.exp-bar-row {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
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
  transition: transform 0.6s $ease-out-expo;
  box-shadow: 0 0 12rpx rgba(255, 215, 0, 0.3);
}

.exp-text {
  font-size: var(--text-caption-size, $type-caption-size);
  font-weight: var(--text-caption-weight, $type-caption-weight);
  line-height: var(--text-caption-lh, $type-caption-lh);
  color: var(--c-text-muted, $text-muted);
  font-variant-numeric: tabular-nums;
}

.stat-row {
  display: flex;
  align-items: baseline;
  gap: $intra-tight;
}

.stat-label {
  font-size: var(--text-label-size, $type-label-size);
  font-weight: var(--text-label-weight, $type-label-weight);
  line-height: var(--text-label-lh, $type-label-lh);
  color: var(--c-text-tertiary, $text-tertiary);
  letter-spacing: var(--text-label-ls, $type-label-ls);
}

.stat-value {
  font-size: var(--text-display-size, $type-display-size);
  font-weight: var(--text-display-weight, $type-display-weight);
  line-height: var(--text-display-lh, $type-display-lh);
  color: var(--c-accent, $accent-orange);
  font-variant-numeric: tabular-nums;
  letter-spacing: var(--text-display-ls, $type-display-ls);
}

/* ── Stats Banner (Double-Bezel) ── */
.stats-shell {
  background: linear-gradient(165deg, var(--c-surface-8, $glass-white-8) 0%, var(--c-surface-3, $glass-white-3) 100%);
  border: 1rpx solid var(--c-surface-12, $glass-white-12);
  border-radius: $radius-2xl;
  box-shadow: var(--c-shadow-xl, $shadow-xl), var(--c-shadow-inner, $shadow-inner);
  backdrop-filter: blur(12rpx);
  -webkit-backdrop-filter: blur(12rpx);
  margin-bottom: $section-gap;
  position: relative;
  z-index: 1;
  animation: fadeInUp $dur-slow $ease-out-expo 0.1s both;
  overflow: hidden;
}

.stats-core {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: $card-pad-compact;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $intra-tight;
  flex: 1;
}

.stat-item__num {
  font-size: var(--text-display-size, $type-display-size);
  font-weight: var(--text-display-weight, $type-display-weight);
  line-height: var(--text-display-lh, $type-display-lh);
  color: var(--c-accent, $accent-orange);
  font-variant-numeric: tabular-nums;
  letter-spacing: var(--text-display-ls, $type-display-ls);
}

.stat-item__label {
  font-size: var(--text-label-size, $type-label-size);
  font-weight: var(--text-label-weight, $type-label-weight);
  line-height: var(--text-label-lh, $type-label-lh);
  color: var(--c-text-tertiary, $text-tertiary);
  letter-spacing: var(--text-label-ls, $type-label-ls);
}

.stat-divider {
  width: 1rpx;
  height: 52rpx;
  background: linear-gradient(180deg, transparent, var(--c-surface-6, $glass-white-6), transparent);
}

/* ── Menu Section (Double-Bezel) ── */
.menu-section {
  background: linear-gradient(165deg, var(--c-surface-8, $glass-white-8) 0%, var(--c-surface-3, $glass-white-3) 100%);
  border: 1rpx solid var(--c-surface-12, $glass-white-12);
  border-radius: $radius-2xl;
  box-shadow: var(--c-shadow-xl, $shadow-xl), var(--c-shadow-inner, $shadow-inner);
  backdrop-filter: blur(12rpx);
  -webkit-backdrop-filter: blur(12rpx);
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $card-pad-inner;
  border-bottom: 1rpx solid var(--c-border-subtle, $hairline-subtle);
  transition: background $dur-normal $ease-spring, transform $dur-fast $ease-spring;
  animation: fadeInUpSoft $dur-slow $ease-out-expo both;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background: var(--c-surface-3, $glass-white-3);
  transform: scale(0.99);
}

.menu-item__left {
  display: flex;
  align-items: center;
  gap: $intra-group;
}

.menu-item__icon-wrap {
  width: 76rpx;
  height: 76rpx;
  border-radius: $radius-lg;
  background: var(--c-surface-4, $glass-white-4);
  border: 1rpx solid var(--c-border-subtle, $hairline-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--c-shadow-inner, $shadow-inner);
}

.menu-item__icon {
  font-size: 34rpx;
}

.menu-item__text {
  font-size: var(--text-title-size, $type-title-size);
  font-weight: var(--text-title-weight, $type-title-weight);
  line-height: var(--text-title-lh, $type-title-lh);
  color: var(--c-text-primary, $text-primary);
  letter-spacing: var(--text-title-ls, $type-title-ls);
}

.menu-item__arrow-wrap {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background: var(--c-surface-3, $glass-white-3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background $dur-fast $ease-spring, transform $dur-fast $ease-spring;
}

.menu-item:active .menu-item__arrow-wrap {
  background: var(--c-surface-6, $glass-white-6);
  transform: translateX(2rpx);
}

.menu-item__arrow {
  font-size: 32rpx;
  color: var(--c-text-muted, $text-muted);
  font-weight: 300;
}

/* ── About Dialog ── */
.dialog-mask {
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

.dialog {
  width: 80vw;
  max-width: 600rpx;
  background: var(--c-bg-elevated, $abyss);
  border: 1rpx solid var(--c-border, $hairline);
  border-radius: $radius-3xl;
  box-shadow: var(--c-card-shadow-elevated);
  overflow: hidden;
  animation: scaleIn $dur-normal $ease-out-expo;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $card-pad-inner;
  border-bottom: 1rpx solid var(--c-border-subtle, $hairline-subtle);
}

.dialog-title {
  font-size: var(--text-headline-size, $type-headline-size);
  font-weight: var(--text-headline-weight, $type-headline-weight);
  line-height: var(--text-headline-lh, $type-headline-lh);
  color: var(--c-text-primary, $text-primary);
  letter-spacing: var(--text-headline-ls, $type-headline-ls);
}

.dialog-close {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: var(--c-surface-3, $glass-white-3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-close-text {
  font-size: 28rpx;
  color: var(--c-text-secondary, $text-secondary);
}

.dialog-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $section-gap $card-pad-inner;
  gap: $intra-group;
}

.dialog-icon {
  font-size: 80rpx;
}

.dialog-app-name {
  font-size: var(--text-headline-size, $type-headline-size);
  font-weight: var(--text-headline-weight, $type-headline-weight);
  line-height: var(--text-headline-lh, $type-headline-lh);
  color: var(--c-text-primary, $text-primary);
  letter-spacing: var(--text-headline-ls, $type-headline-ls);
}

.dialog-desc {
  font-size: var(--text-body-size, $type-body-size);
  font-weight: var(--text-body-weight, $type-body-weight);
  line-height: var(--text-body-lh, $type-body-lh);
  color: var(--c-text-secondary, $text-secondary);
}

.dialog-copy {
  font-size: var(--text-label-size, $type-label-size);
  font-weight: var(--text-label-weight, $type-label-weight);
  line-height: var(--text-label-lh, $type-label-lh);
  color: var(--c-text-muted, $text-muted);
  margin-top: $intra-group;
}

</style>
