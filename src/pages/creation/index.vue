<template>
  <view class="page" :data-theme="currentTheme">
    <nav-bar title="AI 创作" :show-back="false" />

    <!-- Tab 切换 -->
    <view class="tab-bar">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ 'tab-item--active': activeTab === tab.key }"
        @tap="switchTab(tab.key)"
      >
        <text class="tab-icon">{{ tab.icon }}</text>
        <text class="tab-label">{{ tab.label }}</text>
        <view v-if="getTabCount(tab.key) > 0" class="tab-badge">
          <text class="tab-badge__text">{{ getTabCount(tab.key) }}</text>
        </view>
      </view>
    </view>

    <!-- 列表 -->
    <scroll-view
      v-if="filteredList.length > 0"
      scroll-y
      class="creation-list"
      :scroll-anchoring="true"
      :enable-back-to-top="true"
      @scrolltolower="loadMore"
    >
      <view
        v-for="(item, index) in displayList"
        :key="item.id"
        class="card-shell"
        :style="{ animationDelay: index * 60 + 'ms' }"
        @tap="onCardTap(item)"
      >
        <view class="card-core">
          <!-- 左侧缩略图 -->
          <view class="card-thumb">
            <image
              v-if="item.resultUrl && item.status === 'completed'"
              class="thumb-img"
              :src="item.resultUrl"
              mode="aspectFill"
            />
            <view v-else class="thumb-placeholder">
              <text class="thumb-placeholder__icon">{{ item.type === 'video' ? '🎬' : '🖼️' }}</text>
            </view>
          </view>

          <!-- 右侧信息 -->
          <view class="card-info">
            <!-- 风格标签 -->
            <view v-if="item.style" class="style-tag">
              <text class="style-tag__text">{{ item.style }}</text>
            </view>
            <!-- 店铺名 -->
            <text class="card-shop">{{ item.shopName || '未关联店铺' }}</text>
            <!-- 创建时间 -->
            <text class="card-time">{{ getRelativeTime(item.createdAt) }}</text>
            <!-- 状态 -->
            <view class="card-status" :class="'status--' + item.status">
              <text v-if="item.status === 'generating'" class="status-icon status-spin">⏳</text>
              <text v-else-if="item.status === 'completed'" class="status-icon">✅</text>
              <text v-else class="status-icon">❌</text>
              <text class="status-text">{{ statusLabel(item.status) }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="!hasMore && filteredList.length > PAGE_SIZE" class="list-end">
        <text class="list-end-text">已显示全部 {{ filteredList.length }} 条</text>
      </view>
    </scroll-view>

    <!-- 空状态 -->
    <EmptyState
      v-else
      icon="🎨"
      title="还没有创作记录"
      :description="'去挑战页面生成一张' + (activeTab === 'image' ? '海报' : '视频') + '吧'"
      action-text="开始创作"
      hint="挑战完成后可生成 AI 作品"
      @action="goCreate"
    />

    <!-- FAB 悬浮按钮 -->
    <view class="fab" @tap="goCreate">
      <text class="fab-icon">✨</text>
      <text class="fab-text">创作</text>
    </view>
  </view>
</template>

<script setup>
import NavBar from '@/components/nav-bar.vue'
import EmptyState from '@/components/empty-state.vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onShow, onHide } from '@dcloudio/uni-app'
import { creationStore } from '@/store/creation-store.js'
import { currentTheme, settingsStore } from '@/store/settings-store.js'
import { applyPageTheme, syncThemeFromStorage } from '@/utils/apply-page-theme.js'
import { getRelativeTime } from '@/utils/time.js'
import { queryVideoResult } from '@/utils/ai-service.js'

const PAGE_SIZE = 20
const POLL_INTERVAL = 5000

const tabs = [
  { key: 'image', label: '图片', icon: '🖼️' },
  { key: 'video', label: '视频', icon: '🎬' }
]

const activeTab = ref('image')
const creations = ref([])
const displayCount = ref(PAGE_SIZE)
let pollTimer = null

const filteredList = computed(() => {
  return creations.value
    .filter(c => c.type === activeTab.value)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const displayList = computed(() => filteredList.value.slice(0, displayCount.value))
const hasMore = computed(() => filteredList.value.length > displayCount.value)

function getTabCount(type) {
  return creations.value.filter(c => c.type === type).length
}

function switchTab(key) {
  activeTab.value = key
  displayCount.value = PAGE_SIZE
}

function loadMore() {
  if (hasMore.value) {
    displayCount.value += PAGE_SIZE
  }
}

function statusLabel(status) {
  if (status === 'generating') return '生成中...'
  if (status === 'completed') return '已完成'
  return '失败'
}

function loadData() {
  creations.value = creationStore.getAll()
  displayCount.value = PAGE_SIZE
}

function onCardTap(item) {
  if (item.status === 'completed') {
    if (item.type === 'image' && item.resultUrl) {
      uni.previewImage({
        urls: [item.resultUrl],
        current: item.resultUrl
      })
    }
    // 视频暂不处理预览
  } else if (item.status === 'failed') {
    uni.showModal({
      title: '重新创作',
      content: '上次创作失败，是否重新创作？',
      confirmText: '重新创作',
      confirmColor: '#FF6B35',
      success(res) {
        if (res.confirm) {
          creationStore.update(item.id, { status: 'generating', resultUrl: '' })
          loadData()
          // 如果是视频，立即触发一次轮询
          if (item.type === 'video' && item.videoId) {
            pollVideoStatus()
          }
        }
      }
    })
  }
}

function goCreate() {
  uni.navigateTo({ url: '/pages/creation/create' })
}

// ── 视频轮询 ──

function pollVideoStatus() {
  const generating = creationStore.getByType('video').filter(c => c.status === 'generating')
  if (generating.length === 0) return

  generating.forEach(async (item) => {
    if (!item.videoId) return
    try {
      const result = await queryVideoResult(item.videoId)
      if (result.status === 'completed' || result.status === 'succeeded') {
        creationStore.update(item.id, {
          status: 'completed',
          resultUrl: result.videoUrl
        })
        loadData()
      } else if (result.status === 'failed' || result.status === 'error') {
        creationStore.update(item.id, { status: 'failed' })
        loadData()
      }
      // generating 状态继续等待下次轮询
    } catch (e) {
      // 网络错误不更新状态，等下次轮询
    }
  })
}

function startPolling() {
  stopPolling()
  const hasGenerating = creations.value.some(c => c.status === 'generating' && c.type === 'video')
  if (hasGenerating) {
    pollTimer = setInterval(pollVideoStatus, POLL_INTERVAL)
  }
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

onMounted(() => {
  applyPageTheme(settingsStore.get().theme)
  uni.$on('theme-apply', applyPageTheme)
})

onUnmounted(() => {
  stopPolling()
  uni.$off('theme-apply', applyPageTheme)
})

onShow(() => {
  loadData()
  syncThemeFromStorage()
  startPolling()
})

onHide(() => {
  stopPolling()
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--c-bg, $void-black);
  padding: $page-pad-y $page-pad-x $page-pad-bottom;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

/* ── Tab Bar ── */
.tab-bar {
  display: flex;
  gap: 16rpx;
  padding: 8rpx 0;
  animation: fadeInUp $dur-normal $ease-out-expo both;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 20rpx 0;
  border-radius: $radius-xl;
  background: var(--c-surface-2, $glass-white-2);
  border: 1rpx solid transparent;
  transition: all $dur-fast $ease-out-expo;
  position: relative;
}

.tab-item--active {
  background: rgba(255, 107, 53, 0.08);
  border-color: $accent-orange;
}

.tab-icon {
  font-size: 28rpx;
}

.tab-label {
  font-size: $type-title-size;
  font-weight: $type-title-weight;
  color: var(--c-text-secondary, $text-secondary);
  letter-spacing: $type-title-ls;
}

.tab-item--active .tab-label {
  color: $accent-orange;
}

.tab-badge {
  position: absolute;
  top: -8rpx;
  right: 24rpx;
  min-width: 32rpx;
  height: 32rpx;
  border-radius: $radius-pill;
  background: $accent-orange;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
}

.tab-badge__text {
  font-size: 18rpx;
  font-weight: 600;
  color: #FFFFFF;
}

/* ── Creation List ── */
.creation-list {
  position: relative;
  z-index: 1;
}

/* ── Card Shell (double-layer glass) ── */
.card-shell {
  background: var(--c-surface-1, $surface-1);
  border: 1rpx solid var(--c-border, $hairline);
  border-radius: $radius-xl;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.25), 0 1rpx 3rpx rgba(0, 0, 0, 0.15);
  margin-bottom: $inter-group;
  animation: revealSlide $dur-entrance $ease-out-expo both;
  transition: transform $dur-fast $ease-spring, box-shadow $dur-fast $ease-spring;
  overflow: hidden;
}

.card-shell:active {
  transform: scale(0.98);
  box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.2);
}

.card-core {
  display: flex;
  align-items: stretch;
  gap: $intra-group;
  padding: $card-pad-compact;
}

/* ── Thumbnail ── */
.card-thumb {
  width: 160rpx;
  height: 160rpx;
  border-radius: $radius-lg;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--c-surface-4, $glass-white-4);
  border: 1rpx solid var(--c-surface-4, $glass-white-4);
}

.thumb-img {
  width: 100%;
  height: 100%;
}

.thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(165deg, var(--c-surface-6, $glass-white-6) 0%, var(--c-surface-3, $glass-white-3) 100%);
}

.thumb-placeholder__icon {
  font-size: 48rpx;
  opacity: 0.5;
}

/* ── Card Info ── */
.card-info {
  display: flex;
  flex-direction: column;
  gap: $intra-tight;
  flex: 1;
  min-width: 0;
  justify-content: center;
}

.style-tag {
  display: inline-flex;
  align-self: flex-start;
  padding: 4rpx 16rpx;
  border-radius: $radius-pill;
  background: var(--c-accent-soft, rgba(255, 107, 53, 0.06));
  border: 1rpx solid var(--c-accent-glow, rgba(255, 107, 53, 0.12));
}

.style-tag__text {
  font-size: $type-caption-size;
  font-weight: $type-label-weight;
  color: var(--c-accent, $accent-orange);
  letter-spacing: $type-caption-ls;
}

.card-shop {
  font-size: var(--text-title-size, $type-title-size);
  font-weight: var(--text-headline-weight, $type-headline-weight);
  line-height: var(--text-title-lh, $type-title-lh);
  color: var(--c-text-primary, $text-primary);
  letter-spacing: var(--text-title-ls, $type-title-ls);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-time {
  font-size: var(--text-caption-size, $type-caption-size);
  font-weight: var(--text-caption-weight, $type-caption-weight);
  color: var(--c-text-muted, $text-muted);
}

/* ── Status ── */
.card-status {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.status-icon {
  font-size: 22rpx;
}

.status-spin {
  display: inline-block;
  animation: spin 1.2s linear infinite;
}

.status-text {
  font-size: $type-label-size;
  font-weight: $type-label-weight;
  letter-spacing: $type-label-ls;
}

.status--generating .status-text {
  color: var(--c-warning, #F59E0B);
}

.status--completed .status-text {
  color: var(--c-success, #34D399);
}

.status--failed .status-text {
  color: var(--c-danger, #FF3B30);
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

/* ── FAB ── */
.fab {
  position: fixed;
  right: 40rpx;
  bottom: 200rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 24rpx 40rpx;
  border-radius: $radius-pill;
  background: linear-gradient(135deg, $accent-orange 0%, $accent-orange-light 100%);
  box-shadow: $shadow-glow-orange-strong;
  z-index: $z-overlay;
  transition: transform $dur-fast $ease-spring, box-shadow $dur-fast $ease-spring;
}

.fab:active {
  transform: scale(0.92);
  box-shadow: $shadow-glow-orange;
}

.fab-icon {
  font-size: 32rpx;
}

.fab-text {
  font-size: $type-title-size;
  font-weight: 600;
  color: #FFFFFF;
  letter-spacing: $type-title-ls;
}

/* ── Animations ── */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes revealSlide {
  from {
    opacity: 0;
    transform: translateY(24rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
