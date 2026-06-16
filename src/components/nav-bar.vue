<template>
  <view class="nav-bar" :style="navBarStyle">
    <view :style="{ height: statusBarHeight + 'px' }" />
    <view class="nav-bar__content">
      <view class="nav-bar__left" @tap="onBack" v-if="showBack">
        <text class="nav-bar__back" :style="textStyle">‹</text>
      </view>
      <view class="nav-bar__left" v-else />
      <text class="nav-bar__title" :style="textStyle">{{ title }}</text>
      <view class="nav-bar__right">
        <slot name="right" />
      </view>
    </view>
  </view>
  <!-- 占位，防止页面内容被导航栏遮挡 -->
  <view :style="{ height: (statusBarHeight + 44) + 'px' }" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { settingsStore } from '@/store/settings-store.js'

const props = defineProps({
  title: { type: String, default: '' },
  showBack: { type: Boolean, default: true }
})

const statusBarHeight = ref(20)
const theme = ref('dark')

function readTheme() {
  try {
    const s = settingsStore.get()
    theme.value = s.theme || 'dark'
  } catch (e) {}
}

onMounted(() => {
  readTheme()
  try {
    const sysInfo = uni.getSystemInfoSync()
    statusBarHeight.value = sysInfo.statusBarHeight || 20
  } catch (e) {}
  uni.$on('theme-apply', (t) => { theme.value = t })
  uni.$on('tabbar-theme-change', (t) => { theme.value = t })
})

const navBarStyle = computed(() => {
  const isLight = theme.value === 'light'
  return {
    background: isLight ? '#F4F1EC' : '#0A0A12'
  }
})

const textStyle = computed(() => {
  const isLight = theme.value === 'light'
  return {
    color: isLight ? '#181820' : '#F0F0F5'
  }
})

function onBack() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
}

.nav-bar__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 16px;
}

.nav-bar__left,
.nav-bar__right {
  width: 60px;
  display: flex;
  align-items: center;
}

.nav-bar__left {
  justify-content: flex-start;
}

.nav-bar__right {
  justify-content: flex-end;
}

.nav-bar__back {
  font-size: 28px;
  font-weight: 300;
  line-height: 44px;
}

.nav-bar__title {
  font-size: 17px;
  font-weight: 600;
  text-align: center;
  flex: 1;
}
</style>
