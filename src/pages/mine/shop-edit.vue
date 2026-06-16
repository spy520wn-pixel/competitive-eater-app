<template>
  <view class="page" :data-theme="currentTheme">
    <!-- Photo Carousel -->
    <view v-if="form.photos.length > 0" class="carousel-shell">
      <swiper
        class="carousel-swiper"
        :indicator-dots="false"
        :autoplay="true"
        :interval="4000"
        :duration="500"
        :circular="true"
        @change="onPhotoChange"
      >
        <swiper-item v-for="(photo, idx) in form.photos" :key="idx">
          <image class="carousel-image" :src="photo" mode="aspectFill" />
        </swiper-item>
      </swiper>
      <view class="carousel-dots">
        <view
          v-for="(_, idx) in form.photos"
          :key="idx"
          class="carousel-dot"
          :class="{ 'carousel-dot--active': currentPhotoIndex === idx }"
        />
      </view>
    </view>

    <!-- Form Section — Double-Bezel -->
    <view class="form-shell">
      <view class="form-core">
        <view class="form-item">
          <text class="form-label">店铺名称</text>
          <view class="form-input-wrap">
            <input
              class="form-input"
              placeholder="请输入店铺名称"
              placeholder-class="form-placeholder"
              :value="form.name"
              @input="form.name = $event.detail.value"
              aria-label="店铺名称"
            />
          </view>
        </view>

        <view class="form-item">
          <text class="form-label">店铺分类</text>
          <picker :range="categories" :value="categoryIndex" @change="onCategoryChange">
            <view class="form-picker">
              <text class="form-picker__text">{{ form.category }}</text>
              <text class="form-picker__arrow">▾</text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="form-label">店铺地址</text>
          <view class="form-input-wrap">
            <input
              class="form-input"
              placeholder="请输入地址"
              placeholder-class="form-placeholder"
              :value="form.address"
              @input="form.address = $event.detail.value"
              aria-label="店铺地址"
            />
          </view>
        </view>

        <view class="form-item">
          <text class="form-label">所在城市</text>
          <picker :range="cities" :value="cityIndex" @change="onCityChange">
            <view class="form-picker">
              <text class="form-picker__text">{{ form.city || '请选择城市' }}</text>
              <text class="form-picker__arrow">▾</text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="form-label">就餐时限</text>
          <view class="time-input-row">
            <view class="form-input-wrap form-input-wrap--time">
              <input
                class="form-input"
                type="number"
                placeholder="90"
                placeholder-class="form-placeholder"
                :value="form._mealTimeLimitStr ?? String(form.mealTimeLimit)"
                @input="form._mealTimeLimitStr = $event.detail.value"
                @blur="onMealTimeBlur"
                aria-label="就餐时限（分钟）"
              />
            </view>
            <text class="time-unit">分钟</text>
          </view>
        </view>

        <view class="form-item">
          <text class="form-label">人均消费</text>
          <view class="form-input-row">
            <view class="form-input-wrap form-input-wrap--cost">
              <input
                class="form-input"
                placeholder="如 68"
                placeholder-class="form-placeholder"
                :value="form.cost"
                @input="form.cost = $event.detail.value"
                aria-label="人均消费"
              />
            </view>
            <text class="form-input-suffix">元/人</text>
          </view>
        </view>

        <view class="form-item">
          <text class="form-label">评分</text>
          <view class="form-input-row">
            <view class="form-input-wrap form-input-wrap--cost">
              <input
                class="form-input"
                placeholder="如 4.5"
                placeholder-class="form-placeholder"
                :value="form.rating"
                @input="form.rating = $event.detail.value"
                aria-label="评分"
              />
            </view>
            <text class="form-input-suffix">分</text>
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
    </view>

    <!-- Menu Management (No Tiers) — Double-Bezel -->
    <view v-if="!form.hasTiers" class="menu-shell">
      <view class="menu-core">
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
    </view>

    <!-- Tier Management (With Tiers) — Double-Bezel -->
    <view v-if="form.hasTiers" class="tier-shell">
      <view class="tier-core">
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
            <text class="menu-empty-icon">🍽️</text>
            <text class="menu-empty-text">暂无菜品</text>
            <text class="menu-empty-hint">点击上方按钮添加</text>
          </view>
        </view>

        <view v-if="form.tiers.length === 0" class="tier-empty">
          <text class="tier-empty-text">点击"添加档位"开始</text>
        </view>
      </view>
    </view>

    <!-- Save Button -->
    <view class="save-btn" @tap="onSave">
      <text class="save-btn__text">保存店铺</text>
    </view>

    <!-- Add Dish Popup -->
    <view v-if="showDishPopup" class="popup-mask" @tap="showDishPopup = false">
      <view class="popup" @tap.stop>
        <view class="popup-glow" />
        <view class="popup-inner">
          <text class="popup-title">{{ editingDish ? '编辑菜品' : '添加菜品' }}</text>
          <view class="popup-form">
            <view class="popup-form-item">
              <text class="popup-label">菜品名称</text>
              <view class="popup-input-wrap">
                <input
                  class="popup-input"
                  placeholder="请输入菜品名称"
                  placeholder-class="form-placeholder"
                  :value="dishForm.name"
                  @input="dishForm.name = $event.detail.value"
                  aria-label="菜品名称"
                />
              </view>
            </view>
            <view class="popup-form-item">
              <text class="popup-label">分类</text>
              <picker :range="dishCategories" :value="dishCategoryIndex" @change="onDishCategoryChange">
                <view class="form-picker">
                  <text class="form-picker__text">{{ dishForm.category }}</text>
                  <text class="form-picker__arrow">▾</text>
                </view>
              </picker>
            </view>
            <view class="popup-form-item">
              <text class="popup-label">单位</text>
              <view class="popup-input-wrap">
                <input
                  class="popup-input"
                  placeholder="如：盘、份、只"
                  placeholder-class="form-placeholder"
                  :value="dishForm.unit"
                  @input="dishForm.unit = $event.detail.value"
                  aria-label="菜品单位"
                />
              </view>
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
    </view>

    <!-- Add Tier Popup -->
    <view v-if="showTierPopup" class="popup-mask" @tap="showTierPopup = false">
      <view class="popup" @tap.stop>
        <view class="popup-glow" />
        <view class="popup-inner">
          <text class="popup-title">添加档位</text>
          <view class="popup-form">
            <view class="popup-form-item">
              <text class="popup-label">档位名称</text>
              <view class="popup-input-wrap">
                <input
                  class="popup-input"
                  placeholder="如：基础档、豪华档"
                  placeholder-class="form-placeholder"
                  :value="tierName"
                  @input="tierName = $event.detail.value"
                  aria-label="档位名称"
                />
              </view>
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
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { shopStore } from '@/store/shop-store.js'
import { createShop, createTier, createMenuItem } from '@/store/models.js'
import { recognizeMenu } from '@/utils/ai-service.js'
import { settingsStore, currentTheme } from '@/store/settings-store.js'
import { applyPageTheme, syncThemeFromStorage } from '@/utils/apply-page-theme.js'

const isEdit = ref(false)
const shopId = ref('')

const categories = ['自助餐', '火锅', '烧烤', '日料', '西餐', '中餐', '其他']
const cities = [
  '全国', '北京', '上海', '天津', '重庆', '广州', '深圳', '东莞', '佛山', '珠海',
  '杭州', '宁波', '温州', '嘉兴', '南京', '苏州', '无锡', '常州', '南通', '徐州',
  '济南', '青岛', '烟台', '潍坊', '成都', '绵阳', '武汉', '宜昌', '襄阳', '长沙',
  '岳阳', '郑州', '洛阳', '石家庄', '唐山', '福州', '厦门', '合肥', '芜湖', '沈阳',
  '大连', '南昌', '赣州', '西安', '咸阳', '南宁', '昆明', '贵阳', '太原', '哈尔滨',
  '长春', '兰州', '呼和浩特', '乌鲁木齐', '海口', '拉萨', '其他'
]
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
  menu: [],
  photos: [],
  cost: '',
  rating: '',
  _mealTimeLimitStr: undefined
})

const currentPhotoIndex = ref(0)

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
  form.photos = shop.photos || []
  form.cost = shop.cost || ''
  form.rating = shop.rating || ''
}


function onCategoryChange(e) {
  form.category = categories[e.detail.value]
}

function onCityChange(e) {
  form.city = cities[e.detail.value]
}

function onMealTimeBlur() {
  const val = Number(form._mealTimeLimitStr)
  form.mealTimeLimit = val > 0 ? val : 90
  form._mealTimeLimitStr = undefined
}

function onPhotoChange(e) {
  currentPhotoIndex.value = e.detail.current
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

async function onOcrImport(tierId = null) {
  try {
    // 显示选择来源的菜单
    let actionRes
    try {
      actionRes = await new Promise((resolve, reject) => {
        uni.showActionSheet({
          itemList: ['拍照', '从相册选择'],
          success: resolve,
          fail: reject
        })
      })
    } catch (e) {
      // 用户取消选择，直接返回
      return
    }

    // 确定图片来源
    const sourceType = actionRes.tapIndex === 0 ? ['camera'] : ['album']

    // 选择图片
    let res
    try {
      res = await new Promise((resolve, reject) => {
        uni.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: sourceType,
          success: resolve,
          fail: reject
        })
      })
    } catch (e) {
      // 用户取消选择图片，直接返回
      return
    }

    if (!res.tempFilePaths || res.tempFilePaths.length === 0) {
      return
    }

    const imagePath = res.tempFilePaths[0]

    // 显示加载提示
    uni.showLoading({ title: 'AI识别中...', mask: true })

    // 调用AI识别
    const result = await recognizeMenu(imagePath)

    // 隐藏加载
    uni.hideLoading()

    if (!result.success) {
      uni.showModal({
        title: '识别失败',
        content: result.error || '无法识别图片内容，请重试',
        showCancel: false
      })
      return
    }

    // 统计识别到的菜品数量
    const menuCount = result.menu.length
    const tierCount = result.tiers.length
    const totalTierItems = result.tiers.reduce((sum, t) => sum + t.menu.length, 0)

    if (menuCount === 0 && totalTierItems === 0) {
      uni.showModal({
        title: '未识别到菜品',
        content: '请确保图片清晰且包含菜单内容',
        showCancel: false
      })
      return
    }

    // 构建确认消息
    let confirmMsg = ''
    if (menuCount > 0) {
      confirmMsg += `识别到 ${menuCount} 道菜品`
    }
    if (tierCount > 0) {
      if (confirmMsg) confirmMsg += '，'
      confirmMsg += `${tierCount} 个档位共 ${totalTierItems} 道菜品`
    }
    confirmMsg += '\n\n是否导入？'

    // 确认导入
    uni.showModal({
      title: '识别成功',
      content: confirmMsg,
      confirmText: '导入',
      confirmColor: '#FF6B35',
      success(res) {
        if (res.confirm) {
          importOcrResult(result, tierId)
        }
      }
    })
  } catch (err) {
    // 如果是用户取消操作，不显示错误
    if (err && (err.errMsg?.includes('cancel') || err.errMsg?.includes('fail'))) {
      uni.hideLoading()
      return
    }

    uni.hideLoading()
    console.error('图片识别失败:', err)
    uni.showModal({
      title: '识别失败',
      content: err.message || '请检查AI配置后重试',
      showCancel: false
    })
  }
}

function importOcrResult(result, tierId = null) {
  let importedCount = 0

  if (tierId) {
    // 导入到指定档位
    form.tiers = form.tiers.map(tier => {
      if (tier.id === tierId) {
        // 合并基础菜单和档位菜单
        const allItems = [...result.menu, ...result.tiers.flatMap(t => t.menu)]
        const newItems = allItems.map(item =>
          createMenuItem({
            shopId: shopId.value || 'temp',
            tierId: tierId,
            name: item.name,
            category: item.category,
            unit: item.unit
          })
        )
        importedCount = newItems.length
        return { ...tier, menu: [...tier.menu, ...newItems] }
      }
      return tier
    })
  } else {
    // 导入到基础菜单
    const newItems = result.menu.map(item =>
      createMenuItem({
        shopId: shopId.value || 'temp',
        tierId: '',
        name: item.name,
        category: item.category,
        unit: item.unit
      })
    )
    form.menu = [...form.menu, ...newItems]
    importedCount += newItems.length

    // 如果有档位菜单，也创建对应档位
    if (result.tiers.length > 0 && form.hasTiers) {
      result.tiers.forEach(tierData => {
        const newTier = createTier({
          shopId: shopId.value || 'temp',
          name: tierData.name
        })
        newTier.menu = tierData.menu.map(item =>
          createMenuItem({
            shopId: shopId.value || 'temp',
            tierId: newTier.id,
            name: item.name,
            category: item.category,
            unit: item.unit
          })
        )
        form.tiers = [...form.tiers, newTier]
        importedCount += newTier.menu.length
      })
    } else if (result.tiers.length > 0 && !form.hasTiers) {
      // 如果没有开启档位，将档位菜品合并到基础菜单
      const tierItems = result.tiers.flatMap(t => t.menu)
      const newItems = tierItems.map(item =>
        createMenuItem({
          shopId: shopId.value || 'temp',
          tierId: '',
          name: item.name,
          category: item.category,
          unit: item.unit
        })
      )
      form.menu = [...form.menu, ...newItems]
      importedCount += newItems.length
    }
  }

  uni.showToast({ title: `成功导入 ${importedCount} 道菜品`, icon: 'success' })
}

function onSave() {
  if (!form.name.trim()) {
    uni.showToast({ title: '请输入店铺名称', icon: 'none' })
    return
  }

  const existingShop = isEdit.value ? shopStore.getById(shopId.value) : null
  const shopData = {
    name: form.name,
    category: form.category,
    address: form.address,
    city: form.city,
    mealTimeLimit: form.mealTimeLimit,
    location: form.location,
    cost: form.cost || existingShop?.cost || '',
    photos: existingShop?.photos || [],
    rating: form.rating || existingShop?.rating || ''
  }

  if (isEdit.value) {
    shopStore.replaceShopContent(shopId.value, form.tiers, form.menu)
    shopStore.update(shopId.value, shopData)
    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 800)
  } else {
    const newShop = shopStore.createWithContent(shopData, form.tiers, form.menu)
    uni.showToast({ title: '创建成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 800)
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--c-bg, $void-black);
  padding: $page-pad-y 24rpx 120rpx;
}

/* ── Photo Carousel ── */
.carousel-shell {
  margin-bottom: 24rpx;
  border-radius: $radius-xl;
  overflow: hidden;
  position: relative;
  animation: fadeInUp $dur-slow $ease-out-expo both;
}

.carousel-swiper {
  width: 100%;
  height: 320rpx;
}

.carousel-image {
  width: 100%;
  height: 100%;
  border-radius: $radius-xl;
}

.carousel-dots {
  position: absolute;
  bottom: 20rpx;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 12rpx;
}

.carousel-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.35);
  transition: width $dur-fast $ease-out-quint, background $dur-fast $ease-out-quint;
}

.carousel-dot--active {
  width: 28rpx;
  border-radius: 6rpx;
  background: var(--c-accent, $accent-orange);
}

/* ── Double-Bezel Mixin ── */
.form-shell,
.menu-shell,
.tier-shell {
  background: var(--c-surface-2, $glass-white-2);
  border: 1rpx solid var(--c-surface-4, $glass-white-4);
  border-radius: $radius-xl;
  padding: 6rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  animation: fadeInUp $dur-slow $ease-out-expo both;
}

.form-core,
.menu-core,
.tier-core {
  background: var(--c-surface-0, $surface-0);
  border-radius: $radius-md;
  padding: 8rpx 28rpx;
  border: 1rpx solid var(--c-surface-3, $glass-white-3);
  box-shadow: var(--c-shadow-inner, $shadow-inner);
  overflow: hidden;
}

/* ── Form ── */
.form-item {
  padding: 24rpx 0;
  border-bottom: 1rpx solid var(--c-surface-3, $glass-white-3);
  overflow: hidden;
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
  color: var(--c-text-secondary, $text-secondary);
  margin-bottom: 12rpx;
  display: block;
  letter-spacing: $tracking-normal;
}

.form-item--switch .form-label {
  margin-bottom: 0;
}

.form-input-wrap {
  width: 100%;
  background: var(--c-surface-3, $glass-white-3);
  border: 1rpx solid var(--c-surface-5, $glass-white-5);
  border-radius: $radius-sm;
  padding: 18rpx 24rpx;
  box-sizing: border-box;
  min-height: 80rpx;
  display: flex;
  align-items: center;
}

.form-input-wrap--time {
  width: 200rpx;
  flex-shrink: 0;
}

.form-input {
  width: 100%;
  height: 100%;
  font-size: 30rpx;
  color: var(--c-text-primary, $text-primary);
  background: transparent;
  border: none;
  padding: 0;
}

.form-placeholder {
  color: var(--c-text-muted, $text-muted);
}

.form-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--c-surface-3, $glass-white-3);
  border: 1rpx solid var(--c-surface-5, $glass-white-5);
  border-radius: $radius-sm;
  padding: 18rpx 24rpx;
  overflow: hidden;
}

.form-picker__text {
  font-size: 30rpx;
  color: var(--c-text-primary, $text-primary);
}

.form-picker__arrow {
  font-size: 22rpx;
  color: var(--c-text-muted, $text-muted);
}

.time-input-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.time-unit {
  font-size: 28rpx;
  color: var(--c-text-secondary, $text-secondary);
}

.form-input-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.form-input-wrap--cost {
  width: 200rpx;
  flex-shrink: 0;
}

.form-input-suffix {
  font-size: 28rpx;
  color: var(--c-text-secondary, $text-secondary);
}

.location-btn {
  display: flex;
  align-items: center;
  background: var(--c-surface-3, $glass-white-3);
  border: 1rpx solid var(--c-surface-5, $glass-white-5);
  border-radius: $radius-sm;
  padding: 18rpx 24rpx;
  overflow: hidden;
}

.location-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}

.location-text {
  font-size: 28rpx;
  color: var(--c-accent, $accent-orange);
}

/* ── Section Header ── */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--c-text-primary, $text-primary);
  letter-spacing: $tracking-wide;
}

.add-tier-btn {
  background: var(--c-accent-glow, $glow-orange);
  border: 1rpx solid rgba(255, 107, 53, 0.2);
  border-radius: $radius-pill;
  padding: 10rpx 24rpx;
}

.add-tier-text {
  font-size: 24rpx;
  color: var(--c-accent, $accent-orange);
  font-weight: 500;
}

/* ── Menu Actions ── */
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
  background: var(--c-surface-3, $glass-white-3);
  border: 1rpx solid var(--c-surface-5, $glass-white-5);
  border-radius: $radius-sm;
  padding: 20rpx 0;
  transition: background $dur-fast $ease-out-expo;
}

.menu-action-btn:active {
  background: var(--c-hairline, $hairline);
}

.menu-action-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.menu-action-text {
  font-size: 24rpx;
  color: var(--c-text-primary, $text-primary);
}

/* ── Menu Groups ── */
.menu-groups {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.menu-group {
  background: var(--c-surface-3, $glass-white-3);
  border-radius: $radius-md;
  padding: 20rpx;
}

.group-title {
  font-size: 26rpx;
  font-weight: 600;
  color: var(--c-accent, $accent-orange);
  margin-bottom: 12rpx;
  display: block;
}

.menu-item-row {
  display: flex;
  align-items: center;
  padding: 14rpx 0;
  border-bottom: 1rpx solid var(--c-surface-3, $glass-white-3);
}

.menu-item-row:last-child {
  border-bottom: none;
}

.menu-item-name {
  flex: 1;
  font-size: 28rpx;
  color: var(--c-text-primary, $text-primary);
}

.menu-item-unit {
  font-size: 24rpx;
  color: var(--c-text-tertiary, $text-tertiary);
  margin-right: 20rpx;
}

.menu-item-actions {
  display: flex;
  gap: 20rpx;
}

.menu-item-action {
  font-size: 24rpx;
  color: var(--c-accent, $accent-orange);
}

.menu-item-action--del {
  color: var(--c-danger, $accent-danger-light);
}

.menu-empty {
  padding: 40rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.menu-empty-icon {
  font-size: 48rpx;
  margin-bottom: 12rpx;
}

.menu-empty-text {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--c-text-primary, $text-primary);
  margin-bottom: 8rpx;
}

.menu-empty-hint {
  font-size: 22rpx;
  color: var(--c-text-muted, $text-muted);
}

/* ── Tier Block ── */
.tier-block {
  background: var(--c-surface-3, $glass-white-3);
  border-radius: $radius-md;
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
  color: var(--c-text-primary, $text-primary);
}

.tier-block__del {
  font-size: 24rpx;
  color: var(--c-danger, $accent-danger-light);
}

.tier-empty {
  padding: 40rpx 0;
  text-align: center;
}

.tier-empty-text {
  font-size: 26rpx;
  color: var(--c-text-muted, $text-muted);
}

/* ── Save Button ── */
.save-btn {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, var(--c-accent, $accent-orange) 0%, var(--c-accent-light, $accent-orange-light) 100%);
  padding: 28rpx;
  text-align: center;
  z-index: 10;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.3), var(--c-shadow-inner, $shadow-inner);
}

.save-btn__text {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--c-text-on-accent, #FFFFFF);
  letter-spacing: $tracking-wide;
}

/* ── Popup ── */
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--c-overlay, $glass-black-60);
  backdrop-filter: blur(12rpx);
  -webkit-backdrop-filter: blur(12rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  animation: fadeIn $dur-normal $ease-out-expo;
}

.popup {
  width: 90vw;
  max-width: 620rpx;
  background: var(--c-surface-1, $surface-1);
  border-radius: $radius-2xl;
  overflow: hidden;
  border: 1rpx solid var(--c-hairline, $hairline);
  position: relative;
  animation: scaleIn $dur-normal $ease-out-expo;
}

.popup-glow {
  position: absolute;
  top: -50rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 250rpx;
  height: 120rpx;
  border-radius: 50%;
  background: radial-gradient(ellipse, var(--c-accent-soft, $glow-orange-soft) 0%, transparent 70%);
  pointer-events: none;
}

.popup-inner {
  padding: 36rpx 32rpx;
  position: relative;
  z-index: 1;
}

.popup-title {
  font-size: 34rpx;
  font-weight: 700;
  color: var(--c-text-primary, $text-primary);
  margin-bottom: 28rpx;
  display: block;
  letter-spacing: $tracking-wide;
}

.popup-form {
  margin-bottom: 32rpx;
}

.popup-form-item {
  margin-bottom: 28rpx;
  overflow: hidden;
}

.popup-label {
  font-size: 28rpx;
  color: var(--c-text-secondary, $text-secondary);
  margin-bottom: 14rpx;
  display: block;
  letter-spacing: $tracking-normal;
}

.popup-input-wrap {
  width: 100%;
  background: var(--c-surface-5, $glass-white-5);
  border: 1rpx solid var(--c-surface-8, $glass-white-8);
  border-radius: $radius-md;
  padding: 28rpx;
  box-sizing: border-box;
  min-height: 96rpx;
  display: flex;
  align-items: center;
}

.popup-input {
  width: 100%;
  height: 100%;
  font-size: 32rpx;
  color: var(--c-text-primary, $text-primary);
  background: transparent;
  border: none;
  padding: 0;
}

.popup-actions {
  display: flex;
  gap: 16rpx;
}

.popup-btn {
  flex: 1;
  padding: 22rpx;
  border-radius: $radius-md;
  text-align: center;
  transition: transform $dur-normal $ease-spring;
}

.popup-btn:active {
  transform: scale(0.96);
}

.popup-btn--cancel {
  background: var(--c-surface-4, $glass-white-4);
  border: 1rpx solid var(--c-hairline, $hairline);
}

.popup-btn--confirm {
  background: linear-gradient(135deg, var(--c-accent, $accent-orange), var(--c-accent-light, $accent-orange-light));
  box-shadow: $shadow-glow-orange-strong;
}

.popup-btn-text {
  font-size: 28rpx;
  color: var(--c-text-on-accent, #FFFFFF);
  font-weight: 600;
  letter-spacing: $tracking-wide;
}

</style>
