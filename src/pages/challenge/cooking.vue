<template>
  <view class="page">
    <!-- Custom navbar -->
    <view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <view class="navbar-left">
          <view class="timer-icon-wrap">
            <text class="timer-icon">⏱</text>
          </view>
          <text class="timer-text" :class="{ 'timer-text--danger': isTimeDanger, 'timer-text--pulse': isTimeDanger }">
            {{ timerDisplay }}
          </text>
        </view>
        <view class="navbar-right">
          <view class="end-btn" role="button" aria-label="结束挑战" @tap="onFinish">
            <text class="end-btn-text">结束挑战</text>
          </view>
        </view>
      </view>
      <view class="navbar-sub">
        <text class="navbar-shop">{{ shopName }}</text>
        <text class="navbar-tier" v-if="tierName"> · {{ tierName }}</text>
      </view>
    </view>

    <!-- Main content -->
    <view class="main" :style="{ paddingTop: navHeight + 'px' }">
      <CategoryTabs
        :categories="categories"
        v-model="activeCategory"
      />

      <scroll-view
        scroll-y
        class="dish-list"
        :scroll-anchoring="true"
        :enable-back-to-top="true"
        :fast-deceleration="true"
      >
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
          <text class="empty-dishes-icon">🍽️</text>
          <text class="empty-dishes-text">该分类暂无菜品</text>
          <text class="empty-dishes-hint">切换其他分类看看</text>
        </view>
      </scroll-view>
    </view>

    <!-- Bottom stats bar -->
    <view class="bottom-bar">
      <view class="stats">
        <text class="stats-text">已选 <text class="stats-num">{{ totalItems }}</text> 道菜</text>
        <text class="stats-divider">·</text>
        <text class="stats-text">覆盖 <text class="stats-num">{{ coveredCategories }}</text> 类</text>
        <text class="stats-divider" v-if="record.diners > 1">·</text>
        <text class="stats-text" v-if="record.diners > 1"><text class="stats-num">{{ record.diners }}</text> 人均分</text>
      </view>
      <view class="score-preview" v-if="totalItems > 0">
        <text class="score-label">预计</text>
        <text class="score-value">{{ previewScore }}</text>
        <text class="score-label">分/人</text>
      </view>
    </view>

    <!-- Finish confirm dialog -->
    <view v-if="showFinishConfirm" class="confirm-mask" @tap="showFinishConfirm = false">
      <view class="confirm-dialog" @tap.stop role="dialog" aria-modal="true">
        <view class="confirm-glow" />
        <view class="confirm-content">
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
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { shopStore } from '../../store/shop-store'
import { recordStore } from '../../store/record-store'
import { settingsStore } from '../../store/settings-store'
import { calculateScore } from '../../utils/score'
import CategoryTabs from '../../components/category-tabs.vue'
import DishItem from '../../components/dish-item.vue'

const statusBarHeight = ref(20)
const navHeight = ref(88)

const recordId = ref('')
const record = ref({ items: [], status: '进行中', diners: 1 })
const shop = ref(null)
const shopName = ref('')
const tierName = ref('')
const menu = ref([])
const menuMap = computed(() => {
  const map = {}
  menu.value.forEach(d => { map[d.id] = d })
  return map
})
const categories = ref([])
const activeCategory = ref('')
const quantities = ref({})
const showFinishConfirm = ref(false)

let timerInterval = null
const remainingSeconds = ref(0)
let lastVibrateMinute = -1
let lastVibrateTenSec = -1

const timerDisplay = computed(() => {
  const total = remainingSeconds.value
  if (total <= 0) return '00:00:00'
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
})

const isTimeDanger = computed(() => {
  const settings = settingsStore.get()
  const warningMinutes = settings.countdownWarningMinutes || 5
  return remainingSeconds.value > 0 && remainingSeconds.value < warningMinutes * 60
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
  const map = menuMap.value
  for (const [id, qty] of Object.entries(quantities.value)) {
    if (qty > 0 && map[id]) cats.add(map[id].category)
  }
  return cats.size
})

const previewScore = computed(() => {
  const items = []
  const map = menuMap.value
  for (const [id, qty] of Object.entries(quantities.value)) {
    if (qty > 0 && map[id]) {
      items.push({ category: map[id].category, quantity: qty })
    }
  }
  return calculateScore(items, record.value.diners || 1)
})

function getDishQuantity(dishId) {
  return quantities.value[dishId] || 0
}

function updateQuantity(dish, newQty) {
  if (record.value.status !== '进行中') return

  const oldQty = quantities.value[dish.id] || 0
  quantities.value = { ...quantities.value, [dish.id]: newQty }

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

  const items = []
  for (const [id, qty] of Object.entries(quantities.value)) {
    if (qty > 0) {
      const dish = menu.value.find(d => d.id === id)
      if (dish) {
        items.push({ category: dish.category, quantity: qty })
      }
    }
  }

  const score = calculateScore(items, record.value.diners || 1)
  recordStore.finish(recordId.value, score)

  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }

  uni.redirectTo({
    url: `/pages/challenge/result?recordId=${recordId.value}`
  })
}

function vibrate() {
  uni.vibrateShort({ type: 'heavy' })
}

function startTimer() {
  if (record.value.status !== '进行中') return

  const settings = settingsStore.get()
  const warningEnabled = settings.countdownWarning !== false
  const warningMinutes = settings.countdownWarningMinutes || 5
  const warningSeconds = warningMinutes * 60

  const startTime = new Date(record.value.startTime).getTime()
  const timeLimit = (shop.value?.mealTimeLimit || 90) * 60

  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000)
    remainingSeconds.value = Math.max(0, timeLimit - elapsed)

    const remaining = remainingSeconds.value

    if (remaining <= 0) {
      if (warningEnabled) uni.vibrateLong()
      finishChallenge()
      return
    }

    if (!warningEnabled) return

    const currentMinute = Math.floor(remaining / 60)
    const currentTenSec = Math.floor(remaining / 10)

    // 最后N分钟，每分钟振动
    if (remaining <= warningSeconds && currentMinute !== lastVibrateMinute) {
      lastVibrateMinute = currentMinute
      vibrate()
    }

    // 最后1分钟，每10秒振动
    if (remaining <= 60 && currentTenSec !== lastVibrateTenSec) {
      lastVibrateTenSec = currentTenSec
      vibrate()
    }
  }, 1000)

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

  const s = shopStore.getById(rec.shopId)
  if (!s) return

  shop.value = s
  menu.value = shopStore.getMenu(rec.shopId, rec.tierId || null)

  const catSet = new Set(menu.value.map(d => d.category))
  categories.value = Array.from(catSet)
  if (categories.value.length > 0) {
    activeCategory.value = categories.value[0]
  }

  const q = {}
  rec.items.forEach(item => {
    q[item.menuItemId] = item.quantity
  })
  quantities.value = q
}

onLoad((options) => {
  recordId.value = options.recordId || ''

  uni.getSystemInfo({
    success(sysInfo) {
      statusBarHeight.value = sysInfo.statusBarHeight || 20
      navHeight.value = statusBarHeight.value + 88
    }
  })

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

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--c-bg, $void-black);
  display: flex;
  flex-direction: column;
}

/* ── Custom Navbar ── */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: linear-gradient(180deg, var(--c-surface-0, $surface-0) 0%, var(--c-bg, $void-black) 100%);
  border-bottom: 1rpx solid var(--c-border-light, $glass-white-4);
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $intra-group $page-pad-x;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: $intra-group;
}

.timer-icon-wrap {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: var(--c-gold-glow, $glow-gold);
  border: 1rpx solid var(--c-gold-glow-strong, $glow-gold-strong);
  display: flex;
  align-items: center;
  justify-content: center;
}

.timer-icon {
  font-size: 28rpx;
}

.timer-text {
  font-size: 48rpx;
  font-weight: 800;
  color: var(--c-gold, $accent-gold);
  font-variant-numeric: tabular-nums;
  letter-spacing: $tracking-wide;
  text-shadow: 0 0 20rpx var(--c-gold-glow-strong, $glow-gold-strong);
  transition: color $dur-normal $ease-in-out-smooth;
}

.timer-text--danger {
  color: var(--c-danger, $accent-danger);
  text-shadow: 0 0 20rpx $shadow-glow-danger;
}

.timer-text--pulse {
  animation: pulse 1s $ease-spring infinite;
}

.navbar-right {
  display: flex;
  align-items: center;
}

.end-btn {
  background: linear-gradient(135deg, var(--c-danger, $accent-danger), $accent-danger-light);
  border-radius: $radius-pill;
  padding: 14rpx 32rpx;
  box-shadow: $shadow-glow-danger;
  transition: transform $dur-normal $ease-spring;
}

.end-btn:active {
  transform: scale(0.95);
}

.end-btn-text {
  font-size: 26rpx;
  color: var(--c-text-on-accent, #FFFFFF);
  font-weight: 600;
  letter-spacing: $tracking-wide;
}

.navbar-sub {
  padding: 0 $page-pad-x $intra-group;
  display: flex;
  align-items: center;
}

.navbar-shop {
  font-size: 26rpx;
  color: var(--c-text-tertiary, $text-tertiary);
  letter-spacing: $tracking-wide;
}

.navbar-tier {
  font-size: 26rpx;
  color: var(--c-accent, $accent-orange);
  letter-spacing: $tracking-wide;
}

/* ── Main Content ── */
.main {
  flex: 1;
  display: flex;
  min-height: 0;
}

.dish-list {
  flex: 1;
  height: calc(100vh - 300rpx);
  background: var(--c-bg, $void-black);
}

.empty-dishes {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 160rpx;
}

.empty-dishes-icon {
  font-size: 64rpx;
  margin-bottom: 24rpx;
}

.empty-dishes-text {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--c-text-primary, $text-primary);
  margin-bottom: 12rpx;
}

.empty-dishes-hint {
  font-size: 24rpx;
  color: var(--c-text-muted, $text-muted);
}

/* ── Bottom Stats Bar ── */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--c-overlay, $glass-black-60);
  border-top: 1rpx solid var(--c-border-light, $glass-white-4);
  padding: $intra-group $page-pad-x;
  padding-bottom: calc($intra-group + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
}

.stats {
  display: flex;
  align-items: center;
  gap: $intra-tight;
}

.stats-text {
  font-size: 26rpx;
  color: var(--c-text-tertiary, $text-tertiary);
  letter-spacing: $tracking-wide;
}

.stats-num {
  color: var(--c-accent, $accent-orange);
  font-weight: 700;
  letter-spacing: $tracking-wide;
}

.stats-divider {
  color: var(--c-text-ghost, $text-ghost);
  font-size: 26rpx;
}

.score-preview {
  display: flex;
  align-items: baseline;
  gap: $intra-tight;
}

.score-label {
  font-size: 24rpx;
  color: var(--c-text-tertiary, $text-tertiary);
  letter-spacing: $tracking-wide;
}

.score-value {
  font-size: 40rpx;
  font-weight: 800;
  color: var(--c-gold, $accent-gold);
  font-variant-numeric: tabular-nums;
  letter-spacing: $tracking-wide;
  text-shadow: 0 0 16rpx var(--c-gold-glow-strong, $glow-gold-strong);
}

/* ── Confirm Dialog ── */
.confirm-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--c-overlay, $glass-black-60);
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  display: flex;
  align-items: center;
  animation: fadeIn $dur-fast $ease-in-out-smooth;
  justify-content: center;
  z-index: 200;
  animation: fadeIn $dur-normal $ease-out-expo;
}

.confirm-dialog {
  width: 90vw;
  max-width: 620rpx;
  background: $surface-1;
  border-radius: $radius-2xl;
  overflow: hidden;
  border: 1rpx solid var(--c-hairline, $hairline);
  position: relative;
  animation: scaleIn $dur-normal $ease-out-expo;
}


.confirm-glow {
  position: absolute;
  top: -50rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 300rpx;
  height: 150rpx;
  border-radius: 50%;
  background: radial-gradient(ellipse, var(--c-gold-glow, $glow-gold) 0%, transparent 70%);
  pointer-events: none;
}

.confirm-content {
  padding: $section-gap 36rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.confirm-title {
  font-size: 40rpx;
  font-weight: 800;
  color: var(--c-gold, $accent-gold);
  letter-spacing: $tracking-wide;
  margin-bottom: $intra-group;
}

.confirm-desc {
  font-size: 28rpx;
  color: var(--c-text-primary, $text-primary);
  letter-spacing: $tracking-wide;
  margin-bottom: $intra-tight;
}

.confirm-score {
  font-size: 28rpx;
  color: var(--c-accent, $accent-orange);
  font-weight: 600;
  letter-spacing: $tracking-wide;
  margin-bottom: $section-gap;
}

.confirm-actions {
  display: flex;
  gap: $inter-group;
  width: 100%;
}

.confirm-btn {
  flex: 1;
  height: 88rpx;
  border-radius: $radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform $dur-normal $ease-spring;
}

.confirm-btn:active {
  transform: scale(0.96);
}

.confirm-btn--cancel {
  background: var(--c-surface-4, $glass-white-4);
  border: 1rpx solid var(--c-hairline, $hairline);
}

.confirm-btn--finish {
  background: linear-gradient(135deg, var(--c-accent, $accent-orange), var(--c-accent-light, $accent-orange-light));
  box-shadow: $shadow-glow-orange;
}

.confirm-btn-text {
  font-size: 30rpx;
  color: var(--c-text-secondary, $text-secondary);
  font-weight: 600;
  letter-spacing: $tracking-wide;
}

.confirm-btn-text--finish {
  color: var(--c-text-on-accent, #FFFFFF);
}
</style>
