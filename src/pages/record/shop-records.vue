<template>
  <view class="page" :data-theme="currentTheme">
    <nav-bar title="店铺战绩" :show-back="true" />
    <!-- Stats banner — Double-Bezel -->
    <view class="stats-shell">
      <view class="stats-core">
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
    </view>

    <!-- Record list -->
    <view v-if="sortedRecords.length > 0" class="record-list">
      <view
        v-for="(rec, idx) in sortedRecords"
        :key="rec.id"
        class="record-card-shell"
        role="button"
        :class="{ 'record-card-shell--best': idx === 0 }"
        :style="{ animationDelay: idx * 80 + 'ms' }"
        @tap="goDetail(rec.id)"
      >
        <view class="record-card-core">
          <view class="record-top">
            <view class="record-left">
              <text class="record-date">{{ formatDate(rec.createdAt) }}</text>
              <view class="record-score-row">
                <text class="record-score-label">战斗力</text>
                <text class="record-score" :class="{ 'record-score--best': idx === 0 }">{{ rec.score }}</text>
                <view v-if="idx === 0" class="best-badge">
                  <text class="best-star">⭐</text>
                </view>
              </view>
            </view>
            <view class="arrow-wrap">
              <text class="record-arrow">›</text>
            </view>
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
    </view>

    <!-- Empty -->
    <EmptyState
      v-else
      icon="📋"
      title="这家店还没挑战过"
      description="去挑战一下，看看你能吃多少"
      action-text="去挑战"
      @action="goChallenge"
    />
  </view>
</template>

<script setup>
import NavBar from '@/components/nav-bar.vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { recordStore } from '../../store/record-store'
import { settingsStore, currentTheme } from '../../store/settings-store'
import { applyPageTheme, syncThemeFromStorage } from '@/utils/apply-page-theme.js'
import EmptyState from '@/components/empty-state.vue'

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
  Object.keys(totals).forEach(cat => {
    if (!CATEGORY_ORDER.includes(cat)) {
      parts.push(`${cat}${totals[cat]}份`)
    }
  })
  return parts.join(' ')
}

const sortedRecords = computed(() => {
  return [...records.value].sort((a, b) => b.score - a.score)
})

const bestScore = computed(() => {
  if (records.value.length === 0) return 0
  return Math.max(...records.value.map(r => r.score))
})

const avgScore = computed(() => {
  if (records.value.length === 0) return 0
  const sum = records.value.reduce((acc, r) => acc + r.score, 0)
  return Math.round(sum / records.value.length)
})

function goDetail(recordId) {
  uni.navigateTo({ url: `/pages/record/detail?id=${recordId}` })
}

function goChallenge() {
  uni.switchTab({ url: '/pages/challenge/select' })
}

onLoad((options) => {
  shopId.value = options.shopId || ''
  const allRecords = recordStore.getByShopId(shopId.value)
  records.value = allRecords
  if (allRecords.length > 0) {
    shopName.value = allRecords[0].shopName
    uni.setNavigationBarTitle({ title: shopName.value })
  }

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

/* ── Stats Bar (Double-Bezel) ── */
.stats-shell {
  background: linear-gradient(165deg, var(--c-surface-8, $glass-white-8) 0%, var(--c-surface-3, $glass-white-3) 100%);
  border: 1rpx solid var(--c-surface-12, $glass-white-12);
  border-radius: $radius-2xl;
  box-shadow: var(--c-shadow-xl, $shadow-xl), var(--c-shadow-inner, $shadow-inner);
  backdrop-filter: blur(12rpx);
  -webkit-backdrop-filter: blur(12rpx);
  margin-bottom: $section-gap;
  animation: fadeInUp $dur-slow $ease-out-expo both;
  overflow: hidden;
}

.stats-core {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: $card-pad-compact;
}

.stat-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $intra-tight;
}

.stat-value {
  font-size: 48rpx;
  font-weight: 800;
  color: var(--c-accent, $accent-orange);
  font-variant-numeric: tabular-nums;
  letter-spacing: $tracking-tighter;
}

.stat-label {
  font-size: 22rpx;
  color: var(--c-text-tertiary, $text-tertiary);
  letter-spacing: $tracking-wider;
}

.stat-divider {
  width: 1rpx;
  height: 56rpx;
  background: linear-gradient(180deg, transparent, var(--c-surface-6, $glass-white-6), transparent);
}

/* ── Record List ── */
.record-list {
  display: flex;
  flex-direction: column;
  gap: $inter-group;
}

/* ── Record Card (Double-Bezel) ── */
.record-card-shell {
  background: linear-gradient(165deg, var(--c-surface-8, $glass-white-8) 0%, var(--c-surface-3, $glass-white-3) 100%);
  border: 1rpx solid var(--c-surface-12, $glass-white-12);
  border-radius: $radius-2xl;
  box-shadow: var(--c-shadow-xl, $shadow-xl), var(--c-shadow-inner, $shadow-inner);
  backdrop-filter: blur(12rpx);
  -webkit-backdrop-filter: blur(12rpx);
  animation: fadeInUp $dur-slow $ease-out-expo both;
  transition: transform $dur-fast $ease-spring, box-shadow $dur-fast $ease-spring;
  overflow: hidden;
}

.record-card-shell:active {
  transform: scale(0.98);
}

.record-card-shell--best {
  border-color: rgba(255, 215, 0, 0.3);
  background: linear-gradient(165deg, rgba(255, 215, 0, 0.12) 0%, rgba(255, 215, 0, 0.04) 100%);
  box-shadow: 0 8rpx 40rpx rgba(255, 215, 0, 0.15), var(--c-shadow-inner, $shadow-inner);
}

.record-card-core {
  background: var(--c-surface-0, $surface-0);
  border-radius: calc(#{$radius-2xl} - #{$bezel-offset});
  padding: $card-pad-inner;
  border: 1rpx solid var(--c-border-subtle, $hairline-subtle);
  box-shadow: var(--c-shadow-inner, $shadow-inner);
}

.record-card-shell--best .record-card-core {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.06) 0%, var(--c-surface-0, $surface-0) 100%);
  border-color: rgba(255, 215, 0, 0.1);
}

.record-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.record-left {
  display: flex;
  flex-direction: column;
  gap: $intra-tight;
}

.record-date {
  font-size: 24rpx;
  color: var(--c-text-tertiary, $text-tertiary);
}

.record-score-row {
  display: flex;
  align-items: center;
  gap: $intra-tight;
}

.record-score-label {
  font-size: 26rpx;
  color: var(--c-text-secondary, $text-secondary);
}

.record-score {
  font-size: 44rpx;
  font-weight: 800;
  color: var(--c-accent, $accent-orange);
  font-variant-numeric: tabular-nums;
}

.record-score--best {
  color: var(--c-gold, $accent-gold);
  text-shadow: 0 0 20rpx rgba(255, 215, 0, 0.3);
}

.best-badge {
  animation: pulseGlow 2s ease-in-out infinite;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%);
  border-radius: $radius-pill;
  padding: 4rpx 12rpx;
  margin-left: 8rpx;
}

.best-star {
  font-size: 32rpx;
}

.arrow-wrap {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background: var(--c-surface-3, $glass-white-3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.record-arrow {
  font-size: 28rpx;
  color: var(--c-text-muted, $text-muted);
  font-weight: 300;
}

/* Category summary */
.record-summary {
  margin-top: $intra-group;
  padding-top: $intra-group;
  border-top: 1rpx solid var(--c-border-subtle, $hairline-subtle);
}

.summary-text {
  font-size: 24rpx;
  color: var(--c-text-secondary, $text-secondary);
  line-height: 1.6;
}

/* Duration */
.record-duration {
  margin-top: $intra-tight;
}

.duration-text {
  font-size: 22rpx;
  color: var(--c-text-muted, $text-muted);
}

/* ── Empty State ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 160rpx 60rpx;
  animation: fadeInUp 0.8s $ease-out-expo 0.2s both;
}

.empty-plate {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: var(--c-surface-3, $glass-white-3);
  border: 1rpx solid var(--c-hairline, $hairline);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $intra-group;
  box-shadow: var(--c-shadow-lg, $shadow-lg), var(--c-shadow-inner, $shadow-inner);
}

.empty-icon {
  font-size: 56rpx;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--c-text-primary, $text-primary);
}
</style>
