<template>
  <view class="page" :data-theme="currentTheme">
    <!-- Ambient glow -->
    <view class="ambient-orb ambient-orb--gold" />
    <view class="ambient-orb ambient-orb--orange" />

    <!-- Header result -->
    <view class="result-header">
      <text class="result-emoji">🎉</text>
      <text class="result-title">挑战完成！</text>
      <text class="result-subtitle">
        {{ record.shopName }}
        <text v-if="record.tierName"> · {{ record.tierName }}</text>
        · {{ formatDate(record.createdAt) }}
      </text>

      <!-- Score card — Double-Bezel -->
      <view class="score-shell">
        <view class="score-core">
          <view class="score-glow" />
          <text class="score-label">战斗力</text>
          <view class="score-row">
            <text class="score-star">⭐</text>
            <text class="score-value">{{ displayScore }}</text>
            <text class="score-star">⭐</text>
          </view>
          <text class="score-duration">
            时长 {{ record.duration }}分钟 · 本次 +{{ expGained }} 经验
            <text v-if="record.diners > 1"> · {{ record.diners }}人平分</text>
          </text>
          <view class="level-badge">
            <text class="level-icon">{{ levelInfo.icon }}</text>
            <text class="level-name">{{ levelInfo.name }}{{ levelInfo.levelText ? ' ' + levelInfo.levelText : '' }}</text>
            <text class="level-exp">累计 {{ totalExp }} 经验</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Category stats (collapsible) -->
    <view class="section">
      <view class="section-header section-header--collapsible" @tap="showStats = !showStats">
        <view class="header-left">
          <view class="eyebrow">
            <text class="eyebrow-text">统计</text>
          </view>
          <text class="section-title">分类食量统计</text>
        </view>
        <text class="collapse-icon">{{ showStats ? '▾' : '▸' }}</text>
      </view>
      <view v-show="showStats" class="stats-shell">
        <view class="stats-core">
          <view class="stats-grid">
            <view v-for="cat in categoryStats" :key="cat.name" class="stat-col">
              <view class="stat-bar-bg">
                <view class="stat-bar" :style="{ transform: 'scaleY(' + cat.percent / 100 + ')' }" />
                <view class="stat-bar-glow" :style="{ transform: 'scaleY(' + cat.percent / 100 + ')' }" />
              </view>
              <text class="stat-label">{{ cat.name }}</text>
              <text class="stat-val">{{ cat.total }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Order details (collapsible) -->
    <view class="section">
      <view class="section-header section-header--collapsible" @tap="showDetails = !showDetails">
        <view class="header-left">
          <view class="eyebrow">
            <text class="eyebrow-text">明细</text>
          </view>
          <text class="section-title">点餐明细</text>
        </view>
        <text class="collapse-icon">{{ showDetails ? '▾' : '▸' }}</text>
      </view>
      <view v-show="showDetails">
        <view v-for="group in groupedItems" :key="group.category" class="group-shell">
          <view class="group-core">
            <text class="group-title">{{ group.category }}</text>
            <view v-for="item in group.items" :key="item.menuItemId" class="detail-item">
              <text class="detail-name">{{ item.name }}</text>
              <text class="detail-qty">{{ item.quantity }}{{ item.unit }}</text>
            </view>
          </view>
        </view>
        <view v-if="record.items.length === 0" class="empty-items">
          <text class="empty-items-icon">📝</text>
          <text class="empty-items-text">本次挑战未记录菜品</text>
          <text class="empty-items-hint">下次挑战时记得记录哦</text>
        </view>
      </view>
    </view>

    <!-- Action buttons -->
    <view class="actions">
      <view class="action-btn action-btn--share" role="button" aria-label="分享战绩" @tap="onShare">
        <text class="action-btn-text">📤 分享战绩</text>
      </view>
      <view class="action-btn action-btn--receipt" role="button" aria-label="生成小票" @tap="onGenerateReceipt">
        <text class="action-btn-text">🧾 生成小票</text>
      </view>
      <view class="action-btn action-btn--home" role="button" aria-label="返回首页" @tap="goHome">
        <text class="action-btn-text action-btn-text--home">返回首页</text>
      </view>
    </view>

    <!-- Hidden canvas for receipt rendering -->
    <canvas canvas-id="receiptCanvas" id="receiptCanvas"
      :style="{ position: 'fixed', left: '-9999px', width: canvasWidth + 'px', height: canvasHeight + 'px' }" />

    <!-- Level Up Celebration -->
    <view v-if="showLevelUp" class="levelup-mask" @tap="showLevelUp = false">
      <view class="levelup-dialog" @tap.stop>
        <view class="levelup-confetti">
          <text class="confetti-item">🎉</text>
          <text class="confetti-item">⭐</text>
          <text class="confetti-item">🏆</text>
          <text class="confetti-item">🎊</text>
          <text class="confetti-item">✨</text>
          <text class="confetti-item">🥇</text>
          <text class="confetti-item">🔥</text>
          <text class="confetti-item">💪</text>
        </view>
        <view class="levelup-content">
          <text class="levelup-title">恭喜升级！</text>
          <view class="levelup-badge">
            <text class="levelup-icon">{{ levelInfo.icon }}</text>
            <text class="levelup-name">{{ levelInfo.name }}</text>
          </view>
          <text class="levelup-desc">继续挑战，解锁更多成就！</text>
        </view>
        <view class="levelup-action" @tap="showLevelUp = false">
          <text class="levelup-action-text">太棒了！</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { recordStore } from '../../store/record-store'
import { getLevel, scoreToExp } from '../../utils/level'
import { saveReceiptToAlbum, calcReceiptHeight } from '../../utils/receipt-renderer'
import { settingsStore, currentTheme } from '@/store/settings-store.js'
import { applyPageTheme, syncThemeFromStorage } from '@/utils/apply-page-theme.js'

const recordId = ref('')
const canvasWidth = ref(375)
const canvasHeight = ref(800)
const showStats = ref(false)
const showDetails = ref(false)
const showLevelUp = ref(false)
const previousLevel = ref(null)
const displayScore = ref(0)
const record = ref({
  shopName: '',
  tierName: '',
  score: 0,
  duration: 0,
  items: [],
  createdAt: '',
  diners: 1
})

// 本次挑战获得的经验
const expGained = computed(() => scoreToExp(record.value.score))

// 累计总经验（包括本次挑战）
const totalExp = computed(() => {
  const stats = recordStore.getStats()
  return stats.totalExp
})

// 根据累计总经验计算等级
const levelInfo = computed(() => getLevel(totalExp.value))

const categoryStats = computed(() => {
  const totals = {}
  record.value.items.forEach(item => {
    if (!totals[item.category]) totals[item.category] = 0
    totals[item.category] += item.quantity
  })

  const maxTotal = Math.max(...Object.values(totals), 1)
  return Object.entries(totals).map(([name, total]) => ({
    name,
    total,
    percent: Math.round((total / maxTotal) * 100)
  }))
})

const groupedItems = computed(() => {
  const groups = {}
  record.value.items.forEach(item => {
    if (!groups[item.category]) groups[item.category] = []
    groups[item.category].push(item)
  })
  return Object.entries(groups).map(([category, items]) => ({
    category,
    items
  }))
})

function formatDate(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function goHome() {
  uni.switchTab({ url: '/pages/index/index' })
}

async function onGenerateReceipt() {
  uni.showLoading({ title: '生成中...' })
  canvasHeight.value = calcReceiptHeight(record.value)
  await nextTick()
  await saveReceiptToAlbum(record.value, canvasWidth.value)
  uni.hideLoading()
}

function onShare() {
  // #ifdef APP-PLUS
  uni.share({
    provider: 'weixin',
    scene: 'WXSceneSession',
    type: 0,
    title: `我在大胃王挑战了${record.value.shopName}！`,
    summary: `战斗力：${record.value.score}分，时长${record.value.duration}分钟`,
    imageUrl: '',
    success: () => {
      uni.showToast({ title: '分享成功', icon: 'success' })
    },
    fail: (err) => {
      console.error('Share failed:', err)
      uni.showToast({ title: '分享失败', icon: 'none' })
    }
  })
  // #endif

  // #ifdef H5
  uni.showToast({ title: '请使用浏览器分享功能', icon: 'none' })
  // #endif
}

function animateScore(target) {
  const duration = 1200
  const startTime = Date.now()
  const step = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    // ease-out-expo curve
    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
    displayScore.value = Math.round(eased * target)
    if (progress < 1) {
      setTimeout(step, 16)
    }
  }
  step()
}

onLoad((options) => {
  recordId.value = options.recordId || ''
  const rec = recordStore.getById(recordId.value)
  if (rec) {
    record.value = rec
    // 延迟启动分数计数动画
    setTimeout(() => animateScore(rec.score), 400)
  } else {
    uni.showToast({ title: '记录不存在', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
  }

  // 动态设置 canvas 宽度
  const sysInfo = uni.getSystemInfoSync()
  canvasWidth.value = sysInfo.windowWidth || 375

  // 检测是否升级
  const previousTotalExp = totalExp.value - expGained.value
  const previousLevelInfo = getLevel(previousTotalExp)
  const currentLevelInfo = levelInfo.value

  if (currentLevelInfo.tier > previousLevelInfo.tier ||
      (currentLevelInfo.tier === previousLevelInfo.tier &&
       currentLevelInfo.name !== previousLevelInfo.name)) {
    // 升级了！
    setTimeout(() => {
      showLevelUp.value = true
    }, 1600)
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


</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--c-bg, $void-black);
  padding: $page-pad-y $page-pad-x;
  padding-bottom: $section-gap;
  position: relative;
  overflow: hidden;
}

/* ── Ambient Glows ── */
.ambient-orb {
  position: fixed;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

.ambient-orb--gold {
  width: 500rpx;
  height: 500rpx;
  top: -100rpx;
  left: 50%;
  transform: translateX(-50%);
  background: radial-gradient(circle, var(--c-gold-soft, $glow-gold-soft) 0%, transparent 70%);
}

.ambient-orb--orange {
  width: 400rpx;
  height: 400rpx;
  bottom: 200rpx;
  right: -100rpx;
  background: radial-gradient(circle, var(--c-accent-soft, $glow-orange-soft) 0%, transparent 70%);
}

/* ── Result Header ── */
.result-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $section-gap 0 $intra-group;
  position: relative;
  z-index: 1;
  animation: fadeInUp $dur-entrance $ease-out-expo both;
}

.result-emoji {
  font-size: 72rpx;
  margin-bottom: $intra-group;
}

.result-title {
  font-size: var(--text-display-size, $type-display-size);
  font-weight: var(--text-display-weight, $type-display-weight);
  line-height: var(--text-display-lh, $type-display-lh);
  color: var(--c-gold, $accent-gold);
  margin-bottom: $intra-tight;
  letter-spacing: var(--text-display-ls, $type-display-ls);
  text-shadow: 0 0 30rpx var(--c-gold-glow-strong, $glow-gold-strong);
}

.result-subtitle {
  font-size: var(--text-label-size, $type-label-size);
  font-weight: var(--text-label-weight, $type-label-weight);
  line-height: var(--text-label-lh, $type-label-lh);
  color: var(--c-text-tertiary, $text-tertiary);
  margin-bottom: $section-gap;
  letter-spacing: var(--text-label-ls, $type-label-ls);
}

/* ── Score Card ── */
.score-shell {
  width: 100%;
  background: linear-gradient(165deg, var(--c-surface-10, $glass-white-10) 0%, var(--c-surface-3, $glass-white-3) 100%);
  border: 1rpx solid var(--c-border-active, $hairline-active);
  border-radius: $radius-2xl;
  box-shadow: var(--c-shadow-xl, $shadow-xl), var(--c-shadow-inner, $shadow-inner);
  backdrop-filter: blur(12rpx);
  -webkit-backdrop-filter: blur(12rpx);
  overflow: hidden;
}

.score-core {
  background: linear-gradient(165deg, var(--c-gold-soft, $glow-gold-soft) 0%, transparent 50%);
  padding: $section-gap 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.score-glow {
  position: absolute;
  top: -80rpx;
  width: 300rpx;
  height: 200rpx;
  border-radius: 50%;
  background: radial-gradient(ellipse, var(--c-gold-glow, $glow-gold) 0%, transparent 70%);
  pointer-events: none;
}

.score-label {
  font-size: var(--text-label-size, $type-label-size);
  font-weight: var(--text-label-weight, $type-label-weight);
  line-height: var(--text-label-lh, $type-label-lh);
  color: var(--c-text-tertiary, $text-tertiary);
  margin-bottom: $intra-tight;
  letter-spacing: $tracking-ultra-wide;
  text-transform: uppercase;
}

.score-row {
  display: flex;
  align-items: center;
  gap: $intra-group;
  margin-bottom: $intra-group;
}

.score-star {
  font-size: 40rpx;
}

.score-value {
  font-size: $score-hero-size;
  font-weight: 900;
  color: var(--c-gold, $accent-gold);
  line-height: 1;
  font-variant-numeric: tabular-nums;
  letter-spacing: $tracking-tighter;
  text-shadow: 0 0 40rpx var(--c-gold-glow-strong, $glow-gold-strong);
  animation: scoreReveal 0.6s $ease-out-expo 1.6s both;
}

@keyframes scoreReveal {
  0% { transform: scale(1); }
  50% { transform: scale(1.08); text-shadow: 0 0 60rpx var(--c-gold-glow-strong, $glow-gold-strong); }
  100% { transform: scale(1); }
}

.score-duration {
  font-size: var(--text-label-size, $type-label-size);
  font-weight: var(--text-label-weight, $type-label-weight);
  line-height: var(--text-label-lh, $type-label-lh);
  color: var(--c-text-tertiary, $text-tertiary);
  margin-bottom: $intra-group;
  letter-spacing: var(--text-label-ls, $type-label-ls);
}

.level-badge {
  display: flex;
  align-items: center;
  gap: $intra-tight;
  background: var(--c-accent-soft, $glow-orange-soft);
  border-radius: $radius-pill;
  padding: 14rpx 32rpx;
  border: 1rpx solid var(--c-accent-glow-strong, $glow-orange-strong);
}

.level-icon {
  font-size: 32rpx;
}

.level-name {
  font-size: var(--text-title-size, $type-title-size);
  font-weight: var(--text-headline-weight, $type-headline-weight);
  line-height: var(--text-title-lh, $type-title-lh);
  color: var(--c-accent, $accent-orange);
  letter-spacing: var(--text-title-ls, $type-title-ls);
}

.level-exp {
  font-size: var(--text-label-size, $type-label-size);
  font-weight: var(--text-label-weight, $type-label-weight);
  line-height: var(--text-label-lh, $type-label-lh);
  color: var(--c-text-tertiary, $text-tertiary);
  margin-left: $intra-tight;
  padding-left: $intra-tight;
  border-left: 1rpx solid var(--c-hairline, $hairline);
}

/* ── Section ── */
.section {
  margin-top: $section-gap;
  position: relative;
  z-index: 1;
}

.section-header {
  margin-bottom: $intra-group;
  animation: fadeInUp $dur-slow $ease-out-expo 0.2s both;
}

.section-header--collapsible {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: $intra-group 0;
  margin-bottom: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: $intra-group;
}

.collapse-icon {
  font-size: 24rpx;
  color: var(--c-text-muted, $text-muted);
  transition: transform $dur-fast $ease-spring;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  background: var(--c-accent-soft, $glow-orange-soft);
  border-radius: $radius-pill;
  padding: 6rpx 20rpx;
  margin-bottom: $intra-tight;
}

.eyebrow-text {
  font-size: var(--text-caption-size, $type-caption-size);
  font-weight: var(--text-label-weight, $type-label-weight);
  line-height: var(--text-caption-lh, $type-caption-lh);
  color: var(--c-accent, $accent-orange);
  letter-spacing: $tracking-ultra-wide;
  text-transform: uppercase;
}

.section-title {
  font-size: var(--text-headline-size, $type-headline-size);
  font-weight: var(--text-headline-weight, $type-headline-weight);
  line-height: var(--text-headline-lh, $type-headline-lh);
  color: var(--c-text-primary, $text-primary);
  letter-spacing: var(--text-headline-ls, $type-headline-ls);
}

/* ── Stats Double-Bezel ── */
.stats-shell {
  background: var(--c-surface-2, $glass-white-2);
  border: 1rpx solid var(--c-hairline, $hairline);
  border-radius: $radius-2xl;
  padding: $bezel-offset;
  animation: fadeInUp $dur-slow $ease-out-expo 0.25s both;
}

.stats-core {
  background: var(--c-surface-0, $surface-0);
  border-radius: $radius-xl;
  padding: $card-pad-compact;
  border: 1rpx solid var(--c-border-subtle, $hairline-subtle);
  box-shadow: var(--c-shadow-inner, $shadow-inner);
}

.stats-grid {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 300rpx;
}

.stat-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $intra-tight;
  flex: 1;
}

.stat-bar-bg {
  width: 40rpx;
  height: 200rpx;
  background: var(--c-surface-3, $glass-white-3);
  border-radius: $radius-sm;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
}

.stat-bar {
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #{$accent-orange}, #{$accent-gold});
  border-radius: $radius-sm;
  transform-origin: bottom;
  transition: transform $dur-slow $ease-spring;
  position: relative;
  z-index: 2;
}

.stat-bar-glow {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, rgba(255, 107, 53, 0.3), rgba(255, 215, 0, 0.3));
  filter: blur(8rpx);
  transform-origin: bottom;
  transition: transform $dur-slow $ease-spring;
  z-index: 1;
}

.stat-label {
  font-size: var(--text-label-size, $type-label-size);
  font-weight: var(--text-label-weight, $type-label-weight);
  line-height: var(--text-label-lh, $type-label-lh);
  color: var(--c-text-tertiary, $text-tertiary);
  letter-spacing: var(--text-label-ls, $type-label-ls);
}

.stat-val {
  font-size: var(--text-label-size, $type-label-size);
  font-weight: var(--text-headline-weight, $type-headline-weight);
  line-height: var(--text-label-lh, $type-label-lh);
  color: var(--c-accent, $accent-orange);
  letter-spacing: var(--text-label-ls, $type-label-ls);
}

/* ── Group Double-Bezel ── */
.group-shell {
  background: var(--c-surface-2, $glass-white-2);
  border: 1rpx solid var(--c-hairline, $hairline);
  border-radius: $radius-xl;
  padding: $bezel-offset;
  margin-bottom: $inter-group;
  animation: fadeInUp $dur-slow $ease-out-expo 0.3s both;
}

.group-core {
  background: var(--c-surface-0, $surface-0);
  border-radius: $radius-lg;
  padding: $card-pad-inner;
  border: 1rpx solid var(--c-border-subtle, $hairline-subtle);
  box-shadow: var(--c-shadow-inner, $shadow-inner);
}

.group-title {
  font-size: var(--text-title-size, $type-title-size);
  font-weight: var(--text-title-weight, $type-title-weight);
  line-height: var(--text-title-lh, $type-title-lh);
  color: var(--c-accent, $accent-orange);
  margin-bottom: $intra-group;
  padding-bottom: $intra-tight;
  border-bottom: 1rpx solid var(--c-hairline, $hairline);
  letter-spacing: var(--text-title-ls, $type-title-ls);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $intra-tight 0;
}

.detail-name {
  font-size: var(--text-body-size, $type-body-size);
  font-weight: var(--text-body-weight, $type-body-weight);
  line-height: var(--text-body-lh, $type-body-lh);
  color: var(--c-text-primary, $text-primary);
  letter-spacing: var(--text-body-ls, $type-body-ls);
}

.detail-qty {
  font-size: var(--text-body-size, $type-body-size);
  font-weight: var(--text-headline-weight, $type-headline-weight);
  line-height: var(--text-body-lh, $type-body-lh);
  color: var(--c-gold, $accent-gold);
  font-variant-numeric: tabular-nums;
  letter-spacing: var(--text-body-ls, $type-body-ls);
}

.empty-items {
  background: var(--c-surface-2, $glass-white-2);
  border: 1rpx solid var(--c-hairline, $hairline);
  border-radius: $radius-xl;
  padding: 48rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-items-icon {
  font-size: 48rpx;
  margin-bottom: 16rpx;
}

.empty-items-text {
  font-size: var(--text-title-size, $type-title-size);
  font-weight: var(--text-title-weight, $type-title-weight);
  line-height: var(--text-title-lh, $type-title-lh);
  color: var(--c-text-primary, $text-primary);
  margin-bottom: 8rpx;
}

.empty-items-hint {
  font-size: var(--text-label-size, $type-label-size);
  font-weight: var(--text-label-weight, $type-label-weight);
  line-height: var(--text-label-lh, $type-label-lh);
  color: var(--c-text-muted, $text-muted);
}

/* ── Action Buttons ── */
.actions {
  margin-top: $section-gap;
  display: flex;
  flex-direction: column;
  gap: $intra-group;
  position: relative;
  z-index: 1;
  animation: fadeInUp $dur-entrance $ease-out-expo 0.4s both;
}

.action-btn {
  height: 96rpx;
  border-radius: $radius-xl;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: transform $dur-normal $ease-spring;
}

.action-btn:active {
  transform: scale(0.97);
}

.action-btn--share {
  background: linear-gradient(135deg, var(--c-accent, $accent-orange), var(--c-accent-light, $accent-orange-light));
  box-shadow: var(--c-accent-glow-strong, $shadow-glow-orange-strong);
}

.action-btn--receipt {
  background: var(--c-surface-4, $glass-white-4);
  border: 1rpx solid var(--c-hairline, $hairline);
}

.action-btn--poster {
  background: linear-gradient(135deg, #{$accent-orange}, #{$accent-gold});
  box-shadow: var(--c-accent-glow-strong, $shadow-glow-orange-strong);
}

.poster-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(ellipse at 30% 30%, var(--c-surface-15, $glass-white-15) 0%, transparent 50%);
  pointer-events: none;
}

.action-btn--home {
  background: transparent;
  border: 1rpx solid var(--c-hairline, $hairline);
}

.action-btn-text {
  font-size: var(--text-title-size, $type-title-size);
  font-weight: var(--text-title-weight, $type-title-weight);
  line-height: var(--text-title-lh, $type-title-lh);
  color: var(--c-text-primary, $text-primary);
  position: relative;
  z-index: 1;
  letter-spacing: var(--text-title-ls, $type-title-ls);
}

.action-btn-text--poster {
  color: var(--c-text-on-accent, #FFFFFF);
}

.action-btn-text--home {
  color: var(--c-text-tertiary, $text-tertiary);
}

/* ── Level Up Celebration ── */
.levelup-mask {
  position: fixed;
  inset: 0;
  background: var(--c-overlay, $glass-black-60);
  backdrop-filter: blur(12rpx);
  -webkit-backdrop-filter: blur(12rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $z-modal;
  animation: fadeIn $dur-fast $ease-in-out-smooth;
}

.levelup-dialog {
  width: 85vw;
  max-width: 680rpx;
  background: var(--c-bg-elevated, $abyss);
  border: 1rpx solid var(--c-gold-glow, $glow-gold);
  border-radius: $radius-3xl;
  box-shadow: var(--c-card-shadow-elevated), 0 0 60rpx var(--c-gold-glow, $glow-gold);
  overflow: hidden;
  animation: scaleIn $dur-normal $ease-out-expo;
  position: relative;
}

.levelup-confetti {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 240rpx;
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
  padding: 20rpx;
  pointer-events: none;
}

.confetti-item {
  font-size: 48rpx;
  animation: confettiFall 2.5s ease-in-out infinite;
}

.confetti-item:nth-child(1) { animation-delay: 0s; font-size: 40rpx; }
.confetti-item:nth-child(2) { animation-delay: 0.2s; font-size: 52rpx; }
.confetti-item:nth-child(3) { animation-delay: 0.4s; font-size: 44rpx; }
.confetti-item:nth-child(4) { animation-delay: 0.6s; font-size: 48rpx; }
.confetti-item:nth-child(5) { animation-delay: 0.8s; font-size: 36rpx; }
.confetti-item:nth-child(6) { animation-delay: 1.0s; font-size: 44rpx; }
.confetti-item:nth-child(7) { animation-delay: 1.2s; font-size: 40rpx; }
.confetti-item:nth-child(8) { animation-delay: 1.4s; font-size: 52rpx; }

@keyframes confettiFall {
  0% {
    transform: translateY(-60rpx) translateX(0) rotate(0deg) scale(0.5);
    opacity: 0;
  }
  15% {
    opacity: 1;
    transform: translateY(0) translateX(10rpx) rotate(45deg) scale(1);
  }
  50% {
    opacity: 1;
    transform: translateY(100rpx) translateX(-15rpx) rotate(180deg) scale(1.1);
  }
  100% {
    transform: translateY(240rpx) translateX(20rpx) rotate(400deg) scale(0.8);
    opacity: 0;
  }
}

.levelup-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $section-gap $card-pad-inner;
  gap: $intra-group;
}

.levelup-title {
  font-size: var(--text-display-size, $type-display-size);
  font-weight: var(--text-display-weight, $type-display-weight);
  line-height: var(--text-display-lh, $type-display-lh);
  color: var(--c-gold, $accent-gold);
  letter-spacing: var(--text-display-ls, $type-display-ls);
  text-shadow: 0 0 20rpx var(--c-gold-glow, $glow-gold);
}

.levelup-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $intra-group;
  padding: $card-pad-inner;
  background: var(--c-gold-soft, $glow-gold-soft);
  border-radius: $radius-2xl;
  border: 1rpx solid var(--c-gold-glow, $glow-gold);
}

.levelup-icon {
  font-size: 96rpx;
}

.levelup-name {
  font-size: var(--text-headline-size, $type-headline-size);
  font-weight: var(--text-headline-weight, $type-headline-weight);
  line-height: var(--text-headline-lh, $type-headline-lh);
  color: var(--c-gold, $accent-gold);
  letter-spacing: var(--text-headline-ls, $type-headline-ls);
}

.levelup-desc {
  font-size: var(--text-body-size, $type-body-size);
  font-weight: var(--text-body-weight, $type-body-weight);
  line-height: var(--text-body-lh, $type-body-lh);
  color: var(--c-text-secondary, $text-secondary);
}

.levelup-action {
  padding: 24rpx;
  margin: $card-pad-inner;
  background: linear-gradient(135deg, var(--c-gold, $accent-gold), var(--c-gold-deep, $accent-gold-deep));
  border-radius: $radius-xl;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform $dur-fast $ease-spring;
}

.levelup-action:active {
  transform: scale(0.97);
}

.levelup-action-text {
  font-size: var(--text-title-size, $type-title-size);
  font-weight: var(--text-title-weight, $type-title-weight);
  line-height: var(--text-title-lh, $type-title-lh);
  color: var(--c-text-on-accent, #FFFFFF);
}

</style>
