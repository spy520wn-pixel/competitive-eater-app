<template>
  <view class="page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <text class="search-icon">🔍</text>
      <input
        class="search-input"
        placeholder="搜索店铺..."
        placeholder-style="color: #666680"
        :value="keyword"
        @input="onSearch"
      />
    </view>

    <!-- 店铺列表 -->
    <scroll-view scroll-y class="shop-list" v-if="filteredShops.length > 0">
      <view
        v-for="shop in filteredShops"
        :key="shop.id"
        class="shop-card"
        @tap="onSelectShop(shop)"
      >
        <view class="shop-card__icon">
          <text class="icon-text">{{ getCategoryIcon(shop.category) }}</text>
        </view>
        <view class="shop-card__info">
          <text class="shop-card__name">{{ shop.name }}</text>
          <text class="shop-card__meta">
            {{ shop.category }} · 时限 {{ shop.mealTimeLimit }}分钟
          </text>
        </view>
        <text class="shop-card__arrow">›</text>
      </view>
    </scroll-view>

    <!-- 空状态 -->
    <view v-else class="empty-state">
      <text class="empty-icon">🏪</text>
      <text class="empty-title">暂无店铺</text>
      <text class="empty-desc">请先到「我的」页面添加店铺和菜单</text>
      <view class="empty-btn" @tap="goToMine">
        <text class="empty-btn-text">去添加店铺</text>
      </view>
    </view>

    <!-- 档位选择弹窗 -->
    <TierPicker
      v-model:visible="showTierPicker"
      :tiers="currentTiers"
      :selected-id="selectedTierId"
      @select="onTierSelected"
    />

    <!-- 确认弹窗 -->
    <view v-if="showConfirm" class="confirm-mask" @tap="showConfirm = false">
      <view class="confirm-dialog" @tap.stop>
        <text class="confirm-title">开始挑战？</text>
        <text class="confirm-shop">{{ confirmShopName }}</text>
        <text class="confirm-tier" v-if="confirmTierName">{{ confirmTierName }}</text>
        <text class="confirm-hint">准备好了吗，大胃王？</text>
        <view class="confirm-actions">
          <view class="confirm-btn confirm-btn--cancel" @tap="showConfirm = false">
            <text class="confirm-btn-text">取消</text>
          </view>
          <view class="confirm-btn confirm-btn--go" @tap="startChallenge">
            <text class="confirm-btn-text confirm-btn-text--go">开战！</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { shopStore } from '../../store/shop-store'
import { recordStore } from '../../store/record-store'
import TierPicker from '../../components/tier-picker.vue'

const keyword = ref('')
const shops = ref([])
const showTierPicker = ref(false)
const currentTiers = ref([])
const selectedTierId = ref('')
const pendingShop = ref(null)
const showConfirm = ref(false)
const confirmShopName = ref('')
const confirmTierName = ref('')

const CATEGORY_ICONS = {
  '自助餐': '🍖',
  '火锅': '🍲',
  '烧烤': '🥩',
  '海鲜': '🦐',
  '日料': '🍣',
  '西餐': '🍝',
  '中餐': '🥢',
  '其他': '🍽️'
}

function getCategoryIcon(category) {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS['其他']
}

const filteredShops = computed(() => {
  if (!keyword.value) return shops.value
  const kw = keyword.value.toLowerCase()
  return shops.value.filter(s =>
    s.name.toLowerCase().includes(kw) ||
    s.category.toLowerCase().includes(kw) ||
    (s.city && s.city.toLowerCase().includes(kw))
  )
})

function loadShops() {
  shops.value = shopStore.getAll()
}

function onSearch(e) {
  keyword.value = e.detail.value
}

function onSelectShop(shop) {
  if (shop.hasTiers && shop.tiers.length > 0) {
    pendingShop.value = shop
    currentTiers.value = shop.tiers
    selectedTierId.value = ''
    showTierPicker.value = true
  } else {
    pendingShop.value = shop
    confirmShopName.value = shop.name
    confirmTierName.value = ''
    showConfirm.value = true
  }
}

function onTierSelected(tier) {
  selectedTierId.value = tier.id
  confirmShopName.value = pendingShop.value.name
  confirmTierName.value = tier.name
  showConfirm.value = true
}

function startChallenge() {
  showConfirm.value = false
  const shop = pendingShop.value
  if (!shop) return

  const tierId = selectedTierId.value || ''
  const tierName = confirmTierName.value || ''

  const record = recordStore.create({
    shopId: shop.id,
    shopName: shop.name,
    tierId,
    tierName
  })

  uni.navigateTo({
    url: `/pages/challenge/cooking?recordId=${record.id}`
  })
}

function goToMine() {
  uni.switchTab({ url: '/pages/mine/index' })
}

onShow(() => {
  loadShops()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #0F0F1A;
  padding: 24rpx;
  padding-bottom: 120rpx;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  align-items: center;
  background: #1A1A2E;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 24rpx;
}

.search-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #FFFFFF;
  background: transparent;
}

/* 店铺列表 */
.shop-list {
  height: calc(100vh - 200rpx);
}

.shop-card {
  display: flex;
  align-items: center;
  background: #1A1A2E;
  border-radius: 16rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 20rpx;
  transition: transform 0.15s;
}

.shop-card:active {
  transform: scale(0.98);
}

.shop-card__icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  background: #2D2D44;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.icon-text {
  font-size: 40rpx;
}

.shop-card__info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.shop-card__name {
  font-size: 32rpx;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 8rpx;
}

.shop-card__meta {
  font-size: 24rpx;
  color: #8888AA;
}

.shop-card__arrow {
  font-size: 40rpx;
  color: #666680;
  margin-left: 16rpx;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
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
}

.empty-btn {
  background: #FF6B35;
  border-radius: 24rpx;
  padding: 20rpx 60rpx;
}

.empty-btn-text {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 600;
}

/* 确认弹窗 */
.confirm-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirm-dialog {
  width: 600rpx;
  background: #1A1A2E;
  border-radius: 24rpx;
  padding: 48rpx 36rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.confirm-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #FFD700;
  margin-bottom: 16rpx;
}

.confirm-shop {
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: 600;
  margin-bottom: 8rpx;
}

.confirm-tier {
  font-size: 26rpx;
  color: #FF6B35;
  margin-bottom: 8rpx;
}

.confirm-hint {
  font-size: 26rpx;
  color: #8888AA;
  margin-bottom: 40rpx;
}

.confirm-actions {
  display: flex;
  gap: 24rpx;
  width: 100%;
}

.confirm-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-btn--cancel {
  background: #2D2D44;
}

.confirm-btn--go {
  background: #FF6B35;
}

.confirm-btn-text {
  font-size: 30rpx;
  color: #8888AA;
  font-weight: 600;
}

.confirm-btn-text--go {
  color: #FFFFFF;
}
</style>
