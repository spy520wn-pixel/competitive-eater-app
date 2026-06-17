<template>
  <view class="page" :data-theme="currentTheme">
    <nav-bar title="战绩详情" :show-back="true" />
    <!-- Header info -->
    <view class="detail-header">
      <text class="header-sub">
        {{ record.shopName }}
        <text v-if="record.tierName"> · {{ record.tierName }}</text>
        · {{ formatDate(record.createdAt) }}
      </text>

      <!-- Score card — Double-Bezel -->
      <view class="score-shell">
        <view class="score-core">
          <view class="score-glow" />
          <text class="score-label">战斗力</text>
          <view class="score-row">
            <text class="score-star">⭐</text>
            <text class="score-value">{{ record.score }}</text>
            <text class="score-star">⭐</text>
          </view>
          <text class="score-duration">时长 {{ record.duration }}分钟 · 获得 {{ expGained }} 经验</text>
          <view class="level-tag">
            <text class="level-icon">{{ levelInfo.icon }}</text>
            <text class="level-name">{{ levelInfo.name }}{{ levelInfo.levelText ? ' ' + levelInfo.levelText : '' }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Radar chart section -->
    <view class="section">
      <view class="section-header">
        <view class="eyebrow">
          <text class="eyebrow-text">统计</text>
        </view>
        <text class="section-title">分类食量统计</text>
      </view>
      <view class="chart-shell">
        <view class="chart-core">
          <radar-chart :data="categoryTotals" :theme="currentTheme" />
        </view>
      </view>
    </view>

    <!-- Item detail list -->
    <view class="section">
      <view class="section-header">
        <view class="eyebrow">
          <text class="eyebrow-text">明细</text>
        </view>
        <text class="section-title">点餐明细</text>
      </view>
      <view v-for="group in groupedItems" :key="group.category" class="group-shell">
        <view class="group-core">
          <text class="group-title" :style="{ color: getCategoryColor(group.category) }">{{ group.category }}</text>
          <view v-for="item in group.items" :key="item.menuItemId" class="item-row">
            <text class="item-name">{{ item.name }}</text>
            <text class="item-qty">{{ item.quantity }}{{ item.unit }}</text>
          </view>
        </view>
      </view>
      <view v-if="record.items.length === 0" class="empty-items">
        <text class="empty-items-icon">📝</text>
        <text class="empty-items-text">本次挑战未记录菜品</text>
      </view>
    </view>

    <!-- Action buttons -->
    <view class="actions">
      <view class="action-btn action-btn--receipt" role="button" aria-label="生成小票" @tap="onGenerateReceipt">
        <text class="action-btn-text">🧾 生成小票</text>
      </view>
      <view class="action-btn action-btn--delete" role="button" aria-label="删除记录" @tap="onDelete">
        <text class="action-btn-text action-btn-text--delete">🗑️ 删除记录</text>
      </view>
    </view>

    <!-- Hidden canvas for receipt rendering -->
    <canvas canvas-id="receiptCanvas" id="receiptCanvas"
      :style="{ position: 'fixed', left: '-9999px', width: canvasWidth + 'px', height: canvasHeight + 'px' }" />
  </view>
</template>

<script setup>
import NavBar from '@/components/nav-bar.vue'
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { recordStore } from '../../store/record-store'
import { getLevel, scoreToExp } from '../../utils/level'
import { saveReceiptToAlbum, calcReceiptHeight } from '../../utils/receipt-renderer'
import RadarChart from '../../components/radar-chart.vue'
import { settingsStore, currentTheme } from '@/store/settings-store.js'
import { applyPageTheme, syncThemeFromStorage } from '@/utils/apply-page-theme.js'

const CATEGORY_CSS = {
  '肉类': 'var(--c-cat-meat)',
  '海鲜': 'var(--c-cat-seafood)',
  '主食': 'var(--c-cat-staples)',
  '甜点': 'var(--c-cat-dessert)',
  '饮料': 'var(--c-cat-drinks)',
  '其他': 'var(--c-cat-other)'
}

function getCategoryColor(name) {
  return CATEGORY_CSS[name] || 'var(--c-accent)'
}

const recordId = ref('')
const canvasWidth = ref(375)
const canvasHeight = ref(800)
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

const expGained = computed(() => scoreToExp(record.value.score))
const levelInfo = computed(() => getLevel(expGained.value))

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
  canvasHeight.value = calcReceiptHeight(record.value)
  await nextTick()
  await saveReceiptToAlbum(record.value, canvasWidth.value)
  uni.hideLoading()
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

  // 动态设置 canvas 宽度
  const sysInfo = uni.getSystemInfoSync()
  canvasWidth.value = sysInfo.windowWidth || 375
})

onMounted(() => {
  applyPageTheme(settingsStore.get().theme)
  uni.$on('theme-apply', applyPageTheme)
})

onUnmounted(() => {
  uni.$off('theme-apply', applyPageTheme)
})

onShow(() => {
  syncThemeFromStorage()
})


</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--c-bg, $void-black);
  padding: $page-pad-y $page-pad-x;
  padding-bottom: $section-gap;
}

/* ── Header ── */
.detail-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $intra-group 0 $section-gap;
  animation: fadeInUp $dur-slow $ease-out-expo both;
}

.header-sub {
  font-size: 24rpx;
  color: var(--c-text-tertiary, $text-tertiary);
  margin-bottom: $intra-group;
  text-align: center;
  letter-spacing: $tracking-wide;
}

/* ── Score Card ── */
.score-shell {
  width: 100%;
  background: linear-gradient(165deg, var(--c-surface-10, $glass-white-10) 0%, var(--c-surface-3, $glass-white-3) 100%);
  border: 1rpx solid var(--c-surface-12, $glass-white-12);
  border-radius: $radius-2xl;
  box-shadow: var(--c-shadow-xl, $shadow-xl), var(--c-shadow-inner, $shadow-inner);
  backdrop-filter: blur(12rpx);
  -webkit-backdrop-filter: blur(12rpx);
  overflow: hidden;
}

.score-core {
  background: linear-gradient(165deg, var(--c-gold-soft, $glow-gold-soft) 0%, transparent 50%);
  padding: $section-gap $space-5;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.score-glow {
  position: absolute;
  top: -80rpx;
  width: 300rpx;
  height: 200rpx;
  border-radius: 50%;
  background: radial-gradient(ellipse, var(--c-gold-soft, $glow-gold-soft) 0%, transparent 70%);
  pointer-events: none;
}

.score-label {
  font-size: 26rpx;
  color: var(--c-text-tertiary, $text-tertiary);
  margin-bottom: $intra-tight;
  letter-spacing: $tracking-ultra-wide;
  text-transform: uppercase;
}

.score-row {
  display: flex;
  align-items: center;
  gap: $intra-group;
  margin-bottom: $intra-group;
}

.score-star {
  font-size: 40rpx;
}

.score-value {
  font-size: 80rpx;
  font-weight: 900;
  color: var(--c-gold, $accent-gold);
  line-height: 1;
  font-variant-numeric: tabular-nums;
  letter-spacing: $tracking-tighter;
  text-shadow: 0 0 40rpx rgba(255, 215, 0, 0.3);
}

.score-duration {
  font-size: 26rpx;
  color: var(--c-text-tertiary, $text-tertiary);
  margin-bottom: $intra-group;
  letter-spacing: $tracking-normal;
}

.level-tag {
  display: flex;
  align-items: center;
  gap: $intra-tight;
  background: var(--c-accent-soft, $glow-orange-soft);
  border-radius: $radius-pill;
  padding: 14rpx 32rpx;
  border: 1rpx solid var(--c-accent-glow, $glow-orange);
}

.level-icon {
  font-size: 32rpx;
}

.level-name {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--c-accent, $accent-orange);
  letter-spacing: $tracking-normal;
}

/* ── Section ── */
.section {
  margin-top: $section-gap;
}

.section-header {
  margin-bottom: $intra-group;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  background: var(--c-accent-soft, $glow-orange-soft);
  border-radius: $radius-pill;
  padding: 6rpx 20rpx;
  margin-bottom: $intra-tight;
}

.eyebrow-text {
  font-size: 20rpx;
  color: var(--c-accent, $accent-orange);
  font-weight: 500;
  letter-spacing: $tracking-ultra-wide;
  text-transform: uppercase;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--c-text-primary, $text-primary);
  letter-spacing: $tracking-normal;
}

/* ── Chart Double-Bezel ── */
.chart-shell {
  background: var(--c-surface-2, $glass-white-2);
  border: 1rpx solid var(--c-surface-4, $glass-white-4);
  border-radius: $radius-xl;
  padding: $bezel-offset;
}

.chart-core {
  background: var(--c-surface-0, $surface-0);
  border-radius: $radius-lg;
  padding: $card-pad-inner;
  display: flex;
  justify-content: center;
  border: 1rpx solid var(--c-surface-3, $glass-white-3);
  box-shadow: var(--c-shadow-inner, $shadow-inner);
}

/* ── Group Double-Bezel ── */
.group-shell {
  background: var(--c-surface-2, $glass-white-2);
  border: 1rpx solid var(--c-surface-4, $glass-white-4);
  border-radius: $radius-xl;
  padding: $bezel-offset;
  margin-bottom: $inter-group;
}

.group-core {
  background: var(--c-surface-0, $surface-0);
  border-radius: $radius-md;
  padding: $card-pad-inner;
  border: 1rpx solid var(--c-surface-3, $glass-white-3);
  box-shadow: var(--c-shadow-inner, $shadow-inner);
}

.group-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--c-accent, $accent-orange);
  margin-bottom: $intra-group;
  padding-bottom: $intra-tight;
  border-bottom: 1rpx solid var(--c-surface-4, $glass-white-4);
  display: block;
  letter-spacing: $tracking-normal;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $intra-tight 0;
}

.item-name {
  font-size: 28rpx;
  color: var(--c-text-primary, $text-primary);
  letter-spacing: $tracking-normal;
}

.item-qty {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--c-gold, $accent-gold);
  font-variant-numeric: tabular-nums;
  letter-spacing: $tracking-normal;
}

/* ── Empty Items ── */
.empty-items {
  background: var(--c-surface-2, $glass-white-2);
  border: 1rpx solid var(--c-surface-4, $glass-white-4);
  border-radius: $radius-xl;
  padding: $space-6;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-items-icon {
  font-size: 48rpx;
  margin-bottom: 16rpx;
}

.empty-items-text {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--c-text-primary, $text-primary);
}

/* ── Action Buttons ── */
.actions {
  margin-top: $section-gap;
  display: flex;
  flex-direction: column;
  gap: $intra-group;
  animation: fadeInUp $dur-slow $ease-out-expo $dur-normal both;
}

.action-btn {
  height: 96rpx;
  border-radius: $radius-xl;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: transform $dur-normal $ease-spring;
}

.action-btn:active {
  transform: scale(0.97);
}

.action-btn--receipt {
  background: var(--c-surface-4, $glass-white-4);
  border: 1rpx solid var(--c-hairline, $hairline);
}

.action-btn--poster {
  background: linear-gradient(135deg, var(--c-accent, $accent-orange), var(--c-gold, $accent-gold));
  box-shadow: $shadow-glow-orange-strong;
}

.poster-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(ellipse at 30% 30%, var(--c-surface-15, $glass-white-15) 0%, transparent 50%);
  pointer-events: none;
}

.action-btn--delete {
  background: transparent;
  border: 1rpx solid var(--c-danger, $accent-danger);
}

.action-btn-text {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--c-text-primary, $text-primary);
  position: relative;
  z-index: 1;
  letter-spacing: $tracking-wide;
}

.action-btn-text--poster {
  color: var(--c-text-on-accent, #FFFFFF);
}

.action-btn-text--delete {
  color: var(--c-danger, $accent-danger-light);
}

</style>
