<template>
  <view class="page" :data-theme="currentTheme">
    <nav-bar title="战绩" :show-back="true" />
    <!-- Stats Summary -->
    <view class="stats-bar" v-if="shopGroups.length > 0">
      <text class="stats-text">
        共 {{ totalRecords }} 条记录 · {{ shopGroups.length }} 家店铺
      </text>
    </view>

    <!-- Shop groups -->
    <scroll-view
      v-if="shopGroups.length > 0"
      scroll-y
      class="shop-list"
      :scroll-anchoring="true"
      :enable-back-to-top="true"
      @scrolltolower="loadMore"
    >
      <view
        v-for="(group, index) in displayedGroups"
        :key="group.shopId"
        class="shop-card-shell"
        role="button"
        :aria-label="group.shopName"
        :style="{ animationDelay: index * 80 + 'ms' }"
        @tap="goShopRecords(group.shopId)"
      >
        <view class="shop-card-core">
          <view class="shop-left">
            <view class="shop-icon-wrap">
              <text class="shop-icon">{{ group.icon }}</text>
            </view>
            <view class="shop-info">
              <text class="shop-name">{{ group.shopName }}</text>
              <view class="shop-meta">
                <text class="meta-score">最高战斗力：{{ group.bestScore }}</text>
                <text class="meta-dot">·</text>
                <text class="meta-count">挑战 {{ group.count }} 次</text>
              </view>
              <text class="meta-date">{{ getRelativeTime(group.latestDate) }}挑战过</text>
            </view>
          </view>
          <view class="arrow-wrap">
            <text class="arrow">›</text>
          </view>
        </view>
      </view>
      <view v-if="!hasMore && shopGroups.length > PAGE_SIZE" class="list-end">
        <text class="list-end-text">已显示全部 {{ shopGroups.length }} 家店铺</text>
      </view>
    </scroll-view>

    <!-- Empty state -->
    <EmptyState
      v-else
      icon="🏆"
      title="战绩簿空空的"
      description="去挑战一家店铺，开始积累你的战绩"
      action-text="开始挑战"
      hint="每次挑战都会记录在这里"
      @action="goChallenge"
    />
  </view>
</template>

<script setup>
import NavBar from '@/components/nav-bar.vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { recordStore } from '../../store/record-store'
import { getRelativeTime, formatDate } from '@/utils/time.js'
import EmptyState from '@/components/empty-state.vue'
import { settingsStore, currentTheme } from '@/store/settings-store.js'
import { applyPageTheme, syncThemeFromStorage } from '@/utils/apply-page-theme.js'

const PAGE_SIZE = 20
const records = ref([])
const displayCount = ref(PAGE_SIZE)

const CATEGORY_ICONS = {
  '自助餐': '🍖',
  '海鲜': '🦐',
  '火锅': '🍲',
  '烧烤': '🥩',
  '日料': '🍣',
  'default': '🍽️'
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
        latestDate: null
      }
    }
    const g = groups[r.shopId]
    g.count++
    if (r.score > g.bestScore) g.bestScore = r.score
    if (!g.latestDate || new Date(r.createdAt) > new Date(g.latestDate)) {
      g.latestDate = r.createdAt
    }
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

const displayedGroups = computed(() => shopGroups.value.slice(0, displayCount.value))
const hasMore = computed(() => shopGroups.value.length > displayCount.value)

function loadMore() {
  if (hasMore.value) {
    displayCount.value += PAGE_SIZE
  }
}

function loadData() {
  records.value = recordStore.getAll()
  displayCount.value = PAGE_SIZE
}

function goShopRecords(shopId) {
  uni.navigateTo({ url: `/pages/record/shop-records?shopId=${shopId}` })
}

function goChallenge() {
  uni.switchTab({ url: '/pages/challenge/select' })
}

onMounted(() => {
  applyPageTheme(settingsStore.get().theme)
  uni.$on('theme-apply', applyPageTheme)
})

onUnmounted(() => {
  uni.$off('theme-apply', applyPageTheme)
})

onShow(() => {
  loadData()
  syncThemeFromStorage()
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--c-bg, $void-black);
  padding: $page-pad-y $page-pad-x $page-pad-bottom;
  position: relative;
  overflow: hidden;
}

/* ── Stats Bar ── */
.stats-bar {
  padding: $intra-group 0;
  animation: fadeInUp $dur-normal $ease-out-expo both;
}

.stats-text {
  font-size: var(--text-label-size, $type-label-size);
  color: var(--c-text-tertiary, $text-tertiary);
  letter-spacing: var(--text-label-ls, $type-label-ls);
}

/* ── Shop List ── */
.shop-list {
  position: relative;
  z-index: 1;
}

/* ── Shop Card ── */
.shop-card-shell {
  background: linear-gradient(165deg, var(--c-surface-8, $glass-white-8) 0%, var(--c-surface-3, $glass-white-3) 100%);
  border: 1rpx solid var(--c-border, $hairline);
  border-radius: $radius-xl;
  box-shadow: var(--c-shadow-xl, $shadow-xl), var(--c-shadow-inner, $shadow-inner);
  backdrop-filter: blur(12rpx);
  -webkit-backdrop-filter: blur(12rpx);
  margin-bottom: $inter-group;
  animation: fadeInUp $dur-slow $ease-out-expo both;
  transition: transform $dur-fast $ease-spring, box-shadow $dur-fast $ease-spring;
  overflow: hidden;
}

.shop-card-shell:active {
  transform: scale(0.98);
  box-shadow: $shadow-sm;
}

.shop-card-core {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--c-surface-0, $surface-0);
  border-radius: $radius-lg;
  padding: $card-pad-compact;
  border: 1rpx solid var(--c-surface-3, $glass-white-3);
  box-shadow: var(--c-shadow-inner, $shadow-inner);
  min-width: 0;
}

.shop-left {
  display: flex;
  align-items: center;
  gap: $intra-group;
  flex: 1;
}

.shop-icon-wrap {
  width: 80rpx;
  height: 80rpx;
  border-radius: $radius-lg;
  background: var(--c-surface-4, $glass-white-4);
  border: 1rpx solid var(--c-surface-4, $glass-white-4);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.shop-icon {
  font-size: 40rpx;
}

.shop-info {
  display: flex;
  flex-direction: column;
  gap: $intra-tight;
  flex: 1;
  min-width: 0;
}

.shop-name {
  font-size: var(--text-title-size, $type-title-size);
  font-weight: var(--text-headline-weight, $type-headline-weight);
  line-height: var(--text-title-lh, $type-title-lh);
  color: var(--c-text-primary, $text-primary);
  letter-spacing: var(--text-title-ls, $type-title-ls);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shop-meta {
  display: flex;
  align-items: center;
  gap: $intra-tight;
}

.meta-score {
  font-size: var(--text-label-size, $type-label-size);
  font-weight: var(--text-headline-weight, $type-headline-weight);
  color: var(--c-accent, $accent-orange);
  letter-spacing: var(--text-label-ls, $type-label-ls);
}

.meta-dot {
  font-size: var(--text-label-size, $type-label-size);
  color: var(--c-text-ghost, $text-ghost);
}

.meta-count {
  font-size: var(--text-label-size, $type-label-size);
  font-weight: var(--text-label-weight, $type-label-weight);
  color: var(--c-text-tertiary, $text-tertiary);
  letter-spacing: var(--text-label-ls, $type-label-ls);
}

.meta-date {
  font-size: var(--text-caption-size, $type-caption-size);
  font-weight: var(--text-caption-weight, $type-caption-weight);
  color: var(--c-text-muted, $text-muted);
}

.arrow-wrap {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: var(--c-surface-3, $glass-white-3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.arrow {
  font-size: 28rpx;
  color: var(--c-text-muted, $text-muted);
  font-weight: 300;
}

/* ── Empty State ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 160rpx 60rpx;
  position: relative;
  z-index: 1;
  animation: fadeInUp $dur-entrance $ease-out-expo 0.2s both;
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
  animation: float 4s $ease-in-out-smooth infinite;
}

.empty-icon {
  font-size: 64rpx;
}

.empty-title {
  font-size: 34rpx;
  font-weight: 700;
  color: var(--c-text-primary, $text-primary);
  margin-bottom: $intra-tight;
  letter-spacing: $tracking-normal;
}

.empty-desc {
  font-size: 26rpx;
  color: var(--c-text-tertiary, $text-tertiary);
  text-align: center;
  letter-spacing: $tracking-wide;
}

/* ── List End ── */
.list-end {
  display: flex;
  justify-content: center;
  padding: 24rpx 0 16rpx;
}

.list-end-text {
  font-size: var(--text-label-size, $type-label-size);
  color: var(--c-text-ghost, $text-ghost);
  letter-spacing: var(--text-label-ls, $type-label-ls);
}
</style>
