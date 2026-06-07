<template>
  <view class="page">
    <!-- 头部结果展示 -->
    <view class="result-header">
      <text class="result-emoji">🎉</text>
      <text class="result-title">挑战完成！</text>
      <text class="result-subtitle">
        {{ record.shopName }}
        <text v-if="record.tierName"> · {{ record.tierName }}</text>
        · {{ formatDate(record.createdAt) }}
      </text>

      <!-- 分数展示 -->
      <view class="score-card">
        <text class="score-label">战斗力</text>
        <view class="score-row">
          <text class="score-star">⭐</text>
          <text class="score-value">{{ record.score }}</text>
          <text class="score-star">⭐</text>
        </view>
        <text class="score-duration">时长 {{ record.duration }}分钟</text>
        <view class="level-badge">
          <text class="level-icon">{{ levelInfo.icon }}</text>
          <text class="level-name">{{ levelInfo.name }}</text>
        </view>
      </view>
    </view>

    <!-- 分类食量统计 -->
    <view class="section">
      <text class="section-title">分类食量统计</text>
      <view class="radar-placeholder">
        <view class="radar-grid">
          <view v-for="cat in categoryStats" :key="cat.name" class="radar-item">
            <view class="radar-bar-bg">
              <view class="radar-bar" :style="{ height: cat.percent + '%' }" />
            </view>
            <text class="radar-label">{{ cat.name }}</text>
            <text class="radar-value">{{ cat.total }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 点餐明细 -->
    <view class="section">
      <text class="section-title">点餐明细</text>
      <view v-for="group in groupedItems" :key="group.category" class="detail-group">
        <text class="group-title">{{ group.category }}</text>
        <view v-for="item in group.items" :key="item.menuItemId" class="detail-item">
          <text class="detail-name">{{ item.name }}</text>
          <text class="detail-qty">{{ item.quantity }}{{ item.unit }}</text>
        </view>
      </view>
      <view v-if="record.items.length === 0" class="empty-items">
        <text class="empty-items-text">没有点餐记录</text>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="actions">
      <view class="action-btn action-btn--receipt" @tap="onGenerateReceipt">
        <text class="action-btn-text">🧾 生成小票</text>
      </view>
      <view class="action-btn action-btn--poster" @tap="onGeneratePoster">
        <text class="action-btn-text">🎨 AI生成海报</text>
      </view>
      <view class="action-btn action-btn--home" @tap="goHome">
        <text class="action-btn-text action-btn-text--home">返回首页</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { recordStore } from '../../store/record-store'
import { getLevel } from '../../utils/level'

const recordId = ref('')
const record = ref({
  shopName: '',
  tierName: '',
  score: 0,
  duration: 0,
  items: [],
  createdAt: ''
})

const levelInfo = computed(() => {
  return getLevel(record.value.score)
})

const categoryStats = computed(() => {
  const totals = {}
  record.value.items.forEach(item => {
    if (!totals[item.category]) totals[item.category] = 0
    totals[item.category] += item.quantity
  })

  const maxTotal = Math.max(...Object.values(totals), 1)
  return Object.entries(totals).map(([name, total]) => ({
    name,
    total,
    percent: Math.round((total / maxTotal) * 100)
  }))
})

const groupedItems = computed(() => {
  const groups = {}
  record.value.items.forEach(item => {
    if (!groups[item.category]) groups[item.category] = []
    groups[item.category].push(item)
  })
  return Object.entries(groups).map(([category, items]) => ({
    category,
    items
  }))
})

function formatDate(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function onGenerateReceipt() {
  uni.showToast({ title: '小票生成开发中', icon: 'none' })
}

function onGeneratePoster() {
  uni.showToast({ title: '海报生成开发中', icon: 'none' })
}

function goHome() {
  uni.switchTab({ url: '/pages/index/index' })
}

onLoad((options) => {
  recordId.value = options.recordId || ''
  const rec = recordStore.getById(recordId.value)
  if (rec) {
    record.value = rec
  } else {
    uni.showToast({ title: '记录不存在', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
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

/* 头部结果 */
.result-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0 32rpx;
}

.result-emoji {
  font-size: 64rpx;
  margin-bottom: 16rpx;
}

.result-title {
  font-size: 40rpx;
  font-weight: 800;
  color: #FFD700;
  margin-bottom: 12rpx;
}

.result-subtitle {
  font-size: 24rpx;
  color: #8888AA;
  margin-bottom: 32rpx;
}

/* 分数卡片 */
.score-card {
  width: 100%;
  background: #1A1A2E;
  border-radius: 24rpx;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-label {
  font-size: 26rpx;
  color: #8888AA;
  margin-bottom: 8rpx;
}

.score-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 12rpx;
}

.score-star {
  font-size: 36rpx;
}

.score-value {
  font-size: 72rpx;
  font-weight: 900;
  color: #FFD700;
  line-height: 1;
}

.score-duration {
  font-size: 26rpx;
  color: #8888AA;
  margin-bottom: 20rpx;
}

.level-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: rgba(255, 107, 53, 0.15);
  border-radius: 20rpx;
  padding: 12rpx 28rpx;
  border: 2rpx solid #FF6B35;
}

.level-icon {
  font-size: 32rpx;
}

.level-name {
  font-size: 28rpx;
  font-weight: 700;
  color: #FF6B35;
}

/* 分类统计 */
.section {
  margin-top: 32rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 20rpx;
}

/* 雷达图占位 */
.radar-placeholder {
  background: #1A1A2E;
  border-radius: 24rpx;
  padding: 32rpx;
}

.radar-grid {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 300rpx;
}

.radar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  flex: 1;
}

.radar-bar-bg {
  width: 40rpx;
  height: 200rpx;
  background: #2D2D44;
  border-radius: 8rpx;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
}

.radar-bar {
  width: 100%;
  background: linear-gradient(180deg, #FF6B35, #FFD700);
  border-radius: 8rpx;
  transition: height 0.5s ease;
}

.radar-label {
  font-size: 22rpx;
  color: #8888AA;
}

.radar-value {
  font-size: 24rpx;
  font-weight: 700;
  color: #FF6B35;
}

/* 点餐明细 */
.detail-group {
  background: #1A1A2E;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.group-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #FF6B35;
  margin-bottom: 16rpx;
  padding-bottom: 12rpx;
  border-bottom: 1rpx solid #2D2D44;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 0;
}

.detail-name {
  font-size: 28rpx;
  color: #FFFFFF;
}

.detail-qty {
  font-size: 28rpx;
  font-weight: 600;
  color: #FFD700;
}

.empty-items {
  background: #1A1A2E;
  border-radius: 16rpx;
  padding: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-items-text {
  font-size: 26rpx;
  color: #666680;
}

/* 操作按钮 */
.actions {
  margin-top: 40rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.action-btn {
  height: 88rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn--receipt {
  background: #2D2D44;
}

.action-btn--poster {
  background: linear-gradient(135deg, #FF6B35, #FFD700);
}

.action-btn--home {
  background: transparent;
  border: 2rpx solid #2D2D44;
}

.action-btn-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #FFFFFF;
}

.action-btn-text--home {
  color: #8888AA;
}
</style>
