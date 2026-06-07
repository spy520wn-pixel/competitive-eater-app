<template>
  <view class="page">
    <!-- Header -->
    <view class="header">
      <text class="header-title">我的战绩</text>
      <text class="header-sub" v-if="shopGroups.length > 0">
        共 {{ totalRecords }} 条记录 · {{ shopGroups.length }} 家店铺
      </text>
    </view>

    <!-- Shop groups -->
    <view v-if="shopGroups.length > 0" class="shop-list">
      <view
        v-for="group in shopGroups"
        :key="group.shopId"
        class="shop-card"
        @tap="goShopRecords(group.shopId)"
      >
        <view class="shop-left">
          <text class="shop-icon">{{ group.icon }}</text>
          <view class="shop-info">
            <text class="shop-name">{{ group.shopName }}</text>
            <view class="shop-meta">
              <text class="meta-score">最高战斗力：{{ group.bestScore }}</text>
              <text class="meta-dot">·</text>
              <text class="meta-count">挑战 {{ group.count }} 次</text>
            </view>
            <text class="meta-date">最近：{{ group.latestDate }}</text>
          </view>
        </view>
        <text class="arrow">></text>
      </view>
    </view>

    <!-- Empty state -->
    <view v-else class="empty-state">
      <text class="empty-icon">🏆</text>
      <text class="empty-title">暂无战绩</text>
      <text class="empty-desc">去挑战吧！成为最强的大胃王！</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { recordStore } from '../../store/record-store'

const records = ref([])

const CATEGORY_ICONS = {
  '自助餐': '🍖',
  '海鲜': '🦐',
  '火锅': '🍲',
  '烧烤': '🥩',
  '日料': '🍣',
  'default': '🍽️'
}

function formatDate(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const shopGroups = computed(() => {
  const completed = records.value.filter(r => r.status === '已完成')
  const groups = {}

  completed.forEach(r => {
    if (!groups[r.shopId]) {
      groups[r.shopId] = {
        shopId: r.shopId,
        shopName: r.shopName,
        bestScore: 0,
        count: 0,
        latestDate: ''
      }
    }
    const g = groups[r.shopId]
    g.count++
    if (r.score > g.bestScore) g.bestScore = r.score
    const dateStr = formatDate(r.createdAt)
    if (!g.latestDate || dateStr > g.latestDate) g.latestDate = dateStr
  })

  return Object.values(groups)
    .map(g => ({
      ...g,
      icon: CATEGORY_ICONS[g.shopName] || CATEGORY_ICONS['default']
    }))
    .sort((a, b) => b.bestScore - a.bestScore)
})

const totalRecords = computed(() => {
  return records.value.filter(r => r.status === '已完成').length
})

function loadData() {
  records.value = recordStore.getAll()
}

function goShopRecords(shopId) {
  uni.navigateTo({ url: `/pages/record/shop-records?shopId=${shopId}` })
}

onShow(() => {
  loadData()
})
</script>

<style scoped>
.page {
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

.header-title {
  font-size: 40rpx;
  font-weight: 800;
  color: #FFFFFF;
  display: block;
}

.header-sub {
  font-size: 24rpx;
  color: #8888AA;
  margin-top: 8rpx;
  display: block;
}

/* Shop list */
.shop-list {
  padding: 24rpx;
}

.shop-card {
  background: #1A1A2E;
  border-radius: 16rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 2rpx solid transparent;
  transition: border-color 0.2s;
}

.shop-card:active {
  border-color: #FF6B35;
}

.shop-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
  flex: 1;
}

.shop-icon {
  font-size: 48rpx;
  width: 72rpx;
  height: 72rpx;
  background: #2D2D44;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 72rpx;
}

.shop-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  flex: 1;
}

.shop-name {
  font-size: 30rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.shop-meta {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.meta-score {
  font-size: 24rpx;
  color: #FF6B35;
  font-weight: 600;
}

.meta-dot {
  font-size: 24rpx;
  color: #555570;
}

.meta-count {
  font-size: 24rpx;
  color: #8888AA;
}

.meta-date {
  font-size: 22rpx;
  color: #666680;
}

.arrow {
  font-size: 32rpx;
  color: #555570;
  font-weight: 300;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 160rpx 60rpx;
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
  color: #8888AA;
  text-align: center;
}
</style>
