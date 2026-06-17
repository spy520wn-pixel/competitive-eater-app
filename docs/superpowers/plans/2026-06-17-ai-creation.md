# AI 创作功能实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 AI 创作功能，包括挑战拍照、生图/视频大模型调用、创作结果列表展示。

**Architecture:** 数据层（models + stores）→ 路由层（pages.json + TabBar）→ 功能层（拍照、API、页面）。各 Task 独立可测，按顺序实施。

**Tech Stack:** UniApp + Vue 3 + SCSS + Agnes AI API

---

## File Map

| 文件 | 操作 | Task |
|------|------|------|
| `src/store/models.js` | 修改 | 1 |
| `src/store/record-store.js` | 修改 | 1 |
| `src/store/creation-store.js` | 新建 | 1 |
| `tests/unit/creation-store.test.js` | 新建 | 1 |
| `src/pages.json` | 修改 | 2 |
| `src/custom-tab-bar/index.vue` | 修改 | 2 |
| `static/images/tab-creation.png` | 新建 | 2 |
| `static/images/tab-creation-active.png` | 新建 | 2 |
| `src/pages/challenge/cooking.vue` | 修改 | 3 |
| `src/utils/ai-service.js` | 修改 | 4 |
| `src/pages/creation/index.vue` | 新建 | 5 |
| `src/pages/creation/create.vue` | 新建 | 6 |
| `src/pages/challenge/result.vue` | 修改 | 7 |
| `src/pages/record/detail.vue` | 修改 | 7 |

---

### Task 1: 数据层 — Record 扩展 + Creation 模型/Store

**Files:**
- Modify: `src/store/models.js`
- Modify: `src/store/record-store.js`
- Create: `src/store/creation-store.js`
- Create: `tests/unit/creation-store.test.js`

- [ ] **Step 1: 修改 models.js — Record 新增 photos 字段**

在 `createRecord` 函数中添加 `photos: []`：

```js
export function createRecord({ shopId, shopName, tierId = '', tierName = '', diners = 1 }) {
  return {
    id: generateId(),
    shopId,
    shopName,
    tierId,
    tierName,
    diners,
    startTime: new Date().toISOString(),
    endTime: null,
    duration: 0,
    status: '进行中',
    items: [],
    photos: [],
    score: 0,
    createdAt: new Date().toISOString()
  }
}
```

- [ ] **Step 2: 修改 record-store.js — 新增 addPhoto 方法**

在 `recordStore` 对象中添加：

```js
addPhoto(recordId, photoPath) {
  const record = recordStorage.getById(recordId)
  if (!record) return
  if (!record.photos) record.photos = []
  record.photos.push(photoPath)
  recordStorage.update(recordId, { photos: record.photos })
}
```

- [ ] **Step 3: 创建 creation-store.js**

```js
import { Storage } from './storage'

const creationStorage = new Storage('creations')

export function createCreation({ type, recordId, shopName, style, prompt, inputPhotos }) {
  let idCounter = Date.now()
  return {
    id: (++idCounter).toString(36),
    type,
    recordId,
    shopName: shopName || '',
    style: style || '',
    prompt: prompt || '',
    status: 'generating',
    resultUrl: '',
    inputPhotos: inputPhotos || [],
    videoId: '',
    createdAt: new Date().toISOString()
  }
}

export const creationStore = {
  getAll() {
    return creationStorage.getAll()
  },

  getById(id) {
    return creationStorage.getById(id)
  },

  getByType(type) {
    return creationStorage.getAll()
      .filter(c => c.type === type)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },

  create(creationData) {
    const creation = createCreation(creationData)
    creationStorage.save(creation)
    return creation
  },

  update(id, updates) {
    creationStorage.update(id, updates)
  },

  delete(id) {
    creationStorage.delete(id)
  },

  getGenerating() {
    return creationStorage.getAll().filter(c => c.status === 'generating')
  }
}
```

- [ ] **Step 4: 创建测试 creation-store.test.js**

```js
import { describe, it, expect, beforeEach } from 'vitest'
import { createCreation } from '../../src/store/models' // 如果移到 models

describe('Creation 模型', () => {
  it('createCreation 生成正确结构', () => {
    const c = createCreation({
      type: 'image',
      recordId: 'r1',
      shopName: '测试店',
      style: '搞笑夸张',
      prompt: 'test prompt',
      inputPhotos: ['/path/photo1.jpg']
    })
    expect(c.type).toBe('image')
    expect(c.recordId).toBe('r1')
    expect(c.shopName).toBe('测试店')
    expect(c.style).toBe('搞笑夸张')
    expect(c.status).toBe('generating')
    expect(c.resultUrl).toBe('')
    expect(c.inputPhotos).toEqual(['/path/photo1.jpg'])
    expect(c.id).toBeTruthy()
    expect(c.createdAt).toBeTruthy()
  })

  it('type 为 video 时 style 为空', () => {
    const c = createCreation({ type: 'video', recordId: 'r1' })
    expect(c.style).toBe('')
  })
})
```

- [ ] **Step 5: 运行测试**

```bash
npx vitest run
```

- [ ] **Step 6: Commit**

```bash
git add src/store/models.js src/store/record-store.js src/store/creation-store.js tests/unit/creation-store.test.js
git commit -m "feat: 数据层 - Record 新增 photos 字段 + Creation 模型/Store"
```

---

### Task 2: 路由层 — pages.json + TabBar

**Files:**
- Modify: `src/pages.json`
- Modify: `src/custom-tab-bar/index.vue`

- [ ] **Step 1: pages.json 注册新页面**

在 `pages` 数组中添加（放在 `pages/challenge/result` 之后）：

```json
{
  "path": "pages/creation/index",
  "style": {
    "navigationBarTitleText": "AI 创作",
    "navigationStyle": "custom"
  }
},
{
  "path": "pages/creation/create",
  "style": {
    "navigationBarTitleText": "创作",
    "navigationStyle": "custom"
  }
}
```

- [ ] **Step 2: pages.json tabBar.list 添加 AI 创作**

在 `tabBar.list` 的第 4 位（`pages/challenge/select` 之后，`pages/mine/index` 之前）插入：

```json
{
  "pagePath": "pages/creation/index",
  "text": "AI创作"
}
```

- [ ] **Step 3: 创建 TabBar 图标**

在 `static/images/` 下创建两个占位图标文件（64x64 PNG）：
- `tab-creation.png`（未选中态，灰色）
- `tab-creation-active.png`（选中态，橙色）

可以使用简单的星星或画笔图标。如果暂时没有图标资源，先复用其他 tab 的图标文件。

- [ ] **Step 4: 修改 custom-tab-bar/index.vue**

在 `tabs` 数组中添加 AI 创作 tab（第 4 位）：

```js
const tabs = [
  { pagePath: 'pages/index/index', text: '首页', icon: '/static/images/tab-home.png', activeIcon: '/static/images/tab-home-active.png', type: 'home' },
  { pagePath: 'pages/record/record', text: '战绩', icon: '/static/images/tab-record.png', activeIcon: '/static/images/tab-record-active.png', type: 'record' },
  { pagePath: 'pages/challenge/select', text: '挑战', icon: '/static/images/tab-challenge.png', activeIcon: '/static/images/tab-challenge-active.png', type: 'challenge' },
  { pagePath: 'pages/creation/index', text: 'AI创作', icon: '/static/images/tab-creation.png', activeIcon: '/static/images/tab-creation-active.png', type: 'creation' },
  { pagePath: 'pages/mine/index', text: '我的', icon: '/static/images/tab-mine.png', activeIcon: '/static/images/tab-mine-active.png', type: 'mine' }
]
```

在 `pages` 数组中同样添加：

```js
const pages = [
  'pages/index/index',
  'pages/record/record',
  'pages/challenge/select',
  'pages/creation/index',
  'pages/mine/index'
]
```

- [ ] **Step 5: 验证**

运行 `npm run dev`，确认底部 TabBar 显示 5 个 Tab，点击 AI 创作 Tab 能跳转（页面为空但不报错）。

- [ ] **Step 6: Commit**

```bash
git add src/pages.json src/custom-tab-bar/index.vue static/images/tab-creation*.png
git commit -m "feat: 注册 AI 创作页面路由 + TabBar 新增第 5 个 Tab"
```

---

### Task 3: 挑战拍照 — cooking.vue 改造

**Files:**
- Modify: `src/pages/challenge/cooking.vue`

- [ ] **Step 1: 添加拍照按钮到 HUD**

在 cooking.vue 顶部 HUD 区域（店铺名旁边）添加相机按钮：

```html
<view class="hud-camera" @tap="onCamera">
  <text class="hud-camera-icon">📷</text>
  <text v-if="photoCount > 0" class="hud-camera-badge">{{ photoCount }}</text>
</view>
```

- [ ] **Step 2: 添加拍照逻辑**

在 `<script setup>` 中添加：

```js
import { recordStore } from '../../store/record-store'

// 在现有变量区域添加
const photoCount = ref(0)

function onCamera() {
  uni.showActionSheet({
    itemList: ['拍照', '从相册选择'],
    success: (res) => {
      const sourceType = res.tapIndex === 0 ? ['camera'] : ['album']
      uni.chooseImage({
        count: 9 - photoCount.value,
        sizeType: ['compressed'],
        sourceType,
        success: (imgRes) => {
          imgRes.tempFilePaths.forEach(path => {
            recordStore.addPhoto(record.id, path)
          })
          photoCount.value += imgRes.tempFilePaths.length
          uni.showToast({ title: `已保存 ${imgRes.tempFilePaths.length} 张照片`, icon: 'success' })
        }
      })
    }
  })
}
```

注意：需要确认 `record` 变量（当前挑战记录）在 cooking.vue 中的引用方式。如果使用 `recordStore.getById()` 获取，确保在 `onShow` 中加载。

- [ ] **Step 3: 添加样式**

```scss
.hud-camera {
  position: relative;
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--c-surface-3, $glass-white-3);
  border-radius: 50%;
  border: 1rpx solid var(--c-surface-5, $glass-white-5);
}

.hud-camera-icon {
  font-size: 28rpx;
}

.hud-camera-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  min-width: 32rpx;
  height: 32rpx;
  line-height: 32rpx;
  text-align: center;
  font-size: 18rpx;
  color: #fff;
  background: $accent-orange;
  border-radius: $radius-pill;
  padding: 0 6rpx;
}
```

- [ ] **Step 4: 验证**

运行 `npm run dev`，开始挑战后点击相机按钮，拍照/选照片后角标数字更新。

- [ ] **Step 5: Commit**

```bash
git add src/pages/challenge/cooking.vue
git commit -m "feat: 挑战过程中支持拍照上传，照片存入 Record"
```

---

### Task 4: AI 服务层 — 生图 + 视频方法

**Files:**
- Modify: `src/utils/ai-service.js`

- [ ] **Step 1: 新增 STYLES 常量**

在文件顶部（`STYLE_PROMPTS` 附近）添加完整的 8 种风格：

```js
export const IMAGE_STYLES = {
  '搞笑夸张': '搞笑夸张风格，食物放大变大，添加表情包元素，色彩鲜艳，有趣幽默',
  '动漫二次元': '动漫二次元风格，日系画风，可爱Q版人物，鲜艳配色',
  '霸气宣言': '霸气宣言风格，大字报排版，奖杯奖牌元素，金色红色为主，气势磅礴',
  '简约战绩': '简约现代风格，干净的卡片式布局，数据可视化展示，专业感',
  '赛博朋克': '赛博朋克风格，霓虹灯光，暗色调，科技感，未来都市',
  '复古港风': '复古港风，80年代港片色调，暖黄滤镜，胶片质感',
  '日式清新': '日式清新风格，淡雅色调，干净构图，ins风格，小清新',
  '油画艺术': '油画艺术风格，厚涂笔触，浓郁色彩，艺术感，古典画风'
}
```

- [ ] **Step 2: 新增 generateImage 方法**

```js
export async function generateImage({ record, style, photoPaths = [] }) {
  const settings = settingsStore.get()
  if (!settings.aiServiceUrl || !settings.aiApiKey) {
    throw new Error('请先在设置中配置生图大模型服务地址和 API Key')
  }

  const stylePrompt = IMAGE_STYLES[style] || IMAGE_STYLES['简约战绩']

  // 构建战绩摘要
  const catSummary = {}
  record.items.forEach(item => {
    if (!catSummary[item.category]) catSummary[item.category] = 0
    catSummary[item.category] += item.quantity
  })
  const catText = Object.entries(catSummary).map(([cat, qty]) => `${cat}${qty}`).join('、')

  const prompt = `${stylePrompt}。
大胃王战绩海报：
- 店铺：${record.shopName}
- 战斗力：${record.score}分
- 菜品：${catText}
- 时长：${record.duration}分钟
要求：突出战绩数据，视觉冲击力强，适合发朋友圈炫耀。`

  // 构建请求数据
  const requestData = {
    model: settings.aiModel || 'agnes-image-2.0-flash',
    prompt,
    size: '1024x1024'
  }

  // 如果有照片，使用图生图模式
  if (photoPaths.length > 0) {
    const base64Photos = []
    for (const path of photoPaths.slice(0, 3)) {
      const base64 = await imageToBase64(path)
      base64Photos.push(base64)
    }
    requestData.extra_body = {
      image: base64Photos,
      response_format: 'url'
    }
  }

  const response = await withRetry(() => uni.request({
    url: settings.aiServiceUrl,
    method: 'POST',
    header: {
      'Authorization': `Bearer ${settings.aiApiKey}`,
      'Content-Type': 'application/json'
    },
    data: requestData
  }), { label: '生图大模型' })

  return response.data.data[0].url
}
```

- [ ] **Step 3: 新增 createVideoTask 方法**

```js
export async function createVideoTask({ record, photoPath }) {
  const settings = settingsStore.get()
  if (!settings.videoServiceUrl || !settings.videoApiKey) {
    throw new Error('请先在设置中配置视频大模型服务地址和 API Key')
  }

  const catSummary = {}
  record.items.forEach(item => {
    if (!catSummary[item.category]) catSummary[item.category] = 0
    catSummary[item.category] += item.quantity
  })
  const catText = Object.entries(catSummary).map(([cat, qty]) => `${cat}${qty}`).join('、')

  const prompt = `大胃王挑战精彩瞬间，${record.shopName}，战斗力${record.score}分，吃了${catText}，动感镜头，电影级画质。`

  const requestData = {
    model: settings.videoModel || 'agnes-video-v2.0',
    prompt,
    height: 768,
    width: 1152,
    num_frames: 121,
    frame_rate: 24
  }

  // 如果有照片，使用图生视频模式
  if (photoPath) {
    const base64 = await imageToBase64(photoPath)
    requestData.image = base64
  }

  const response = await withRetry(() => uni.request({
    url: settings.videoServiceUrl,
    method: 'POST',
    header: {
      'Authorization': `Bearer ${settings.videoApiKey}`,
      'Content-Type': 'application/json'
    },
    data: requestData
  }), { label: '视频大模型' })

  return {
    taskId: response.data.task_id,
    videoId: response.data.video_id
  }
}
```

- [ ] **Step 4: 新增 queryVideoResult 方法**

```js
export async function queryVideoResult(videoId) {
  const settings = settingsStore.get()

  const response = await uni.request({
    url: `${settings.videoServiceUrl.replace('/v1/videos', '')}/agnesapi?video_id=${videoId}`,
    method: 'GET',
    header: {
      'Authorization': `Bearer ${settings.videoApiKey}`
    }
  })

  return {
    status: response.data.status,
    videoUrl: response.data.remixed_from_video_id || '',
    progress: response.data.progress || 0,
    error: response.data.error
  }
}
```

- [ ] **Step 5: 确保 imageToBase64 已导出**

检查 `imageToBase64` 函数是否已 export。如果没有，在函数前添加 `export`。

- [ ] **Step 6: Commit**

```bash
git add src/utils/ai-service.js
git commit -m "feat: AI 服务层新增 generateImage/createVideoTask/queryVideoResult"
```

---

### Task 5: AI 创作列表页

**Files:**
- Create: `src/pages/creation/index.vue`

- [ ] **Step 1: 创建页面结构**

```vue
<template>
  <view class="page" :data-theme="currentTheme">
    <nav-bar title="AI 创作" :show-back="false" />

    <!-- Type Tabs -->
    <view class="type-tabs">
      <text
        v-for="tab in typeTabs"
        :key="tab.key"
        class="type-tab"
        :class="{ 'type-tab--active': activeType === tab.key }"
        @tap="activeType = tab.key"
      >{{ tab.label }}</text>
    </view>

    <!-- Creation List -->
    <scroll-view
      v-if="filteredList.length > 0"
      scroll-y
      class="creation-list"
      @scrolltolower="loadMore"
    >
      <view
        v-for="(item, index) in displayedList"
        :key="item.id"
        class="creation-card-shell"
        :style="{ animationDelay: index * 80 + 'ms' }"
        @tap="onTapItem(item)"
      >
        <view class="creation-card-core">
          <view class="creation-thumb-wrap">
            <image
              v-if="item.resultUrl"
              class="creation-thumb"
              :src="item.type === 'video' ? (item.videoCover || item.resultUrl) : item.resultUrl"
              mode="aspectFill"
            />
            <view v-else class="creation-thumb-placeholder">
              <text class="creation-thumb-icon">{{ item.type === 'video' ? '🎬' : '🖼️' }}</text>
            </view>
            <view v-if="item.type === 'video'" class="creation-video-badge">
              <text class="creation-video-badge-text">视频</text>
            </view>
          </view>
          <view class="creation-info">
            <view class="creation-meta-row">
              <text v-if="item.style" class="creation-style-tag">{{ item.style }}</text>
              <text v-if="item.type === 'video'" class="creation-style-tag creation-style-tag--video">视频</text>
            </view>
            <text class="creation-shop">{{ item.shopName }}</text>
            <text class="creation-time">{{ getRelativeTime(item.createdAt) }}</text>
            <view class="creation-status" :class="'creation-status--' + item.status">
              <text v-if="item.status === 'generating'" class="creation-status-text">⏳ 生成中...</text>
              <text v-else-if="item.status === 'completed'" class="creation-status-text">✅ 已完成</text>
              <text v-else-if="item.status === 'failed'" class="creation-status-text">❌ 失败</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- Empty State -->
    <EmptyState
      v-else
      icon="🎨"
      title="还没有创作过"
      description="用 AI 将你的挑战瞬间变成创意作品"
      action-text="去创作"
      hint="选择挑战记录开始创作"
      @action="goCreate"
    />

    <!-- FAB -->
    <view class="fab" @tap="goCreate">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>
```

- [ ] **Step 2: 添加 script 逻辑**

```vue
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import NavBar from '@/components/nav-bar.vue'
import EmptyState from '@/components/empty-state.vue'
import { creationStore } from '@/store/creation-store.js'
import { settingsStore, currentTheme } from '@/store/settings-store.js'
import { applyPageTheme, syncThemeFromStorage } from '@/utils/apply-page-theme.js'
import { getRelativeTime } from '@/utils/time.js'

const PAGE_SIZE = 20
const activeType = ref('image')
const displayCount = ref(PAGE_SIZE)
const creations = ref([])
const generatingTimers = ref([])

const typeTabs = [
  { key: 'image', label: '图片' },
  { key: 'video', label: '视频' }
]

const filteredList = computed(() => {
  return creations.value
    .filter(c => c.type === activeType.value)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const displayedList = computed(() => filteredList.value.slice(0, displayCount.value))

function loadMore() {
  if (displayedList.value.length < filteredList.value.length) {
    displayCount.value += PAGE_SIZE
  }
}

function loadData() {
  creations.value = creationStore.getAll()
  displayCount.value = PAGE_SIZE
}

function goCreate() {
  uni.navigateTo({ url: '/pages/creation/create' })
}

function onTapItem(item) {
  if (item.status === 'completed' && item.resultUrl) {
    if (item.type === 'image') {
      uni.previewImage({ urls: [item.resultUrl] })
    } else {
      // 视频播放
      uni.navigateTo({ url: `/pages/creation/preview?id=${item.id}` })
    }
  } else if (item.status === 'failed') {
    uni.showModal({
      title: '创作失败',
      content: '是否重新创作？',
      success: (res) => {
        if (res.confirm) {
          // 重新创建
          creationStore.delete(item.id)
          loadData()
          goCreate()
        }
      }
    })
  }
}

// 轮询生成中的视频
function startPolling() {
  const generating = creationStore.getGenerating()
  generating.forEach(item => {
    if (item.type === 'video' && item.videoId) {
      const timer = setInterval(async () => {
        try {
          const { queryVideoResult } = await import('@/utils/ai-service.js')
          const result = await queryVideoResult(item.videoId)
          if (result.status === 'completed') {
            creationStore.update(item.id, { status: 'completed', resultUrl: result.videoUrl })
            clearInterval(timer)
            loadData()
          } else if (result.status === 'failed') {
            creationStore.update(item.id, { status: 'failed' })
            clearInterval(timer)
            loadData()
          }
        } catch (e) {
          console.error('轮询视频结果失败:', e)
        }
      }, 5000)
      generatingTimers.value.push(timer)
    }
  })
}

onMounted(() => {
  applyPageTheme(settingsStore.get().theme)
  uni.$on('theme-apply', applyPageTheme)
})

onUnmounted(() => {
  uni.$off('theme-apply', applyPageTheme)
  generatingTimers.value.forEach(t => clearInterval(t))
})

onShow(() => {
  loadData()
  syncThemeFromStorage()
  startPolling()
})
</script>
```

- [ ] **Step 3: 添加样式（遵循项目设计规范，适配双主题）**

```vue
<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--c-bg, $void-black);
  padding: $page-pad-y $page-pad-x $page-pad-bottom;
  position: relative;
}

/* ── Type Tabs ── */
.type-tabs {
  display: flex;
  gap: 12rpx;
  margin-bottom: $section-gap;
  animation: fadeInUp $dur-slow $ease-out-expo both;
}

.type-tab {
  flex: 1;
  text-align: center;
  font-size: $type-label-size;
  font-weight: $type-label-weight;
  color: var(--c-text-muted, $text-muted);
  padding: 16rpx 0;
  border-radius: $radius-pill;
  background: var(--c-surface-2, $glass-white-2);
  border: 1rpx solid transparent;
  transition: all $dur-micro $ease-out-expo;
  letter-spacing: $tracking-wide;
}

.type-tab--active {
  color: $accent-orange;
  border-color: $accent-orange;
  background: rgba(255, 107, 53, 0.1);
}

/* ── Creation List ── */
.creation-list {
  flex: 1;
}

.creation-card-shell {
  background: var(--c-surface-1, $surface-1);
  border: 1rpx solid var(--c-border, $hairline);
  border-radius: $radius-xl;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.25), 0 1rpx 3rpx rgba(0, 0, 0, 0.15);
  margin-bottom: $inter-group;
  animation: revealSlide $dur-entrance $ease-out-expo both;
  transition: transform $dur-fast $ease-spring;
  overflow: hidden;
}

.creation-card-shell:active {
  transform: scale(0.98);
}

.creation-card-core {
  display: flex;
  padding: $card-pad-compact;
  gap: $intra-group;
}

.creation-thumb-wrap {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  border-radius: $radius-lg;
  overflow: hidden;
  flex-shrink: 0;
}

.creation-thumb {
  width: 100%;
  height: 100%;
}

.creation-thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--c-surface-3, $glass-white-3);
}

.creation-thumb-icon {
  font-size: 48rpx;
}

.creation-video-badge {
  position: absolute;
  bottom: 8rpx;
  right: 8rpx;
  background: rgba(0, 0, 0, 0.6);
  border-radius: $radius-xs;
  padding: 4rpx 10rpx;
}

.creation-video-badge-text {
  font-size: 18rpx;
  color: #fff;
}

.creation-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8rpx;
  min-width: 0;
}

.creation-meta-row {
  display: flex;
  gap: 8rpx;
  flex-wrap: wrap;
}

.creation-style-tag {
  font-size: 18rpx;
  color: $accent-orange;
  background: rgba(255, 107, 53, 0.1);
  padding: 4rpx 14rpx;
  border-radius: $radius-pill;
  letter-spacing: $tracking-wide;
}

.creation-style-tag--video {
  color: $accent-violet;
  background: rgba(139, 92, 246, 0.1);
}

.creation-shop {
  font-size: $type-body-size;
  color: var(--c-text-primary, $text-primary);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.creation-time {
  font-size: $type-caption-size;
  color: var(--c-text-tertiary, $text-tertiary);
}

.creation-status {
  margin-top: 4rpx;
}

.creation-status-text {
  font-size: $type-caption-size;
}

.creation-status--generating .creation-status-text {
  color: $accent-orange;
}

.creation-status--completed .creation-status-text {
  color: $accent-emerald;
}

.creation-status--failed .creation-status-text {
  color: $accent-danger;
}

/* ── FAB ── */
.fab {
  position: fixed;
  right: 32rpx;
  bottom: 200rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, $accent-orange, $accent-orange-deep);
  box-shadow: $shadow-glow-orange-strong;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $z-fab;
  transition: transform $dur-fast $ease-spring;
}

.fab:active {
  transform: scale(0.92);
}

.fab-icon {
  font-size: 48rpx;
  color: #fff;
  font-weight: 300;
  line-height: 1;
}
</style>
```

- [ ] **Step 4: 验证**

运行 `npm run dev`，点击 AI 创作 Tab，空状态显示正常。切换图片/视频 Tab。

- [ ] **Step 5: Commit**

```bash
git add src/pages/creation/index.vue
git commit -m "feat: AI 创作列表页 - 图片/视频 Tab 切换 + 列表展示"
```

---

### Task 6: AI 创作流程页

**Files:**
- Create: `src/pages/creation/create.vue`

- [ ] **Step 1: 创建页面 — Step 1 选择挑战记录**

```vue
<template>
  <view class="page" :data-theme="currentTheme">
    <nav-bar title="创作" :show-back="true" />

    <!-- Step indicator -->
    <view class="steps">
      <view v-for="(s, i) in steps" :key="i" class="step" :class="{ 'step--active': currentStep === i, 'step--done': currentStep > i }">
        <text class="step-num">{{ currentStep > i ? '✓' : i + 1 }}</text>
        <text class="step-label">{{ s }}</text>
      </view>
    </view>

    <!-- Step 1: Select Record -->
    <view v-if="currentStep === 0" class="step-content">
      <text class="step-title">选择挑战记录</text>
      <scroll-view scroll-y class="record-list">
        <view
          v-for="r in records"
          :key="r.id"
          class="record-item"
          :class="{ 'record-item--selected': selectedRecord?.id === r.id }"
          @tap="selectedRecord = r"
        >
          <view class="record-item-left">
            <text class="record-shop">{{ r.shopName }}</text>
            <text class="record-meta">{{ formatDate(r.createdAt) }} · 战斗力 {{ r.score }}</text>
          </view>
          <view v-if="r.photos?.length > 0" class="record-photos-preview">
            <image
              v-for="(p, pi) in r.photos.slice(0, 3)"
              :key="pi"
              class="record-photo-mini"
              :src="p"
              mode="aspectFill"
            />
          </view>
          <text v-else class="record-no-photo">无照片</text>
        </view>
      </scroll-view>
    </view>

    <!-- Step 2: Select Photos -->
    <view v-if="currentStep === 1" class="step-content">
      <text class="step-title">选择照片</text>
      <view class="photo-grid">
        <view
          v-for="(p, i) in availablePhotos"
          :key="i"
          class="photo-grid-item"
          :class="{ 'photo-grid-item--selected': selectedPhotos.includes(p) }"
          @tap="togglePhoto(p)"
        >
          <image class="photo-grid-img" :src="p" mode="aspectFill" />
          <view v-if="selectedPhotos.includes(p)" class="photo-grid-check">
            <text class="photo-grid-check-icon">✓</text>
          </view>
        </view>
        <view class="photo-grid-item photo-grid-item--add" @tap="addNewPhoto">
          <text class="photo-add-icon">+</text>
          <text class="photo-add-text">添加</text>
        </view>
      </view>
    </view>

    <!-- Step 3: Select Type -->
    <view v-if="currentStep === 2" class="step-content">
      <text class="step-title">选择创作类型</text>
      <view class="type-options">
        <view class="type-option" :class="{ 'type-option--selected': creationType === 'image' }" @tap="creationType = 'image'">
          <text class="type-option-icon">🖼️</text>
          <text class="type-option-label">生成图片</text>
          <text class="type-option-desc">AI 生成创意战绩海报</text>
        </view>
        <view class="type-option" :class="{ 'type-option--selected': creationType === 'video' }" @tap="creationType = 'video'">
          <text class="type-option-icon">🎬</text>
          <text class="type-option-label">生成视频</text>
          <text class="type-option-desc">AI 生成动态精彩瞬间</text>
        </view>
      </view>
    </view>

    <!-- Step 4: Select Style (image only) -->
    <view v-if="currentStep === 3 && creationType === 'image'" class="step-content">
      <text class="step-title">选择风格</text>
      <view class="style-grid">
        <view
          v-for="(desc, name) in IMAGE_STYLES"
          :key="name"
          class="style-item"
          :class="{ 'style-item--selected': selectedStyle === name }"
          @tap="selectedStyle = name"
        >
          <text class="style-item-name">{{ name }}</text>
          <text class="style-item-desc">{{ desc.split('，')[0] }}</text>
        </view>
      </view>
    </view>

    <!-- Bottom action -->
    <view class="bottom-action">
      <view v-if="currentStep > 0" class="action-btn action-btn--back" @tap="prevStep">
        <text class="action-btn-text">上一步</text>
      </view>
      <view
        class="action-btn action-btn--next"
        :class="{ 'action-btn--disabled': !canNext }"
        @tap="nextStep"
      >
        <text class="action-btn-text">{{ isLastStep ? '开始创作' : '下一步' }}</text>
      </view>
    </view>
  </view>
</template>
```

- [ ] **Step 2: 添加 script 逻辑**

```vue
<script setup>
import { ref, computed } from 'vue'
import NavBar from '@/components/nav-bar.vue'
import { recordStore } from '@/store/record-store.js'
import { creationStore } from '@/store/creation-store.js'
import { IMAGE_STYLES, generateImage, createVideoTask } from '@/utils/ai-service.js'
import { settingsStore, currentTheme } from '@/store/settings-store.js'
import { formatDate } from '@/utils/time.js'

const steps = ['选记录', '选照片', '选类型', '选风格']
const currentStep = ref(0)
const records = ref([])
const selectedRecord = ref(null)
const selectedPhotos = ref([])
const creationType = ref('image')
const selectedStyle = ref('搞笑夸张')
const isSubmitting = ref(false)

// 加载记录
const allRecords = recordStore.getAll().filter(r => r.status === '已完成')
records.value = allRecords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

const availablePhotos = computed(() => {
  if (!selectedRecord.value) return []
  return selectedRecord.value.photos || []
})

const isLastStep = computed(() => {
  if (creationType.value === 'video') return currentStep.value === 2
  return currentStep.value === 3
})

const canNext = computed(() => {
  if (currentStep.value === 0) return !!selectedRecord.value
  if (currentStep.value === 1) return selectedPhotos.value.length > 0
  if (currentStep.value === 2) return !!creationType.value
  if (currentStep.value === 3) return !!selectedStyle.value
  return false
})

function togglePhoto(p) {
  const idx = selectedPhotos.value.indexOf(p)
  if (idx >= 0) selectedPhotos.value.splice(idx, 1)
  else selectedPhotos.value.push(p)
}

function addNewPhoto() {
  uni.chooseImage({
    count: 9 - selectedPhotos.value.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      selectedPhotos.value.push(...res.tempFilePaths)
      // 同时存入 record
      res.tempFilePaths.forEach(p => recordStore.addPhoto(selectedRecord.value.id, p))
    }
  })
}

function prevStep() {
  if (currentStep.value > 0) currentStep.value--
}

async function nextStep() {
  if (!canNext.value || isSubmitting.value) return

  if (isLastStep.value) {
    await submitCreation()
    return
  }

  // 跳过风格选择步骤（视频类型）
  if (currentStep.value === 2 && creationType.value === 'video') {
    currentStep.value = 4 // 直接提交
    await submitCreation()
    return
  }

  currentStep.value++
}

async function submitCreation() {
  isSubmitting.value = true

  try {
    if (creationType.value === 'image') {
      // 同步生图
      uni.showLoading({ title: 'AI 创作中...' })
      const resultUrl = await generateImage({
        record: selectedRecord.value,
        style: selectedStyle.value,
        photoPaths: selectedPhotos.value
      })
      const creation = creationStore.create({
        type: 'image',
        recordId: selectedRecord.value.id,
        shopName: selectedRecord.value.shopName,
        style: selectedStyle.value,
        prompt: '',
        inputPhotos: selectedPhotos.value
      })
      creationStore.update(creation.id, { status: 'completed', resultUrl })
      uni.hideLoading()
      uni.showToast({ title: '创作完成', icon: 'success' })
      setTimeout(() => uni.navigateBack(), 1500)
    } else {
      // 异步视频
      const { taskId, videoId } = await createVideoTask({
        record: selectedRecord.value,
        photoPath: selectedPhotos.value[0]
      })
      const creation = creationStore.create({
        type: 'video',
        recordId: selectedRecord.value.id,
        shopName: selectedRecord.value.shopName,
        style: '',
        prompt: '',
        inputPhotos: selectedPhotos.value
      })
      creationStore.update(creation.id, { videoId })
      uni.showToast({ title: '已提交，后台生成中', icon: 'success' })
      setTimeout(() => uni.navigateBack(), 1500)
    }
  } catch (e) {
    uni.hideLoading()
    // withRetry 已弹窗，这里不需要额外处理
    console.error('创作失败:', e)
  } finally {
    isSubmitting.value = false
  }
}
</script>
```

- [ ] **Step 3: 添加样式（遵循设计规范，适配双主题）**

样式部分参照 Task 5 的设计风格，使用项目既有的 CSS 变量和 SCSS 变量。包括：`.steps`（步骤指示器）、`.record-item`（记录卡片）、`.photo-grid`（照片网格）、`.type-options`（类型选择）、`.style-grid`（风格网格）、`.bottom-action`（底部按钮）。

- [ ] **Step 4: 验证**

运行 `npm run dev`，完整走一遍创作流程：选记录→选照片→选类型→选风格→生成。

- [ ] **Step 5: Commit**

```bash
git add src/pages/creation/create.vue
git commit -m "feat: AI 创作流程页 - 选记录/照片/类型/风格 + 调用生成"
```

---

### Task 7: 结果页/详情页展示挑战照片

**Files:**
- Modify: `src/pages/challenge/result.vue`
- Modify: `src/pages/record/detail.vue`

- [ ] **Step 1: result.vue 添加照片展示区**

在结果页的点餐明细之后、操作按钮之前，添加挑战照片展示区：

```html
<!-- Challenge Photos -->
<view v-if="record.photos && record.photos.length > 0" class="section">
  <view class="section-header">
    <view class="eyebrow">
      <text class="eyebrow-text">照片</text>
    </view>
    <text class="section-title">挑战瞬间</text>
  </view>
  <view class="photos-grid">
    <image
      v-for="(p, i) in record.photos"
      :key="i"
      class="photo-thumb"
      :src="p"
      mode="aspectFill"
      @tap="previewPhoto(i)"
    />
  </view>
</view>
```

添加方法：

```js
function previewPhoto(index) {
  uni.previewImage({
    urls: record.photos,
    current: index
  })
}
```

添加样式：

```scss
.photos-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  animation: fadeInUp $dur-slow $ease-out-expo both;
}

.photo-thumb {
  width: calc(33.33% - 8rpx);
  height: 200rpx;
  border-radius: $radius-lg;
}
```

- [ ] **Step 2: detail.vue 添加照片展示区**

在战绩详情页的点餐明细之后，添加同样的照片展示区（复用相同的 template 和 style 结构）。

- [ ] **Step 3: 验证**

有照片的挑战记录，在结果页和详情页能看到照片网格，点击可全屏预览。

- [ ] **Step 4: Commit**

```bash
git add src/pages/challenge/result.vue src/pages/record/detail.vue
git commit -m "feat: 结果页和详情页展示挑战过程中拍摄的照片"
```
