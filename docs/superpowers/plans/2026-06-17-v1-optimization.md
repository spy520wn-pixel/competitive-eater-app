# V1 优化实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 对大胃王 APP V1 进行业务逻辑、交互体验、代码质量三个层面的 9 项优化。

**Architecture:** 改动分散在 utils、components、pages 三层，互不依赖可并行实施。计分和等级是纯函数改动有完整测试覆盖；UI 改动以现有组件模式为准，不引入新框架。

**Tech Stack:** UniApp + Vue 3 + SCSS + Vitest

---

## File Map

| 文件 | 操作 | 关联 Task |
|------|------|----------|
| `src/utils/category-constants.js` | 新建 | Task 1 |
| `src/components/bar-chart.vue` | 修改 | Task 1 |
| `src/components/category-tabs.vue` | 修改 | Task 1 |
| `src/utils/score.js` | 修改 | Task 2 |
| `tests/unit/score.test.js` | 修改 | Task 2 |
| `src/utils/level.js` | 修改 | Task 3 |
| `tests/unit/level.test.js` | 修改 | Task 3 |
| `src/uni.scss` | 修改 | Task 4 |
| `src/App.vue` | 修改 | Task 4 |
| `src/components/search-bar.vue` | 修改 | Task 5 |
| `src/pages/challenge/result.vue` | 修改 | Task 6 |
| `src/pages/record/record.vue` | 修改 | Task 7 |
| `src/pages/index/index.vue` | 修改 | Task 8 |
| `src/store/settings-store.js` | 修改 | Task 8 |
| `src/pages/mine/shop-edit.vue` | 修改 | Task 9 |

---

### Task 1: CATEGORY_CSS 共享常量提取

**Files:**
- Create: `src/utils/category-constants.js`
- Modify: `src/components/bar-chart.vue`
- Modify: `src/components/category-tabs.vue`

- [ ] **Step 1: 创建共享常量文件**

```js
// src/utils/category-constants.js
export const CATEGORY_CSS = {
  '肉类': { color: '#FF6B55', glow: 'rgba(255,107,85,0.35)' },
  '海鲜': { color: '#55B8FF', glow: 'rgba(85,184,255,0.35)' },
  '主食': { color: '#FFB347', glow: 'rgba(255,179,71,0.35)' },
  '甜点': { color: '#FF7EB3', glow: 'rgba(255,126,179,0.35)' },
  '饮品': { color: '#B47EFF', glow: 'rgba(180,126,255,0.35)' },
  '蔬菜': { color: '#7ED957', glow: 'rgba(126,217,87,0.35)' },
  '饮料': { color: '#B47EFF', glow: 'rgba(180,126,255,0.35)' },
  '其他': { color: '#9E9EB8', glow: 'rgba(158,158,184,0.35)' }
}
```

- [ ] **Step 2: bar-chart.vue 改为导入共享常量**

删除 bar-chart.vue 中的本地 `CATEGORY_CSS` 定义，顶部添加：
```js
import { CATEGORY_CSS } from '@/utils/category-constants.js'
```

- [ ] **Step 3: category-tabs.vue 改为导入共享常量**

删除 category-tabs.vue 中的本地 `CATEGORY_CSS` 定义，顶部添加：
```js
import { CATEGORY_CSS } from '@/utils/category-constants.js'
```

- [ ] **Step 4: 验证**

运行 `npm run dev`，确认首页柱状图和挑战页分类标签颜色显示正常。

- [ ] **Step 5: Commit**

```bash
git add src/utils/category-constants.js src/components/bar-chart.vue src/components/category-tabs.vue
git commit -m "refactor: 提取 CATEGORY_CSS 为共享常量"
```

---

### Task 2: 计分算法简化 + 分类命名统一

**Files:**
- Modify: `src/utils/score.js`
- Modify: `tests/unit/score.test.js`

- [ ] **Step 1: 更新测试用例**

将 `tests/unit/score.test.js` 替换为：

```js
import { describe, it, expect } from 'vitest'
import { calculateScore } from '../../src/utils/score'

describe('战斗力评分', () => {
  it('空战绩返回0', () => {
    expect(calculateScore([])).toBe(0)
  })

  it('null/undefined 返回0', () => {
    expect(calculateScore(null)).toBe(0)
    expect(calculateScore(undefined)).toBe(0)
  })

  it('单分类单菜品正确计算', () => {
    const items = [{ category: '肉类', quantity: 3 }]
    // 3*3 = 9
    expect(calculateScore(items)).toBe(9)
  })

  it('多分类多菜品正确计算', () => {
    const items = [
      { category: '肉类', quantity: 5 },
      { category: '海鲜', quantity: 3 },
      { category: '主食', quantity: 2 },
      { category: '饮品', quantity: 1 }
    ]
    // 5*3 + 3*3 + 2*2 + 1*1 = 15+9+4+1 = 29
    expect(calculateScore(items)).toBe(29)
  })

  it('同分类多个菜品累加', () => {
    const items = [
      { category: '肉类', quantity: 2 },
      { category: '肉类', quantity: 3 }
    ]
    // (2+3)*3 = 15
    expect(calculateScore(items)).toBe(15)
  })

  it('多人就餐除以人数并四舍五入', () => {
    const items = [{ category: '肉类', quantity: 5 }]
    // 5*3 = 15, 15/3 = 5
    expect(calculateScore(items, 3)).toBe(5)
  })

  it('未知分类默认权重1', () => {
    const items = [{ category: '未知分类', quantity: 4 }]
    // 4*1 = 4
    expect(calculateScore(items)).toBe(4)
  })

  it('蔬菜分类权重为1', () => {
    const items = [{ category: '蔬菜', quantity: 5 }]
    expect(calculateScore(items)).toBe(5)
  })

  it('饮品分类权重为1', () => {
    const items = [{ category: '饮品', quantity: 3 }]
    expect(calculateScore(items)).toBe(3)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npx vitest run tests/unit/score.test.js
```

预期：多分类测试失败（旧算法含种类加成，期望值不匹配）。

- [ ] **Step 3: 修改 score.js**

将 `src/utils/score.js` 替换为：

```js
const CATEGORY_WEIGHTS = {
  '肉类': 3,
  '海鲜': 3,
  '蔬菜': 1,
  '主食': 2,
  '饮品': 1,
  '甜点': 2,
  '其他': 1
}

export function calculateScore(items, diners = 1) {
  if (!items || items.length === 0) return 0

  const categoryTotals = {}
  items.forEach(item => {
    const cat = item.category
    if (!categoryTotals[cat]) categoryTotals[cat] = 0
    categoryTotals[cat] += item.quantity
  })

  let score = 0
  for (const [category, total] of Object.entries(categoryTotals)) {
    const weight = CATEGORY_WEIGHTS[category] || 1
    score += total * weight
  }

  if (diners > 1) {
    score = Math.round(score / diners)
  }

  return score
}
```

- [ ] **Step 4: 运行测试确认通过**

```bash
npx vitest run tests/unit/score.test.js
```

预期：全部 PASS。

- [ ] **Step 5: Commit**

```bash
git add src/utils/score.js tests/unit/score.test.js
git commit -m "refactor: 简化计分算法去掉种类加成，统一分类命名"
```

---

### Task 3: 等级阈值重划

**Files:**
- Modify: `src/utils/level.js`
- Modify: `tests/unit/level.test.js`

- [ ] **Step 1: 更新测试用例**

将 `tests/unit/level.test.js` 替换为：

```js
import { describe, it, expect } from 'vitest'
import { getLevel, getLevelName, LEVELS, scoreToExp } from '../../src/utils/level'

describe('等级系统', () => {
  it('LEVELS 包含19个等级条目', () => {
    expect(LEVELS).toHaveLength(19)
  })

  it('scoreToExp = score + 50', () => {
    expect(scoreToExp(0)).toBe(50)
    expect(scoreToExp(100)).toBe(150)
    expect(scoreToExp(500)).toBe(550)
  })

  describe('青铜段位', () => {
    it('0经验是青铜1', () => {
      const level = getLevel(0)
      expect(level.name).toBe('青铜')
      expect(level.tier).toBe(1)
      expect(level.levelText).toBe('1')
    })
    it('99经验是青铜1', () => {
      expect(getLevel(99).levelText).toBe('1')
    })
    it('100经验是青铜2', () => {
      expect(getLevel(100).levelText).toBe('2')
    })
    it('300经验是青铜3', () => {
      expect(getLevel(300).levelText).toBe('3')
    })
  })

  describe('白银段位', () => {
    it('600经验是白银1', () => {
      const level = getLevel(600)
      expect(level.name).toBe('白银')
      expect(level.tier).toBe(2)
      expect(level.levelText).toBe('1')
    })
    it('1200经验是白银2', () => {
      expect(getLevel(1200).levelText).toBe('2')
    })
    it('2000经验是白银3', () => {
      expect(getLevel(2000).levelText).toBe('3')
    })
  })

  describe('黄金段位', () => {
    it('3200经验是黄金1', () => {
      const level = getLevel(3200)
      expect(level.name).toBe('黄金')
      expect(level.tier).toBe(3)
    })
    it('5000经验是黄金2', () => {
      expect(getLevel(5000).levelText).toBe('2')
    })
    it('7500经验是黄金3', () => {
      expect(getLevel(7500).levelText).toBe('3')
    })
  })

  describe('铂金段位', () => {
    it('11000经验是铂金1', () => {
      const level = getLevel(11000)
      expect(level.name).toBe('铂金')
      expect(level.tier).toBe(4)
    })
    it('16000经验是铂金2', () => {
      expect(getLevel(16000).levelText).toBe('2')
    })
    it('22000经验是铂金3', () => {
      expect(getLevel(22000).levelText).toBe('3')
    })
  })

  describe('钻石段位', () => {
    it('30000经验是钻石1', () => {
      const level = getLevel(30000)
      expect(level.name).toBe('钻石')
      expect(level.tier).toBe(5)
    })
    it('40000经验是钻石2', () => {
      expect(getLevel(40000).levelText).toBe('2')
    })
    it('52000经验是钻石3', () => {
      expect(getLevel(52000).levelText).toBe('3')
    })
  })

  describe('星耀段位', () => {
    it('65000经验是星耀1', () => {
      const level = getLevel(65000)
      expect(level.name).toBe('星耀')
      expect(level.tier).toBe(6)
    })
    it('80000经验是星耀2', () => {
      expect(getLevel(80000).levelText).toBe('2')
    })
    it('100000经验是星耀3', () => {
      expect(getLevel(100000).levelText).toBe('3')
    })
  })

  describe('王者段位', () => {
    it('130000经验是王者', () => {
      const level = getLevel(130000)
      expect(level.name).toBe('王者')
      expect(level.tier).toBe(7)
      expect(level.levelText).toBe('')
    })
    it('999999经验仍是王者', () => {
      expect(getLevel(999999).name).toBe('王者')
    })
  })

  it('getLevelName 返回正确名称', () => {
    expect(getLevelName(0)).toBe('青铜')
    expect(getLevelName(600)).toBe('白银')
    expect(getLevelName(3200)).toBe('黄金')
    expect(getLevelName(11000)).toBe('铂金')
    expect(getLevelName(30000)).toBe('钻石')
    expect(getLevelName(65000)).toBe('星耀')
    expect(getLevelName(130000)).toBe('王者')
  })

  it('progress 在0到1之间', () => {
    const level = getLevel(600)
    expect(level.progress).toBeGreaterThanOrEqual(0)
    expect(level.progress).toBeLessThanOrEqual(1)
  })

  it('王者progress为1', () => {
    const level = getLevel(130000)
    expect(level.progress).toBe(1)
  })

  it('nextExp 正确指向下一等级阈值', () => {
    expect(getLevel(0).nextExp).toBe(100)
    expect(getLevel(100).nextExp).toBe(300)
    expect(getLevel(600).nextExp).toBe(1200)
    expect(getLevel(130000).nextExp).toBeNull()
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npx vitest run tests/unit/level.test.js
```

预期：边界值测试失败（旧阈值不匹配）。

- [ ] **Step 3: 修改 level.js 的 LEVELS 数组**

将 `src/utils/level.js` 中的 `LEVELS` 数组替换为：

```js
export const LEVELS = [
  { tier: 1, name: '青铜', level: 1, min: 0, max: 99, icon: '🥉' },
  { tier: 1, name: '青铜', level: 2, min: 100, max: 299, icon: '🥉' },
  { tier: 1, name: '青铜', level: 3, min: 300, max: 599, icon: '🥉' },
  { tier: 2, name: '白银', level: 1, min: 600, max: 1199, icon: '🥈' },
  { tier: 2, name: '白银', level: 2, min: 1200, max: 1999, icon: '🥈' },
  { tier: 2, name: '白银', level: 3, min: 2000, max: 3199, icon: '🥈' },
  { tier: 3, name: '黄金', level: 1, min: 3200, max: 4999, icon: '🥇' },
  { tier: 3, name: '黄金', level: 2, min: 5000, max: 7499, icon: '🥇' },
  { tier: 3, name: '黄金', level: 3, min: 7500, max: 10999, icon: '🥇' },
  { tier: 4, name: '铂金', level: 1, min: 11000, max: 15999, icon: '💎' },
  { tier: 4, name: '铂金', level: 2, min: 16000, max: 21999, icon: '💎' },
  { tier: 4, name: '铂金', level: 3, min: 22000, max: 29999, icon: '💎' },
  { tier: 5, name: '钻石', level: 1, min: 30000, max: 39999, icon: '💠' },
  { tier: 5, name: '钻石', level: 2, min: 40000, max: 51999, icon: '💠' },
  { tier: 5, name: '钻石', level: 3, min: 52000, max: 64999, icon: '💠' },
  { tier: 6, name: '星耀', level: 1, min: 65000, max: 79999, icon: '⭐' },
  { tier: 6, name: '星耀', level: 2, min: 80000, max: 99999, icon: '⭐' },
  { tier: 6, name: '星耀', level: 3, min: 100000, max: 129999, icon: '⭐' },
  { tier: 7, name: '王者', level: 0, min: 130000, max: Infinity, icon: '👑' }
]
```

`scoreToExp`、`getLevel`、`getLevelName` 函数逻辑不变。

- [ ] **Step 4: 运行测试确认通过**

```bash
npx vitest run tests/unit/level.test.js
```

预期：全部 PASS。

- [ ] **Step 5: 运行全部测试**

```bash
npx vitest run
```

预期：全部 PASS（包括 score、level、models、storage）。

- [ ] **Step 6: Commit**

```bash
git add src/utils/level.js tests/unit/level.test.js
git commit -m "refactor: 重划等级阈值，适配简化后的计分算法"
```

---

### Task 4: CSS 变量统一

**Files:**
- Modify: `src/uni.scss`
- Modify: `src/App.vue`

**约束: 必须以 APP 端为主。H5 与 APP 冲突时优先保证 APP 端。**

- [ ] **Step 1: 分析当前变量定义位置**

打开 `src/uni.scss`，找到 `:root` 块中的 CSS 变量定义（`--c-` 开头的变量）。
打开 `src/App.vue`，找到 `<style>` 中的 `:root` 块和 `[data-theme]` 块。

确认三处变量的覆盖范围和差异。

- [ ] **Step 2: 删除 uni.scss 中的 :root CSS 变量**

在 `src/uni.scss` 中，删除 `:root { ... }` 块内所有 `--c-` 开头的 CSS 变量定义。保留：
- SCSS 变量（`$` 开头）
- mixin 和 function
- 其他非变量的样式规则

- [ ] **Step 3: 删除 App.vue 中重复的 :root 块**

在 `src/App.vue` 的 `<style>` 中，删除 `:root { ... }` 块（如果存在），只保留 `[data-theme="dark"]` 和 `[data-theme="light"]` 块。

- [ ] **Step 4: 确认 [data-theme] 块包含所有变量**

对比被删除的变量列表，确保 `[data-theme="dark"]` 和 `[data-theme="light"]` 中都包含对应的变量定义。如有缺失，补充到 `[data-theme]` 块中。

- [ ] **Step 5: APP 端验证主题切换**

在 APP 端运行，验证：
1. 深色主题下所有页面颜色正常
2. 切换到浅色主题，所有页面颜色正确切换
3. 浅色→深色切换正常
4. TabBar 颜色跟随主题
5. 导航栏颜色跟随主题
6. 页面跳转后主题保持一致
7. 雷达图、柱状图主题响应正常

- [ ] **Step 6: Commit**

```bash
git add src/uni.scss src/App.vue
git commit -m "refactor: CSS 变量统一到 [data-theme]，消除三重定义"
```

---

### Task 5: search-bar 修复

**Files:**
- Modify: `src/components/search-bar.vue`

- [ ] **Step 1: 添加清除按钮和 timer 清理**

将 `src/components/search-bar.vue` 的 `<template>` 部分改为：

```html
<template>
  <view class="search-bar">
    <text class="search-icon">🔍</text>
    <input
      class="search-input"
      :placeholder="placeholder"
      placeholder-class="search-placeholder"
      :value="modelValue"
      @input="onInput"
      :aria-label="ariaLabel"
    />
    <text
      v-if="modelValue"
      class="search-clear"
      @tap="onClear"
      role="button"
      aria-label="清除搜索"
    >✕</text>
    <slot name="extra" />
  </view>
</template>
```

`<script setup>` 部分改为：

```js
import { onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '搜索...' },
  ariaLabel: { type: String, default: '搜索' },
  debounce: { type: Number, default: 200 }
})

const emit = defineEmits(['update:modelValue'])

let timer = null

function onInput(e) {
  const value = e.detail.value
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    emit('update:modelValue', value)
  }, props.debounce)
}

function onClear() {
  if (timer) clearTimeout(timer)
  timer = null
  emit('update:modelValue', '')
}

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})
```

`<style>` 部分追加：

```scss
.search-clear {
  font-size: 28rpx;
  color: var(--c-text-muted, $text-muted);
  padding: 8rpx 12rpx;
  margin-left: 8rpx;
  opacity: 0.6;
  transition: opacity $dur-micro $ease-out-expo;

  &:active {
    opacity: 1;
  }
}
```

- [ ] **Step 2: 验证**

运行 `npm run dev`，在店铺列表或战绩页测试：
1. 输入内容后 X 按钮出现
2. 点 X 清空输入，X 按钮消失
3. 快速输入后跳转页面，无报错

- [ ] **Step 3: Commit**

```bash
git add src/components/search-bar.vue
git commit -m "fix: search-bar 添加清除按钮，修复 timer 内存泄漏"
```

---

### Task 6: 结果页点餐明细样式

**Files:**
- Modify: `src/pages/challenge/result.vue`

- [ ] **Step 1: 修改明细区域模板**

找到 `result.vue` 中的 `<!-- Order details -->` 部分（约第 78-105 行），将 `v-show="showDetails"` 内的多个 `group-shell` 卡片改为单个卡片：

```html
<view v-show="showDetails" class="detail-shell">
  <view class="detail-core">
    <view v-for="group in groupedItems" :key="group.category" class="detail-group">
      <text class="detail-group-title" :style="{ color: getCategoryColor(group.category) }">{{ group.category }}</text>
      <view v-for="item in group.items" :key="item.menuItemId" class="detail-item">
        <text class="detail-name">{{ item.name }}</text>
        <text class="detail-qty">{{ item.quantity }}{{ item.unit }}</text>
      </view>
    </view>
    <view v-if="record.items.length === 0" class="empty-items">
      <text class="empty-items-icon">📝</text>
      <text class="empty-items-text">本次挑战未记录菜品</text>
      <text class="empty-items-hint">下次挑战时记得记录哦</text>
    </view>
  </view>
</view>
```

- [ ] **Step 2: 添加明细样式**

删除旧的 `.group-shell` 和 `.group-core` 样式，替换为：

```scss
.detail-shell {
  animation: fadeInUp $dur-slow $ease-out-expo both;
}

.detail-core {
  background: var(--c-surface-2, $glass-white-2);
  border: 1rpx solid var(--c-surface-5, $glass-white-5);
  border-radius: $radius-lg;
  padding: 28rpx;
}

.detail-group {
  &:not(:last-child) {
    margin-bottom: 24rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid var(--c-surface-3, $glass-white-3);
  }
}

.detail-group-title {
  font-size: $label-size;
  font-weight: $font-medium;
  letter-spacing: $tracking-wide;
  margin-bottom: 12rpx;
  display: block;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8rpx 0;
}

.detail-name {
  font-size: $body-size;
  color: var(--c-text-primary, $text-primary);
  flex: 1;
}

.detail-qty {
  font-size: $body-size;
  color: var(--c-text-secondary, $text-secondary);
  font-variant-numeric: tabular-nums;
  margin-left: 16rpx;
}
```

- [ ] **Step 3: 验证**

运行 `npm run dev`，完成一次挑战后在结果页展开明细，确认：
1. 单个卡片内展示所有分类的菜品
2. 分类之间有分隔线
3. 行间距适中
4. 默认折叠状态不变

- [ ] **Step 4: Commit**

```bash
git add src/pages/challenge/result.vue
git commit -m "refactor: 结果页点餐明细改为单卡片展示，优化行间距"
```

---

### Task 7: 战绩列表排序筛选

**Files:**
- Modify: `src/pages/record/record.vue`

- [ ] **Step 1: 添加排序状态和 UI**

在 `<script setup>` 中添加排序相关的响应式变量：

```js
const sortBy = ref('latestDate')  // 'bestScore' | 'latestDate' | 'count'
const sortOrder = ref('desc')      // 'asc' | 'desc'
```

在 `<template>` 的 `stats-bar` 下方、`scroll-view` 上方添加排序筛选栏：

```html
<!-- Sort bar -->
<view v-if="shopGroups.length > 0" class="sort-bar">
  <view class="sort-options">
    <text
      v-for="opt in sortOptions"
      :key="opt.key"
      class="sort-tag"
      :class="{ 'sort-tag--active': sortBy === opt.key }"
      @tap="toggleSort(opt.key)"
    >{{ opt.label }}</text>
  </view>
  <view class="sort-order" @tap="toggleOrder">
    <text class="sort-order-icon">{{ sortOrder === 'desc' ? '↓' : '↑' }}</text>
  </view>
</view>
```

在 `<script setup>` 中添加：

```js
const sortOptions = [
  { key: 'latestDate', label: '最近挑战' },
  { key: 'bestScore', label: '最高战力' },
  { key: 'count', label: '挑战次数' }
]

function toggleSort(key) {
  if (sortBy.value === key) return
  sortBy.value = key
  displayCount.value = PAGE_SIZE
}

function toggleOrder() {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
}
```

- [ ] **Step 2: 修改 shopGroups computed 的排序逻辑**

将 `shopGroups` computed 中的 `.sort((a, b) => b.bestScore - a.bestScore)` 替换为动态排序：

```js
const shopGroups = computed(() => {
  const completed = records.value.filter(r => r.status === '已完成')
  const groups = {}

  completed.forEach(r => {
    if (!groups[r.shopId]) {
      groups[r.shopId] = {
        shopId: r.shopId,
        shopName: r.shopName,
        bestScore: 0,
        count: 0,
        latestDate: null
      }
    }
    const g = groups[r.shopId]
    g.count++
    if (r.score > g.bestScore) g.bestScore = r.score
    if (!g.latestDate || new Date(r.createdAt) > new Date(g.latestDate)) {
      g.latestDate = r.createdAt
    }
  })

  return Object.values(groups)
    .map(g => ({
      ...g,
      icon: CATEGORY_ICONS[g.shopName] || CATEGORY_ICONS['default']
    }))
    .sort((a, b) => {
      const order = sortOrder.value === 'desc' ? 1 : -1
      if (sortBy.value === 'latestDate') {
        return order * (new Date(b.latestDate) - new Date(a.latestDate))
      }
      if (sortBy.value === 'count') {
        return order * (b.count - a.count)
      }
      return order * (b.bestScore - a.bestScore)
    })
})
```

- [ ] **Step 3: 添加排序栏样式**

```scss
.sort-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28rpx;
  margin-bottom: $intra-group;
}

.sort-options {
  display: flex;
  gap: 12rpx;
}

.sort-tag {
  font-size: $label-size;
  color: var(--c-text-muted, $text-muted);
  padding: 8rpx 20rpx;
  border-radius: $radius-pill;
  background: var(--c-surface-2, $glass-white-2);
  border: 1rpx solid transparent;
  transition: all $dur-micro $ease-out-expo;
}

.sort-tag--active {
  color: $accent-orange;
  border-color: $accent-orange;
  background: rgba(255, 107, 53, 0.1);
}

.sort-order {
  padding: 8rpx 16rpx;
}

.sort-order-icon {
  font-size: 32rpx;
  color: var(--c-text-secondary, $text-secondary);
}
```

- [ ] **Step 4: 验证**

运行 `npm run dev`，在战绩页测试：
1. 默认按最近挑战倒序排列
2. 切换到最高战力，列表按战力降序
3. 切换到挑战次数，列表按次数降序
4. 点击升降序按钮，排序反转
5. 分页加载正常

- [ ] **Step 5: Commit**

```bash
git add src/pages/record/record.vue
git commit -m "feat: 战绩列表支持按战力/时间/次数排序，支持升降序"
```

---

### Task 8: 首次使用城市引导

**Files:**
- Modify: `src/pages/index/index.vue`
- Modify: `src/store/settings-store.js`

- [ ] **Step 1: 在 index.vue 添加首次城市引导逻辑**

在 `onShow` 或 `onMounted` 中，检查 `settings.defaultCity` 是否为空。如果为空，弹出城市选择器：

```js
// 在 onShow 中添加
const settings = settingsStore.get()
if (!settings.defaultCity) {
  showCityPicker.value = true
  isFirstTimeCity.value = true
}
```

添加响应式变量：
```js
const isFirstTimeCity = ref(false)
```

- [ ] **Step 2: 修改城市选择器的确认逻辑**

当 `isFirstTimeCity` 为 true 时，选择城市后同时存入 settings：

```js
function selectCity(city) {
  selectedCity.value = city
  showCityPicker.value = false
  cityKeyword.value = ''

  // 首次选择时保存为默认城市
  if (isFirstTimeCity.value) {
    settingsStore.update({ defaultCity: city })
    isFirstTimeCity.value = false
  }
}
```

- [ ] **Step 3: 修改城市选择器标题**

在城市选择器弹窗的标题处，根据 `isFirstTimeCity` 显示不同文案：

```html
<text class="picker-title">{{ isFirstTimeCity ? '欢迎使用大胃王！请选择你的城市' : '选择城市' }}</text>
```

- [ ] **Step 4: 验证**

1. 清除应用数据（或新安装）
2. 打开 APP，首页自动弹出城市选择器
3. 选择一个城市，地图显示该城市
4. 退出重新进入，不再弹出引导
5. 在设置中修改默认城市，首页跟随变化

- [ ] **Step 5: Commit**

```bash
git add src/pages/index/index.vue src/store/settings-store.js
git commit -m "feat: 首次使用时引导选择城市，存入设置"
```

---

### Task 9: 店铺照片管理

**Files:**
- Modify: `src/pages/mine/shop-edit.vue`

- [ ] **Step 1: 在照片轮播区域添加删除按钮**

修改 `shop-edit.vue` 中的照片轮播部分（约第 5-25 行），每张照片上增加删除按钮：

```html
<view v-if="form.photos.length > 0" class="carousel-shell">
  <swiper
    class="carousel-swiper"
    :indicator-dots="form.photos.length > 1"
    indicator-color="rgba(255,255,255,0.3)"
    indicator-active-color="#FF6B35"
    :autoplay="form.photos.length > 1"
    :interval="4000"
    circular
  >
    <swiper-item v-for="(photo, idx) in form.photos" :key="idx">
      <view class="photo-wrap">
        <image class="carousel-image" :src="photo" mode="aspectFill" />
        <view class="photo-delete" @tap="deletePhoto(idx)">
          <text class="photo-delete-icon">✕</text>
        </view>
      </view>
    </swiper-item>
    <swiper-item>
      <view class="photo-add" @tap="showPhotoOptions">
        <text class="photo-add-icon">+</text>
        <text class="photo-add-text">添加照片</text>
      </view>
    </swiper-item>
  </swiper>
</view>
```

当 `form.photos` 为空时，显示添加照片的入口：

```html
<view v-else class="carousel-shell carousel-shell--empty" @tap="showPhotoOptions">
  <view class="photo-add photo-add--standalone">
    <text class="photo-add-icon">+</text>
    <text class="photo-add-text">添加店铺照片</text>
  </view>
</view>
```

- [ ] **Step 2: 添加照片操作方法**

在 `<script setup>` 中添加：

```js
function showPhotoOptions() {
  uni.showActionSheet({
    itemList: ['从相册选择', '拍照'],
    success: (res) => {
      if (res.tapIndex === 0) choosePhoto('album')
      else if (res.tapIndex === 1) choosePhoto('camera')
    }
  })
}

function choosePhoto(sourceType) {
  uni.chooseImage({
    count: 9 - form.photos.length,
    sizeType: ['compressed'],
    sourceType: [sourceType],
    success: (res) => {
      form.photos.push(...res.tempFilePaths)
    }
  })
}

function deletePhoto(idx) {
  uni.showModal({
    title: '删除照片',
    content: '确定删除这张照片吗？',
    success: (res) => {
      if (res.confirm) {
        form.photos.splice(idx, 1)
      }
    }
  })
}
```

- [ ] **Step 3: 添加照片管理样式**

```scss
.photo-wrap {
  position: relative;
  width: 100%;
  height: 100%;
}

.photo-delete {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.photo-delete-icon {
  color: #fff;
  font-size: 24rpx;
}

.photo-add {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--c-surface-2, $glass-white-2);
  border: 2rpx dashed var(--c-surface-5, $glass-white-5);
  border-radius: $radius-lg;
}

.photo-add--standalone {
  min-height: 240rpx;
}

.photo-add-icon {
  font-size: 56rpx;
  color: var(--c-text-muted, $text-muted);
  line-height: 1;
}

.photo-add-text {
  font-size: $label-size;
  color: var(--c-text-muted, $text-muted);
  margin-top: 8rpx;
}

.carousel-shell--empty {
  margin-bottom: $section-gap;
}
```

- [ ] **Step 4: 验证**

运行 `npm run dev`，在店铺编辑页测试：
1. 新建店铺，点击添加照片，从相册选择 → 照片显示在轮播中
2. 点击添加照片，拍照 → 照片显示
3. 点击照片上的 X → 二次确认 → 照片删除
4. 多张照片轮播正常
5. 保存后重新进入，照片仍在

- [ ] **Step 5: Commit**

```bash
git add src/pages/mine/shop-edit.vue
git commit -m "feat: 店铺照片支持从相册/相机上传和删除"
```
