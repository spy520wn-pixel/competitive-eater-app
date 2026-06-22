<template>
  <view class="nav-bar" :data-theme="theme">
    <view :style="{ height: statusBarHeight + 'px' }" />
    <view class="nav-bar__content">
      <view class="nav-bar__left" role="button" tabindex="0" aria-label="返回" @tap="onBack" @keydown.enter="onBack" v-if="showBack">
        <text class="nav-bar__back">‹</text>
      </view>
      <view class="nav-bar__left" v-else />
      <text class="nav-bar__title">{{ title }}</text>
      <view class="nav-bar__right">
        <slot name="right" />
      </view>
    </view>
  </view>
  <!-- 占位，防止页面内容被导航栏遮挡 -->
  <view :style="{ height: (statusBarHeight + 44) + 'px' }" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTheme } from '@/composables/useTheme.js'

const props = defineProps({
  title: { type: String, default: '' },
  showBack: { type: Boolean, default: true }
})

const statusBarHeight = ref(20)
const { theme } = useTheme()

onMounted(() => {
  try {
    const sysInfo = uni.getSystemInfoSync()
    statusBarHeight.value = sysInfo.statusBarHeight || 20
  } catch (e) {}
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
  background: var(--c-bg);
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
  color: var(--c-text-primary);
}

.nav-bar__title {
  font-size: 17px;
  font-weight: 600;
  text-align: center;
  flex: 1;
  color: var(--c-text-primary);
}
</style>
