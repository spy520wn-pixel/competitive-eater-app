<template>
  <view class="page" :data-theme="currentTheme">
    <nav-bar title="视频预览" :show-back="true" />
    <view class="video-container">
      <video
        v-if="videoUrl"
        class="video-player"
        :src="videoUrl"
        :controls="true"
        :autoplay="true"
        :show-fullscreen-btn="true"
        :show-play-btn="true"
        :enable-progress-gesture="true"
      />
    </view>
    <view class="video-info">
      <text class="video-shop">{{ creation.shopName }}</text>
      <text class="video-time">{{ getRelativeTime(creation.createdAt) }}</text>
    </view>
  </view>
</template>

<script setup>
import NavBar from '@/components/nav-bar.vue'
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { creationStore } from '@/store/creation-store.js'
import { currentTheme, settingsStore } from '@/store/settings-store.js'
import { applyPageTheme, syncThemeFromStorage } from '@/utils/apply-page-theme.js'
import { getRelativeTime } from '@/utils/time.js'

const creation = ref({})
const videoUrl = ref('')

onLoad((options) => {
  const id = options.id
  const item = creationStore.getById(id)
  if (item) {
    creation.value = item
    videoUrl.value = item.resultUrl
  }
  applyPageTheme(settingsStore.get().theme)
  syncThemeFromStorage()
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--c-bg, $void-black);
  display: flex;
  flex-direction: column;
}

.video-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $page-pad-x;
}

.video-player {
  width: 100%;
  border-radius: $radius-xl;
}

.video-info {
  padding: $card-pad-inner;
  text-align: center;
}

.video-shop {
  font-size: $type-title-size;
  font-weight: 600;
  color: var(--c-text-primary, $text-primary);
  display: block;
  margin-bottom: 8rpx;
}

.video-time {
  font-size: $type-caption-size;
  color: var(--c-text-tertiary, $text-tertiary);
}
</style>
