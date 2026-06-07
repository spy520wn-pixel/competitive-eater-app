<template>
  <view class="page">
    <!-- Stats banner -->
    <view class="stats-banner">
      <view class="stat-block">
        <text class="stat-value">{{ bestScore }}</text>
        <text class="stat-label">最高战斗力</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-block">
        <text class="stat-value">{{ avgScore }}</text>
        <text class="stat-label">平均战斗力</text>
      </view>
    </view>

    <!-- Record list -->
    <view v-if="records.length > 0" class="record-list">
      <view
        v-for="(rec, idx) in records"
        :key="rec.id"
        class="record-card"
        :class="{ 'record-card--best': idx === bestIndex }"
        @tap="goDetail(rec.id)"
      >
        <view class="record-top">
          <view class="record-left">
            <text class="record-date">{{ formatDate(rec.createdAt) }}</text>
            <view class="record-score-row">
              <text class="record-score-label">战斗力</text>
              <text class="record-score" :class="{ 'record-score--best': idx === bestIndex }">{{ rec.score }}</text>
              <text v-if="idx === bestIndex" class="best-star">⭐</text>
            </view>
          </view>
          <text class="record-arrow">></text>
        </view>

        <!-- Category summary -->
        <view class="record-summary">
          <text class="summary-text">{{ getCategorySummary(rec.items) }}</text>
        </view>

        <!-- Duration -->
        <view class="record-duration">
          <text class="duration-text">时长 {{ rec.duration }}分钟</text>
        </view>
      </view>
    </view>

    <!-- Empty -->
    <view v-else class="empty-state">
      <text class="empty-icon">📋</text>
      <text class="empty-title">暂无挑战记录</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { recordStore } from '../../store/record-store'

const shopId = ref('')
const shopName = ref('')
const records = ref([])

const CATEGORY_ORDER = ['肉类', '海鲜', '主食', '甜点', '饮料', '其他']

function formatDate(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getCategorySummary(items) {
  if (!items || items.length === 0) return '无点餐记录'
  const totals = {}
  items.forEach(item => {
    if (!totals[item.category]) totals[item.category] = 0
    totals[item.category] += item.quantity
  })
  const parts = []
  CATEGORY_ORDER.forEach(cat => {
    if (totals[cat]) {
      parts.push(`${cat}${totals[cat]}份`)
    }
  })
  // Include any categories not in the predefined order
  Object.keys(totals).forEach(cat => {
    if (!CATEGORY_ORDER.includes(cat)) {
      parts.push(`${cat}${totals[cat]}份`)
    }
  })
  return parts.join(' ')
}

const bestScore = computed(() => {
  if (records.value.length === 0) return 0
  return Math.max(...records.value.map(r => r.score))
})

const avgScore = computed(() => {
  if (records.value.length === 0) return 0
  const sum = records.value.reduce((acc, r) => acc + r.score, 0)
  return Math.round(sum / records.value.length)
})

const bestIndex = computed(() => {
  if (records.value.length === 0) return -1
  let maxScore = 0
  let maxIdx = 0
  records.value.forEach((r, i) => {
    if (r.score > maxScore) {
      maxScore = r.score
      maxIdx = i
    }
  })
  return maxIdx
})

function goDetail(recordId) {
  uni.navigateTo({ url: `/pages/record/detail?id=${recordId}` })
}

onLoad((options) => {
  shopId.value = options.shopId || ''
  const allRecords = recordStore.getByShopId(shopId.value)
  records.value = allRecords
  if (allRecords.length > 0) {
    shopName.value = allRecords[0].shopName
    uni.setNavigationBarTitle({ title: shopName.value })
  }
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #0F0F1A;
  padding: 24rpx;
  padding-bottom: 40rpx;
}

/* Stats banner */
.stats-banner {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%);
  border-radius: 16rpx;
  padding: 32rpx 0;
  margin-bottom: 24rpx;
}

.stat-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.stat-value {
  font-size: 44rpx;
  font-weight: 800;
  color: #FF6B35;
}

.stat-label {
  font-size: 22rpx;
  color: #8888AA;
}

.stat-divider {
  width: 2rpx;
  height: 56rpx;
  background: #2D2D44;
}

/* Record list */
.record-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.record-card {
  background: #1A1A2E;
  border-radius: 16rpx;
  padding: 24rpx;
  border: 2rpx solid transparent;
  transition: border-color 0.2s;
}

.record-card:active {
  border-color: #FF6B35;
}

.record-card--best {
  border-color: #FFD700;
  background: linear-gradient(135deg, #1A1A2E 0%, #1E1A30 100%);
}

.record-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.record-left {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.record-date {
  font-size: 24rpx;
  color: #8888AA;
}

.record-score-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.record-score-label {
  font-size: 26rpx;
  color: #AAAAAA;
}

.record-score {
  font-size: 40rpx;
  font-weight: 800;
  color: #FF6B35;
}

.record-score--best {
  color: #FFD700;
}

.best-star {
  font-size: 32rpx;
}

.record-arrow {
  font-size: 32rpx;
  color: #555570;
  font-weight: 300;
}

/* Category summary */
.record-summary {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #2D2D44;
}

.summary-text {
  font-size: 24rpx;
  color: #AAAAAA;
  line-height: 1.6;
}

/* Duration */
.record-duration {
  margin-top: 12rpx;
}

.duration-text {
  font-size: 22rpx;
  color: #666680;
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
}
</style>
