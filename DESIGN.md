---
name: 大胃王
description: 让大胃王挑战可记录、可追踪、可分享的游戏化战绩 APP
colors:
  void-black: "#030306"
  abyss: "#06060B"
  surface-0: "#131320"
  surface-1: "#1A1A2E"
  surface-2: "#22223A"
  accent-orange: "#FF6B35"
  accent-orange-light: "#FF8F60"
  accent-orange-deep: "#E85520"
  accent-gold: "#FFD700"
  accent-gold-deep: "#D4A017"
  text-primary: "#F0F0F5"
  text-secondary: "#9E9EB8"
  text-tertiary: "#6B6B85"
  text-muted: "#7575A0"
  text-ghost: "#4A4A68"
  cream-bg: "#F4F1EC"
  cream-elevated: "#FAF8F5"
  cream-surface-0: "#FFFFFF"
  cream-surface-1: "#FAF8F5"
  cream-surface-2: "#F0EDEA"
  cream-accent: "#D94F1E"
  cream-accent-light: "#F06830"
  cream-text-primary: "#181820"
  cream-text-secondary: "#3C3C54"
  cream-text-tertiary: "#545468"
typography:
  display:
    fontFamily: "Manrope, Noto Sans SC, -apple-system, BlinkMacSystemFont, PingFang SC, Helvetica Neue, sans-serif"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Manrope, Noto Sans SC, -apple-system, BlinkMacSystemFont, PingFang SC, Helvetica Neue, sans-serif"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.01em"
  label:
    fontFamily: "Manrope, Noto Sans SC, -apple-system, BlinkMacSystemFont, PingFang SC, Helvetica Neue, sans-serif"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.04em"
  mono:
    fontFamily: "JetBrains Mono, SF Mono, Menlo, Monaco, monospace"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  xs: "8rpx"
  sm: "12rpx"
  md: "16rpx"
  lg: "20rpx"
  xl: "24rpx"
  2xl: "32rpx"
  3xl: "40rpx"
  4xl: "48rpx"
  pill: "999rpx"
spacing:
  1: "8rpx"
  2: "16rpx"
  3: "24rpx"
  4: "32rpx"
  5: "40rpx"
  6: "48rpx"
  8: "64rpx"
  10: "80rpx"
  12: "96rpx"
  16: "128rpx"
  20: "160rpx"
components:
  button-primary:
    backgroundColor: "{colors.accent-orange}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: "0 48rpx"
    height: "100rpx"
  button-primary-hover:
    backgroundColor: "{colors.accent-orange-deep}"
  card:
    backgroundColor: "{colors.surface-1}"
    rounded: "{rounded.2xl}"
    padding: "32rpx"
  card-elevated:
    backgroundColor: "{colors.surface-0}"
    rounded: "{rounded.2xl}"
    padding: "40rpx"
  input:
    backgroundColor: "rgba(255, 255, 255, 0.04)"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "20rpx 26rpx"
  chip:
    backgroundColor: "rgba(255, 107, 53, 0.06)"
    textColor: "{colors.accent-orange}"
    rounded: "{rounded.pill}"
    padding: "8rpx 22rpx"
---

# Design System: 大胃王

## 1. Overview

**Creative North Star: "深夜食堂 × 午后咖啡馆"**

这是一个双面设计系统。深色主题是「深夜食堂」—— 深邃的靛蓝底色上，橙色光晕像灶火般温暖，金色点缀如美食的诱人色泽。界面有玻璃般的通透感，层次分明，像深夜食堂里透过雾气看到的灯光。浅色主题是「午后咖啡馆」—— 温暖的奶油色背景，深橙色点缀如咖啡的醇厚，整体氛围轻松舒适，像周末和朋友在咖啡馆闲聊。

这套系统明确拒绝效率工具的冷峻感（Notion、Linear），也拒绝健康 APP 的严肃语调（Keep、薄荷健康）。它是一个让人「放肆吃」的游戏化社交空间，不是「自律打卡」的工具。

**Key Characteristics:**
- **游戏化叙事**：等级、经验值、战斗力等游戏语言替代数据分析语调
- **情感优先**：界面传递挑战的兴奋感，不是记录的工具感
- **精致玻璃**：玻璃质感卡片 + 柔和光晕，层次分明但不浮夸
- **橙金双色系**：橙色用于交互和强调，金色用于成就和等级
- **双主题并行**：深色「深夜食堂」+ 浅色「午后咖啡馆」，同一套组件，两种氛围

## 2. Colors: The Midnight & Daylight Palette

深色主题是「深夜食堂」的靛蓝底色，浅色主题是「午后咖啡馆」的奶油暖调。两套主题共享同一套色彩角色，只是色值不同。

### Primary (交互色)
- **炽焰橙** (#FF6B35 / dark, #D94F1E / light): 按钮、链接、关键交互元素。这是用户的「行动色」，出现在需要点击的地方。深色主题偏亮，浅色主题偏深，确保对比度。
- **炽焰橙浅** (#FF8F60 / dark, #F06830 / light): hover 状态、次要强调。
- **炽焰橙深** (#E85520 / dark, #C04018 / light): 按钮按下状态、激活态边框。

### Secondary (成就色)
- **荣耀金** (#FFD700 / dark, #C08B10 / light): 等级、经验值、成就徽章、战斗力数字。金色代表「值得炫耀的东西」。
- **荣耀金深** (#D4A017 / dark, #A07508 / light): 金色的按下/禁用状态。

### Neutral (基础色)
- **深渊靛** (#030306): 深色主题的页面背景，像深夜的天空。
- **奶油暖** (#F4F1EC): 浅色主题的页面背景，像咖啡馆的墙面。
- **文字主色** (#F0F0F5 / dark, #181820 / light): 正文、标题。
- **文字次色** (#9E9EB8 / dark, #3C3C54 / light): 副标题、描述文字。
- **文字幽灵** (#4A4A68 / dark, #8A8AA0 / light): 占位符、禁用文字。

### Semantic (语义色)
- **危险红** (#FF3B30 / dark, #CC2D20 / light): 删除、错误、警告。
- **翡翠绿** (#34D399 / dark, #16A36A / light): 成功、完成、在线状态。
- **星紫** (#8B5CF6 / dark, #7C3AED / light): 特殊成就、高级功能。

### Named Rules

**The Glowing Ember Rule.** 橙色是「灶火」，不是「霓虹灯」。它通过 `glow` 效果（box-shadow with orange rgba）发光，而不是通过高饱和度刺眼。深色主题的橙色发光更强（0.12-0.25 alpha），浅色主题更弱（0.06-0.15 alpha）。

**The Gold Is Earned Rule.** 金色只出现在「值得炫耀」的地方：等级徽章、经验值、战斗力、成就。不要把金色用在普通按钮或普通文字上，它的稀缺性就是它的价值。

**The Cream Is Warm Rule.** 浅色主题的背景不是纯白，是带暖调的奶油色（#F4F1EC）。纯白太冷，像医院；奶油色像咖啡馆，有温度。

## 3. Typography

**Display Font:** Manrope（英文）+ Noto Sans SC（中文）
**Body Font:** Manrope（英文）+ Noto Sans SC（中文）
**Mono Font:** JetBrains Mono

**Character:** 现代、几何、有力量感。Manrope 的几何线条搭配 Noto Sans SC 的清晰中文字体，既有游戏感又不失专业。字重对比明显（标题 700，正文 400，标签 500），层次分明。Manrope 支持 800 字重，适合游戏化数字展示。

### Hierarchy
- **Display** (700, 48rpx, line-height 1.2): 大标题、统计数据的数字。用于战斗力、最高分等「炫耀性」数据。
- **Headline** (600, 36rpx, line-height 1.3): 页面标题、卡片标题。
- **Title** (500, 28rpx, line-height 1.4): 区块标题、按钮文字。
- **Body** (400, 28rpx, line-height 1.5, max-width 75ch): 正文、描述文字。
- **Label** (500, 22rpx, line-height 1.4, letter-spacing 0.04em): 标签、角标、小字说明。常用于等级、经验值等辅助信息。
- **Mono** (400, 26rpx, line-height 1.5): 代码、技术信息。

### Named Rules

**The Game Number Rule.** 战斗力、最高分、经验值等「游戏数字」使用 Display 级别的字号和字重，配合金色或橙色。这些数字是界面的视觉锚点，要足够大、足够醒目，让人一眼就想截图分享。

**The Label Whisper Rule.** 标签文字（等级、经验值、状态）使用 Label 级别，字小、字重轻、字间距宽。它们是「耳语」，不是「喊叫」—— 提供信息但不抢视觉焦点。

## 4. Elevation: The Glass Depth System

这是一个「玻璃深度」系统。深色主题通过多层半透明表面 + 柔和光晕营造深度，像透过雾气看灯光。浅色主题通过微妙阴影 + 边框营造层次，像阳光下的纸张堆叠。

### Shadow Vocabulary (深色主题)
- **Ambient Low** (`0 2rpx 8rpx rgba(0,0,0,0.35), 0 1rpx 2rpx rgba(0,0,0,0.15)`): 卡片默认状态，轻微悬浮感。
- **Ambient Medium** (`0 4rpx 20rpx rgba(0,0,0,0.4), 0 2rpx 6rpx rgba(0,0,0,0.2)`): 卡片 hover 状态，更强的悬浮感。
- **Ambient High** (`0 16rpx 56rpx rgba(0,0,0,0.5), 0 8rpx 20rpx rgba(0,0,0,0.3)`): 弹窗、浮层，最高层级。
- **Glow Orange** (`0 4rpx 28rpx rgba(255,107,53,0.18), 0 0 60rpx rgba(255,107,53,0.06)`): 橙色元素的光晕，像灶火。
- **Glow Gold** (`0 4rpx 28rpx rgba(255,215,0,0.15), 0 0 60rpx rgba(255,215,0,0.05)`): 金色元素的光晕，像成就闪耀。

### Shadow Vocabulary (浅色主题)
- **Subtle Low** (`0 1rpx 4rpx rgba(0,0,0,0.06)`): 卡片默认状态，几乎不可见的阴影。
- **Subtle Medium** (`0 4rpx 16rpx rgba(0,0,0,0.08)`): 卡片 hover 状态。
- **Subtle High** (`0 12rpx 48rpx rgba(0,0,0,0.12)`): 弹窗、浮层。

### Named Rules

**The Glass Layer Rule.** 深色主题的卡片背景是半透明的（`rgba(255,255,255,0.07)` 到 `rgba(255,255,255,0.02)` 渐变），配合 `backdrop-filter: blur(24rpx)`。这创造了「透过玻璃看内容」的效果，层次分明但不沉重。

**The Warm Shadow Rule.** 浅色主题的阴影是暖调的（`rgba(0,0,0,0.06)`），不是冷调的纯黑。阴影要轻，像阳光下的自然投影，不是舞台灯光。

## 5. Components

### Buttons
- **Shape:** 胶囊形（`border-radius: 999rpx`），圆润友好。
- **Primary:** 橙色背景（`#FF6B35`），白色文字，高度 100rpx，左右内边距 48rpx。按下时背景变深（`#E85520`），配合微弱的 `scale(0.97)` 动画。
- **Secondary:** 透明背景，橙色文字，橙色边框。用于次要操作。
- **Ghost:** 透明背景，文字色，无边框。用于取消、返回等低优先级操作。

### Cards / Containers
- **Corner Style:** 大圆角（`32rpx`），圆润但不夸张。
- **Background:** 深色主题用半透明渐变（`rgba(255,255,255,0.07)` → `rgba(255,255,255,0.02)`），浅色主题用白色渐变（`#FFFFFF` → `#FDFCFA`）。
- **Shadow Strategy:** 参考 Elevation 部分。深色主题用 Ambient Low，浅色主题用 Subtle Low。
- **Border:** 深色主题用白色 6% 透明边框，浅色主题用黑色 6% 透明边框。
- **Internal Padding:** 标准 32rpx，紧凑 24rpx，宽敞 40rpx。
- **Double-Bezel:** 特色组件。外层卡片 + 内层内容区，中间有 8rpx 的间距，创造「双层边框」效果。

### Inputs / Fields
- **Style:** 半透明背景（深色 `rgba(255,255,255,0.04)`，浅色 `rgba(0,0,0,0.025)`），圆角 16rpx，内边距 20rpx 26rpx。
- **Focus:** 边框变为橙色（`rgba(255,107,53,0.35)`），配合微弱的光晕。
- **Error:** 边框变为红色，配合红色文字提示。

### Chips / Tags
- **Style:** 半透明橙色背景（`rgba(255,107,53,0.06)`），橙色文字，胶囊形。
- **State:** 选中时背景更深（`rgba(255,107,53,0.12)`），文字更亮。

### Navigation
- **TabBar:** 自定义组件，深色主题用深色背景（`rgba(11,11,20,0.98)`），浅色主题用浅色背景（`rgba(244,241,236,0.98)`）。选中态用橙色图标和文字。
- **NavigationBar:** 使用 uni-app 原生 API，深色主题白字深底，浅色主题黑字浅底。

### Level Badge (特色组件)
- **Shape:** 胶囊形，橙色背景。
- **Content:** 等级数字 + 经验值进度条。
- **Behavior:** 经验值增长时有动画效果，等级提升时有金色光晕。

### Radar Chart (特色组件)
- **Style:** 深色主题用半透明网格线 + 橙色填充区域，浅色主题用浅灰网格线 + 橙色填充区域。
- **Labels:** 使用 Label 级别字体，环绕图表。

## 6. Do's and Don'ts

### Do:
- **Do** 使用橙色作为主要交互色，出现在所有可点击的元素上。
- **Do** 使用金色点缀「值得炫耀」的数据：等级、经验值、战斗力、成就。
- **Do** 深色主题使用玻璃质感卡片（半透明背景 + backdrop-filter），营造「深夜食堂」的雾气感。
- **Do** 浅色主题使用温暖的奶油色背景（#F4F1EC），不是纯白。
- **Do** 使用 Double-Bezel Card 作为主要卡片样式，创造层次感。
- **Do** 游戏数字（战斗力、最高分）使用 Display 级别字号，足够大、足够醒目。
- **Do** 标签文字使用 Label 级别，字小、字轻、字间距宽，提供信息但不抢焦点。
- **Do** 使用 `prefers-reduced-motion` 媒体查询，为减少动画的用户关闭动画。

### Don't:
- **Don't** 使用纯黑（#000）或纯白（#fff）作为背景或文字色，始终带一点色调。
- **Don't** 把金色用在普通按钮或普通文字上，它的稀缺性就是它的价值。
- **Don't** 使用效率工具的冷峻感（Notion、Linear 的那种「高效」语调）。
- **Don't** 使用健康 APP 的严肃语调（Keep、薄荷健康的那种「自律」叙事）。
- **Don't** 使用大众点评那种信息过载的复杂布局。
- **Don't** 使用渐变文字（background-clip: text + gradient），太装饰性。
- **Don't** 使用侧边条纹边框（border-left > 1px 作为彩色强调），太老套。
- **Don't** 使用弹窗作为第一选择，优先考虑内联、渐进式的交互方式。
- **Don't** 使用相同的卡片网格（同样大小的 icon + heading + text 重复），太无聊。
- **Don't** 深色主题的阴影太轻（像平面设计），或浅色主题的阴影太重（像 2014 年的 APP）。
