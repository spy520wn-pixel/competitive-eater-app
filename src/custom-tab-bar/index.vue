<template>
  <view class="tabbar" :class="{ 'tabbar--light': isLight }" :data-theme="theme" role="tablist">
    <view
      v-for="(item, index) in tabs"
      :key="item.pagePath"
      class="tabbar-item"
      :class="{ 'tabbar-item--active': current === index }"
      role="tab"
      tabindex="0"
      :aria-label="item.text"
      :aria-selected="current === index"
      @tap="switchTab(index)"
      @keydown.enter="switchTab(index)"
    >
      <image
        class="tabbar-icon-img"
        :src="current === index ? item.activeIcon : item.icon"
        mode="aspectFit"
        aria-hidden="true"
      />
      <text class="tabbar-text">{{ item.text }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useTheme } from '@/composables/useTheme.js'

const current = ref(0)
const { theme } = useTheme()

const isLight = computed(() => theme.value === 'light')

const tabs = [
  { pagePath: 'pages/index/index', text: '首页', icon: '/static/images/tab-home.png', activeIcon: '/static/images/tab-home-active.png', type: 'home' },
  { pagePath: 'pages/record/record', text: '战绩', icon: '/static/images/tab-record.png', activeIcon: '/static/images/tab-record-active.png', type: 'record' },
  { pagePath: 'pages/challenge/select', text: '挑战', icon: '/static/images/tab-challenge.png', activeIcon: '/static/images/tab-challenge-active.png', type: 'challenge' },
  { pagePath: 'pages/creation/index', text: 'AI创作', icon: '/static/images/tab-creation.png', activeIcon: '/static/images/tab-creation-active.png', type: 'creation' },
  { pagePath: 'pages/mine/index', text: '我的', icon: '/static/images/tab-mine.png', activeIcon: '/static/images/tab-mine-active.png', type: 'mine' }
]

const pages = [
  'pages/index/index',
  'pages/record/record',
  'pages/challenge/select',
  'pages/creation/index',
  'pages/mine/index'
]

function switchTab(index) {
  if (current.value === index) return
  uni.switchTab({ url: '/' + pages[index] })
}

onShow(() => {
  const pageStack = getCurrentPages()
  const currentPage = pageStack[pageStack.length - 1]
  if (currentPage) {
    const idx = pages.indexOf(currentPage.route)
    if (idx !== -1) current.value = idx
  }
})
</script>

<style lang="scss" scoped>
.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 100rpx;
  background: var(--c-bg-elevated);
  border-top: 1rpx solid var(--c-hairline);
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 999;
}

.tabbar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 16rpx 0;
  gap: 4rpx;
  transition: transform 0.2s cubic-bezier(0.32, 0.72, 0, 1);
}

.tabbar-item:active {
  transform: scale(0.92);
}

.tabbar-icon-img {
  width: 48rpx;
  height: 48rpx;
  transition: transform 0.2s $ease-out-expo;
}

.tabbar-item--active .tabbar-icon-img {
  transform: scale(1.1);
}

.tabbar-text {
  font-size: 22rpx;
  color: var(--c-text-tertiary, $text-tertiary);
  font-weight: 500;
  transition: color 0.3s ease;
}

.tabbar-item--active .tabbar-text {
  color: var(--c-accent, $accent-orange);
  font-weight: 700;
}
</style>
