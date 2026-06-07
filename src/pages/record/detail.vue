<template>
  <view class="page">
    <!-- Header info -->
    <view class="detail-header">
      <text class="header-sub">
        {{ record.shopName }}
        <text v-if="record.tierName"> · {{ record.tierName }}</text>
        · {{ formatDate(record.createdAt) }}
      </text>

      <!-- Score card -->
      <view class="score-card">
        <text class="score-label">战斗力</text>
        <view class="score-row">
          <text class="score-star">⭐</text>
          <text class="score-value">{{ record.score }}</text>
          <text class="score-star">⭐</text>
        </view>
        <text class="score-duration">时长 {{ record.duration }}分钟</text>
        <view class="level-tag">
          <text class="level-icon">{{ levelInfo.icon }}</text>
          <text class="level-name">等级：{{ levelInfo.name }}</text>
        </view>
      </view>
    </view>

    <!-- Radar chart section -->
    <view class="section">
      <text class="section-title">分类食量统计</text>
      <view class="chart-card">
        <radar-chart :data="categoryTotals" :size="300" />
      </view>
    </view>

    <!-- Item detail list -->
    <view class="section">
      <text class="section-title">点餐明细</text>
      <view v-for="group in groupedItems" :key="group.category" class="group-card">
        <text class="group-title">{{ group.category }}</text>
        <view v-for="item in group.items" :key="item.menuItemId" class="item-row">
          <text class="item-name">{{ item.name }}</text>
          <text class="item-qty">{{ item.quantity }}{{ item.unit }}</text>
        </view>
      </view>
      <view v-if="record.items.length === 0" class="empty-items">
        <text class="empty-items-text">没有点餐记录</text>
      </view>
    </view>

    <!-- Action buttons -->
    <view class="actions">
      <view class="action-btn action-btn--receipt" @tap="onGenerateReceipt">
        <text class="action-btn-text">🧾 生成小票</text>
      </view>
      <view class="action-btn action-btn--poster" @tap="onGeneratePoster">
        <text class="action-btn-text">🎨 AI生成海报</text>
      </view>
      <view class="action-btn action-btn--delete" @tap="onDelete">
        <text class="action-btn-text action-btn-text--delete">🗑️ 删除记录</text>
      </view>
    </view>
    <!-- Hidden canvas for receipt rendering -->
    <canvas canvas-id="receiptCanvas" id="receiptCanvas"
      style="position:fixed;left:-9999px;width:375px;height:800px;" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { recordStore } from '../../store/record-store'
import { getLevel } from '../../utils/level'
import { saveReceiptToAlbum } from '../../utils/receipt-renderer'
import RadarChart from '../../components/radar-chart.vue'

const recordId = ref('')
const record = ref({
  shopName: '',
  tierName: '',
  score: 0,
  duration: 0,
  items: [],
  createdAt: '',
  status: ''
})

const CATEGORY_ORDER = ['肉类', '海鲜', '主食', '甜点', '饮料', '其他']

function formatDate(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const levelInfo = computed(() => {
  return getLevel(record.value.score)
})

const categoryTotals = computed(() => {
  const totals = {}
  record.value.items.forEach(item => {
    if (!totals[item.category]) totals[item.category] = 0
    totals[item.category] += item.quantity
  })
  return totals
})

const groupedItems = computed(() => {
  const groups = {}
  record.value.items.forEach(item => {
    if (!groups[item.category]) groups[item.category] = []
    groups[item.category].push(item)
  })
  // Sort groups by predefined category order
  const ordered = []
  CATEGORY_ORDER.forEach(cat => {
    if (groups[cat]) {
      ordered.push({ category: cat, items: groups[cat] })
      delete groups[cat]
    }
  })
  Object.keys(groups).forEach(cat => {
    ordered.push({ category: cat, items: groups[cat] })
  })
  return ordered
})

async function onGenerateReceipt() {
  uni.showLoading({ title: '生成中...' })
  await saveReceiptToAlbum(record.value)
  uni.hideLoading()
}

function onGeneratePoster() {
  uni.showToast({ title: '海报生成开发中', icon: 'none' })
}

function onDelete() {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条战绩记录吗？删除后无法恢复。',
    confirmColor: '#FF4444',
    success: (res) => {
      if (res.confirm) {
        recordStore.remove(recordId.value)
        uni.showToast({ title: '已删除', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1000)
      }
    }
  })
}

onLoad((options) => {
  recordId.value = options.id || ''
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

/* Header */
.detail-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 0 32rpx;
}

.header-sub {
  font-size: 24rpx;
  color: #8888AA;
  margin-bottom: 24rpx;
  text-align: center;
}

/* Score card */
.score-card {
  width: 100%;
  background: #1A1A2E;
  border-radius: 24rpx;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 2rpx solid #FFD700;
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

.level-tag {
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

/* Section */
.section {
  margin-top: 32rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 20rpx;
}

/* Chart card */
.chart-card {
  background: #1A1A2E;
  border-radius: 24rpx;
  padding: 32rpx;
  display: flex;
  justify-content: center;
}

/* Group card */
.group-card {
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
  display: block;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 0;
}

.item-name {
  font-size: 28rpx;
  color: #FFFFFF;
}

.item-qty {
  font-size: 28rpx;
  font-weight: 600;
  color: #FFD700;
}

/* Empty items */
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

/* Action buttons */
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

.action-btn--delete {
  background: transparent;
  border: 2rpx solid #FF4444;
}

.action-btn-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #FFFFFF;
}

.action-btn-text--delete {
  color: #FF4444;
}
</style>
