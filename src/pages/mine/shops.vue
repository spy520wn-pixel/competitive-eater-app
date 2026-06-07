<template>
  <view class="page">
    <!-- Header -->
    <view class="header">
      <view class="header__left" @tap="goBack">
        <text class="back-arrow">‹</text>
      </view>
      <text class="header__title">我的店铺</text>
      <view class="header__right" @tap="addShop">
        <text class="add-btn">+ 新增</text>
      </view>
    </view>

    <!-- Search Bar -->
    <view class="search-bar">
      <text class="search-icon">🔍</text>
      <input
        class="search-input"
        placeholder="搜索店铺..."
        placeholder-class="search-placeholder"
        :value="keyword"
        @input="onSearch"
      />
    </view>

    <!-- Shop List -->
    <view v-if="filteredShops.length > 0" class="shop-list">
      <view v-for="shop in filteredShops" :key="shop.id" class="shop-card">
        <view class="shop-card__header">
          <text class="shop-card__name">{{ shop.name }}</text>
          <view class="shop-card__badge">
            <text class="badge-text">{{ shop.category }}</text>
          </view>
        </view>
        <view class="shop-card__meta">
          <text class="meta-item">⏱ 时限 {{ shop.mealTimeLimit }}分钟</text>
          <text v-if="shop.hasTiers" class="meta-item">📊 {{ shop.tiers.length }}档位</text>
          <text class="meta-item">🍽 菜品{{ getMenuCount(shop) }}道</text>
        </view>
        <view class="shop-card__actions">
          <view class="action-btn action-btn--edit" @tap="editShop(shop)">
            <text class="action-btn__text">编辑</text>
          </view>
          <view class="action-btn action-btn--delete" @tap="deleteShop(shop)">
            <text class="action-btn__text">删除</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Empty State -->
    <view v-else class="empty-state">
      <text class="empty-icon">🏪</text>
      <text class="empty-title">还没有店铺</text>
      <text class="empty-desc">点击右上角"新增"添加你的第一家店铺</text>
      <view class="empty-btn" @tap="addShop">
        <text class="empty-btn__text">+ 新增店铺</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { shopStore } from '@/store/shop-store.js'

const shops = ref([])
const keyword = ref('')

function loadShops() {
  shops.value = shopStore.getAll()
}

onShow(() => {
  loadShops()
})

const filteredShops = computed(() => {
  if (!keyword.value) return shops.value
  return shopStore.search(keyword.value)
})

function getMenuCount(shop) {
  if (shop.hasTiers) {
    return shop.tiers.reduce((sum, t) => sum + t.menu.length, 0)
  }
  return shop.menu.length
}

function onSearch(e) {
  keyword.value = e.detail.value
}

function goBack() {
  uni.navigateBack()
}

function addShop() {
  uni.navigateTo({ url: '/pages/mine/shop-edit' })
}

function editShop(shop) {
  uni.navigateTo({ url: `/pages/mine/shop-edit?id=${shop.id}` })
}

function deleteShop(shop) {
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
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #0F0F1A;
  padding: 0 24rpx 24rpx;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  margin-bottom: 16rpx;
}

.header__left {
  width: 80rpx;
}

.back-arrow {
  font-size: 48rpx;
  color: #FFFFFF;
  font-weight: 300;
}

.header__title {
  font-size: 34rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.header__right {
  width: 80rpx;
  display: flex;
  justify-content: flex-end;
}

.add-btn {
  font-size: 28rpx;
  color: #FF6B35;
  font-weight: 600;
}

/* Search Bar */
.search-bar {
  display: flex;
  align-items: center;
  background: #1A1A2E;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 24rpx;
}

.search-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #FFFFFF;
  background: transparent;
}

.search-placeholder {
  color: #555577;
}

/* Shop List */
.shop-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.shop-card {
  background: #1A1A2E;
  border-radius: 16rpx;
  padding: 28rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.2);
}

.shop-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.shop-card__name {
  font-size: 32rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.shop-card__badge {
  background: rgba(255, 107, 53, 0.15);
  border-radius: 8rpx;
  padding: 4rpx 14rpx;
}

.badge-text {
  font-size: 22rpx;
  color: #FF6B35;
  font-weight: 500;
}

.shop-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.meta-item {
  font-size: 24rpx;
  color: #8888AA;
}

.shop-card__actions {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
}

.action-btn {
  padding: 12rpx 28rpx;
  border-radius: 12rpx;
}

.action-btn--edit {
  background: rgba(255, 107, 53, 0.15);
}

.action-btn--edit .action-btn__text {
  color: #FF6B35;
}

.action-btn--delete {
  background: rgba(255, 68, 68, 0.12);
}

.action-btn--delete .action-btn__text {
  color: #FF4444;
}

.action-btn__text {
  font-size: 24rpx;
  font-weight: 500;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 40rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #8888AA;
  margin-bottom: 40rpx;
  text-align: center;
}

.empty-btn {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8F60 100%);
  border-radius: 24rpx;
  padding: 20rpx 48rpx;
}

.empty-btn__text {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 600;
}
</style>
