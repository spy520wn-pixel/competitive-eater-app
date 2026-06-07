<template>
  <view class="page">
    <!-- 自定义导航栏 -->
    <view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <view class="navbar-left">
          <text class="timer-icon">⏱</text>
          <text class="timer-text" :class="{ 'timer-text--danger': isTimeDanger, 'timer-text--pulse': isTimeDanger }">
            {{ timerDisplay }}
          </text>
        </view>
        <view class="navbar-right">
          <view class="end-btn" @tap="onFinish">
            <text class="end-btn-text">结束挑战</text>
          </view>
        </view>
      </view>
      <view class="navbar-sub">
        <text class="navbar-shop">{{ shopName }}</text>
        <text class="navbar-tier" v-if="tierName"> · {{ tierName }}</text>
      </view>
    </view>

    <!-- 主内容区 -->
    <view class="main" :style="{ paddingTop: navHeight + 'px' }">
      <!-- 左侧分类 Tab -->
      <CategoryTabs
        :categories="categories"
        v-model="activeCategory"
      />

      <!-- 右侧菜品列表 -->
      <scroll-view scroll-y class="dish-list">
        <view v-if="currentDishes.length > 0">
          <DishItem
            v-for="dish in currentDishes"
            :key="dish.id"
            :item="dish"
            :quantity="getDishQuantity(dish.id)"
            :disabled="record.status !== '进行中'"
            @update:quantity="(val) => updateQuantity(dish, val)"
          />
        </view>
        <view v-else class="empty-dishes">
          <text class="empty-dishes-text">该分类暂无菜品</text>
        </view>
      </scroll-view>
    </view>

    <!-- 底部统计栏 -->
    <view class="bottom-bar">
      <view class="stats">
        <text class="stats-text">已选 <text class="stats-num">{{ totalItems }}</text> 道菜</text>
        <text class="stats-divider">·</text>
        <text class="stats-text">覆盖 <text class="stats-num">{{ coveredCategories }}</text> 类</text>
      </view>
      <view class="score-preview" v-if="totalItems > 0">
        <text class="score-label">预计</text>
        <text class="score-value">{{ previewScore }}</text>
        <text class="score-label">分</text>
      </view>
    </view>

    <!-- 结束确认弹窗 -->
    <view v-if="showFinishConfirm" class="confirm-mask" @tap="showFinishConfirm = false">
      <view class="confirm-dialog" @tap.stop>
        <text class="confirm-title">确定结束？</text>
        <text class="confirm-desc">已点 {{ totalItems }} 道菜，覆盖 {{ coveredCategories }} 个分类</text>
        <text class="confirm-score">预计得分：{{ previewScore }}</text>
        <view class="confirm-actions">
          <view class="confirm-btn confirm-btn--cancel" @tap="showFinishConfirm = false">
            <text class="confirm-btn-text">继续吃！</text>
          </view>
          <view class="confirm-btn confirm-btn--finish" @tap="confirmFinish">
            <text class="confirm-btn-text confirm-btn-text--finish">结算</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { shopStore } from '../../store/shop-store'
import { recordStore } from '../../store/record-store'
import { calculateScore } from '../../utils/score'
import CategoryTabs from '../../components/category-tabs.vue'
import DishItem from '../../components/dish-item.vue'

const statusBarHeight = ref(20)
const navHeight = ref(88)

const recordId = ref('')
const record = ref({ items: [], status: '进行中' })
const shop = ref(null)
const shopName = ref('')
const tierName = ref('')
const menu = ref([])
const categories = ref([])
const activeCategory = ref('')
const quantities = ref({})
const showFinishConfirm = ref(false)

let timerInterval = null
const remainingSeconds = ref(0)

// 计算属性
const timerDisplay = computed(() => {
  const total = remainingSeconds.value
  if (total <= 0) return '00:00:00'
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
})

const isTimeDanger = computed(() => {
  return remainingSeconds.value > 0 && remainingSeconds.value < 300
})

const currentDishes = computed(() => {
  if (!activeCategory.value) return []
  return menu.value.filter(d => d.category === activeCategory.value)
})

const totalItems = computed(() => {
  return Object.values(quantities.value).reduce((sum, q) => sum + q, 0)
})

const coveredCategories = computed(() => {
  const cats = new Set()
  for (const [id, qty] of Object.entries(quantities.value)) {
    if (qty > 0) {
      const dish = menu.value.find(d => d.id === id)
      if (dish) cats.add(dish.category)
    }
  }
  return cats.size
})

const previewScore = computed(() => {
  const items = []
  for (const [id, qty] of Object.entries(quantities.value)) {
    if (qty > 0) {
      const dish = menu.value.find(d => d.id === id)
      if (dish) {
        items.push({ category: dish.category, quantity: qty })
      }
    }
  }
  return calculateScore(items)
})

// 方法
function getDishQuantity(dishId) {
  return quantities.value[dishId] || 0
}

function updateQuantity(dish, newQty) {
  if (record.value.status !== '进行中') return

  const oldQty = quantities.value[dish.id] || 0
  quantities.value = { ...quantities.value, [dish.id]: newQty }

  // 同步到 record store
  if (oldQty === 0 && newQty > 0) {
    recordStore.addItem(recordId.value, {
      menuItemId: dish.id,
      name: dish.name,
      category: dish.category,
      quantity: newQty,
      unit: dish.unit
    })
  } else {
    recordStore.updateItemQuantity(recordId.value, dish.id, newQty)
  }
}

function onFinish() {
  showFinishConfirm.value = true
}

function confirmFinish() {
  showFinishConfirm.value = false
  finishChallenge()
}

function finishChallenge() {
  if (record.value.status !== '进行中') return

  // 构建 items 用于计分
  const items = []
  for (const [id, qty] of Object.entries(quantities.value)) {
    if (qty > 0) {
      const dish = menu.value.find(d => d.id === id)
      if (dish) {
        items.push({ category: dish.category, quantity: qty })
      }
    }
  }

  const score = calculateScore(items)
  recordStore.finish(recordId.value, score)

  // 停止计时器
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }

  uni.redirectTo({
    url: `/pages/challenge/result?recordId=${recordId.value}`
  })
}

function startTimer() {
  if (record.value.status !== '进行中') return

  const startTime = new Date(record.value.startTime).getTime()
  const timeLimit = (shop.value?.mealTimeLimit || 90) * 60 // 秒

  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000)
    remainingSeconds.value = Math.max(0, timeLimit - elapsed)

    if (remainingSeconds.value <= 0) {
      // 时间到，自动结束
      finishChallenge()
    }
  }, 1000)

  // 立即执行一次
  const elapsed = Math.floor((Date.now() - startTime) / 1000)
  remainingSeconds.value = Math.max(0, timeLimit - elapsed)
}

function loadRecord() {
  const rec = recordStore.getById(recordId.value)
  if (!rec) {
    uni.showToast({ title: '记录不存在', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
    return
  }

  record.value = rec
  shopName.value = rec.shopName
  tierName.value = rec.tierName

  // 加载店铺和菜单
  const s = shopStore.getById(rec.shopId)
  if (!s) return

  shop.value = s
  menu.value = shopStore.getMenu(rec.shopId, rec.tierId || null)

  // 提取分类
  const catSet = new Set(menu.value.map(d => d.category))
  categories.value = Array.from(catSet)
  if (categories.value.length > 0) {
    activeCategory.value = categories.value[0]
  }

  // 从已有记录恢复 quantities
  const q = {}
  rec.items.forEach(item => {
    q[item.menuItemId] = item.quantity
  })
  quantities.value = q
}

// 生命周期
onLoad((options) => {
  recordId.value = options.recordId || ''

  // 获取状态栏高度
  const sysInfo = uni.getSystemInfoSync()
  statusBarHeight.value = sysInfo.statusBarHeight || 20
  navHeight.value = statusBarHeight.value + 88

  loadRecord()
  startTimer()
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #0F0F1A;
  display: flex;
  flex-direction: column;
}

/* 自定义导航栏 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: linear-gradient(180deg, #1A1A2E 0%, #0F0F1A 100%);
  border-bottom: 1rpx solid #2D2D44;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 24rpx;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.timer-icon {
  font-size: 36rpx;
}

.timer-text {
  font-size: 44rpx;
  font-weight: 800;
  color: #FFD700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 2rpx;
}

.timer-text--danger {
  color: #FF3B30;
}

.timer-text--pulse {
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.navbar-right {
  display: flex;
  align-items: center;
}

.end-btn {
  background: #FF3B30;
  border-radius: 20rpx;
  padding: 12rpx 28rpx;
}

.end-btn-text {
  font-size: 26rpx;
  color: #FFFFFF;
  font-weight: 600;
}

.navbar-sub {
  padding: 0 24rpx 16rpx;
  display: flex;
  align-items: center;
}

.navbar-shop {
  font-size: 26rpx;
  color: #8888AA;
}

.navbar-tier {
  font-size: 26rpx;
  color: #FF6B35;
}

/* 主内容区 */
.main {
  flex: 1;
  display: flex;
  min-height: 0;
}

/* 菜品列表 */
.dish-list {
  flex: 1;
  height: calc(100vh - 300rpx);
  background: #0F0F1A;
}

.empty-dishes {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.empty-dishes-text {
  font-size: 28rpx;
  color: #666680;
}

/* 底部统计栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #1A1A2E;
  border-top: 1rpx solid #2D2D44;
  padding: 20rpx 24rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;
}

.stats {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.stats-text {
  font-size: 26rpx;
  color: #8888AA;
}

.stats-num {
  color: #FF6B35;
  font-weight: 700;
}

.stats-divider {
  color: #2D2D44;
  font-size: 26rpx;
}

.score-preview {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}

.score-label {
  font-size: 24rpx;
  color: #8888AA;
}

.score-value {
  font-size: 36rpx;
  font-weight: 800;
  color: #FFD700;
}

/* 确认弹窗 */
.confirm-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
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

.confirm-desc {
  font-size: 28rpx;
  color: #FFFFFF;
  margin-bottom: 8rpx;
}

.confirm-score {
  font-size: 26rpx;
  color: #FF6B35;
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

.confirm-btn--finish {
  background: #FF3B30;
}

.confirm-btn-text {
  font-size: 30rpx;
  color: #8888AA;
  font-weight: 600;
}

.confirm-btn-text--finish {
  color: #FFFFFF;
}
</style>
