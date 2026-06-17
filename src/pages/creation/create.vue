<template>
  <view class="page" :data-theme="currentTheme">
    <nav-bar title="创作" :show-back="true" />
    <text>创作流程页（待实现）</text>
  </view>
</template>

<script setup>
import NavBar from '@/components/nav-bar.vue'
import { currentTheme } from '@/store/settings-store.js'
</script>
