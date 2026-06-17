<template>
  <view class="page" :data-theme="currentTheme">
    <nav-bar title="AI 创作" :show-back="false" />
    <text>AI 创作页面（待实现）</text>
  </view>
</template>

<script setup>
import NavBar from '@/components/nav-bar.vue'
import { currentTheme } from '@/store/settings-store.js'
</script>
