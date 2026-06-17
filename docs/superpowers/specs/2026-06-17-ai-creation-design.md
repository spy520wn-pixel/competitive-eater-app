# AI 创作功能设计

## 概述

新增「AI 创作」功能模块，允许用户在挑战过程中拍摄照片，然后通过 AI 大模型生成创意图片或视频，支持多种风格选择。

## 约束

- **所有前端设计必须符合项目 DESIGN.md 设计规范**（色彩体系、排版层级、玻璃拟态风格、双层卡片模式等）
- **必须适配深色「深夜食堂」和浅色「午后咖啡馆」两个主题**，使用 CSS 变量（`--c-*`）而非硬编码颜色
- **视觉效果要精致**，遵循现有页面的设计语言，不能出现样式割裂

---

## 一、数据模型

### 1.1 Record 模型扩展

新增 `photos` 字段，存储挑战过程中拍摄的照片路径。

```js
// 现有 Record 模型新增字段
{
  // ... 现有字段
  photos: []  // 挑战过程中拍摄的照片路径数组
}
```

### 1.2 新建 Creation 模型

独立的创作结果模型，存储在 Storage 的 `eater_creations` key 下。

```js
{
  id: 'uuid',                    // 唯一 ID
  type: 'image' | 'video',       // 创作类型
  recordId: 'record-uuid',       // 关联的挑战记录 ID
  shopName: '店铺名',             // 冗余存储，方便列表展示
  style: '风格名称',              // 图片类型才有，8 种风格之一
  prompt: '完整提示词',            // 发送给大模型的提示词
  status: 'generating' | 'completed' | 'failed',
  resultUrl: '结果URL',           // 生成的图片/视频 URL
  inputPhotos: ['照片路径'],      // 本次创作使用的照片
  createdAt: 'ISO时间戳'
}
```

### 1.3 Creation Store

新增 `src/store/creation-store.js`，提供 CRUD 和状态管理。

---

## 二、挑战流程改造

### 2.1 cooking.vue 改造

- 顶部 HUD 区域（店铺名旁）新增相机按钮
- 点击弹出 ActionSheet：拍照 / 从相册选择
- 拍摄的照片存入当前 Record 的 `photos` 字段
- 相机按钮右上角显示已拍照片数量角标（0 时不显示）

### 2.2 Record 数据流

- `recordStore.create()` 时初始化 `photos: []`
- 挑战中拍照时调用 `recordStore.addPhoto(recordId, photoPath)`
- 结果页、详情页可查看挑战过程中拍的照片

---

## 三、底部 TabBar 改造

5 个 Tab，顺序：

1. 首页
2. 战绩
3. 挑战
4. **AI 创作**（新增）
5. 我的

Tab 图标和文字需适配双主题。

---

## 四、AI 创作页面

### 4.1 页面入口：`pages/creation/index.vue`

**布局结构：**
- 顶部：图片 / 视频 Tab 切换（复用 category-tabs 风格）
- 中间：创作结果列表（scroll-view + 分页加载）
- 底部右侧：悬浮「创作」按钮（FAB 风格）

**列表卡片（双层卡片风格）：**
- 左侧：缩略图（图片）或视频封面（视频）
- 右侧：
  - 风格标签（胶囊形，橙色高亮）
  - 关联店铺名
  - 创建时间（相对时间）
  - 状态标签：生成中（带动画）/ 已完成 / 失败
- 生成中的卡片：显示进度动画 + 「生成中」文字
- 点击已完成卡片：全屏预览图片或播放视频
- 点击生成中视频卡片：无操作
- 点击失败卡片：显示错误信息，可重试

**空状态：**
- 图标 + 「还没有创作过」+ 「去创作」按钮

### 4.2 空状态引导

无创作记录时显示 EmptyState 组件，引导用户点击创作按钮。

---

## 五、创作流程

### 5.1 页面入口：`pages/creation/create.vue`

**Step 1：选择挑战记录**
- 列表展示所有已完成的挑战记录
- 每项显示：店铺名、日期、战斗力分数、是否已有照片（缩略图预览）
- 选中后高亮

**Step 2：选择照片**
- 展示该记录已有的照片（网格布局，可多选）
- 末尾「+」按钮：拍照 / 从相册选择
- 至少选择 1 张照片才能继续

**Step 3：选择类型**
- 图片 / 视频 两个大按钮选择

**Step 4：选择风格（仅图片类型）**
- 8 种风格网格展示
- 每种风格：名称 + 预览关键词
- 选中后高亮

**Step 5：提交创作**
- 图片类型：同步调用，显示 loading，完成后跳转预览
- 视频类型：异步提交，显示「已提交」提示，返回列表页，列表中出现「生成中」卡片

---

## 六、8 种生图风格

| 风格 | Prompt 关键词 |
|------|-------------|
| 搞笑夸张 | 搞笑夸张风格，食物放大变大，添加表情包元素，色彩鲜艳，有趣幽默 |
| 动漫二次元 | 动漫二次元风格，日系画风，可爱Q版人物，鲜艳配色 |
| 霸气宣言 | 霸气宣言风格，大字报排版，奖杯奖牌元素，金色红色为主，气势磅礴 |
| 简约战绩 | 简约现代风格，干净的卡片式布局，数据可视化展示，专业感 |
| 赛博朋克 | 赛博朋克风格，霓虹灯光，暗色调，科技感，未来都市 |
| 复古港风 | 复古港风，80年代港片色调，暖黄滤镜，胶片质感 |
| 日式清新 | 日式清新风格，淡雅色调，干净构图，ins风格，小清新 |
| 油画艺术 | 油画艺术风格，厚涂笔触，浓郁色彩，艺术感，古典画风 |

提示词构建模板：
```
${stylePrompt}。
大胃王战绩海报：
- 店铺：${shopName}
- 战斗力：${score}分
- 菜品：${catSummary}
- 时长：${duration}分钟
要求：突出战绩数据，视觉冲击力强，适合发朋友圈炫耀。
```

---

## 七、API 调用

### 7.1 生图接口

```
POST https://apihub.agnes-ai.com/v1/images/generations
Authorization: Bearer {apiKey}
Content-Type: application/json

{
  "model": "agnes-image-2.0-flash",
  "prompt": "风格描述 + 战绩信息",
  "size": "1024x1024",
  "extra_body": {
    "image": ["照片URL或Base64"],
    "response_format": "url"
  }
}
```

### 7.2 视频接口

**创建任务：**
```
POST https://apihub.agnes-ai.com/v1/videos
Authorization: Bearer {apiKey}

{
  "model": "agnes-video-v2.0",
  "prompt": "视频内容描述",
  "image": "照片URL",
  "height": 768,
  "width": 1152,
  "num_frames": 121,
  "frame_rate": 24
}
```

**轮询结果（每 5 秒）：**
```
GET https://apihub.agnes-ai.com/agnesapi?video_id={video_id}
Authorization: Bearer {apiKey}
```

状态：queued → in_progress → completed / failed

### 7.3 重试机制

所有 AI 调用使用 `withRetry` 工具，默认重试 3 次，全部失败弹窗提醒。

---

## 八、视觉设计约束

- 所有页面必须使用 CSS 变量（`--c-*`），不硬编码颜色
- 卡片使用项目既有的双层玻璃拟态风格（`card-shell` + `card-core`）
- 排版使用项目既有的 6 级排版层级
- 动画使用项目既有的缓动函数和时长
- Tab 切换、按钮、标签等交互元素风格与现有页面统一
- 深色/浅色主题切换后所有元素颜色正确
- 创作页面的视觉语言与挑战、战绩等页面保持一致

---

## 九、文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/store/creation-store.js` | 新建 | Creation 数据模型和 Store |
| `src/store/record-store.js` | 修改 | 新增 addPhoto 方法 |
| `src/pages/creation/index.vue` | 新建 | AI 创作列表页 |
| `src/pages/creation/create.vue` | 新建 | AI 创作流程页 |
| `src/pages/challenge/cooking.vue` | 修改 | 新增拍照功能 |
| `src/pages/challenge/result.vue` | 修改 | 展示挑战照片 |
| `src/pages/record/detail.vue` | 修改 | 展示挑战照片 |
| `src/utils/ai-service.js` | 修改 | 新增生图/视频调用方法 |
| `src/custom-tab-bar/index.vue` | 修改 | 新增 AI 创作 Tab |
| `src/pages.json` | 修改 | 注册新页面路由 |
