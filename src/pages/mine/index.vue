<template>
  <view class="page">
    <!-- Profile Card -->
    <view class="profile-card">
      <view class="profile-card__avatar">
        <text class="avatar-icon">👤</text>
      </view>
      <view class="profile-card__info">
        <text class="profile-name">大胃王选手</text>
        <view class="level-row">
          <text class="level-icon">{{ level.icon }}</text>
          <text class="level-text">{{ level.name }} {{ level.tier > 3 ? 'I' : level.tier > 2 ? 'II' : 'III' }}</text>
        </view>
        <view class="stat-row">
          <text class="stat-label">最高战斗力</text>
          <text class="stat-value">{{ stats.maxScore }}</text>
        </view>
      </view>
    </view>

    <!-- Stats Banner -->
    <view class="stats-banner">
      <view class="stat-item">
        <text class="stat-item__num">{{ stats.totalRecords }}</text>
        <text class="stat-item__label">挑战次数</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-item__num">{{ stats.shopCount }}</text>
        <text class="stat-item__label">征服店铺</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-item__num">{{ stats.maxScore }}</text>
        <text class="stat-item__label">最高分</text>
      </view>
    </view>

    <!-- Menu List -->
    <view class="menu-section">
      <view class="menu-item" @tap="goTo('/pages/mine/shops')">
        <view class="menu-item__left">
          <text class="menu-item__icon">📋</text>
          <text class="menu-item__text">我的店铺</text>
        </view>
        <text class="menu-item__arrow">›</text>
      </view>

      <view class="menu-item" @tap="goTo('/pages/mine/backup')">
        <view class="menu-item__left">
          <text class="menu-item__icon">📦</text>
          <text class="menu-item__text">数据备份</text>
        </view>
        <text class="menu-item__arrow">›</text>
      </view>

      <view class="menu-item" @tap="goTo('/pages/mine/settings')">
        <view class="menu-item__left">
          <text class="menu-item__icon">⚙️</text>
          <text class="menu-item__text">设置</text>
        </view>
        <text class="menu-item__arrow">›</text>
      </view>

      <view class="menu-item" @tap="showAbout">
        <view class="menu-item__left">
          <text class="menu-item__icon">ℹ️</text>
          <text class="menu-item__text">关于</text>
        </view>
        <text class="menu-item__arrow">›</text>
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
const stats = reactive({
  totalRecords: 0,
  maxScore: 0,
  shopCount: 0,
  categoryTotals: {}
})

function loadStats() {
  const s = recordStore.getStats()
  stats.totalRecords = s.totalRecords
  stats.maxScore = s.maxScore
  stats.shopCount = s.shopCount
  stats.categoryTotals = s.categoryTotals
  level.value = getLevel(stats.maxScore)
}

onShow(() => {
  loadStats()
})

function goTo(url) {
  uni.navigateTo({ url })
}

function showAbout() {
  uni.showModal({
    title: '关于大胃王',
    content: '大胃王 v1.0.0\n记录你的每一餐挑战！',
    showCancel: false
  })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #0F0F1A;
  padding: 24rpx;
}

/* Profile Card */
.profile-card {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #1A1A2E 0%, #2D2D44 100%);
  border-radius: 20rpx;
  padding: 36rpx 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.3);
}

.profile-card__avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8F60 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 28rpx;
  flex-shrink: 0;
}

.avatar-icon {
  font-size: 56rpx;
}

.profile-card__info {
  flex: 1;
}

.profile-name {
  font-size: 36rpx;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 8rpx;
}

.level-row {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.level-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.level-text {
  font-size: 26rpx;
  color: #FFD700;
  font-weight: 600;
}

.stat-row {
  display: flex;
  align-items: baseline;
}

.stat-label {
  font-size: 22rpx;
  color: #8888AA;
  margin-right: 10rpx;
}

.stat-value {
  font-size: 36rpx;
  font-weight: 800;
  color: #FF6B35;
}

/* Stats Banner */
.stats-banner {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: #1A1A2E;
  border-radius: 16rpx;
  padding: 28rpx 16rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.2);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stat-item__num {
  font-size: 40rpx;
  font-weight: 800;
  color: #FF6B35;
  margin-bottom: 6rpx;
}

.stat-item__label {
  font-size: 22rpx;
  color: #8888AA;
}

.stat-divider {
  width: 1rpx;
  height: 48rpx;
  background: #2D2D44;
}

/* Menu Section */
.menu-section {
  background: #1A1A2E;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.2);
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid #2D2D44;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item__left {
  display: flex;
  align-items: center;
}

.menu-item__icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}

.menu-item__text {
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: 500;
}

.menu-item__arrow {
  font-size: 36rpx;
  color: #555577;
  font-weight: 300;
}
</style>
