<template>
  <view class="page">
    <!-- Header -->
    <view class="header">
      <view class="header__left" @tap="goBack">
        <text class="back-arrow">‹</text>
      </view>
      <text class="header__title">{{ isEdit ? '编辑店铺' : '新增店铺' }}</text>
      <view class="header__right"></view>
    </view>

    <!-- Form Section -->
    <view class="form-section">
      <view class="form-item">
        <text class="form-label">店铺名称</text>
        <input
          class="form-input"
          placeholder="请输入店铺名称"
          placeholder-class="form-placeholder"
          :value="form.name"
          @input="form.name = $event.detail.value"
        />
      </view>

      <view class="form-item">
        <text class="form-label">店铺分类</text>
        <picker :range="categories" :value="categoryIndex" @change="onCategoryChange">
          <view class="form-picker">
            <text class="form-picker__text">{{ form.category }}</text>
            <text class="form-picker__arrow">▼</text>
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">店铺地址</text>
        <input
          class="form-input"
          placeholder="请输入地址"
          placeholder-class="form-placeholder"
          :value="form.address"
          @input="form.address = $event.detail.value"
        />
      </view>

      <view class="form-item">
        <text class="form-label">所在城市</text>
        <picker :range="cities" :value="cityIndex" @change="onCityChange">
          <view class="form-picker">
            <text class="form-picker__text">{{ form.city || '请选择城市' }}</text>
            <text class="form-picker__arrow">▼</text>
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">就餐时限</text>
        <view class="time-input-row">
          <input
            class="form-input time-input"
            type="number"
            placeholder="90"
            placeholder-class="form-placeholder"
            :value="String(form.mealTimeLimit)"
            @input="form.mealTimeLimit = Number($event.detail.value) || 90"
          />
          <text class="time-unit">分钟</text>
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">位置定位</text>
        <view class="location-btn" @tap="getLocation">
          <text class="location-icon">📍</text>
          <text class="location-text">{{ form.location ? '已获取位置' : '获取当前位置' }}</text>
        </view>
      </view>

      <view class="form-item form-item--switch">
        <text class="form-label">是否分档位</text>
        <switch
          :checked="form.hasTiers"
          color="#FF6B35"
          @change="form.hasTiers = $event.detail.value"
        />
      </view>
    </view>

    <!-- Menu Management (No Tiers) -->
    <view v-if="!form.hasTiers" class="menu-section">
      <view class="section-header">
        <text class="section-title">菜单管理</text>
      </view>
      <view class="menu-actions">
        <view class="menu-action-btn" @tap="onOcrImport()">
          <text class="menu-action-icon">📷</text>
          <text class="menu-action-text">图片识别导入</text>
        </view>
        <view class="menu-action-btn" @tap="onAddDish()">
          <text class="menu-action-icon">➕</text>
          <text class="menu-action-text">手动添加</text>
        </view>
      </view>
      <view v-if="groupedMenu.length > 0" class="menu-groups">
        <view v-for="group in groupedMenu" :key="group.category" class="menu-group">
          <text class="group-title">{{ group.category }}（{{ group.items.length }}道）</text>
          <view v-for="item in group.items" :key="item.id" class="menu-item-row">
            <text class="menu-item-name">{{ item.name }}</text>
            <text class="menu-item-unit">{{ item.unit }}</text>
            <view class="menu-item-actions">
              <text class="menu-item-action" @tap="onEditDish(item)">编辑</text>
              <text class="menu-item-action menu-item-action--del" @tap="onDeleteDish(item)">删除</text>
            </view>
          </view>
        </view>
      </view>
      <view v-else class="menu-empty">
        <text class="menu-empty-text">暂无菜品，点击上方按钮添加</text>
      </view>
    </view>

    <!-- Tier Management (With Tiers) -->
    <view v-if="form.hasTiers" class="tier-section">
      <view class="section-header">
        <text class="section-title">档位管理</text>
        <view class="add-tier-btn" @tap="onAddTier">
          <text class="add-tier-text">+ 添加档位</text>
        </view>
      </view>

      <view v-for="tier in form.tiers" :key="tier.id" class="tier-block">
        <view class="tier-block__header">
          <text class="tier-block__name">{{ tier.name }}</text>
          <text class="tier-block__del" @tap="onDeleteTier(tier)">删除档位</text>
        </view>
        <view class="menu-actions">
          <view class="menu-action-btn" @tap="onOcrImport(tier.id)">
            <text class="menu-action-icon">📷</text>
            <text class="menu-action-text">图片识别</text>
          </view>
          <view class="menu-action-btn" @tap="onAddDish(tier.id)">
            <text class="menu-action-icon">➕</text>
            <text class="menu-action-text">手动添加</text>
          </view>
        </view>
        <view v-if="getTierMenu(tier).length > 0" class="menu-groups">
          <view v-for="group in getTierGroupedMenu(tier)" :key="group.category" class="menu-group">
            <text class="group-title">{{ group.category }}（{{ group.items.length }}道）</text>
            <view v-for="item in group.items" :key="item.id" class="menu-item-row">
              <text class="menu-item-name">{{ item.name }}</text>
              <text class="menu-item-unit">{{ item.unit }}</text>
              <view class="menu-item-actions">
                <text class="menu-item-action" @tap="onEditDish(item, tier.id)">编辑</text>
                <text class="menu-item-action menu-item-action--del" @tap="onDeleteDish(item, tier.id)">删除</text>
              </view>
            </view>
          </view>
        </view>
        <view v-else class="menu-empty">
          <text class="menu-empty-text">暂无菜品</text>
        </view>
      </view>

      <view v-if="form.tiers.length === 0" class="tier-empty">
        <text class="tier-empty-text">点击"添加档位"开始</text>
      </view>
    </view>

    <!-- Save Button -->
    <view class="save-btn" @tap="onSave">
      <text class="save-btn__text">保存店铺</text>
    </view>

    <!-- Add Dish Popup -->
    <view v-if="showDishPopup" class="popup-mask" @tap="showDishPopup = false">
      <view class="popup" @tap.stop>
        <text class="popup-title">{{ editingDish ? '编辑菜品' : '添加菜品' }}</text>
        <view class="popup-form">
          <view class="popup-form-item">
            <text class="popup-label">菜品名称</text>
            <input
              class="popup-input"
              placeholder="请输入菜品名称"
              placeholder-class="form-placeholder"
              :value="dishForm.name"
              @input="dishForm.name = $event.detail.value"
            />
          </view>
          <view class="popup-form-item">
            <text class="popup-label">分类</text>
            <picker :range="dishCategories" :value="dishCategoryIndex" @change="onDishCategoryChange">
              <view class="form-picker">
                <text class="form-picker__text">{{ dishForm.category }}</text>
                <text class="form-picker__arrow">▼</text>
              </view>
            </picker>
          </view>
          <view class="popup-form-item">
            <text class="popup-label">单位</text>
            <input
              class="popup-input"
              placeholder="如：盘、份、只"
              placeholder-class="form-placeholder"
              :value="dishForm.unit"
              @input="dishForm.unit = $event.detail.value"
            />
          </view>
        </view>
        <view class="popup-actions">
          <view class="popup-btn popup-btn--cancel" @tap="showDishPopup = false">
            <text class="popup-btn-text">取消</text>
          </view>
          <view class="popup-btn popup-btn--confirm" @tap="confirmDish">
            <text class="popup-btn-text">确定</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Add Tier Popup -->
    <view v-if="showTierPopup" class="popup-mask" @tap="showTierPopup = false">
      <view class="popup" @tap.stop>
        <text class="popup-title">添加档位</text>
        <view class="popup-form">
          <view class="popup-form-item">
            <text class="popup-label">档位名称</text>
            <input
              class="popup-input"
              placeholder="如：基础档、豪华档"
              placeholder-class="form-placeholder"
              :value="tierName"
              @input="tierName = $event.detail.value"
            />
          </view>
        </view>
        <view class="popup-actions">
          <view class="popup-btn popup-btn--cancel" @tap="showTierPopup = false">
            <text class="popup-btn-text">取消</text>
          </view>
          <view class="popup-btn popup-btn--confirm" @tap="confirmTier">
            <text class="popup-btn-text">确定</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { shopStore } from '@/store/shop-store.js'
import { createShop, createTier, createMenuItem } from '@/store/models.js'

const isEdit = ref(false)
const shopId = ref('')

const categories = ['自助餐', '火锅', '烧烤', '日料', '西餐', '中餐', '其他']
const cities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '重庆', '西安', '其他']
const dishCategories = ['肉类', '海鲜', '蔬菜', '主食', '饮品', '甜点', '其他']

const form = reactive({
  name: '',
  category: '自助餐',
  address: '',
  city: '',
  mealTimeLimit: 90,
  location: null,
  hasTiers: false,
  tiers: [],
  menu: []
})

const categoryIndex = computed(() => categories.indexOf(form.category))
const cityIndex = computed(() => cities.indexOf(form.city))

const showDishPopup = ref(false)
const showTierPopup = ref(false)
const editingDish = ref(null)
const editingDishTierId = ref(null)
const currentTierId = ref(null)
const tierName = ref('')

const dishForm = reactive({
  name: '',
  category: '肉类',
  unit: '盘'
})

const dishCategoryIndex = computed(() => dishCategories.indexOf(dishForm.category))

onLoad((options) => {
  if (options && options.id) {
    isEdit.value = true
    shopId.value = options.id
    loadShop(options.id)
  }
})

function loadShop(id) {
  const shop = shopStore.getById(id)
  if (!shop) return
  form.name = shop.name
  form.category = shop.category
  form.address = shop.address
  form.city = shop.city
  form.mealTimeLimit = shop.mealTimeLimit
  form.location = shop.location
  form.hasTiers = shop.hasTiers
  form.tiers = shop.tiers.map(t => ({ ...t, menu: [...t.menu] }))
  form.menu = [...shop.menu]
}

function goBack() {
  uni.navigateBack()
}

function onCategoryChange(e) {
  form.category = categories[e.detail.value]
}

function onCityChange(e) {
  form.city = cities[e.detail.value]
}

function onDishCategoryChange(e) {
  dishForm.category = dishCategories[e.detail.value]
}

function getLocation() {
  uni.getLocation({
    type: 'gcj02',
    success(res) {
      form.location = { latitude: res.latitude, longitude: res.longitude }
      uni.showToast({ title: '已获取位置', icon: 'success' })
    },
    fail() {
      uni.showToast({ title: '获取位置失败', icon: 'none' })
    }
  })
}

// Menu grouping
const groupedMenu = computed(() => {
  return groupMenuItems(form.menu)
})

function getTierMenu(tier) {
  return tier.menu || []
}

function getTierGroupedMenu(tier) {
  return groupMenuItems(tier.menu || [])
}

function groupMenuItems(items) {
  const groups = {}
  items.forEach(item => {
    if (!groups[item.category]) groups[item.category] = []
    groups[item.category].push(item)
  })
  return Object.keys(groups).map(cat => ({
    category: cat,
    items: groups[cat]
  }))
}

// Dish CRUD
function onAddDish(tierId = null) {
  editingDish.value = null
  editingDishTierId.value = tierId
  currentTierId.value = tierId
  dishForm.name = ''
  dishForm.category = '肉类'
  dishForm.unit = '盘'
  showDishPopup.value = true
}

function onEditDish(item, tierId = null) {
  editingDish.value = item
  editingDishTierId.value = tierId
  currentTierId.value = tierId
  dishForm.name = item.name
  dishForm.category = item.category
  dishForm.unit = item.unit
  showDishPopup.value = true
}

function confirmDish() {
  if (!dishForm.name.trim()) {
    uni.showToast({ title: '请输入菜品名称', icon: 'none' })
    return
  }

  if (editingDish.value) {
    // Edit existing
    const updates = { name: dishForm.name, category: dishForm.category, unit: dishForm.unit }
    if (currentTierId.value) {
      form.tiers = form.tiers.map(t => {
        if (t.id === currentTierId.value) {
          return { ...t, menu: t.menu.map(m => m.id === editingDish.value.id ? { ...m, ...updates } : m) }
        }
        return t
      })
    } else {
      form.menu = form.menu.map(m => m.id === editingDish.value.id ? { ...m, ...updates } : m)
    }
  } else {
    // Add new
    const newItem = createMenuItem({
      shopId: shopId.value || 'temp',
      tierId: currentTierId.value || '',
      name: dishForm.name,
      category: dishForm.category,
      unit: dishForm.unit
    })
    if (currentTierId.value) {
      form.tiers = form.tiers.map(t => {
        if (t.id === currentTierId.value) {
          return { ...t, menu: [...t.menu, newItem] }
        }
        return t
      })
    } else {
      form.menu = [...form.menu, newItem]
    }
  }

  showDishPopup.value = false
}

function onDeleteDish(item, tierId = null) {
  uni.showModal({
    title: '确认删除',
    content: `确定删除「${item.name}」？`,
    confirmColor: '#FF6B35',
    success(res) {
      if (res.confirm) {
        if (tierId) {
          form.tiers = form.tiers.map(t => {
            if (t.id === tierId) {
              return { ...t, menu: t.menu.filter(m => m.id !== item.id) }
            }
            return t
          })
        } else {
          form.menu = form.menu.filter(m => m.id !== item.id)
        }
      }
    }
  })
}

// Tier CRUD
function onAddTier() {
  tierName.value = ''
  showTierPopup.value = true
}

function confirmTier() {
  if (!tierName.value.trim()) {
    uni.showToast({ title: '请输入档位名称', icon: 'none' })
    return
  }
  const newTier = createTier({ shopId: shopId.value || 'temp', name: tierName.value })
  form.tiers = [...form.tiers, newTier]
  showTierPopup.value = false
}

function onDeleteTier(tier) {
  uni.showModal({
    title: '确认删除',
    content: `确定删除档位「${tier.name}」及其所有菜品？`,
    confirmColor: '#FF6B35',
    success(res) {
      if (res.confirm) {
        form.tiers = form.tiers.filter(t => t.id !== tier.id)
      }
    }
  })
}

// OCR Import stub
function onOcrImport(tierId = null) {
  uni.showToast({ title: '图片识别功能开发中', icon: 'none' })
}

// Save
function onSave() {
  if (!form.name.trim()) {
    uni.showToast({ title: '请输入店铺名称', icon: 'none' })
    return
  }

  const shopData = {
    name: form.name,
    category: form.category,
    address: form.address,
    city: form.city,
    mealTimeLimit: form.mealTimeLimit,
    location: form.location
  }

  if (isEdit.value) {
    shopStore.update(shopId.value, {
      ...shopData,
      hasTiers: form.hasTiers,
      tiers: form.tiers,
      menu: form.menu
    })

    // Sync tiers and menu via store methods for persistence
    const existing = shopStore.getById(shopId.value)
    if (existing) {
      // Clear and re-add tiers
      existing.tiers.forEach(t => shopStore.removeTier(shopId.value, t.id))
      form.tiers.forEach(tier => {
        shopStore.addTier(shopId.value, tier.name)
        const addedTier = shopStore.getById(shopId.value).tiers.slice(-1)[0]
        if (addedTier) {
          tier.menu.forEach(item => {
            shopStore.addMenuItem(shopId.value, { name: item.name, category: item.category, unit: item.unit }, addedTier.id)
          })
        }
      })

      // Clear and re-add menu
      existing.menu.forEach(m => shopStore.removeMenuItem(shopId.value, m.id))
      form.menu.forEach(item => {
        shopStore.addMenuItem(shopId.value, { name: item.name, category: item.category, unit: item.unit })
      })
    }

    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 800)
  } else {
    const newShop = shopStore.create(shopData)

    // Add tiers
    if (form.hasTiers) {
      form.tiers.forEach(tier => {
        shopStore.addTier(newShop.id, tier.name)
        const addedTier = shopStore.getById(newShop.id).tiers.slice(-1)[0]
        if (addedTier) {
          tier.menu.forEach(item => {
            shopStore.addMenuItem(newShop.id, { name: item.name, category: item.category, unit: item.unit }, addedTier.id)
          })
        }
      })
    }

    // Add menu items
    form.menu.forEach(item => {
      shopStore.addMenuItem(newShop.id, { name: item.name, category: item.category, unit: item.unit })
    })

    uni.showToast({ title: '创建成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 800)
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #0F0F1A;
  padding: 0 24rpx 120rpx;
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
}

/* Form Section */
.form-section {
  background: #1A1A2E;
  border-radius: 16rpx;
  padding: 8rpx 28rpx;
  margin-bottom: 24rpx;
}

.form-item {
  padding: 24rpx 0;
  border-bottom: 1rpx solid #2D2D44;
}

.form-item:last-child {
  border-bottom: none;
}

.form-item--switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-label {
  font-size: 26rpx;
  color: #8888AA;
  margin-bottom: 12rpx;
  display: block;
}

.form-item--switch .form-label {
  margin-bottom: 0;
}

.form-input {
  width: 100%;
  font-size: 30rpx;
  color: #FFFFFF;
  background: #2D2D44;
  border-radius: 12rpx;
  padding: 18rpx 20rpx;
}

.form-placeholder {
  color: #555577;
}

.form-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #2D2D44;
  border-radius: 12rpx;
  padding: 18rpx 20rpx;
}

.form-picker__text {
  font-size: 30rpx;
  color: #FFFFFF;
}

.form-picker__arrow {
  font-size: 22rpx;
  color: #555577;
}

.time-input-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.time-input {
  width: 200rpx;
}

.time-unit {
  font-size: 28rpx;
  color: #8888AA;
}

.location-btn {
  display: flex;
  align-items: center;
  background: #2D2D44;
  border-radius: 12rpx;
  padding: 18rpx 20rpx;
}

.location-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}

.location-text {
  font-size: 28rpx;
  color: #FF6B35;
}

/* Menu Section */
.menu-section, .tier-section {
  background: #1A1A2E;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.add-tier-btn {
  background: rgba(255, 107, 53, 0.15);
  border-radius: 12rpx;
  padding: 10rpx 20rpx;
}

.add-tier-text {
  font-size: 24rpx;
  color: #FF6B35;
  font-weight: 500;
}

.menu-actions {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.menu-action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2D2D44;
  border-radius: 12rpx;
  padding: 18rpx 0;
}

.menu-action-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.menu-action-text {
  font-size: 24rpx;
  color: #FFFFFF;
}

.menu-groups {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.menu-group {
  background: #2D2D44;
  border-radius: 12rpx;
  padding: 20rpx;
}

.group-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #FF6B35;
  margin-bottom: 12rpx;
  display: block;
}

.menu-item-row {
  display: flex;
  align-items: center;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #3D3D54;
}

.menu-item-row:last-child {
  border-bottom: none;
}

.menu-item-name {
  flex: 1;
  font-size: 28rpx;
  color: #FFFFFF;
}

.menu-item-unit {
  font-size: 24rpx;
  color: #8888AA;
  margin-right: 20rpx;
}

.menu-item-actions {
  display: flex;
  gap: 16rpx;
}

.menu-item-action {
  font-size: 24rpx;
  color: #FF6B35;
}

.menu-item-action--del {
  color: #FF4444;
}

.menu-empty {
  padding: 40rpx 0;
  text-align: center;
}

.menu-empty-text {
  font-size: 26rpx;
  color: #555577;
}

/* Tier Block */
.tier-block {
  background: #2D2D44;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.tier-block__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.tier-block__name {
  font-size: 28rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.tier-block__del {
  font-size: 24rpx;
  color: #FF4444;
}

.tier-empty {
  padding: 40rpx 0;
  text-align: center;
}

.tier-empty-text {
  font-size: 26rpx;
  color: #555577;
}

/* Save Button */
.save-btn {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8F60 100%);
  padding: 28rpx;
  text-align: center;
  z-index: 10;
}

.save-btn__text {
  font-size: 32rpx;
  font-weight: 700;
  color: #FFFFFF;
}

/* Popup */
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.popup {
  width: 620rpx;
  background: #1A1A2E;
  border-radius: 24rpx;
  padding: 32rpx;
}

.popup-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 24rpx;
  display: block;
}

.popup-form {
  margin-bottom: 28rpx;
}

.popup-form-item {
  margin-bottom: 20rpx;
}

.popup-label {
  font-size: 26rpx;
  color: #8888AA;
  margin-bottom: 10rpx;
  display: block;
}

.popup-input {
  width: 100%;
  font-size: 28rpx;
  color: #FFFFFF;
  background: #2D2D44;
  border-radius: 12rpx;
  padding: 18rpx 20rpx;
}

.popup-actions {
  display: flex;
  gap: 16rpx;
}

.popup-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 16rpx;
  text-align: center;
}

.popup-btn--cancel {
  background: #2D2D44;
}

.popup-btn--confirm {
  background: #FF6B35;
}

.popup-btn-text {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 600;
}
</style>
