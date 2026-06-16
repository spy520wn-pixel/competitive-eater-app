<template>
  <view class="page" :data-theme="currentTheme">
    <!-- Search Bar -->
    <SearchBar
      v-model="keyword"
      placeholder="搜索店铺..."
      aria-label="搜索店铺"
    >
      <template #extra>
        <view class="import-btn" @tap="showImportPanel">
          <text class="import-btn__text">📥 导入</text>
        </view>
      </template>
    </SearchBar>

    <!-- Swipe Hint -->
    <view v-if="filteredShops.length > 0 && !hasSwiped" class="swipe-hint">
      <text class="swipe-hint__text">👈 左滑店铺卡片可编辑或删除</text>
    </view>

    <!-- Shop List -->
    <view v-if="filteredShops.length > 0" class="shop-list">
      <view
        v-for="(shop, index) in displayedShops"
        :key="shop.id"
        class="shop-card-wrapper"
        :style="{ animationDelay: index * 60 + 'ms' }"
        @touchstart="onTouchStart($event, shop.id)"
        @touchmove="onTouchMove($event, shop.id)"
        @touchend="onTouchEnd(shop.id)"
      >
        <view class="shop-card-shell" :class="{ 'shop-card-shell--swiped': swipedShopId === shop.id }">
          <view class="shop-card-core">
            <view class="shop-card__header">
              <text class="shop-card__name">{{ shop.name }}</text>
            </view>
            <view v-if="shop.rating || shop.cost" class="shop-card__info">
              <text v-if="shop.rating" class="info-rating">★ {{ shop.rating }}</text>
              <text v-if="shop.rating && shop.cost" class="info-dot">·</text>
              <text v-if="shop.cost" class="info-cost">¥{{ shop.cost }}/人</text>
            </view>
            <view class="shop-card__meta">
              <text class="meta-item">⏱ 时限 {{ shop.mealTimeLimit }}分钟</text>
              <text v-if="shop.hasTiers" class="meta-item">📊 {{ shop.tiers.length }}档位</text>
              <text class="meta-item">🍽 菜品{{ getMenuCount(shop) }}道</text>
            </view>
          </view>
          <view class="shop-card__glow" />
        </view>
        <view class="shop-card-actions" :class="{ 'shop-card-actions--visible': swipedShopId === shop.id }">
          <view class="swipe-action swipe-action--edit" @tap="editShop(shop)">
            <text class="swipe-action-icon">✏️</text>
            <text class="swipe-action-text">编辑</text>
          </view>
          <view class="swipe-action swipe-action--delete" @tap="deleteShop(shop)">
            <text class="swipe-action-icon">🗑</text>
            <text class="swipe-action-text">删除</text>
          </view>
        </view>
      </view>
      <view v-if="!hasMore && filteredShops.length > PAGE_SIZE" class="list-end">
        <text class="list-end-text">已显示全部 {{ filteredShops.length }} 家店铺</text>
      </view>
    </view>

    <!-- Empty State -->
    <EmptyState
      v-else
      icon="🍜"
      title="还没有店铺"
      description="添加你常去的自助餐店铺，开始挑战之旅"
      hint="点击右下角按钮新增店铺"
    />

    <!-- Floating Add Button -->
    <view class="fab" @tap="addShop">
      <text class="fab-text">+</text>
    </view>

    <!-- Import Panel -->
    <ImportShopsPanel
      :visible="importPanelVisible"
      @close="importPanelVisible = false"
      @imported="onImported"
    />
  </view>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { onShow, onReachBottom } from '@dcloudio/uni-app'
import { shopStore } from '@/store/shop-store.js'
import { applyPageTheme, syncThemeFromStorage } from '@/utils/apply-page-theme.js'
import { settingsStore, currentTheme } from '@/store/settings-store.js'
import ImportShopsPanel from '@/components/import-shops-panel.vue'
import EmptyState from '@/components/empty-state.vue'
import SearchBar from '@/components/search-bar.vue'

const PAGE_SIZE = 20
const shops = ref([])
const keyword = ref('')
const importPanelVisible = ref(false)
const swipedShopId = ref(null)
const hasSwiped = ref(false)
const displayCount = ref(PAGE_SIZE)
let touchStartX = 0
let touchStartY = 0
let touchDirection = null

function loadShops() {
  shops.value = shopStore.getAll()
  displayCount.value = PAGE_SIZE
}

onMounted(() => {
  applyPageTheme(settingsStore.get().theme)
  uni.$on('theme-apply', applyPageTheme)
})

onUnmounted(() => {
  uni.$off('theme-apply', applyPageTheme)
})

onShow(() => {
  loadShops()
  syncThemeFromStorage()
})

const filteredShops = computed(() => {
  if (!keyword.value) return shops.value
  return shopStore.search(keyword.value)
})

const displayedShops = computed(() => filteredShops.value.slice(0, displayCount.value))
const hasMore = computed(() => filteredShops.value.length > displayCount.value)

onReachBottom(() => {
  if (hasMore.value) {
    displayCount.value += PAGE_SIZE
  }
})

watch(keyword, () => {
  displayCount.value = PAGE_SIZE
})

function getMenuCount(shop) {
  if (shop.hasTiers) {
    return shop.tiers.reduce((sum, t) => sum + t.menu.length, 0)
  }
  return shop.menu.length
}

function addShop() {
  uni.navigateTo({ url: '/pages/mine/shop-edit' })
}

function showImportPanel() {
  importPanelVisible.value = true
}

function onImported() {
  loadShops()
}

function editShop(shop) {
  swipedShopId.value = null
  uni.navigateTo({ url: `/pages/mine/shop-edit?id=${shop.id}` })
}

function deleteShop(shop) {
  swipedShopId.value = null
  uni.showModal({
    title: '确认删除',
    content: `确定要删除「${shop.name}」吗？此操作不可恢复。`,
    confirmColor: '#FF6B35',
    success(res) {
      if (res.confirm) {
        shopStore.remove(shop.id)
        loadShops()
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}

// 滑动手势处理
function onTouchStart(e, shopId) {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
  touchDirection = null
}

function onTouchMove(e, shopId) {
  const deltaX = e.touches[0].clientX - touchStartX
  const deltaY = e.touches[0].clientY - touchStartY

  // 首次移动时确定方向（需要至少 10px 的移动）
  if (touchDirection === null && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
    touchDirection = Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical'
  }

  // 只在水平方向滑动时处理
  if (touchDirection === 'horizontal' && Math.abs(deltaX) > 50) {
    if (deltaX < 0) {
      // 左滑显示操作按钮
      swipedShopId.value = shopId
      hasSwiped.value = true
    } else {
      // 右滑隐藏操作按钮
      swipedShopId.value = null
    }
  }
}

function onTouchEnd(shopId) {
  touchDirection = null
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--c-bg, $void-black);
  padding: $page-pad-y $page-pad-x;
  padding-bottom: calc(#{$page-pad-bottom} + 120rpx);
}

.search-placeholder {
  color: var(--c-text-muted, $text-muted);
}

.import-btn {
  padding: 10rpx 20rpx;
  border-radius: $radius-lg;
  background: var(--c-accent-glow, $glow-orange);
  border: 1rpx solid rgba(255, 107, 53, 0.2);
  margin-left: 16rpx;
}

.import-btn__text {
  font-size: 24rpx;
  color: var(--c-accent, $accent-orange);
  font-weight: 500;
  white-space: nowrap;
}

/* ── Swipe Hint ── */
.swipe-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 0;
  margin-bottom: 8rpx;
  animation: fadeIn $dur-slow $ease-out-expo both;
}

.swipe-hint__text {
  font-size: var(--text-label-size, $type-label-size);
  color: var(--c-text-muted, $text-muted);
  letter-spacing: $tracking-wide;
}

/* ── Shop List ── */
.shop-list {
  display: flex;
  flex-direction: column;
  gap: $inter-group;
}

/* ── Shop Card ── */
.shop-card-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: $radius-xl;
  animation: fadeInUp $dur-slow $ease-out-expo both;
}

.shop-card-shell {
  background: linear-gradient(165deg, var(--c-surface-10, $glass-white-10) 0%, var(--c-surface-3, $glass-white-3) 100%);
  border: 1rpx solid var(--c-border-active, $hairline-active);
  border-radius: $radius-xl;
  box-shadow: var(--c-shadow-xl, $shadow-xl), var(--c-shadow-inner, $shadow-inner);
  backdrop-filter: blur(12rpx);
  -webkit-backdrop-filter: blur(12rpx);
  transition: transform $dur-fast $ease-spring, box-shadow $dur-fast $ease-out-quint;
  overflow: hidden;
  &:active {
    transform: scale(0.98);
    box-shadow: var(--c-shadow-xl, $shadow-xl), var(--c-shadow-inner, $shadow-inner), 0 0 30rpx rgba(255, 107, 53, 0.12);
  }
}

.shop-card-shell--swiped {
  transform: translateX(-220rpx);
}

.shop-card-actions {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  transform: translateX(100%);
  transition: transform $dur-fast $ease-spring;
}

.shop-card-actions--visible {
  transform: translateX(0);
}

.swipe-action {
  width: 110rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.swipe-action-icon {
  font-size: 32rpx;
}

.swipe-action--edit {
  background: var(--c-accent, $accent-orange);
}

.swipe-action--delete {
  background: var(--c-danger, $accent-danger);
}

.swipe-action-text {
  font-size: 24rpx;
  color: #FFFFFF;
  font-weight: 500;
}

.shop-card-core {
  padding: $card-pad-inner;
}

.shop-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $intra-group;
}

.shop-card__name {
  font-size: var(--text-headline-size, $type-headline-size);
  font-weight: var(--text-headline-weight, $type-headline-weight);
  line-height: var(--text-headline-lh, $type-headline-lh);
  color: var(--c-text-primary, $text-primary);
  letter-spacing: var(--text-headline-ls, $type-headline-ls);
}

.shop-card__info {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: $intra-group;
}

.info-rating {
  font-size: var(--text-label-size, $type-label-size);
  color: var(--c-gold, $accent-gold);
  font-weight: 600;
  letter-spacing: var(--text-label-ls, $type-label-ls);
}

.info-dot {
  font-size: 20rpx;
  color: var(--c-text-ghost, $text-ghost);
}

.info-cost {
  font-size: var(--text-label-size, $type-label-size);
  color: var(--c-text-secondary, $text-secondary);
  letter-spacing: var(--text-label-ls, $type-label-ls);
}

.shop-card__glow {
  height: 3rpx;
  background: linear-gradient(90deg, transparent 0%, var(--c-accent, $accent-orange) 30%, var(--c-gold, $accent-gold) 70%, transparent 100%);
  opacity: 0.35;
  border-radius: 0 0 $radius-xl $radius-xl;
}

.shop-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: $intra-group;
  margin-bottom: $intra-group;
}

.meta-item {
  font-size: var(--text-label-size, $type-label-size);
  color: var(--c-text-tertiary, $text-tertiary);
  letter-spacing: var(--text-label-ls, $type-label-ls);
}

/* ── Floating Action Button ── */
.fab {
  position: fixed;
  right: 32rpx;
  bottom: calc(env(safe-area-inset-bottom) + 200rpx);
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--c-accent, $accent-orange) 0%, var(--c-accent-light, $accent-orange-light) 100%);
  box-shadow: $shadow-glow-orange-strong;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition: transform $dur-normal $ease-spring;
}

.fab:active {
  transform: scale(0.92);
}

.fab-text {
  font-size: 52rpx;
  color: var(--c-text-on-accent, #FFFFFF);
  font-weight: 300;
  line-height: 1;
  margin-top: -2rpx;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
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
