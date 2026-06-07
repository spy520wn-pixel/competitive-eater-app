<template>
  <view class="dashboard">
    <!-- Header -->
    <view class="header">
      <view class="header-top">
        <level-badge :score="stats.maxScore" />
      </view>
      <view class="header-stats">
        <view class="stat-item">
          <text class="stat-value">{{ stats.maxScore }}</text>
          <text class="stat-label">最高战斗力</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item">
          <text class="stat-value">{{ stats.totalRecords }}</text>
          <text class="stat-label">总挑战</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item">
          <text class="stat-value">{{ stats.shopCount }}</text>
          <text class="stat-label">已打卡店铺</text>
        </view>
      </view>
    </view>

    <!-- Empty state -->
    <view v-if="stats.totalRecords === 0" class="empty-state">
      <text class="empty-icon">🍽️</text>
      <text class="empty-title">还没有挑战记录</text>
      <text class="empty-desc">去挑战一家店铺，开启你的大胃王之路！</text>
    </view>

    <!-- Charts & Map -->
    <view v-else class="content">
      <!-- Radar chart -->
      <view class="card">
        <text class="card-title">食量分布</text>
        <radar-chart :data="stats.categoryTotals" :size="300" />
      </view>

      <!-- Bar chart -->
      <view class="card">
        <text class="card-title">分类食量排行</text>
        <bar-chart :data="stats.categoryTotals" />
      </view>

      <!-- Map -->
      <view class="card">
        <view class="card-header">
          <text class="card-title">挑战足迹 · 已挑战 {{ challengedShops.length }} 家店铺</text>
        </view>
        <map-view
          :shops="shops"
          :records="records"
          @marker-tap="onMarkerTap"
        />
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { recordStore } from '../../store/record-store'
import { shopStore } from '../../store/shop-store'
import LevelBadge from '../../components/level-badge.vue'
import RadarChart from '../../components/radar-chart.vue'
import BarChart from '../../components/bar-chart.vue'
import MapView from '../../components/map-view.vue'

const stats = ref({ totalRecords: 0, maxScore: 0, shopCount: 0, categoryTotals: {} })
const shops = ref([])
const records = ref([])

const challengedShops = computed(() => {
  const shopIds = new Set(records.value.filter(r => r.status === '已完成').map(r => r.shopId))
  return shops.value.filter(s => shopIds.has(s.id))
})

function loadData() {
  stats.value = recordStore.getStats()
  shops.value = shopStore.getAll()
  records.value = recordStore.getAll()
}

onShow(() => {
  loadData()
})

function onMarkerTap(shopId) {
  uni.navigateTo({ url: `/pages/shop-detail/index?id=${shopId}` })
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #0F0F1A;
  padding-bottom: 120rpx;
}

/* Header */
.header {
  background: linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%);
  padding: 40rpx 32rpx 32rpx;
  border-radius: 0 0 24rpx 24rpx;
}

.header-top {
  margin-bottom: 24rpx;
}

.header-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  padding: 24rpx 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.stat-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #FF6B35;
}

.stat-label {
  font-size: 22rpx;
  color: #AAAAAA;
}

.stat-divider {
  width: 1rpx;
  height: 48rpx;
  background: #2D2D44;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 60rpx;
}

.empty-icon {
  font-size: 96rpx;
  margin-bottom: 24rpx;
}

.empty-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #AAAAAA;
  text-align: center;
}

/* Content cards */
.content {
  padding: 24rpx 24rpx 0;
}

.card {
  background: #1A1A2E;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.card-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 16rpx;
}

.card-header .card-title {
  margin-bottom: 0;
}
</style>
