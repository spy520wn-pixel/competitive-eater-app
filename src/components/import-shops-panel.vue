<template>
  <view v-if="visible" class="panel-mask" :class="{ 'panel-mask--visible': visible }" @tap.self="close">
    <view class="panel">
      <!-- Header -->
      <view class="panel__header">
        <text class="panel__title">导入店铺</text>
        <view class="panel__close" @tap="close">
          <text class="close-icon">✕</text>
        </view>
      </view>

      <!-- City Selector -->
      <view class="city-section">
        <text class="section-label">选择城市</text>
        <scroll-view scroll-x class="city-scroll">
          <view class="city-list">
            <view
              v-for="city in cities"
              :key="city"
              class="city-chip"
              :class="{ 'city-chip--active': selectedCity === city }"
              @tap="selectCity(city)"
            >
              <text class="city-chip__text">{{ city }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- Search Status -->
      <view v-if="loading" class="loading-section">
        <view class="loading-spinner" />
        <text class="loading-text">正在搜索「{{ selectedCity }}」的自助餐店铺...</text>
      </view>

      <!-- Results -->
      <view v-else-if="results.length > 0" class="results-section">
        <view class="results-header">
          <text class="results-count">找到 {{ results.length }} 家店铺</text>
          <view class="select-all" @tap="toggleSelectAll">
            <text class="select-all__text">{{ isAllSelected ? '取消全选' : '全选' }}</text>
          </view>
        </view>

        <scroll-view scroll-y class="results-scroll">
          <view class="results-list">
            <view
              v-for="(shop, index) in results"
              :key="shop.id"
              class="result-item"
              :class="{
                'result-item--selected': selectedIds.has(shop.id),
                'result-item--duplicate': shop._isDuplicate
              }"
              @tap="toggleSelect(shop)"
            >
              <view class="result-item__check">
                <text v-if="shop._isDuplicate" class="check-icon check-icon--duplicate">⊘</text>
                <text v-else-if="selectedIds.has(shop.id)" class="check-icon check-icon--selected">✓</text>
                <text v-else class="check-icon">○</text>
              </view>
              <view class="result-item__info">
                <text class="result-item__name">{{ shop.name }}</text>
                <text class="result-item__address">{{ shop.address }}</text>
                <view class="result-item__tags">
                  <text v-if="shop.category" class="tag">{{ shop.category }}</text>
                  <text v-if="shop.rating" class="tag tag--rating">★ {{ shop.rating }}</text>
                  <text v-if="shop.cost" class="tag">¥{{ shop.cost }}/人</text>
                </view>
              </view>
              <text v-if="shop._isDuplicate" class="result-item__dup-hint">已存在</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- Empty State -->
      <view v-else-if="selectedCity && !loading" class="empty-section">
        <text class="empty-icon">🔍</text>
        <text class="empty-text">未找到「{{ selectedCity }}」的自助餐店铺</text>
        <text class="empty-hint">请尝试其他城市，或手动添加店铺</text>
        <view class="empty-action" @tap="goToAddShop">
          <text class="empty-action__text">手动添加</text>
        </view>
      </view>

      <!-- Initial State -->
      <view v-else class="initial-section">
        <text class="initial-icon">🏪</text>
        <text class="initial-text">选择城市开始搜索</text>
        <text class="initial-hint">将从高德地图获取该城市的自助餐店铺</text>
      </view>

      <!-- Footer -->
      <view class="panel__footer">
        <view class="footer-info">
          <text v-if="selectedCount > 0" class="footer-count">已选 {{ selectedCount }} 家</text>
          <text v-if="duplicateCount > 0" class="footer-dup">跳过 {{ duplicateCount }} 家重复</text>
        </view>
        <view
          class="import-btn"
          :class="{ 'import-btn--disabled': selectedCount === 0 || importing }"
          @tap="handleImport"
        >
          <text class="import-btn__text">{{ importing ? '导入中...' : '导入选中' }}</text>
        </view>
      </view>

      <!-- Success Message -->
      <view v-if="importSuccess" class="success-message">
        <text class="success-icon">✓</text>
        <text class="success-text">导入成功</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { searchAllBuffetShops, isDuplicate } from '@/utils/amap-service.js'
import { shopStore } from '@/store/shop-store.js'

const props = defineProps({
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'imported'])

const cities = [
  '全国', '北京', '上海', '天津', '重庆', '广州', '深圳', '东莞', '佛山', '珠海',
  '杭州', '宁波', '温州', '嘉兴', '南京', '苏州', '无锡', '常州', '南通', '徐州',
  '济南', '青岛', '烟台', '潍坊', '成都', '绵阳', '武汉', '宜昌', '襄阳', '长沙',
  '岳阳', '郑州', '洛阳', '石家庄', '唐山', '福州', '厦门', '合肥', '芜湖', '沈阳',
  '大连', '南昌', '赣州', '西安', '咸阳', '南宁', '昆明', '贵阳', '太原', '哈尔滨',
  '长春', '兰州', '呼和浩特', '乌鲁木齐', '海口', '拉萨'
]

const selectedCity = ref('')
const loading = ref(false)
const results = ref([])
const selectedIds = ref(new Set())
const importing = ref(false)
const duplicateCount = ref(0)
const importSuccess = ref(false)

const selectedCount = computed(() => selectedIds.value.size)

const isAllSelected = computed(() => {
  const selectable = results.value.filter(s => !s._isDuplicate)
  return selectable.length > 0 && selectable.every(s => selectedIds.value.has(s.id))
})

watch(() => props.visible, (val) => {
  if (val) {
    selectedCity.value = ''
    results.value = []
    selectedIds.value = new Set()
    duplicateCount.value = 0
    importSuccess.value = false
  }
})

function close() {
  emit('close')
}

async function selectCity(city) {
  if (city === '全国') {
    selectedCity.value = ''
    results.value = []
    return
  }

  selectedCity.value = city
  loading.value = true
  results.value = []
  selectedIds.value = new Set()

  try {
    const pois = await searchAllBuffetShops(city, 4)

    // 获取已存在的店铺，用于去重
    const existingShops = shopStore.getAll()

    // 标记重复店铺
    const processedPois = pois.map(poi => ({
      ...poi,
      _isDuplicate: isDuplicate(poi, existingShops)
    }))

    results.value = processedPois

    // 统计重复数量
    duplicateCount.value = processedPois.filter(p => p._isDuplicate).length

    // 自动选中非重复店铺
    const autoSelectIds = new Set()
    processedPois.forEach(poi => {
      if (!poi._isDuplicate) {
        autoSelectIds.add(poi.id)
      }
    })
    selectedIds.value = autoSelectIds

  } catch (error) {
    console.error('Search failed:', error)
    const msg = error?.message || '搜索失败'
    uni.showToast({
      title: msg.length > 20 ? '搜索失败，请重试' : msg,
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

function toggleSelect(shop) {
  if (shop._isDuplicate) return

  const newSet = new Set(selectedIds.value)
  if (newSet.has(shop.id)) {
    newSet.delete(shop.id)
  } else {
    newSet.add(shop.id)
  }
  selectedIds.value = newSet
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedIds.value = new Set()
  } else {
    const selectable = results.value.filter(s => !s._isDuplicate)
    selectedIds.value = new Set(selectable.map(s => s.id))
  }
}

async function handleImport() {
  if (selectedCount.value === 0 || importing.value) return

  importing.value = true

  try {
    const selectedShops = results.value.filter(s => selectedIds.value.has(s.id))
    // 循环外一次性获取已有店铺，避免 O(n²) 查询
    const existingShops = shopStore.getAll()
    let importedCount = 0

    for (const shop of selectedShops) {
      if (isDuplicate(shop, existingShops)) continue

      const rawCity = shop.city || selectedCity.value
      const normalizedCity = rawCity.replace(/市$/, '') || selectedCity.value

      shopStore.create({
        name: shop.name,
        address: shop.address,
        category: shop.category || '自助餐',
        city: normalizedCity,
        location: shop.location,
        mealTimeLimit: 90,
        cost: shop.cost || '',
        photos: shop.photos || [],
        rating: shop.rating || ''
      })

      importedCount++
    }

    importSuccess.value = true
    uni.showToast({
      title: `成功导入 ${importedCount} 家店铺`,
      icon: 'success'
    })

    setTimeout(() => {
      importSuccess.value = false
      emit('imported')
      close()
    }, 800)

  } catch (error) {
    console.error('Import failed:', error)
    uni.showToast({
      title: '导入失败，请重试',
      icon: 'none'
    })
  } finally {
    importing.value = false
  }
}

function goToAddShop() {
  close()
  uni.navigateTo({ url: '/pages/mine/shop-edit' })
}
</script>

<style lang="scss" scoped>
.panel-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  transition: background $dur-fast $ease-in-out-smooth;
}

.panel-mask--visible {
  background: rgba(0, 0, 0, 0.6);
}

.panel {
  width: 100%;
  max-height: 85vh;
  background: var(--c-bg, $void-black);
  border-radius: 32rpx 32rpx 0 0;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
  position: relative;
  overflow: hidden;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid var(--c-border, $hairline);
}

.panel__title {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--c-text-primary, $text-primary);
}

.panel__close {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: var(--c-surface-3, $glass-white-3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-icon {
  font-size: 28rpx;
  color: var(--c-text-secondary, $text-secondary);
}

/* ── City Section ── */
.city-section {
  padding: 24rpx 32rpx;
}

.section-label {
  font-size: 24rpx;
  color: var(--c-text-secondary, $text-secondary);
  font-weight: 500;
  margin-bottom: 16rpx;
  display: block;
}

.city-scroll {
  white-space: nowrap;
}

.city-list {
  display: inline-flex;
  gap: 12rpx;
  padding-bottom: 8rpx;
}

.city-chip {
  display: inline-flex;
  padding: 12rpx 24rpx;
  border-radius: 999rpx;
  background: var(--c-surface-3, $glass-white-3);
  border: 1rpx solid var(--c-border-light, $hairline-subtle);
}

.city-chip--active {
  background: var(--c-accent-glow, $glow-orange);
  border-color: var(--c-accent, $accent-orange);
}

.city-chip__text {
  font-size: 24rpx;
  color: var(--c-text-secondary, $text-secondary);
  white-space: nowrap;
}

.city-chip--active .city-chip__text {
  color: var(--c-accent, $accent-orange);
  font-weight: 600;
}

/* ── Loading ── */
.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 32rpx;
}

.loading-spinner {
  width: 64rpx;
  height: 64rpx;
  border: 4rpx solid var(--c-surface-10, $glass-white-10);
  border-top-color: var(--c-accent, $accent-orange);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 24rpx;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 26rpx;
  color: var(--c-text-secondary, $text-secondary);
}

/* ── Results ── */
.results-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 32rpx;
}

.results-count {
  font-size: 24rpx;
  color: var(--c-text-secondary, $text-secondary);
}

.select-all {
  padding: 8rpx 16rpx;
}

.select-all__text {
  font-size: 24rpx;
  color: var(--c-accent, $accent-orange);
  font-weight: 500;
}

.results-scroll {
  flex: 1;
  max-height: 50vh;
}

.results-list {
  padding: 0 32rpx;
}

.result-item {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  padding: 24rpx 0;
  border-bottom: 1rpx solid var(--c-border-subtle, $hairline-subtle);
}

.result-item--selected {
  background: var(--c-accent-soft, $glow-orange-soft);
  margin: 0 -32rpx;
  padding: 24rpx 32rpx;
  border-radius: 16rpx;
  border-bottom: none;
  margin-bottom: 8rpx;
}

.result-item--duplicate {
  opacity: 0.5;
}

.result-item__check {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 4rpx;
}

.check-icon {
  font-size: 32rpx;
  color: var(--c-text-ghost, $text-ghost);
}

.check-icon--selected {
  color: var(--c-accent, $accent-orange);
  font-weight: 700;
}

.check-icon--duplicate {
  color: var(--c-text-muted, $text-muted);
}

.result-item__info {
  flex: 1;
  min-width: 0;
}

.result-item__name {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--c-text-primary, $text-primary);
  margin-bottom: 8rpx;
  display: block;
}

.result-item__address {
  font-size: 22rpx;
  color: var(--c-text-tertiary, $text-tertiary);
  margin-bottom: 12rpx;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-item__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.tag {
  font-size: 20rpx;
  color: var(--c-text-muted, $text-muted);
  background: var(--c-surface-3, $glass-white-3);
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.tag--rating {
  color: var(--c-gold, $accent-gold);
  background: var(--c-gold-soft, $glow-gold-soft);
}

.result-item__dup-hint {
  font-size: 20rpx;
  color: var(--c-text-muted, $text-muted);
  flex-shrink: 0;
  margin-top: 8rpx;
}

/* ── Empty State ── */
.empty-section,
.initial-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 32rpx;
}

.empty-icon,
.initial-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.empty-text,
.initial-text {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--c-text-primary, $text-primary);
  margin-bottom: 12rpx;
}

.empty-hint,
.initial-hint {
  font-size: 24rpx;
  color: var(--c-text-tertiary, $text-tertiary);
  margin-bottom: 24rpx;
}

.empty-action {
  background: var(--c-accent-glow, $glow-orange);
  border: 1rpx solid rgba(255, 107, 53, 0.2);
  border-radius: 999rpx;
  padding: 16rpx 32rpx;
}

.empty-action__text {
  font-size: 26rpx;
  color: var(--c-accent, $accent-orange);
  font-weight: 500;
}

/* ── Footer ── */
.panel__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid var(--c-border, $hairline);
}

.footer-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.footer-count {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--c-accent, $accent-orange);
}

.footer-dup {
  font-size: 22rpx;
  color: var(--c-text-muted, $text-muted);
}

.import-btn {
  background: linear-gradient(135deg, var(--c-accent, $accent-orange) 0%, var(--c-accent-light, $accent-orange-light) 100%);
  border-radius: 999rpx;
  padding: 20rpx 48rpx;
  box-shadow: $shadow-glow-orange;
}

.import-btn--disabled {
  opacity: 0.5;
  pointer-events: none;
}

.import-btn__text {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--c-text-on-accent, #FFFFFF);
}

/* ── Success Message ── */
.success-message {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  background: var(--c-bg, $void-black);
  animation: fadeInScale $dur-normal $ease-out-expo;
}

.success-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: var(--c-success-soft, rgba(52, 211, 153, 0.08));
  border: 2rpx solid var(--c-success, #34D399);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  color: var(--c-success, #34D399);
}

.success-text {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--c-success, #34D399);
}
</style>
