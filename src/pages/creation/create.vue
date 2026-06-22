<template>
  <view class="page" :data-theme="currentTheme">
    <nav-bar title="AI 创作" :show-back="true" />

    <!-- Step Indicator -->
    <view class="step-bar">
      <view
        v-for="(s, i) in steps"
        :key="i"
        class="step-item"
        :class="{
          'step-item--active': i === step,
          'step-item--done': i < step
        }"
      >
        <view class="step-dot">
          <text v-if="i < step" class="step-dot-text">✓</text>
          <text v-else class="step-dot-text">{{ i + 1 }}</text>
        </view>
        <text class="step-label">{{ s }}</text>
        <view v-if="i < steps.length - 1" class="step-line" :class="{ 'step-line--filled': i < step }" />
      </view>
    </view>

    <!-- Step 1: Select Record -->
    <view v-if="step === 0" class="step-content">
      <text class="step-title">选择挑战记录</text>
      <text class="step-desc">选择一条已完成的挑战记录来创作</text>
      <scroll-view scroll-y class="record-list" v-if="completedRecords.length > 0">
        <view
          v-for="record in completedRecords"
          :key="record.id"
          class="record-card"
          :class="{ 'record-card--selected': selectedRecord?.id === record.id }"
          role="button"
          :aria-label="'选择战绩 ' + record.shopName"
          @tap="selectedRecord = record"
        >
          <view class="record-card__left">
            <text class="record-card__shop">{{ record.shopName }}</text>
            <text class="record-card__meta">
              {{ formatDate(record.createdAt) }}
              <text v-if="record.photos?.length" class="record-card__photo-tag"> · {{ record.photos.length }}张照片</text>
            </text>
          </view>
          <view class="record-card__right">
            <text class="record-card__score">{{ record.score }}</text>
            <text class="record-card__score-label">战斗力</text>
          </view>
        </view>
      </scroll-view>
      <view v-else class="empty-hint">
        <text class="empty-hint-text">暂无已完成的挑战记录</text>
      </view>
    </view>

    <!-- Step 2: Select Photos -->
    <view v-if="step === 1" class="step-content">
      <text class="step-title">选择照片</text>
      <text class="step-desc">至少选择 1 张，最多 3 张照片用于 AI 创作</text>
      <view class="photo-grid">
        <view
          v-for="(photo, i) in availablePhotos"
          :key="i"
          class="photo-item"
          :class="{ 'photo-item--selected': selectedPhotos.includes(photo) }"
          role="button"
          :aria-label="'选择照片 ' + (i + 1)"
          @tap="togglePhoto(photo)"
        >
          <image :src="photo" mode="aspectFill" class="photo-img" lazy-load :aria-label="'照片 ' + (index + 1)" />
          <view v-if="selectedPhotos.includes(photo)" class="photo-check">
            <text class="photo-check-text">✓</text>
          </view>
        </view>
        <view
          class="photo-item photo-item--add"
          :class="{ 'photo-item--disabled': selectedPhotos.length >= 3 }"
          role="button"
          aria-label="添加照片"
          @tap="selectedPhotos.length < 3 && addNewPhoto()"
        >
          <text class="photo-add-icon">+</text>
          <text class="photo-add-label">拍照/相册</text>
        </view>
      </view>
      <text class="photo-count">已选 {{ selectedPhotos.length }} 张</text>
    </view>

    <!-- Step 3: Select Type -->
    <view v-if="step === 2" class="step-content">
      <text class="step-title">选择创作类型</text>
      <text class="step-desc">图片同步生成，视频异步提交</text>
      <view class="type-grid">
        <view
          class="type-card"
          :class="{ 'type-card--selected': selectedType === 'image' }"
          role="button"
          aria-label="生成海报"
          @tap="selectedType = 'image'"
        >
          <text class="type-card__icon">🖼️</text>
          <text class="type-card__name">AI 海报</text>
          <text class="type-card__desc">同步生成，立即查看</text>
        </view>
        <view
          class="type-card"
          :class="{ 'type-card--selected': selectedType === 'video' }"
          role="button"
          aria-label="生成视频"
          @tap="selectedType = 'video'"
        >
          <text class="type-card__icon">🎬</text>
          <text class="type-card__name">AI 视频</text>
          <text class="type-card__desc">异步生成，后台处理</text>
        </view>
      </view>
    </view>

    <!-- Step 4: Select Style (image only) -->
    <view v-if="step === 3" class="step-content">
      <text class="step-title">选择风格</text>
      <text class="step-desc">选择你喜欢的海报风格</text>
      <view class="style-grid">
        <view
          v-for="(desc, name) in imageStyles"
          :key="name"
          class="style-card"
          :class="{ 'style-card--selected': selectedStyle === name }"
          role="button"
          :aria-label="'选择风格 ' + name"
          @tap="selectedStyle = name"
        >
          <view class="style-card__color" :style="{ background: getStyleColor(name) }" />
          <text class="style-card__name">{{ name }}</text>
          <text class="style-card__desc">{{ desc.split('，').slice(0, 2).join('，') }}</text>
        </view>
      </view>
    </view>

    <!-- Generating Overlay -->
    <view v-if="generating" class="generating-mask">
      <view class="generating-card">
        <view class="generating-spinner" />
        <text class="generating-text">{{ generatingText }}</text>
        <view class="generating-cancel" role="button" aria-label="取消生成" @tap="cancelGeneration">
          <text class="generating-cancel-text">取消</text>
        </view>
      </view>
    </view>

    <!-- Bottom Buttons -->
    <view class="bottom-bar">
      <view
        v-if="step > 0"
        class="btn btn--secondary"
        role="button"
        aria-label="上一步"
        @tap="prevStep"
      >
        <text class="btn-text btn-text--secondary">上一步</text>
      </view>
      <view v-else class="btn-placeholder" />

      <view
        class="btn btn--primary"
        :class="{ 'btn--disabled': !canProceed }"
        role="button"
        aria-label="下一步"
        @tap="nextStep"
      >
        <text class="btn-text btn-text--primary">{{ isLastStep ? '开始创作' : '下一步' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import NavBar from '@/components/nav-bar.vue'
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { settingsStore, currentTheme, getConfirmColor } from '@/store/settings-store.js'
import { applyPageTheme, syncThemeFromStorage } from '@/utils/apply-page-theme.js'
import { recordStore } from '@/store/record-store.js'
import { creationStore } from '@/store/creation-store.js'
import { IMAGE_STYLES, generateImage, createVideoTask } from '@/utils/ai-service.js'

const steps = ['选记录', '选照片', '选类型', '选风格']
const step = ref(0)
const selectedRecord = ref(null)
const selectedPhotos = ref([])
const selectedType = ref('')
const selectedStyle = ref('')
const generating = ref(false)
const generatingText = ref('')
const imageStyles = IMAGE_STYLES

const STYLE_COLORS = {
  '搞笑夸张': 'linear-gradient(135deg, #FF6B35, #FFD700)',
  '动漫二次元': 'linear-gradient(135deg, #FF69B4, #87CEEB)',
  '霸气宣言': 'linear-gradient(135deg, #FF0000, #FFD700)',
  '简约战绩': 'linear-gradient(135deg, #2C3E50, #4CA1AF)',
  '赛博朋克': 'linear-gradient(135deg, #FF00FF, #00FFFF)',
  '复古港风': 'linear-gradient(135deg, #D4A574, #8B6914)',
  '日式清新': 'linear-gradient(135deg, #98D8C8, #F7DC6F)',
  '油画艺术': 'linear-gradient(135deg, #8B4513, #CD853F)'
}

const completedRecords = computed(() =>
  recordStore.getAll().filter(r => r.status === '已完成')
)

const availablePhotos = computed(() => {
  if (!selectedRecord.value) return []
  return selectedRecord.value.photos || []
})

const isLastStep = computed(() => {
  if (selectedType.value === 'video') return step.value === 2
  return step.value === 3
})

const canProceed = computed(() => {
  if (step.value === 0) return !!selectedRecord.value
  if (step.value === 1) return selectedPhotos.value.length > 0
  if (step.value === 2) return !!selectedType.value
  if (step.value === 3) return !!selectedStyle.value
  return false
})

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

function getStyleColor(name) {
  return STYLE_COLORS[name] || 'linear-gradient(135deg, #666, #999)'
}

function cancelGeneration() {
  generating.value = false
  uni.showToast({ title: '已取消', icon: 'none' })
}

function togglePhoto(photo) {
  const idx = selectedPhotos.value.indexOf(photo)
  if (idx >= 0) {
    selectedPhotos.value = selectedPhotos.value.filter(p => p !== photo)
  } else {
    selectedPhotos.value = [...selectedPhotos.value, photo]
  }
}

function addNewPhoto() {
  const remaining = 3 - selectedPhotos.value.length
  if (remaining <= 0) return
  uni.chooseImage({
    count: remaining,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: (res) => {
      const newPhotos = res.tempFilePaths
      newPhotos.forEach(p => {
        recordStore.addPhoto(selectedRecord.value.id, p)
      })
      selectedRecord.value = recordStore.getById(selectedRecord.value.id)
      selectedPhotos.value = [...selectedPhotos.value, ...newPhotos]
    }
  })
}

function prevStep() {
  if (step.value > 0) step.value--
}

function nextStep() {
  if (!canProceed.value) return
  if (isLastStep.value) {
    submit()
    return
  }
  // Skip step 3 (style) for video type
  if (step.value === 2 && selectedType.value === 'video') {
    submit()
    return
  }
  step.value++
}

async function submit() {
  generating.value = true
  const rec = selectedRecord.value

  try {
    if (selectedType.value === 'image') {
      generatingText.value = '正在生成 AI 海报...'
      const resultUrl = await generateImage({
        record: rec,
        style: selectedStyle.value,
        photoPaths: selectedPhotos.value
      })
      const creation = creationStore.create({
        type: 'image',
        recordId: rec.id,
        shopName: rec.shopName,
        style: selectedStyle.value,
        inputPhotos: selectedPhotos.value
      })
      creationStore.update(creation.id, { status: 'completed', resultUrl })
      uni.showToast({ title: '创作完成', icon: 'success' })
    } else {
      generatingText.value = '正在提交视频任务...'
      const { taskId, videoId } = await createVideoTask({
        record: rec,
        photoPath: selectedPhotos.value[0]
      })
      const creation = creationStore.create({
        type: 'video',
        recordId: rec.id,
        shopName: rec.shopName,
        inputPhotos: selectedPhotos.value
      })
      creationStore.update(creation.id, { videoId })
      uni.showToast({ title: '已提交，后台生成中', icon: 'none' })
    }
    setTimeout(() => {
      uni.navigateBack()
    }, 800)
  } catch (e) {
    uni.showModal({
      title: '创作失败',
      content: 'AI 创作请求失败，是否重试？',
      confirmText: '重试',
      confirmColor: getConfirmColor(),
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          submit()
        }
      }
    })
  } finally {
    generating.value = false
  }
}

onShow(() => {
  applyPageTheme(settingsStore.get().theme)
  syncThemeFromStorage()
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--c-bg, $void-black);
  padding: $page-pad-y $page-pad-x;
  padding-bottom: 200rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

/* ── Step Indicator ── */
.step-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 16rpx;
  gap: 0;
  position: relative;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  position: relative;
}

.step-dot {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: var(--c-surface-5, $glass-white-5);
  border: 1rpx solid var(--c-border, $hairline);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.step-item--active .step-dot {
  background: var(--c-accent, $accent-orange);
  border-color: var(--c-accent, $accent-orange);
  box-shadow: 0 0 20rpx var(--c-accent-glow, $glow-orange);
}

.step-item--done .step-dot {
  background: var(--c-success, $accent-emerald);
  border-color: var(--c-success, $accent-emerald);
}

.step-dot-text {
  font-size: 22rpx;
  font-weight: 600;
  color: var(--c-text-muted, $text-muted);
}

.step-item--active .step-dot-text,
.step-item--done .step-dot-text {
  color: var(--c-text-on-accent);
}

.step-label {
  font-size: 22rpx;
  color: var(--c-text-ghost, $text-ghost);
  letter-spacing: $tracking-wide;
  margin-right: 8rpx;
}

.step-item--active .step-label {
  color: var(--c-text-primary, $text-primary);
  font-weight: 600;
}

.step-item--done .step-label {
  color: var(--c-text-secondary, $text-secondary);
}

.step-line {
  flex: 1;
  height: 2rpx;
  background: var(--c-border, $hairline);
  margin: 0 8rpx;
  min-width: 16rpx;
}

.step-line--filled {
  background: var(--c-success, $accent-emerald);
}

/* ── Step Content ── */
.step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  animation: fadeInUp 0.35s $ease-out-expo both;
}

.step-title {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--c-text-primary, $text-primary);
  letter-spacing: $tracking-tight;
}

.step-desc {
  font-size: 26rpx;
  color: var(--c-text-tertiary, $text-tertiary);
  letter-spacing: $tracking-wide;
  margin-bottom: 8rpx;
}

/* ── Step 1: Record List ── */
.record-list {
  flex: 1;
  max-height: calc(100vh - 500rpx);
}

.record-card {
  background: var(--c-surface-1, $surface-1);
  border: 1rpx solid var(--c-border, $hairline);
  border-radius: $radius-xl;
  padding: $card-pad-inner;
  margin-bottom: $intra-group;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: transform 0.25s $ease-spring;
}

.record-card:active {
  transform: scale(0.98);
}

.record-card--selected {
  border-color: var(--c-accent, $accent-orange);
  background: var(--c-accent-soft, $glow-orange-soft);
  box-shadow: 0 0 24rpx var(--c-accent-glow, $glow-orange);
}

.record-card__left {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  flex: 1;
}

.record-card__shop {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--c-text-primary, $text-primary);
}

.record-card__meta {
  font-size: 24rpx;
  color: var(--c-text-tertiary, $text-tertiary);
}

.record-card__photo-tag {
  color: var(--c-accent, $accent-orange);
}

.record-card__right {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 24rpx;
}

.record-card__score {
  font-size: 44rpx;
  font-weight: 700;
  color: var(--c-gold, $accent-gold);
  font-variant-numeric: tabular-nums;
}

.record-card__score-label {
  font-size: 20rpx;
  color: var(--c-text-muted, $text-muted);
  letter-spacing: $tracking-wide;
}

.empty-hint {
  padding: 120rpx 0;
  display: flex;
  justify-content: center;
}

.empty-hint-text {
  font-size: 28rpx;
  color: var(--c-text-ghost, $text-ghost);
}

/* ── Step 2: Photo Grid ── */
.photo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.photo-item {
  width: calc((100% - 32rpx) / 3);
  aspect-ratio: 1;
  border-radius: $radius-lg;
  overflow: hidden;
  position: relative;
  border: 2rpx solid transparent;
  transition: transform 0.25s $ease-spring, border-color 0.25s $ease-spring, box-shadow 0.25s $ease-spring;
}

.photo-item--selected {
  border-color: var(--c-accent, $accent-orange);
  box-shadow: 0 0 16rpx var(--c-accent-glow, $glow-orange);
}

.photo-img {
  width: 100%;
  height: 100%;
}

.photo-check {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: var(--c-accent, $accent-orange);
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-check-text {
  font-size: 22rpx;
  color: var(--c-text-on-accent);
  font-weight: 700;
}

.photo-item--add {
  background: var(--c-surface-3, $glass-white-3);
  border: 1rpx dashed var(--c-border, $hairline);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.photo-item--disabled {
  opacity: 0.35;
  pointer-events: none;
}

.photo-add-icon {
  font-size: 48rpx;
  color: var(--c-text-muted, $text-muted);
  font-weight: 300;
}

.photo-add-label {
  font-size: 20rpx;
  color: var(--c-text-ghost, $text-ghost);
}

.photo-count {
  font-size: 24rpx;
  color: var(--c-text-secondary, $text-secondary);
  text-align: center;
  margin-top: 8rpx;
}

/* ── Step 3: Type Selection ── */
.type-grid {
  display: flex;
  gap: 20rpx;
}

.type-card {
  flex: 1;
  background: var(--c-surface-1, $surface-1);
  border: 1rpx solid var(--c-border, $hairline);
  border-radius: $radius-xl;
  padding: 40rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  transition: transform 0.25s $ease-spring;
}

.type-card:active {
  transform: scale(0.97);
}

.type-card--selected {
  border-color: var(--c-accent, $accent-orange);
  background: var(--c-accent-soft, $glow-orange-soft);
  box-shadow: 0 0 24rpx var(--c-accent-glow, $glow-orange);
}

.type-card__icon {
  font-size: 56rpx;
}

.type-card__name {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--c-text-primary, $text-primary);
}

.type-card__desc {
  font-size: 22rpx;
  color: var(--c-text-tertiary, $text-tertiary);
  text-align: center;
}

/* ── Step 4: Style Grid ── */
.style-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.style-card {
  width: calc((100% - 16rpx) / 2);
  background: var(--c-surface-1, $surface-1);
  border: 1rpx solid var(--c-border, $hairline);
  border-radius: $radius-lg;
  padding: 28rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  transition: transform 0.25s $ease-spring;
}

.style-card:active {
  transform: scale(0.97);
}

.style-card--selected {
  border-color: var(--c-accent, $accent-orange);
  background: var(--c-accent-soft, $glow-orange-soft);
  box-shadow: 0 0 20rpx var(--c-accent-glow, $glow-orange);
}

.style-card__color {
  height: 8rpx;
  border-radius: $radius-xs $radius-xs 0 0;
  margin: -28rpx -24rpx 16rpx;
}

.style-card__name {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--c-text-primary, $text-primary);
}

.style-card__desc {
  font-size: 22rpx;
  color: var(--c-text-tertiary, $text-tertiary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Generating Overlay ── */
.generating-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--c-overlay, $glass-black-60);
  backdrop-filter: blur(12rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  animation: fadeIn 0.2s ease;
}

.generating-card {
  background: var(--c-surface-1, $surface-1);
  border: 1rpx solid var(--c-border, $hairline);
  border-radius: $radius-2xl;
  padding: 56rpx 80rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28rpx;
}

.generating-spinner {
  width: 64rpx;
  height: 64rpx;
  border: 4rpx solid var(--c-surface-8, $glass-white-8);
  border-top-color: var(--c-accent, $accent-orange);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.generating-text {
  font-size: 28rpx;
  color: var(--c-text-secondary, $text-secondary);
  letter-spacing: $tracking-wide;
}

.generating-cancel {
  margin-top: 16rpx;
  padding: 12rpx 40rpx;
  border-radius: $radius-pill;
  background: var(--c-surface-4, $glass-white-4);
  border: 1rpx solid var(--c-border, $hairline);
}

.generating-cancel-text {
  font-size: $type-label-size;
  color: var(--c-text-secondary, $text-secondary);
}

/* ── Bottom Bar ── */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx $page-pad-x;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: var(--c-bg-elevated, #0A0A14);
  border-top: 1rpx solid var(--c-border-subtle, $hairline-subtle);
  z-index: $z-sticky;
}

.btn {
  height: 88rpx;
  border-radius: $radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 48rpx;
  min-width: 200rpx;
  transition: transform 0.25s $ease-spring;
}

.btn:active {
  transform: scale(0.96);
}

.btn--primary {
  background: linear-gradient(135deg, var(--c-accent, $accent-orange), var(--c-accent-light, $accent-orange-light));
  box-shadow: 0 4rpx 20rpx var(--c-accent-glow, $glow-orange);
}

.btn--secondary {
  background: var(--c-surface-4, $glass-white-4);
  border: 1rpx solid var(--c-border, $hairline);
}

.btn--disabled {
  opacity: 0.35;
  pointer-events: none;
}

.btn-text {
  font-size: 28rpx;
  font-weight: 600;
  letter-spacing: $tracking-wide;
}

.btn-text--primary {
  color: var(--c-text-on-accent);
}

.btn-text--secondary {
  color: var(--c-text-secondary, $text-secondary);
}

.btn-placeholder {
  width: 200rpx;
}

</style>
