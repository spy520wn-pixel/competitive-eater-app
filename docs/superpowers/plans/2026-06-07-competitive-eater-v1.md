# 大胃王APP V1 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Design Requirement:** 所有涉及前端页面和组件的任务（Task 5-12）必须调用 `frontend-design` 技能完成，确保页面视觉效果高质量，避免通用 AI 美学。每个页面/组件的设计实现前先 invoke `/frontend-design`，获取专业设计方案后再编码。

**Goal:** 构建大胃王APP V1——一个基于 UniApp + Vue 3 的个人自助餐战绩记录工具，支持店铺管理、挑战记录、倒计时、评分等级、数据看板、地图足迹、小票生成和 AI 创意海报。

**Architecture:** 前端单体应用，纯本地存储（uni.storage），无后端。数据层封装 uni.storage 提供类型安全的 CRUD 操作。页面采用 UniApp 原生组件 + 自定义组件，图表使用 uCharts，地图使用高德地图 JS API。

**Tech Stack:** UniApp + Vue 3 + Vite, uni.storage, uCharts, 高德地图 JS API, Canvas 2D, AI API (通义千问)

---

## 文件结构

```
competitive-eater-app/
├── src/
│   ├── pages/                          # 页面
│   │   ├── index/index.vue             # 首页（数据看板 + 地图）
│   │   ├── record/record.vue           # 战绩列表页
│   │   ├── record/detail.vue           # 单条战绩详情页
│   │   ├── record/shop-records.vue     # 店铺战绩详情页
│   │   ├── challenge/select.vue        # 挑战 - 选择店铺
│   │   ├── challenge/cooking.vue       # 挑战 - 点菜界面
│   │   ├── challenge/result.vue        # 挑战 - 结果页
│   │   ├── mine/index.vue              # 我的页面
│   │   ├── mine/shops.vue              # 店铺管理列表
│   │   ├── mine/shop-edit.vue          # 新增/编辑店铺
│   │   ├── mine/backup.vue             # 数据备份
│   │   └── mine/settings.vue           # 设置
│   ├── components/                     # 公共组件
│   │   ├── category-tabs.vue           # 左侧分类Tab组件
│   │   ├── dish-item.vue               # 菜品行组件（加减器）
│   │   ├── tier-picker.vue             # 档位选择弹窗
│   │   ├── radar-chart.vue             # 雷达图组件
│   │   ├── bar-chart.vue               # 柱状图组件
│   │   ├── receipt-canvas.vue          # 小票Canvas组件
│   │   ├── map-view.vue                # 地图组件
│   │   └── level-badge.vue             # 等级徽章组件
│   ├── store/                          # 数据层
│   │   ├── models.js                   # 数据模型定义
│   │   ├── storage.js                  # uni.storage 封装
│   │   ├── shop-store.js               # 店铺数据操作
│   │   ├── record-store.js             # 战绩数据操作
│   │   └── settings-store.js           # 设置数据操作
│   ├── utils/                          # 工具函数
│   │   ├── score.js                    # 战斗力评分算法
│   │   ├── level.js                    # 等级计算
│   │   ├── receipt-renderer.js         # 小票Canvas绘制
│   │   ├── ai-service.js               # AI API 调用
│   │   └── ocr-service.js              # OCR 菜单识别
│   ├── static/                         # 静态资源
│   │   └── images/
│   ├── App.vue
│   ├── main.js
│   ├── manifest.json
│   ├── pages.json                      # 路由配置
│   └── uni.scss
├── tests/                              # 测试
│   ├── unit/
│   │   ├── score.test.js
│   │   ├── level.test.js
│   │   ├── storage.test.js
│   │   └── models.test.js
│   └── e2e/
├── docs/
│   └── superpowers/
│       ├── specs/                      # 设计文档
│       └── plans/                      # 实施计划
├── package.json
├── vite.config.js
└── README.md
```

---

## Task 1: 项目脚手架搭建

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `src/main.js`
- Create: `src/App.vue`
- Create: `src/pages.json`
- Create: `src/manifest.json`
- Create: `src/uni.scss`

- [ ] **Step 1: 初始化 UniApp + Vue 3 项目**

```bash
npx degit dcloudio/uni-preset-vue#vite-ts competitive-eater-app-temp
```

如果 degit 不可用，手动创建项目结构：

```bash
mkdir -p competitive-eater-app/src/{pages,components,store,utils,static/images}
mkdir -p competitive-eater-app/tests/unit
```

- [ ] **Step 2: 创建 package.json**

```json
{
  "name": "competitive-eater-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev:h5": "uni -p h5",
    "dev:mp-weixin": "uni -p mp-weixin",
    "dev:app": "uni -p app",
    "build:h5": "uni build -p h5",
    "build:mp-weixin": "uni build -p mp-weixin",
    "build:app": "uni build -p app",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@dcloudio/uni-app": "3.0.0-4060620250520001",
    "@dcloudio/uni-app-plus": "3.0.0-4060620250520001",
    "@dcloudio/uni-components": "3.0.0-4060620250520001",
    "@dcloudio/uni-h5": "3.0.0-4060620250520001",
    "@dcloudio/uni-mp-weixin": "3.0.0-4060620250520001",
    "vue": "^3.4.0",
    "pinia": "^2.1.0"
  },
  "devDependencies": {
    "@dcloudio/types": "^3.4.0",
    "@dcloudio/uni-automator": "3.0.0-4060620250520001",
    "@dcloudio/uni-cli-shared": "3.0.0-4060620250520001",
    "@dcloudio/vite-plugin-uni": "3.0.0-4060620250520001",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

- [ ] **Step 3: 创建 vite.config.js**

```javascript
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  test: {
    globals: true,
    environment: 'jsdom'
  }
})
```

- [ ] **Step 4: 创建 src/pages.json**

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "大胃王"
      }
    },
    {
      "path": "pages/record/record",
      "style": {
        "navigationBarTitleText": "战绩"
      }
    },
    {
      "path": "pages/record/detail",
      "style": {
        "navigationBarTitleText": "战绩详情"
      }
    },
    {
      "path": "pages/record/shop-records",
      "style": {
        "navigationBarTitleText": "店铺战绩"
      }
    },
    {
      "path": "pages/challenge/select",
      "style": {
        "navigationBarTitleText": "选择店铺"
      }
    },
    {
      "path": "pages/challenge/cooking",
      "style": {
        "navigationBarTitleText": "挑战中",
        "navigationStyle": "custom"
      }
    },
    {
      "path": "pages/challenge/result",
      "style": {
        "navigationBarTitleText": "挑战结果"
      }
    },
    {
      "path": "pages/mine/index",
      "style": {
        "navigationBarTitleText": "我的"
      }
    },
    {
      "path": "pages/mine/shops",
      "style": {
        "navigationBarTitleText": "我的店铺"
      }
    },
    {
      "path": "pages/mine/shop-edit",
      "style": {
        "navigationBarTitleText": "编辑店铺"
      }
    },
    {
      "path": "pages/mine/backup",
      "style": {
        "navigationBarTitleText": "数据备份"
      }
    },
    {
      "path": "pages/mine/settings",
      "style": {
        "navigationBarTitleText": "设置"
      }
    }
  ],
  "tabBar": {
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "static/images/tab-home.png",
        "selectedIconPath": "static/images/tab-home-active.png"
      },
      {
        "pagePath": "pages/record/record",
        "text": "战绩",
        "iconPath": "static/images/tab-record.png",
        "selectedIconPath": "static/images/tab-record-active.png"
      },
      {
        "pagePath": "pages/challenge/select",
        "text": "挑战",
        "iconPath": "static/images/tab-challenge.png",
        "selectedIconPath": "static/images/tab-challenge-active.png"
      },
      {
        "pagePath": "pages/mine/index",
        "text": "我的",
        "iconPath": "static/images/tab-mine.png",
        "selectedIconPath": "static/images/tab-mine-active.png"
      }
    ]
  },
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarBackgroundColor": "#FFFFFF",
    "backgroundColor": "#F5F5F5"
  }
}
```

- [ ] **Step 5: 创建 src/main.js**

```javascript
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  app.use(pinia)
  return { app }
}
```

- [ ] **Step 6: 创建 src/App.vue**

```vue
<script setup>
import { onLaunch } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('大胃王APP 启动')
})
</script>

<style>
page {
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
```

- [ ] **Step 7: 安装依赖并验证项目启动**

```bash
npm install
npm run dev:h5
```

Expected: 浏览器打开后能看到 UniApp 默认页面

- [ ] **Step 8: 提交**

```bash
git add .
git commit -m "chore: 初始化 UniApp + Vue 3 项目脚手架"
```

---

## Task 2: 数据层 - 模型定义与存储封装

**Files:**
- Create: `src/store/models.js`
- Create: `src/store/storage.js`
- Create: `tests/unit/models.test.js`
- Create: `tests/unit/storage.test.js`

- [ ] **Step 1: 编写数据模型测试**

```javascript
// tests/unit/models.test.js
import { describe, it, expect } from 'vitest'
import { createShop, createTier, createMenuItem, createRecord, createRecordItem } from '../src/store/models'

describe('数据模型', () => {
  it('createShop 创建店铺对象', () => {
    const shop = createShop({ name: 'XX自助', category: '自助餐', city: '北京' })
    expect(shop.id).toBeDefined()
    expect(shop.name).toBe('XX自助')
    expect(shop.hasTiers).toBe(false)
    expect(shop.tiers).toEqual([])
    expect(shop.menu).toEqual([])
    expect(shop.mealTimeLimit).toBe(90)
  })

  it('createTier 创建档位对象', () => {
    const tier = createTier({ shopId: 's1', name: '豪华档' })
    expect(tier.id).toBeDefined()
    expect(tier.shopId).toBe('s1')
    expect(tier.name).toBe('豪华档')
    expect(tier.menu).toEqual([])
  })

  it('createMenuItem 创建菜单项', () => {
    const item = createMenuItem({ shopId: 's1', name: '肥牛卷', category: '肉类', unit: '盘' })
    expect(item.id).toBeDefined()
    expect(item.shopId).toBe('s1')
    expect(item.tierId).toBe('')
    expect(item.category).toBe('肉类')
  })

  it('createRecord 创建战绩记录', () => {
    const record = createRecord({ shopId: 's1', shopName: 'XX自助' })
    expect(record.id).toBeDefined()
    expect(record.shopId).toBe('s1')
    expect(record.status).toBe('进行中')
    expect(record.items).toEqual([])
    expect(record.score).toBe(0)
  })

  it('createRecordItem 创建点餐明细', () => {
    const item = createRecordItem({ menuItemId: 'm1', name: '肥牛卷', category: '肉类', quantity: 2, unit: '盘' })
    expect(item.menuItemId).toBe('m1')
    expect(item.quantity).toBe(2)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npm test -- tests/unit/models.test.js
```

Expected: FAIL - 模块不存在

- [ ] **Step 3: 实现数据模型**

```javascript
// src/store/models.js
let idCounter = Date.now()
function generateId() {
  return (++idCounter).toString(36)
}

export function createShop({ name, category = '自助餐', city = '', address = '', mealTimeLimit = 90, location = null }) {
  return {
    id: generateId(),
    name,
    address,
    category,
    city,
    location,
    mealTimeLimit,
    hasTiers: false,
    tiers: [],
    menu: [],
    createdAt: new Date().toISOString()
  }
}

export function createTier({ shopId, name }) {
  return {
    id: generateId(),
    shopId,
    name,
    menu: []
  }
}

export function createMenuItem({ shopId, tierId = '', name, category, unit }) {
  return {
    id: generateId(),
    shopId,
    tierId,
    name,
    category,
    unit
  }
}

export function createRecord({ shopId, shopName, tierId = '', tierName = '' }) {
  return {
    id: generateId(),
    shopId,
    shopName,
    tierId,
    tierName,
    startTime: new Date().toISOString(),
    endTime: null,
    duration: 0,
    status: '进行中',
    items: [],
    score: 0,
    createdAt: new Date().toISOString()
  }
}

export function createRecordItem({ menuItemId, name, category, quantity, unit }) {
  return {
    menuItemId,
    name,
    category,
    quantity,
    unit
  }
}
```

- [ ] **Step 4: 运行测试确认通过**

```bash
npm test -- tests/unit/models.test.js
```

Expected: PASS

- [ ] **Step 5: 编写存储封装测试**

```javascript
// tests/unit/storage.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock uni.storage
const storage = {}
global.uni = {
  setStorageSync: vi.fn((key, value) => { storage[key] = JSON.stringify(value) }),
  getStorageSync: vi.fn((key) => {
    const val = storage[key]
    return val ? JSON.parse(val) : null
  }),
  removeStorageSync: vi.fn((key) => { delete storage[key] })
}

import { Storage } from '../src/store/storage'

describe('Storage 封装', () => {
  let store

  beforeEach(() => {
    Object.keys(storage).forEach(k => delete storage[k])
    store = new Storage('test')
  })

  it('getAll 返回空数组当无数据时', () => {
    expect(store.getAll()).toEqual([])
  })

  it('save 和 getAll 正确存取数据', () => {
    const item = { id: '1', name: '测试' }
    store.save(item)
    expect(store.getAll()).toEqual([item])
  })

  it('getById 正确查找', () => {
    store.save({ id: '1', name: 'A' })
    store.save({ id: '2', name: 'B' })
    expect(store.getById('2')).toEqual({ id: '2', name: 'B' })
  })

  it('update 正确更新', () => {
    store.save({ id: '1', name: 'A' })
    store.update('1', { name: 'B' })
    expect(store.getById('1').name).toBe('B')
  })

  it('remove 正确删除', () => {
    store.save({ id: '1', name: 'A' })
    store.remove('1')
    expect(store.getAll()).toEqual([])
  })
})
```

- [ ] **Step 6: 运行测试确认失败**

```bash
npm test -- tests/unit/storage.test.js
```

Expected: FAIL

- [ ] **Step 7: 实现存储封装**

```javascript
// src/store/storage.js
export class Storage {
  constructor(key) {
    this.key = `eater_${key}`
  }

  getAll() {
    try {
      return uni.getStorageSync(this.key) || []
    } catch {
      return []
    }
  }

  getById(id) {
    return this.getAll().find(item => item.id === id) || null
  }

  save(item) {
    const list = this.getAll()
    list.push(item)
    uni.setStorageSync(this.key, list)
  }

  update(id, updates) {
    const list = this.getAll()
    const index = list.findIndex(item => item.id === id)
    if (index !== -1) {
      list[index] = { ...list[index], ...updates }
      uni.setStorageSync(this.key, list)
    }
  }

  remove(id) {
    const list = this.getAll().filter(item => item.id !== id)
    uni.setStorageSync(this.key, list)
  }

  clear() {
    uni.removeStorageSync(this.key)
  }

  exportAll() {
    return JSON.stringify(this.getAll(), null, 2)
  }

  importAll(jsonString) {
    const data = JSON.parse(jsonString)
    uni.setStorageSync(this.key, data)
  }
}
```

- [ ] **Step 8: 运行测试确认通过**

```bash
npm test -- tests/unit/storage.test.js
```

Expected: PASS

- [ ] **Step 9: 提交**

```bash
git add src/store/models.js src/store/storage.js tests/unit/
git commit -m "feat: 数据模型定义与 uni.storage 封装"
```

---

## Task 3: 数据层 - 业务 Store

**Files:**
- Create: `src/store/shop-store.js`
- Create: `src/store/record-store.js`
- Create: `src/store/settings-store.js`

- [ ] **Step 1: 实现店铺 Store**

```javascript
// src/store/shop-store.js
import { Storage } from './storage'
import { createShop, createTier, createMenuItem } from './models'

const shopStorage = new Storage('shops')

export const shopStore = {
  getAll() {
    return shopStorage.getAll()
  },

  getById(id) {
    return shopStorage.getById(id)
  },

  create(shopData) {
    const shop = createShop(shopData)
    shopStorage.save(shop)
    return shop
  },

  update(id, updates) {
    shopStorage.update(id, updates)
  },

  remove(id) {
    shopStorage.remove(id)
  },

  search(keyword) {
    const all = shopStorage.getAll()
    if (!keyword) return all
    const kw = keyword.toLowerCase()
    return all.filter(s =>
      s.name.toLowerCase().includes(kw) ||
      s.city.toLowerCase().includes(kw)
    )
  },

  getByCity(city) {
    return shopStorage.getAll().filter(s => s.city === city)
  },

  // 档位管理
  addTier(shopId, tierName) {
    const shop = shopStorage.getById(shopId)
    if (!shop) return null
    const tier = createTier({ shopId, name: tierName })
    shop.tiers = [...shop.tiers, tier]
    shop.hasTiers = true
    shopStorage.update(shopId, { tiers: shop.tiers, hasTiers: true })
    return tier
  },

  removeTier(shopId, tierId) {
    const shop = shopStorage.getById(shopId)
    if (!shop) return
    shop.tiers = shop.tiers.filter(t => t.id !== tierId)
    if (shop.tiers.length === 0) shop.hasTiers = false
    shopStorage.update(shopId, { tiers: shop.tiers, hasTiers: shop.hasTiers })
  },

  updateTier(shopId, tierId, updates) {
    const shop = shopStorage.getById(shopId)
    if (!shop) return
    shop.tiers = shop.tiers.map(t => t.id === tierId ? { ...t, ...updates } : t)
    shopStorage.update(shopId, { tiers: shop.tiers })
  },

  // 菜单管理
  addMenuItem(shopId, itemData, tierId = null) {
    const shop = shopStorage.getById(shopId)
    if (!shop) return null
    const item = createMenuItem({ ...itemData, shopId, tierId: tierId || '' })
    if (tierId) {
      shop.tiers = shop.tiers.map(t => {
        if (t.id === tierId) return { ...t, menu: [...t.menu, item] }
        return t
      })
      shopStorage.update(shopId, { tiers: shop.tiers })
    } else {
      shop.menu = [...shop.menu, item]
      shopStorage.update(shopId, { menu: shop.menu })
    }
    return item
  },

  removeMenuItem(shopId, itemId, tierId = null) {
    const shop = shopStorage.getById(shopId)
    if (!shop) return
    if (tierId) {
      shop.tiers = shop.tiers.map(t => {
        if (t.id === tierId) return { ...t, menu: t.menu.filter(m => m.id !== itemId) }
        return t
      })
      shopStorage.update(shopId, { tiers: shop.tiers })
    } else {
      shop.menu = shop.menu.filter(m => m.id !== itemId)
      shopStorage.update(shopId, { menu: shop.menu })
    }
  },

  updateMenuItem(shopId, itemId, updates, tierId = null) {
    const shop = shopStorage.getById(shopId)
    if (!shop) return
    if (tierId) {
      shop.tiers = shop.tiers.map(t => {
        if (t.id === tierId) return { ...t, menu: t.menu.map(m => m.id === itemId ? { ...m, ...updates } : m) }
        return t
      })
      shopStorage.update(shopId, { tiers: shop.tiers })
    } else {
      shop.menu = shop.menu.map(m => m.id === itemId ? { ...m, ...updates } : m)
      shopStorage.update(shopId, { menu: shop.menu })
    }
  },

  getMenu(shopId, tierId = null) {
    const shop = shopStorage.getById(shopId)
    if (!shop) return []
    if (tierId) {
      const tier = shop.tiers.find(t => t.id === tierId)
      return tier ? tier.menu : []
    }
    return shop.menu
  },

  batchAddMenuItems(shopId, items, tierId = null) {
    items.forEach(itemData => {
      this.addMenuItem(shopId, itemData, tierId)
    })
  }
}
```

- [ ] **Step 2: 实现战绩 Store**

```javascript
// src/store/record-store.js
import { Storage } from './storage'
import { createRecord, createRecordItem } from './models'

const recordStorage = new Storage('records')

export const recordStore = {
  getAll() {
    return recordStorage.getAll()
  },

  getById(id) {
    return recordStorage.getById(id)
  },

  getByShopId(shopId) {
    return recordStorage.getAll()
      .filter(r => r.shopId === shopId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },

  create(recordData) {
    const record = createRecord(recordData)
    recordStorage.save(record)
    return record
  },

  addItem(recordId, itemData) {
    const record = recordStorage.getById(recordId)
    if (!record || record.status !== '进行中') return
    const item = createRecordItem(itemData)
    const existingIndex = record.items.findIndex(
      i => i.menuItemId === item.menuItemId
    )
    if (existingIndex !== -1) {
      record.items[existingIndex].quantity += item.quantity
    } else {
      record.items.push(item)
    }
    recordStorage.update(recordId, { items: record.items })
  },

  updateItemQuantity(recordId, menuItemId, quantity) {
    const record = recordStorage.getById(recordId)
    if (!record || record.status !== '进行中') return
    if (quantity <= 0) {
      record.items = record.items.filter(i => i.menuItemId !== menuItemId)
    } else {
      record.items = record.items.map(i =>
        i.menuItemId === menuItemId ? { ...i, quantity } : i
      )
    }
    recordStorage.update(recordId, { items: record.items })
  },

  finish(recordId, score) {
    const now = new Date().toISOString()
    const record = recordStorage.getById(recordId)
    if (!record) return
    const duration = Math.round((new Date(now) - new Date(record.startTime)) / 60000)
    recordStorage.update(recordId, {
      endTime: now,
      duration,
      status: '已完成',
      score
    })
  },

  remove(recordId) {
    recordStorage.remove(recordId)
  },

  getStats() {
    const all = recordStorage.getAll()
    const completed = all.filter(r => r.status === '已完成')
    if (completed.length === 0) {
      return { totalRecords: 0, maxScore: 0, shopCount: 0, categoryTotals: {} }
    }
    const maxScore = Math.max(...completed.map(r => r.score))
    const shopIds = new Set(completed.map(r => r.shopId))
    const categoryTotals = {}
    completed.forEach(r => {
      r.items.forEach(item => {
        if (!categoryTotals[item.category]) categoryTotals[item.category] = 0
        categoryTotals[item.category] += item.quantity
      })
    })
    return {
      totalRecords: completed.length,
      maxScore,
      shopCount: shopIds.size,
      categoryTotals
    }
  },

  getBestByShop(shopId) {
    const records = this.getByShopId(shopId)
    if (records.length === 0) return null
    return records.reduce((best, r) => r.score > best.score ? r : best)
  },

  exportAll() {
    return recordStorage.exportAll()
  },

  importAll(jsonString) {
    recordStorage.importAll(jsonString)
  }
}
```

- [ ] **Step 3: 实现设置 Store**

```javascript
// src/store/settings-store.js
const SETTINGS_KEY = 'eater_settings'

const defaultSettings = {
  defaultCity: '',
  mapRange: '城市',
  countdownWarning: true,
  longPressInput: true,
  aiServiceUrl: '',
  aiApiKey: ''
}

export const settingsStore = {
  get() {
    try {
      return { ...defaultSettings, ...(uni.getStorageSync(SETTINGS_KEY) || {}) }
    } catch {
      return { ...defaultSettings }
    }
  },

  update(updates) {
    const current = this.get()
    uni.setStorageSync(SETTINGS_KEY, { ...current, ...updates })
  },

  reset() {
    uni.setStorageSync(SETTINGS_KEY, { ...defaultSettings })
  }
}
```

- [ ] **Step 4: 提交**

```bash
git add src/store/
git commit -m "feat: 店铺、战绩、设置业务 Store"
```

---

## Task 4: 工具函数 - 评分算法与等级系统

**Files:**
- Create: `src/utils/score.js`
- Create: `src/utils/level.js`
- Create: `tests/unit/score.test.js`
- Create: `tests/unit/level.test.js`

- [ ] **Step 1: 编写评分算法测试**

```javascript
// tests/unit/score.test.js
import { describe, it, expect } from 'vitest'
import { calculateScore } from '../src/utils/score'

describe('战斗力评分', () => {
  it('空战绩返回0', () => {
    expect(calculateScore([])).toBe(0)
  })

  it('单分类单菜品正确计算', () => {
    const items = [{ category: '肉类', quantity: 3 }]
    // 3*3 + 20 = 29
    expect(calculateScore(items)).toBe(29)
  })

  it('多分类多菜品正确计算', () => {
    const items = [
      { category: '肉类', quantity: 5 },
      { category: '海鲜', quantity: 3 },
      { category: '主食', quantity: 2 },
      { category: '饮料', quantity: 1 }
    ]
    // 5*3 + 3*3 + 2*2 + 1*1 + 4*20 = 15+9+4+1+80 = 109
    expect(calculateScore(items)).toBe(109)
  })

  it('同分类多个菜品累加', () => {
    const items = [
      { category: '肉类', quantity: 2 },
      { category: '肉类', quantity: 3 }
    ]
    // (2+3)*3 + 1*20 = 35
    expect(calculateScore(items)).toBe(35)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npm test -- tests/unit/score.test.js
```

Expected: FAIL

- [ ] **Step 3: 实现评分算法**

```javascript
// src/utils/score.js
const CATEGORY_WEIGHTS = {
  '肉类': 3,
  '海鲜': 3,
  '主食': 2,
  '甜点': 2,
  '饮料': 1,
  '其他': 1
}

const CATEGORY_BONUS = 20

export function calculateScore(items) {
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

  const categoryCount = Object.keys(categoryTotals).length
  score += categoryCount * CATEGORY_BONUS

  return Math.round(score)
}
```

- [ ] **Step 4: 运行测试确认通过**

```bash
npm test -- tests/unit/score.test.js
```

Expected: PASS

- [ ] **Step 5: 编写等级系统测试**

```javascript
// tests/unit/level.test.js
import { describe, it, expect } from 'vitest'
import { getLevel, getLevelName, LEVELS } from '../src/utils/level'

describe('等级系统', () => {
  it('0分是青铜', () => {
    const level = getLevel(0)
    expect(level.name).toBe('青铜')
    expect(level.tier).toBe(1)
  })

  it('49分是青铜', () => {
    expect(getLevel(49).name).toBe('青铜')
  })

  it('50分是白银', () => {
    expect(getLevel(50).name).toBe('白银')
  })

  it('100分是黄金', () => {
    expect(getLevel(100).name).toBe('黄金')
  })

  it('200分是铂金', () => {
    expect(getLevel(200).name).toBe('铂金')
  })

  it('350分是钻石', () => {
    expect(getLevel(350).name).toBe('钻石')
  })

  it('500分是星耀', () => {
    expect(getLevel(500).name).toBe('星耀')
  })

  it('800分是王者', () => {
    expect(getLevel(800).name).toBe('王者')
  })

  it('getLevelName 返回正确名称', () => {
    expect(getLevelName(150)).toBe('黄金')
  })

  it('LEVELS 包含7个等级', () => {
    expect(LEVELS).toHaveLength(7)
  })
})
```

- [ ] **Step 6: 运行测试确认失败**

```bash
npm test -- tests/unit/level.test.js
```

Expected: FAIL

- [ ] **Step 7: 实现等级系统**

```javascript
// src/utils/level.js
export const LEVELS = [
  { tier: 1, name: '青铜', min: 0, max: 49, icon: '🥉' },
  { tier: 2, name: '白银', min: 50, max: 99, icon: '🥈' },
  { tier: 3, name: '黄金', min: 100, max: 199, icon: '🥇' },
  { tier: 4, name: '铂金', min: 200, max: 349, icon: '💎' },
  { tier: 5, name: '钻石', min: 350, max: 499, icon: '💠' },
  { tier: 6, name: '星耀', min: 500, max: 799, icon: '⭐' },
  { tier: 7, name: '王者', min: 800, max: Infinity, icon: '👑' }
]

export function getLevel(score) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (score >= LEVELS[i].min) return LEVELS[i]
  }
  return LEVELS[0]
}

export function getLevelName(score) {
  return getLevel(score).name
}
```

- [ ] **Step 8: 运行测试确认通过**

```bash
npm test -- tests/unit/level.test.js
```

Expected: PASS

- [ ] **Step 9: 提交**

```bash
git add src/utils/score.js src/utils/level.js tests/unit/
git commit -m "feat: 战斗力评分算法与大胃王等级系统"
```

---

## Task 5: 店铺管理页面

> **Design Skill Required:** 本任务涉及页面设计，实施前必须调用 `frontend-design` 技能获取设计方案。

**Files:**
- Create: `src/pages/mine/index.vue`
- Create: `src/pages/mine/shops.vue`
- Create: `src/pages/mine/shop-edit.vue`
- Create: `src/components/tier-picker.vue`

- [ ] **Step 1: 实现"我的"页面**

```vue
<!-- src/pages/mine/index.vue -->
<template>
  <view class="mine-page">
    <view class="profile-card">
      <view class="avatar">{{ level.icon }}</view>
      <view class="info">
        <text class="nickname">{{ nickname }}</text>
        <text class="level">大胃王等级：{{ level.name }}</text>
        <text class="score">最高战斗力：{{ maxScore }}</text>
      </view>
    </view>
    <view class="menu-list">
      <view class="menu-item" @tap="goTo('/pages/mine/shops')">
        <text>📋 我的店铺</text>
        <text class="arrow">></text>
      </view>
      <view class="menu-item" @tap="goTo('/pages/mine/backup')">
        <text>📦 数据备份</text>
        <text class="arrow">></text>
      </view>
      <view class="menu-item" @tap="goTo('/pages/mine/settings')">
        <text>⚙️ 设置</text>
        <text class="arrow">></text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onShow } from '@dcloudio/uni-app'
import { recordStore } from '../../store/record-store'
import { getLevel } from '../../utils/level'

const nickname = ref('大胃王')
const maxScore = ref(0)
const level = ref(getLevel(0))

onShow(() => {
  const stats = recordStore.getStats()
  maxScore.value = stats.maxScore
  level.value = getLevel(stats.maxScore)
})

function goTo(url) {
  uni.navigateTo({ url })
}
</script>

<style scoped>
.mine-page { padding: 20rpx; }
.profile-card {
  display: flex; align-items: center; padding: 30rpx;
  background: #fff; border-radius: 16rpx; margin-bottom: 20rpx;
}
.avatar { font-size: 60rpx; margin-right: 20rpx; }
.info { display: flex; flex-direction: column; }
.nickname { font-size: 36rpx; font-weight: bold; }
.level { font-size: 28rpx; color: #666; margin-top: 8rpx; }
.score { font-size: 28rpx; color: #999; margin-top: 4rpx; }
.menu-list { background: #fff; border-radius: 16rpx; }
.menu-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 30rpx; border-bottom: 1rpx solid #f0f0f0;
}
.arrow { color: #ccc; }
</style>
```

- [ ] **Step 2: 实现店铺管理列表页**

```vue
<!-- src/pages/mine/shops.vue -->
<template>
  <view class="shops-page">
    <view class="header">
      <input class="search" v-model="keyword" placeholder="搜索店铺..." @input="onSearch" />
      <view class="add-btn" @tap="addShop">+ 新增</view>
    </view>
    <view class="shop-list">
      <view class="shop-card" v-for="shop in filteredShops" :key="shop.id">
        <view class="shop-info">
          <text class="shop-name">{{ shop.name }}</text>
          <text class="shop-meta">
            时限 {{ shop.mealTimeLimit }}分钟
            <template v-if="shop.hasTiers"> · {{ shop.tiers.length }}档位</template>
            · 菜品 {{ getMenuCount(shop) }}道
          </text>
        </view>
        <view class="shop-actions">
          <text class="action" @tap="editShop(shop.id)">编辑</text>
          <text class="action delete" @tap="deleteShop(shop.id)">删除</text>
        </view>
      </view>
      <view v-if="filteredShops.length === 0" class="empty">暂无店铺，点击右上角新增</view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onShow } from '@dcloudio/uni-app'
import { shopStore } from '../../store/shop-store'

const keyword = ref('')
const shops = ref([])

onShow(() => { shops.value = shopStore.getAll() })

const filteredShops = computed(() => {
  if (!keyword.value) return shops.value
  return shops.value.filter(s =>
    s.name.toLowerCase().includes(keyword.value.toLowerCase())
  )
})

function getMenuCount(shop) {
  if (shop.hasTiers) {
    return shop.tiers.reduce((sum, t) => sum + t.menu.length, 0)
  }
  return shop.menu.length
}

function onSearch() { /* computed 自动响应 */ }

function addShop() {
  uni.navigateTo({ url: '/pages/mine/shop-edit' })
}

function editShop(id) {
  uni.navigateTo({ url: `/pages/mine/shop-edit?id=${id}` })
}

function deleteShop(id) {
  uni.showModal({
    title: '确认删除',
    content: '删除后相关战绩数据不会丢失，但无法再新增该店铺的挑战记录',
    success: (res) => {
      if (res.confirm) {
        shopStore.remove(id)
        shops.value = shopStore.getAll()
      }
    }
  })
}
</script>

<style scoped>
.shops-page { padding: 20rpx; }
.header { display: flex; gap: 16rpx; margin-bottom: 20rpx; }
.search { flex: 1; padding: 16rpx 20rpx; background: #fff; border-radius: 12rpx; }
.add-btn {
  padding: 16rpx 24rpx; background: #ff6b35; color: #fff;
  border-radius: 12rpx; white-space: nowrap;
}
.shop-card {
  display: flex; justify-content: space-between; align-items: center;
  padding: 24rpx; background: #fff; border-radius: 12rpx; margin-bottom: 16rpx;
}
.shop-name { font-size: 32rpx; font-weight: bold; }
.shop-meta { font-size: 24rpx; color: #999; margin-top: 8rpx; }
.shop-actions { display: flex; gap: 16rpx; }
.action { font-size: 28rpx; color: #007aff; }
.action.delete { color: #ff3b30; }
.empty { text-align: center; padding: 60rpx; color: #999; }
</style>
```

- [ ] **Step 3: 实现新增/编辑店铺页面**

```vue
<!-- src/pages/mine/shop-edit.vue -->
<template>
  <view class="shop-edit-page">
    <view class="form-section">
      <view class="form-item">
        <text class="label">店铺名称</text>
        <input v-model="form.name" placeholder="请输入店铺名称" />
      </view>
      <view class="form-item">
        <text class="label">店铺分类</text>
        <picker :value="categoryIndex" :range="categories" @change="onCategoryChange">
          <text>{{ categories[categoryIndex] }}</text>
        </picker>
      </view>
      <view class="form-item">
        <text class="label">店铺地址</text>
        <input v-model="form.address" placeholder="请输入地址" />
      </view>
      <view class="form-item">
        <text class="label">所在城市</text>
        <input v-model="form.city" placeholder="请输入城市" />
      </view>
      <view class="form-item">
        <text class="label">就餐时限</text>
        <view class="time-input">
          <input v-model.number="form.mealTimeLimit" type="number" />
          <text>分钟</text>
        </view>
      </view>
      <view class="form-item">
        <text class="label">是否分档位</text>
        <switch :checked="form.hasTiers" @change="onTierToggle" />
      </view>
    </view>

    <!-- 无档位：直接显示菜单管理 -->
    <view v-if="!form.hasTiers" class="menu-section">
      <view class="section-header">
        <text class="section-title">菜单管理</text>
        <view class="menu-actions">
          <text class="action-btn" @tap="importMenu()">📷 图片识别</text>
          <text class="action-btn" @tap="addDish()">➕ 手动添加</text>
        </view>
      </view>
      <view v-for="(cat, catName) in groupedMenu" :key="catName" class="category-group">
        <text class="cat-title">{{ catName }}（{{ cat.length }}道）</text>
        <view v-for="item in cat" :key="item.id" class="dish-row">
          <text class="dish-name">{{ item.name }}</text>
          <text class="dish-unit">{{ item.unit }}</text>
          <view class="dish-actions">
            <text @tap="editDish(item)">编辑</text>
            <text class="delete" @tap="deleteDish(item.id)">删除</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 分档位：按档位分组显示菜单管理 -->
    <view v-else class="tier-section">
      <view class="section-header">
        <text class="section-title">档位管理</text>
        <text class="action-btn" @tap="addTier">+ 添加档位</text>
      </view>
      <view v-for="tier in form.tiers" :key="tier.id" class="tier-card">
        <view class="tier-header">
          <input v-model="tier.name" class="tier-name-input" />
          <text class="delete" @tap="deleteTier(tier.id)">删除档位</text>
        </view>
        <view class="menu-actions">
          <text class="action-btn" @tap="importMenu(tier.id)">📷 图片识别</text>
          <text class="action-btn" @tap="addDish(tier.id)">➕ 手动添加</text>
        </view>
        <view v-for="(cat, catName) in groupMenu(tier.menu)" :key="catName" class="category-group">
          <text class="cat-title">{{ catName }}（{{ cat.length }}道）</text>
          <view v-for="item in cat" :key="item.id" class="dish-row">
            <text class="dish-name">{{ item.name }}</text>
            <text class="dish-unit">{{ item.unit }}</text>
            <view class="dish-actions">
              <text @tap="editDish(item, tier.id)">编辑</text>
              <text class="delete" @tap="deleteDish(item.id, tier.id)">删除</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="save-btn" @tap="save">保存店铺</view>
  </view>
</template>

<script setup>
import { ref, computed, onLoad } from '@dcloudio/uni-app'
import { shopStore } from '../../store/shop-store'

const categories = ['自助餐', '火锅', '烧烤', '其他']
const categoryIndex = ref(0)
const isEdit = ref(false)
const shopId = ref('')

const form = ref({
  name: '', address: '', city: '', category: '自助餐',
  mealTimeLimit: 90, hasTiers: false, tiers: [], menu: []
})

onLoad((options) => {
  if (options.id) {
    isEdit.value = true
    shopId.value = options.id
    const shop = shopStore.getById(options.id)
    if (shop) {
      form.value = { ...shop }
      categoryIndex.value = categories.indexOf(shop.category)
    }
  }
})

const groupedMenu = computed(() => groupMenu(form.value.menu))

function groupMenu(menu) {
  const groups = {}
  menu.forEach(item => {
    if (!groups[item.category]) groups[item.category] = []
    groups[item.category].push(item)
  })
  return groups
}

function onCategoryChange(e) {
  categoryIndex.value = e.detail.value
  form.value.category = categories[e.detail.value]
}

function onTierToggle(e) {
  form.value.hasTiers = e.detail.value
  if (form.value.hasTiers && form.value.tiers.length === 0) {
    form.value.tiers = [{ id: Date.now().toString(36), name: '默认档', menu: [] }]
  }
}

function addTier() {
  const name = `档位${form.value.tiers.length + 1}`
  form.value.tiers.push({ id: Date.now().toString(36), name, menu: [] })
}

function deleteTier(tierId) {
  form.value.tiers = form.value.tiers.filter(t => t.id !== tierId)
  if (form.value.tiers.length === 0) form.value.hasTiers = false
}

function addDish(tierId) {
  uni.navigateTo({
    url: `/pages/mine/shop-edit?mode=addDish&shopId=${shopId.value}&tierId=${tierId || ''}`
  })
}

function editDish(item, tierId) {
  uni.navigateTo({
    url: `/pages/mine/shop-edit?mode=editDish&shopId=${shopId.value}&tierId=${tierId || ''}&dishId=${item.id}`
  })
}

function deleteDish(itemId, tierId) {
  if (tierId) {
    const tier = form.value.tiers.find(t => t.id === tierId)
    if (tier) tier.menu = tier.menu.filter(m => m.id !== itemId)
  } else {
    form.value.menu = form.value.menu.filter(m => m.id !== itemId)
  }
}

function importMenu(tierId) {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      // 调用 OCR 服务识别菜单
      ocrService.recognize(res.tempFilePaths[0]).then(items => {
        // 展示识别结果供用户确认
        showOcrResult(items, tierId)
      })
    }
  })
}

function showOcrResult(items, tierId) {
  uni.showModal({
    title: '识别结果',
    content: `识别到 ${items.length} 道菜品，是否导入？`,
    success: (res) => {
      if (res.confirm) {
        if (tierId) {
          const tier = form.value.tiers.find(t => t.id === tierId)
          if (tier) tier.menu.push(...items)
        } else {
          form.value.menu.push(...items)
        }
        uni.showToast({ title: `已导入 ${items.length} 道菜品`, icon: 'success' })
      }
    }
  })
}

function save() {
  if (!form.value.name) {
    uni.showToast({ title: '请输入店铺名称', icon: 'none' })
    return
  }
  if (isEdit.value) {
    shopStore.update(shopId.value, form.value)
  } else {
    shopStore.create(form.value)
  }
  uni.showToast({ title: '保存成功', icon: 'success' })
  setTimeout(() => uni.navigateBack(), 1500)
}
</script>

<style scoped>
.shop-edit-page { padding: 20rpx; }
.form-section { background: #fff; border-radius: 16rpx; padding: 20rpx; margin-bottom: 20rpx; }
.form-item { display: flex; justify-content: space-between; align-items: center; padding: 20rpx 0; border-bottom: 1rpx solid #f0f0f0; }
.label { font-size: 28rpx; color: #333; }
.form-item input { text-align: right; flex: 1; }
.time-input { display: flex; align-items: center; gap: 8rpx; }
.menu-section, .tier-section { background: #fff; border-radius: 16rpx; padding: 20rpx; margin-bottom: 20rpx; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx; }
.section-title { font-size: 32rpx; font-weight: bold; }
.menu-actions { display: flex; gap: 16rpx; }
.action-btn { font-size: 24rpx; color: #007aff; padding: 8rpx 16rpx; border: 1rpx solid #007aff; border-radius: 8rpx; }
.category-group { margin-bottom: 16rpx; }
.cat-title { font-size: 26rpx; color: #666; margin-bottom: 8rpx; }
.dish-row { display: flex; align-items: center; padding: 12rpx 0; }
.dish-name { flex: 1; }
.dish-unit { color: #999; margin-right: 16rpx; }
.dish-actions text { font-size: 24rpx; color: #007aff; margin-left: 16rpx; }
.dish-actions .delete { color: #ff3b30; }
.tier-card { border: 1rpx solid #e0e0e0; border-radius: 12rpx; padding: 16rpx; margin-bottom: 16rpx; }
.tier-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx; }
.tier-name-input { font-size: 30rpx; font-weight: bold; }
.save-btn { background: #ff6b35; color: #fff; text-align: center; padding: 24rpx; border-radius: 12rpx; margin-top: 20rpx; }
</style>
```

- [ ] **Step 4: 实现档位选择弹窗组件**

```vue
<!-- src/components/tier-picker.vue -->
<template>
  <view v-if="visible" class="tier-picker-mask" @tap="close">
    <view class="tier-picker" @tap.stop>
      <text class="picker-title">选择档位</text>
      <view
        v-for="tier in tiers"
        :key="tier.id"
        class="tier-option"
        @tap="select(tier)"
      >
        <text class="tier-name">{{ tier.name }}</text>
        <text class="tier-count">{{ tier.menu.length }}道菜品</text>
      </view>
      <view class="cancel" @tap="close">取消</view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  visible: Boolean,
  tiers: { type: Array, default: () => [] }
})

const emit = defineEmits(['select', 'close'])

function select(tier) { emit('select', tier) }
function close() { emit('close') }
</script>

<style scoped>
.tier-picker-mask {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5); z-index: 999;
  display: flex; align-items: center; justify-content: center;
}
.tier-picker { background: #fff; border-radius: 16rpx; width: 80%; padding: 30rpx; }
.picker-title { font-size: 32rpx; font-weight: bold; text-align: center; margin-bottom: 20rpx; }
.tier-option {
  padding: 24rpx; border-bottom: 1rpx solid #f0f0f0;
  display: flex; justify-content: space-between;
}
.tier-name { font-size: 30rpx; }
.tier-count { font-size: 24rpx; color: #999; }
.cancel { text-align: center; padding: 24rpx; color: #999; margin-top: 16rpx; }
</style>
```

- [ ] **Step 5: 验证页面在浏览器中可访问**

```bash
npm run dev:h5
```

访问"我的"页面，验证店铺管理列表、新增店铺、编辑店铺页面均可正常显示和交互。

- [ ] **Step 6: 提交**

```bash
git add src/pages/mine/ src/components/tier-picker.vue
git commit -m "feat: 我的页面与店铺管理（含档位支持）"
```

---

## Task 6: 挑战流程 - 选店铺与倒计时点菜

> **Design Skill Required:** 本任务涉及页面设计，实施前必须调用 `frontend-design` 技能获取设计方案。

**Files:**
- Create: `src/pages/challenge/select.vue`
- Create: `src/pages/challenge/cooking.vue`
- Create: `src/pages/challenge/result.vue`
- Create: `src/components/category-tabs.vue`
- Create: `src/components/dish-item.vue`

- [ ] **Step 1: 实现选择店铺页面**

```vue
<!-- src/pages/challenge/select.vue -->
<template>
  <view class="select-page">
    <input class="search" v-model="keyword" placeholder="搜索店铺..." />
    <view class="shop-list">
      <view
        v-for="shop in filteredShops"
        :key="shop.id"
        class="shop-card"
        @tap="selectShop(shop)"
      >
        <text class="shop-name">{{ shop.name }}</text>
        <text class="shop-meta">{{ shop.category }} · 时限{{ shop.mealTimeLimit }}分钟</text>
      </view>
      <view v-if="filteredShops.length === 0" class="empty">
        暂无店铺，请先到「我的」中添加
      </view>
    </view>

    <!-- 档位选择弹窗 -->
    <tier-picker
      :visible="showTierPicker"
      :tiers="selectedShop?.tiers || []"
      @select="onTierSelect"
      @close="showTierPicker = false"
    />
  </view>
</template>

<script setup>
import { ref, computed } from '@dcloudio/uni-app'
import { shopStore } from '../../store/shop-store'
import { recordStore } from '../../store/record-store'
import TierPicker from '../../components/tier-picker.vue'

const keyword = ref('')
const shops = ref(shopStore.getAll())
const showTierPicker = ref(false)
const selectedShop = ref(null)

const filteredShops = computed(() => {
  if (!keyword.value) return shops.value
  return shops.value.filter(s =>
    s.name.toLowerCase().includes(keyword.value.toLowerCase())
  )
})

function selectShop(shop) {
  if (shop.hasTiers && shop.tiers.length > 0) {
    selectedShop.value = shop
    showTierPicker.value = true
  } else {
    startChallenge(shop, null)
  }
}

function onTierSelect(tier) {
  showTierPicker.value = false
  startChallenge(selectedShop.value, tier)
}

function startChallenge(shop, tier) {
  uni.showModal({
    title: '开始挑战',
    content: `即将在「${shop.name}」${tier ? '·' + tier.name : ''}开始挑战，就餐时限 ${shop.mealTimeLimit} 分钟，倒计时开始后不可暂停`,
    success: (res) => {
      if (res.confirm) {
        const record = recordStore.create({
          shopId: shop.id,
          shopName: shop.name,
          tierId: tier?.id || '',
          tierName: tier?.name || ''
        })
        uni.redirectTo({
          url: `/pages/challenge/cooking?recordId=${record.id}&shopId=${shop.id}&tierId=${tier?.id || ''}`
        })
      }
    }
  })
}
</script>

<style scoped>
.select-page { padding: 20rpx; }
.search { padding: 16rpx 20rpx; background: #fff; border-radius: 12rpx; margin-bottom: 20rpx; }
.shop-card { padding: 24rpx; background: #fff; border-radius: 12rpx; margin-bottom: 16rpx; }
.shop-name { font-size: 32rpx; font-weight: bold; }
.shop-meta { font-size: 24rpx; color: #999; margin-top: 8rpx; }
.empty { text-align: center; padding: 60rpx; color: #999; }
</style>
```

- [ ] **Step 2: 实现分类 Tab 组件**

```vue
<!-- src/components/category-tabs.vue -->
<template>
  <view class="category-tabs">
    <view
      v-for="cat in categories"
      :key="cat"
      class="tab-item"
      :class="{ active: modelValue === cat }"
      @tap="$emit('update:modelValue', cat)"
    >
      <text>{{ cat }}</text>
    </view>
  </view>
</template>

<script setup>
defineProps({
  categories: { type: Array, default: () => [] },
  modelValue: { type: String, default: '' }
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.category-tabs {
  width: 160rpx; background: #f5f5f5;
  display: flex; flex-direction: column;
}
.tab-item {
  padding: 24rpx 16rpx; text-align: center;
  font-size: 28rpx; color: #666;
}
.tab-item.active {
  background: #fff; color: #ff6b35; font-weight: bold;
  border-left: 4rpx solid #ff6b35;
}
</style>
```

- [ ] **Step 3: 实现菜品行组件**

```vue
<!-- src/components/dish-item.vue -->
<template>
  <view class="dish-item">
    <text class="dish-name">{{ item.name }}</text>
    <text class="dish-unit">{{ item.unit }}</text>
    <view class="quantity-control">
      <view class="btn minus" @tap="decrease">-</view>
      <text class="quantity" @longpress="inputQuantity">{{ quantity }}</text>
      <view class="btn plus" @tap="increase">+</view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  item: { type: Object, required: true },
  initialQuantity: { type: Number, default: 0 }
})

const emit = defineEmits(['update'])
const quantity = ref(props.initialQuantity)

watch(() => props.initialQuantity, (val) => { quantity.value = val })

function increase() {
  quantity.value += 1
  emit('update', quantity.value)
}

function decrease() {
  if (quantity.value > 0) {
    quantity.value -= 1
    emit('update', quantity.value)
  }
}

function inputQuantity() {
  uni.showModal({
    title: '输入数量',
    editable: true,
    placeholderText: '支持小数，如 0.5',
    success: (res) => {
      if (res.confirm && res.content) {
        const val = parseFloat(res.content)
        if (!isNaN(val) && val >= 0) {
          quantity.value = val
          emit('update', quantity.value)
        }
      }
    }
  })
}
</script>

<style scoped>
.dish-item {
  display: flex; align-items: center; padding: 16rpx 20rpx;
  border-bottom: 1rpx solid #f5f5f5;
}
.dish-name { flex: 1; font-size: 28rpx; }
.dish-unit { font-size: 24rpx; color: #999; margin-right: 16rpx; }
.quantity-control { display: flex; align-items: center; }
.btn {
  width: 56rpx; height: 56rpx; display: flex; align-items: center; justify-content: center;
  border-radius: 50%; font-size: 32rpx;
}
.btn.minus { background: #f0f0f0; color: #666; }
.btn.plus { background: #ff6b35; color: #fff; }
.quantity { min-width: 60rpx; text-align: center; font-size: 30rpx; font-weight: bold; }
</style>
```

- [ ] **Step 4: 实现点菜界面（核心挑战页面）**

```vue
<!-- src/pages/challenge/cooking.vue -->
<template>
  <view class="cooking-page">
    <!-- 自定义导航栏：倒计时 -->
    <view class="navbar" :class="{ warning: isWarning }">
      <text class="timer">{{ formatTime(remainingSeconds) }}</text>
      <view class="end-btn" @tap="endChallenge">结束挑战</view>
    </view>
    <view class="shop-info">
      <text>{{ shopName }}{{ tierName ? ' · ' + tierName : '' }}</text>
    </view>

    <!-- 点菜区域 -->
    <view class="order-area">
      <category-tabs
        :categories="categories"
        v-model="activeCategory"
      />
      <view class="dish-list">
        <dish-item
          v-for="dish in currentDishes"
          :key="dish.id"
          :item="dish"
          :initialQuantity="getQuantity(dish.id)"
          @update="(qty) => updateQuantity(dish, qty)"
        />
      </view>
    </view>

    <!-- 底部汇总 -->
    <view class="summary">
      <text>已选 {{ totalItems }} 道菜 · 覆盖 {{ totalCategories }} 类</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from '@dcloudio/uni-app'
import { shopStore } from '../../store/shop-store'
import { recordStore } from '../../store/record-store'
import { calculateScore } from '../../utils/score'
import CategoryTabs from '../../components/category-tabs.vue'
import DishItem from '../../components/dish-item.vue'

const recordId = ref('')
const shopId = ref('')
const tierId = ref('')
const shopName = ref('')
const tierName = ref('')
const menu = ref([])
const activeCategory = ref('')
const orderMap = ref({})  // { menuItemId: quantity }
const remainingSeconds = ref(0)
let timer = null

onMounted(() => {
  const pages = getCurrentPages()
  const page = pages[pages.length - 1]
  recordId.value = page.options.recordId || page.$page?.options?.recordId
  shopId.value = page.options.shopId || page.$page?.options?.shopId
  tierId.value = page.options.tierId || page.$page?.options?.tierId

  const shop = shopStore.getById(shopId.value)
  if (shop) {
    shopName.value = shop.name
    menu.value = shopStore.getMenu(shopId.value, tierId.value || null)
    remainingSeconds.value = shop.mealTimeLimit * 60
    if (menu.value.length > 0) {
      activeCategory.value = menu.value[0].category
    }
  }

  const record = recordStore.getById(recordId.value)
  if (record && record.tierName) tierName.value = record.tierName

  startTimer()
})

onUnmounted(() => { clearInterval(timer) })

function startTimer() {
  timer = setInterval(() => {
    if (remainingSeconds.value > 0) {
      remainingSeconds.value--
    } else {
      clearInterval(timer)
      endChallenge()
    }
  }, 1000)
}

const isWarning = computed(() => remainingSeconds.value < 300)

const categories = computed(() => {
  const cats = new Set(menu.value.map(d => d.category))
  return [...cats]
})

const currentDishes = computed(() => {
  return menu.value.filter(d => d.category === activeCategory.value)
})

const totalItems = computed(() => {
  return Object.values(orderMap.value).filter(q => q > 0).length
})

const totalCategories = computed(() => {
  const cats = new Set()
  menu.value.forEach(d => {
    if (orderMap.value[d.id] > 0) cats.add(d.category)
  })
  return cats.size
})

function getQuantity(menuItemId) {
  return orderMap.value[menuItemId] || 0
}

function updateQuantity(dish, quantity) {
  orderMap.value = { ...orderMap.value, [dish.id]: quantity }
  recordStore.updateItemQuantity(recordId.value, dish.id, quantity)
  if (quantity > 0 && !recordStore.getById(recordId.value)?.items.find(i => i.menuItemId === dish.id)) {
    recordStore.addItem(recordId.value, {
      menuItemId: dish.id,
      name: dish.name,
      category: dish.category,
      quantity,
      unit: dish.unit
    })
  }
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function endChallenge() {
  clearInterval(timer)
  const record = recordStore.getById(recordId.value)
  if (!record) return
  const score = calculateScore(record.items)
  recordStore.finish(recordId.value, score)
  uni.redirectTo({ url: `/pages/challenge/result?recordId=${recordId.value}` })
}
</script>

<style scoped>
.cooking-page { display: flex; flex-direction: column; height: 100vh; }
.navbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20rpx 30rpx; background: #fff;
}
.navbar.warning { background: #fff3f3; }
.timer { font-size: 48rpx; font-weight: bold; color: #333; }
.navbar.warning .timer { color: #ff3b30; }
.end-btn {
  padding: 12rpx 24rpx; background: #ff3b30; color: #fff;
  border-radius: 8rpx; font-size: 28rpx;
}
.shop-info { padding: 12rpx 30rpx; background: #f9f9f9; font-size: 24rpx; color: #666; }
.order-area { flex: 1; display: flex; overflow: hidden; }
.dish-list { flex: 1; overflow-y: auto; background: #fff; }
.summary {
  padding: 20rpx; background: #fff; text-align: center;
  font-size: 28rpx; color: #666; border-top: 1rpx solid #f0f0f0;
}
</style>
```

- [ ] **Step 5: 实现挑战结果页面**

```vue
<!-- src/pages/challenge/result.vue -->
<template>
  <view class="result-page">
    <view class="result-header">
      <text class="shop-name">{{ record.shopName }}{{ record.tierName ? ' · ' + record.tierName : '' }}</text>
      <text class="score">战斗力 {{ record.score }} ⭐</text>
      <text class="duration">时长 {{ record.duration }}分钟</text>
    </view>

    <!-- 分类食量雷达图 -->
    <view class="chart-section">
      <radar-chart :data="categoryData" />
    </view>

    <!-- 点餐明细 -->
    <view class="detail-section">
      <text class="section-title">点餐明细</text>
      <view v-for="(cat, catName) in groupedItems" :key="catName" class="cat-group">
        <text class="cat-name">{{ catName }}</text>
        <view v-for="item in cat" :key="item.menuItemId" class="item-row">
          <text>{{ item.name }}</text>
          <text>{{ item.quantity }}{{ item.unit }}</text>
        </view>
      </view>
    </view>

    <view class="actions">
      <view class="action-btn" @tap="generateReceipt">生成小票</view>
      <view class="action-btn" @tap="generatePoster">AI生成海报</view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onLoad } from '@dcloudio/uni-app'
import { recordStore } from '../../store/record-store'
import RadarChart from '../../components/radar-chart.vue'

const record = ref({})

onLoad((options) => {
  record.value = recordStore.getById(options.recordId)
})

const categoryData = computed(() => {
  if (!record.value.items) return {}
  const data = {}
  record.value.items.forEach(item => {
    if (!data[item.category]) data[item.category] = 0
    data[item.category] += item.quantity
  })
  return data
})

const groupedItems = computed(() => {
  if (!record.value.items) return {}
  const groups = {}
  record.value.items.forEach(item => {
    if (!groups[item.category]) groups[item.category] = []
    groups[item.category].push(item)
  })
  return groups
})

function generateReceipt() {
  // 跳转到小票预览页或直接调用 Canvas 生成
  uni.navigateTo({ url: `/pages/record/detail?id=${record.value.id}&action=receipt` })
}

function generatePoster() {
  uni.navigateTo({ url: `/pages/record/detail?id=${record.value.id}&action=poster` })
}
</script>

<style scoped>
.result-page { padding: 20rpx; }
.result-header { text-align: center; padding: 40rpx; background: #fff; border-radius: 16rpx; margin-bottom: 20rpx; }
.shop-name { font-size: 36rpx; font-weight: bold; }
.score { font-size: 48rpx; color: #ff6b35; margin-top: 16rpx; }
.duration { font-size: 28rpx; color: #999; margin-top: 8rpx; }
.chart-section { background: #fff; border-radius: 16rpx; padding: 20rpx; margin-bottom: 20rpx; }
.detail-section { background: #fff; border-radius: 16rpx; padding: 20rpx; margin-bottom: 20rpx; }
.section-title { font-size: 32rpx; font-weight: bold; margin-bottom: 16rpx; }
.cat-name { font-size: 26rpx; color: #666; margin: 12rpx 0 8rpx; }
.item-row { display: flex; justify-content: space-between; padding: 8rpx 0; }
.actions { display: flex; gap: 16rpx; }
.action-btn {
  flex: 1; text-align: center; padding: 24rpx; border-radius: 12rpx;
  background: #ff6b35; color: #fff; font-size: 28rpx;
}
</style>
```

- [ ] **Step 6: 验证挑战流程**

```bash
npm run dev:h5
```

验证：选择店铺 → 开始挑战 → 倒计时开始 → 点菜 → 结束挑战 → 查看结果

- [ ] **Step 7: 提交**

```bash
git add src/pages/challenge/ src/components/category-tabs.vue src/components/dish-item.vue src/components/tier-picker.vue
git commit -m "feat: 挑战流程（选店铺、档位选择、倒计时点菜、结果展示）"
```

---

## Task 7: 雷达图与柱状图组件

> **Design Skill Required:** 本任务涉及组件设计，实施前必须调用 `frontend-design` 技能获取设计方案。

**Files:**
- Create: `src/components/radar-chart.vue`
- Create: `src/components/bar-chart.vue`

- [ ] **Step 1: 实现雷达图组件**

```vue
<!-- src/components/radar-chart.vue -->
<template>
  <view class="radar-chart">
    <canvas canvas-id="radar" id="radar" class="canvas" />
  </view>
</template>

<script setup>
import { watch, onMounted } from 'vue'

const props = defineProps({
  data: { type: Object, default: () => ({}) },
  size: { type: Number, default: 300 }
})

onMounted(() => { draw() })
watch(() => props.data, () => { draw() }, { deep: true })

function draw() {
  const ctx = uni.createCanvasContext('radar')
  const center = props.size / 2
  const radius = props.size / 2 - 40
  const categories = ['肉类', '海鲜', '主食', '甜点', '饮料', '其他']
  const values = categories.map(c => props.data[c] || 0)
  const maxVal = Math.max(...values, 1)

  ctx.clearRect(0, 0, props.size, props.size)

  // 绘制背景网格
  for (let level = 1; level <= 5; level++) {
    const r = (radius * level) / 5
    ctx.beginPath()
    categories.forEach((_, i) => {
      const angle = (Math.PI * 2 * i) / categories.length - Math.PI / 2
      const x = center + r * Math.cos(angle)
      const y = center + r * Math.sin(angle)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.closePath()
    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 1
    ctx.stroke()
  }

  // 绘制数据区域
  ctx.beginPath()
  categories.forEach((_, i) => {
    const angle = (Math.PI * 2 * i) / categories.length - Math.PI / 2
    const r = (radius * values[i]) / maxVal
    const x = center + r * Math.cos(angle)
    const y = center + r * Math.sin(angle)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.closePath()
  ctx.fillStyle = 'rgba(255, 107, 53, 0.3)'
  ctx.fill()
  ctx.strokeStyle = '#ff6b35'
  ctx.lineWidth = 2
  ctx.stroke()

  // 绘制标签
  ctx.setFontSize(12)
  ctx.setFillStyle('#666')
  ctx.setTextAlign('center')
  categories.forEach((cat, i) => {
    const angle = (Math.PI * 2 * i) / categories.length - Math.PI / 2
    const x = center + (radius + 20) * Math.cos(angle)
    const y = center + (radius + 20) * Math.sin(angle)
    ctx.fillText(cat, x, y + 4)
  })

  ctx.draw()
}
</script>

<style scoped>
.radar-chart { display: flex; justify-content: center; }
.canvas { width: 300px; height: 300px; }
</style>
```

- [ ] **Step 2: 实现柱状图组件**

```vue
<!-- src/components/bar-chart.vue -->
<template>
  <view class="bar-chart">
    <view v-for="item in sortedData" :key="item.name" class="bar-row">
      <text class="bar-label">{{ item.name }}</text>
      <view class="bar-track">
        <view class="bar-fill" :style="{ width: item.percent + '%' }" />
      </view>
      <text class="bar-value">{{ item.value }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Object, default: () => ({}) }
})

const sortedData = computed(() => {
  const entries = Object.entries(props.data).map(([name, value]) => ({ name, value }))
  entries.sort((a, b) => b.value - a.value)
  const max = Math.max(...entries.map(e => e.value), 1)
  return entries.map(e => ({ ...e, percent: (e.value / max) * 100 }))
})
</script>

<style scoped>
.bar-chart { padding: 16rpx; }
.bar-row { display: flex; align-items: center; margin-bottom: 16rpx; }
.bar-label { width: 80rpx; font-size: 24rpx; color: #666; }
.bar-track { flex: 1; height: 24rpx; background: #f0f0f0; border-radius: 12rpx; margin: 0 16rpx; }
.bar-fill { height: 100%; background: #ff6b35; border-radius: 12rpx; transition: width 0.3s; }
.bar-value { width: 60rpx; text-align: right; font-size: 24rpx; color: #333; }
</style>
```

- [ ] **Step 3: 提交**

```bash
git add src/components/radar-chart.vue src/components/bar-chart.vue
git commit -m "feat: 雷达图与柱状图组件"
```

---

## Task 8: 首页数据看板与地图

> **Design Skill Required:** 本任务涉及页面设计，实施前必须调用 `frontend-design` 技能获取设计方案。

**Files:**
- Create: `src/pages/index/index.vue`
- Create: `src/components/level-badge.vue`
- Create: `src/components/map-view.vue`

- [ ] **Step 1: 实现等级徽章组件**

```vue
<!-- src/components/level-badge.vue -->
<template>
  <view class="level-badge">
    <text class="icon">{{ level.icon }}</text>
    <text class="name">{{ level.name }}</text>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { getLevel } from '../utils/level'

const props = defineProps({ score: { type: Number, default: 0 } })
const level = computed(() => getLevel(props.score))
</script>

<style scoped>
.level-badge { display: flex; align-items: center; gap: 8rpx; }
.icon { font-size: 40rpx; }
.name { font-size: 28rpx; font-weight: bold; color: #333; }
</style>
```

- [ ] **Step 2: 实现地图组件**

```vue
<!-- src/components/map-view.vue -->
<template>
  <view class="map-container">
    <map
      :latitude="center.lat"
      :longitude="center.lng"
      :markers="markers"
      :scale="scale"
      class="map"
      @markertap="onMarkerTap"
    />
    <view class="map-controls">
      <picker :value="rangeIndex" :range="ranges" @change="onRangeChange">
        <text class="range-picker">{{ ranges[rangeIndex] }} ▼</text>
      </picker>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from '@dcloudio/uni-app'

const props = defineProps({
  shops: { type: Array, default: () => [] },
  records: { type: Array, default: () => [] }
})

const emit = defineEmits(['markerTap'])

const ranges = ['全国', '省', '城市']
const rangeIndex = ref(0)
const center = ref({ lat: 39.9042, lng: 116.4074 })
const scale = ref(5)

const markers = computed(() => {
  const shopIds = new Set(props.records.map(r => r.shopId))
  return props.shops
    .filter(s => shopIds.has(s.id) && s.location)
    .map(s => ({
      id: s.id,
      latitude: s.location.lat,
      longitude: s.location.lng,
      title: s.name,
      callout: { content: s.name, display: 'BYCLICK' }
    }))
})

function onRangeChange(e) {
  rangeIndex.value = e.detail.value
  // 根据范围调整地图缩放级别
  scale.value = [5, 8, 11][e.detail.value]
}

function onMarkerTap(e) {
  emit('markerTap', e.markerId)
}
</script>

<style scoped>
.map-container { position: relative; }
.map { width: 100%; height: 400rpx; border-radius: 12rpx; }
.map-controls { position: absolute; top: 16rpx; right: 16rpx; }
.range-picker {
  background: #fff; padding: 8rpx 16rpx; border-radius: 8rpx;
  font-size: 24rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}
</style>
```

- [ ] **Step 3: 实现首页**

```vue
<!-- src/pages/index/index.vue -->
<template>
  <view class="home-page">
    <!-- 顶部：等级信息 -->
    <view class="stats-header">
      <view class="level-section">
        <level-badge :score="stats.maxScore" />
      </view>
      <view class="stats-row">
        <view class="stat-item">
          <text class="stat-value">{{ stats.maxScore }}</text>
          <text class="stat-label">最高战斗力</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.totalRecords }}</text>
          <text class="stat-label">总挑战</text>
        </view>
      </view>
    </view>

    <!-- 雷达图 -->
    <view class="chart-card">
      <text class="card-title">食量分布</text>
      <radar-chart :data="stats.categoryTotals" />
    </view>

    <!-- 分类食量排行 -->
    <view class="chart-card">
      <text class="card-title">分类食量排行</text>
      <bar-chart :data="stats.categoryTotals" />
    </view>

    <!-- 地图足迹 -->
    <view class="chart-card">
      <text class="card-title">挑战足迹 · 已挑战 {{ stats.shopCount }} 家店铺</text>
      <map-view
        :shops="shops"
        :records="records"
        @markerTap="onShopTap"
      />
    </view>
  </view>
</template>

<script setup>
import { ref, onShow } from '@dcloudio/uni-app'
import { recordStore } from '../../store/record-store'
import { shopStore } from '../../store/shop-store'
import LevelBadge from '../../components/level-badge.vue'
import RadarChart from '../../components/radar-chart.vue'
import BarChart from '../../components/bar-chart.vue'
import MapView from '../../components/map-view.vue'

const stats = ref({ totalRecords: 0, maxScore: 0, shopCount: 0, categoryTotals: {} })
const shops = ref([])
const records = ref([])

onShow(() => {
  stats.value = recordStore.getStats()
  shops.value = shopStore.getAll()
  records.value = recordStore.getAll()
})

function onShopTap(shopId) {
  uni.navigateTo({ url: `/pages/record/shop-records?shopId=${shopId}` })
}
</script>

<style scoped>
.home-page { padding: 20rpx; }
.stats-header {
  background: linear-gradient(135deg, #ff6b35, #ff8f65);
  border-radius: 16rpx; padding: 30rpx; color: #fff; margin-bottom: 20rpx;
}
.level-section { margin-bottom: 16rpx; }
.stats-row { display: flex; gap: 40rpx; }
.stat-item { display: flex; flex-direction: column; }
.stat-value { font-size: 40rpx; font-weight: bold; }
.stat-label { font-size: 24rpx; opacity: 0.8; }
.chart-card { background: #fff; border-radius: 16rpx; padding: 20rpx; margin-bottom: 20rpx; }
.card-title { font-size: 30rpx; font-weight: bold; margin-bottom: 16rpx; }
</style>
```

- [ ] **Step 4: 验证首页**

```bash
npm run dev:h5
```

验证：首页展示等级、雷达图、柱状图、地图。添加一些测试数据后验证图表数据正确。

- [ ] **Step 5: 提交**

```bash
git add src/pages/index/ src/components/level-badge.vue src/components/map-view.vue
git commit -m "feat: 首页数据看板（等级、雷达图、柱状图、地图足迹）"
```

---

## Task 9: 战绩页面

> **Design Skill Required:** 本任务涉及页面设计，实施前必须调用 `frontend-design` 技能获取设计方案。

**Files:**
- Create: `src/pages/record/record.vue`
- Create: `src/pages/record/shop-records.vue`
- Create: `src/pages/record/detail.vue`

- [ ] **Step 1: 实现战绩列表页**

```vue
<!-- src/pages/record/record.vue -->
<template>
  <view class="record-page">
    <view class="record-list">
      <view
        v-for="shop in shopRecords"
        :key="shop.shopId"
        class="shop-card"
        @tap="goToShop(shop.shopId)"
      >
        <view class="shop-header">
          <text class="shop-name">{{ shop.shopName }}</text>
          <text class="arrow">></text>
        </view>
        <view class="shop-stats">
          <text>最高战斗力：{{ shop.bestScore }}</text>
          <text>挑战 {{ shop.count }} 次</text>
          <text>最近：{{ shop.latest }}</text>
        </view>
      </view>
      <view v-if="shopRecords.length === 0" class="empty">
        暂无战绩，去挑战吧！
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onShow } from '@dcloudio/uni-app'
import { recordStore } from '../../store/record-store'
import { shopStore } from '../../store/shop-store'

const records = ref([])

onShow(() => { records.value = recordStore.getAll() })

const shopRecords = computed(() => {
  const grouped = {}
  records.value.forEach(r => {
    if (r.status !== '已完成') return
    if (!grouped[r.shopId]) {
      grouped[r.shopId] = {
        shopId: r.shopId,
        shopName: r.shopName,
        records: [],
        bestScore: 0,
        latest: ''
      }
    }
    grouped[r.shopId].records.push(r)
    if (r.score > grouped[r.shopId].bestScore) grouped[r.shopId].bestScore = r.score
    if (!grouped[r.shopId].latest || r.createdAt > grouped[r.shopId].latest) {
      grouped[r.shopId].latest = r.createdAt.slice(0, 10)
    }
  })
  return Object.values(grouped).map(g => ({ ...g, count: g.records.length }))
    .sort((a, b) => b.bestScore - a.bestScore)
})

function goToShop(shopId) {
  uni.navigateTo({ url: `/pages/record/shop-records?shopId=${shopId}` })
}
</script>

<style scoped>
.record-page { padding: 20rpx; }
.shop-card { background: #fff; border-radius: 12rpx; padding: 24rpx; margin-bottom: 16rpx; }
.shop-header { display: flex; justify-content: space-between; align-items: center; }
.shop-name { font-size: 32rpx; font-weight: bold; }
.arrow { color: #ccc; font-size: 28rpx; }
.shop-stats { display: flex; gap: 16rpx; margin-top: 12rpx; font-size: 24rpx; color: #999; }
.empty { text-align: center; padding: 80rpx; color: #999; }
</style>
```

- [ ] **Step 2: 实现店铺战绩详情页**

```vue
<!-- src/pages/record/shop-records.vue -->
<template>
  <view class="shop-records-page">
    <view class="header">
      <text class="shop-name">{{ shopName }}</text>
      <text class="meta">挑战 {{ records.length }} 次</text>
      <view class="stats-row">
        <text>最高战斗力：{{ bestScore }}</text>
        <text>平均：{{ avgScore }}</text>
      </view>
    </view>
    <view class="record-list">
      <view
        v-for="record in records"
        :key="record.id"
        class="record-card"
        @tap="goToDetail(record.id)"
      >
        <view class="record-header">
          <text class="date">{{ record.createdAt.slice(0, 10) }}</text>
          <text class="score" :class="{ best: record.score === bestScore }">
            战斗力 {{ record.score }}{{ record.score === bestScore ? ' ⭐' : '' }}
          </text>
        </view>
        <text class="items-summary">{{ getItemsSummary(record) }}</text>
        <text class="duration">时长 {{ record.duration }}分钟</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onLoad } from '@dcloudio/uni-app'
import { recordStore } from '../../store/record-store'

const shopName = ref('')
const records = ref([])

onLoad((options) => {
  const allRecords = recordStore.getByShopId(options.shopId)
  records.value = allRecords.filter(r => r.status === '已完成')
  if (records.value.length > 0) shopName.value = records.value[0].shopName
})

const bestScore = computed(() => Math.max(...records.value.map(r => r.score), 0))
const avgScore = computed(() => {
  if (records.value.length === 0) return 0
  return Math.round(records.value.reduce((s, r) => s + r.score, 0) / records.value.length)
})

function getItemsSummary(record) {
  const cats = {}
  record.items.forEach(item => {
    if (!cats[item.category]) cats[item.category] = 0
    cats[item.category] += item.quantity
  })
  return Object.entries(cats).map(([cat, qty]) => `${cat}${qty}`).join(' ')
}

function goToDetail(id) {
  uni.navigateTo({ url: `/pages/record/detail?id=${id}` })
}
</script>

<style scoped>
.shop-records-page { padding: 20rpx; }
.header { background: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 20rpx; }
.shop-name { font-size: 36rpx; font-weight: bold; }
.meta { font-size: 24rpx; color: #999; margin-top: 8rpx; }
.stats-row { display: flex; gap: 24rpx; margin-top: 12rpx; font-size: 28rpx; }
.record-card { background: #fff; border-radius: 12rpx; padding: 20rpx; margin-bottom: 12rpx; }
.record-header { display: flex; justify-content: space-between; }
.date { font-size: 28rpx; color: #333; }
.score { font-size: 28rpx; color: #666; }
.score.best { color: #ff6b35; font-weight: bold; }
.items-summary { font-size: 24rpx; color: #999; margin-top: 8rpx; }
.duration { font-size: 24rpx; color: #999; }
</style>
```

- [ ] **Step 3: 实现单条战绩详情页**

```vue
<!-- src/pages/record/detail.vue -->
<template>
  <view class="detail-page">
    <view class="header">
      <text class="shop-name">{{ record.shopName }}{{ record.tierName ? ' · ' + record.tierName : '' }}</text>
      <text class="date">{{ record.createdAt?.slice(0, 10) }}</text>
      <text class="score">战斗力 {{ record.score }} ⭐</text>
      <text class="duration">时长 {{ record.duration }}分钟</text>
    </view>

    <view class="chart-card">
      <text class="card-title">分类食量统计</text>
      <radar-chart :data="categoryData" />
    </view>

    <view class="detail-card">
      <text class="card-title">点餐明细</text>
      <view v-for="(cat, catName) in groupedItems" :key="catName" class="cat-group">
        <text class="cat-name">{{ catName }}</text>
        <view v-for="item in cat" :key="item.menuItemId" class="item-row">
          <text class="item-name">{{ item.name }}</text>
          <text class="item-qty">{{ item.quantity }}{{ item.unit }}</text>
        </view>
      </view>
    </view>

    <view class="actions">
      <view class="action-btn" @tap="generateReceipt">生成小票</view>
      <view class="action-btn secondary" @tap="generatePoster">AI生成海报</view>
      <view class="action-btn danger" @tap="deleteRecord">删除记录</view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onLoad } from '@dcloudio/uni-app'
import { recordStore } from '../../store/record-store'
import RadarChart from '../../components/radar-chart.vue'

const record = ref({ items: [] })

onLoad((options) => {
  record.value = recordStore.getById(options.id)
})

const categoryData = computed(() => {
  const data = {}
  record.value.items.forEach(item => {
    if (!data[item.category]) data[item.category] = 0
    data[item.category] += item.quantity
  })
  return data
})

const groupedItems = computed(() => {
  const groups = {}
  record.value.items.forEach(item => {
    if (!groups[item.category]) groups[item.category] = []
    groups[item.category].push(item)
  })
  return groups
})

function generateReceipt() {
  // Canvas 生成小票
  uni.showToast({ title: '小票生成中...', icon: 'loading' })
  // 实际调用 receipt-renderer
}

function generatePoster() {
  uni.showToast({ title: 'AI海报生成中...', icon: 'loading' })
  // 实际调用 ai-service
}

function deleteRecord() {
  uni.showModal({
    title: '确认删除',
    content: '删除后无法恢复',
    success: (res) => {
      if (res.confirm) {
        recordStore.remove(record.value.id)
        uni.showToast({ title: '已删除', icon: 'success' })
        setTimeout(() => uni.navigateBack(), 1500)
      }
    }
  })
}
</script>

<style scoped>
.detail-page { padding: 20rpx; }
.header { background: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 20rpx; text-align: center; }
.shop-name { font-size: 36rpx; font-weight: bold; }
.date { font-size: 24rpx; color: #999; }
.score { font-size: 48rpx; color: #ff6b35; margin-top: 12rpx; }
.duration { font-size: 28rpx; color: #666; margin-top: 8rpx; }
.chart-card, .detail-card { background: #fff; border-radius: 16rpx; padding: 20rpx; margin-bottom: 20rpx; }
.card-title { font-size: 30rpx; font-weight: bold; margin-bottom: 16rpx; }
.cat-name { font-size: 26rpx; color: #666; margin: 12rpx 0 8rpx; }
.item-row { display: flex; justify-content: space-between; padding: 8rpx 0; }
.item-name { font-size: 28rpx; }
.item-qty { font-size: 28rpx; color: #666; }
.actions { display: flex; flex-direction: column; gap: 16rpx; }
.action-btn { text-align: center; padding: 24rpx; border-radius: 12rpx; font-size: 28rpx; }
.action-btn { background: #ff6b35; color: #fff; }
.action-btn.secondary { background: #007aff; }
.action-btn.danger { background: #fff; color: #ff3b30; border: 1rpx solid #ff3b30; }
</style>
```

- [ ] **Step 4: 提交**

```bash
git add src/pages/record/
git commit -m "feat: 战绩页面（列表、店铺详情、单条详情）"
```

---

## Task 10: 小票生成（Canvas）

> **Design Skill Required:** 本任务涉及视觉设计，实施前必须调用 `frontend-design` 技能获取设计方案。

**Files:**
- Create: `src/utils/receipt-renderer.js`

- [ ] **Step 1: 实现小票 Canvas 绘制器**

```javascript
// src/utils/receipt-renderer.js
export function renderReceipt(record, shop) {
  return new Promise((resolve) => {
    const width = 375
    const padding = 20
    const lineHeight = 36
    let y = 30

    // 计算高度
    const itemsCount = record.items.length
    const height = 30 + lineHeight * (8 + itemsCount) + 60

    const ctx = uni.createCanvasContext('receiptCanvas')

    // 白色背景
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(0, 0, width, height)

    // 标题
    ctx.setFillStyle('#333333')
    ctx.setFontSize(20)
    ctx.setTextAlign('center')
    ctx.fillText('大胃王战绩', width / 2, y)
    y += lineHeight

    // 分割线
    ctx.setStrokeStyle('#cccccc')
    ctx.setLineWidth(1)
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(width - padding, y)
    ctx.stroke()
    y += lineHeight

    // 基本信息
    ctx.setTextAlign('left')
    ctx.setFontSize(14)
    ctx.setFillStyle('#333')
    ctx.fillText(`店铺：${record.shopName}`, padding, y); y += lineHeight
    if (record.tierName) {
      ctx.fillText(`档位：${record.tierName}`, padding, y); y += lineHeight
    }
    ctx.fillText(`日期：${record.createdAt?.slice(0, 10)}`, padding, y); y += lineHeight
    ctx.fillText(`时长：${record.duration}分钟`, padding, y); y += lineHeight

    // 分割线
    y += 8
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(width - padding, y)
    ctx.stroke()
    y += lineHeight

    // 菜品列表表头
    ctx.setFontSize(12)
    ctx.setFillStyle('#999')
    ctx.fillText('菜品', padding, y)
    ctx.setTextAlign('right')
    ctx.fillText('数量', width - padding, y)
    y += lineHeight

    // 菜品列表
    ctx.setTextAlign('left')
    ctx.setFillStyle('#333')
    ctx.setFontSize(14)
    record.items.forEach(item => {
      ctx.fillText(item.name, padding, y)
      ctx.setTextAlign('right')
      ctx.fillText(`${item.quantity}${item.unit}`, width - padding, y)
      ctx.setTextAlign('left')
      y += lineHeight
    })

    // 分割线
    y += 8
    ctx.setStrokeStyle('#cccccc')
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(width - padding, y)
    ctx.stroke()
    y += lineHeight

    // 统计信息
    ctx.setFontSize(14)
    ctx.setFillStyle('#333')
    const catCount = new Set(record.items.map(i => i.category)).size
    ctx.fillText(`总计：${record.items.length}道菜 · ${catCount}类`, padding, y); y += lineHeight
    ctx.fillText(`战斗力：${record.score} ⭐`, padding, y); y += lineHeight

    // 底部
    y += 20
    ctx.setTextAlign('center')
    ctx.setFontSize(12)
    ctx.setFillStyle('#999')
    ctx.fillText('大胃王APP - 记录你的每一次战绩', width / 2, y)

    ctx.draw(false, () => {
      setTimeout(() => {
        uni.canvasToTempFilePath({
          canvasId: 'receiptCanvas',
          success: (res) => resolve(res.tempFilePath),
          fail: () => resolve(null)
        })
      }, 200)
    })
  })
}

export async function saveReceiptToAlbum(record, shop) {
  const filePath = await renderReceipt(record, shop)
  if (!filePath) return false
  return new Promise((resolve) => {
    uni.saveImageToPhotosAlbum({
      filePath,
      success: () => {
        uni.showToast({ title: '已保存到相册', icon: 'success' })
        resolve(true)
      },
      fail: () => {
        uni.showToast({ title: '保存失败', icon: 'none' })
        resolve(false)
      }
    })
  })
}
```

- [ ] **Step 2: 提交**

```bash
git add src/utils/receipt-renderer.js
git commit -m "feat: Canvas 战绩小票生成"
```

---

## Task 11: AI 菜单识别与创意海报

**Files:**
- Create: `src/utils/ocr-service.js`
- Create: `src/utils/ai-service.js`

- [ ] **Step 1: 实现 OCR 菜单识别服务**

```javascript
// src/utils/ocr-service.js
import { settingsStore } from '../store/settings-store'
import { createMenuItem } from '../store/models'

const CATEGORY_KEYWORDS = {
  '肉类': ['牛肉', '猪肉', '羊肉', '鸡肉', '鸭肉', '肥牛', '五花', '牛排', '鸡翅', '排骨'],
  '海鲜': ['虾', '蟹', '鱼', '贝', '龙虾', '三文鱼', '鱿鱼', '扇贝', '生蚝', '鲍鱼'],
  '主食': ['饭', '面', '粥', '饺子', '包子', '炒饭', '拉面', '米饭', '馒头'],
  '甜点': ['蛋糕', '冰淇淋', '布丁', '甜品', '奶茶', '果汁', '水果'],
  '饮料': ['可乐', '雪碧', '啤酒', '茶', '咖啡', '水', '汽水']
}

function guessCategory(name) {
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => name.includes(kw))) return cat
  }
  return '其他'
}

function guessUnit(name) {
  if (name.includes('虾') || name.includes('蟹') || name.includes('鲍鱼')) return '只'
  if (name.includes('杯') || name.includes('汁') || name.includes('奶')) return '杯'
  if (name.includes('碗') || name.includes('粥') || name.includes('面')) return '碗'
  return '盘'
}

export async function recognize(imagePath) {
  const settings = settingsStore.get()
  if (!settings.aiServiceUrl || !settings.aiApiKey) {
    throw new Error('请先在设置中配置 AI 服务地址和 API Key')
  }

  // 将图片转为 base64
  const base64 = await imageToBase64(imagePath)

  const response = await uni.request({
    url: `${settings.aiServiceUrl}/v1/chat/completions`,
    method: 'POST',
    header: {
      'Authorization': `Bearer ${settings.aiApiKey}`,
      'Content-Type': 'application/json'
    },
    data: {
      model: 'qwen-vl-plus',
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: base64 } },
          {
            type: 'text',
            text: '请识别这张菜单图片中的所有菜品，返回JSON数组格式：[{"name":"菜品名"},...]。只返回JSON，不要其他内容。'
          }
        ]
      }]
    }
  })

  const content = response.data.choices[0].message.content
  const items = JSON.parse(content.match(/\[[\s\S]*\]/)[0])

  return items.map(item => ({
    name: item.name,
    category: guessCategory(item.name),
    unit: guessUnit(item.name)
  }))
}

function imageToBase64(path) {
  return new Promise((resolve, reject) => {
    uni.getFileSystemManager().readFile({
      filePath: path,
      encoding: 'base64',
      success: (res) => resolve(`data:image/jpeg;base64,${res.data}`),
      fail: reject
    })
  })
}
```

- [ ] **Step 2: 实现 AI 创意海报服务**

```javascript
// src/utils/ai-service.js'
import { settingsStore } from '../store/settings-store'

const STYLE_PROMPTS = {
  '搞笑夸张': '搞笑夸张风格，食物放大变大，添加表情包元素，色彩鲜艳，有趣幽默',
  '动漫二次元': '动漫二次元风格，日系画风，可爱Q版人物，鲜艳配色',
  '霸气宣言': '霸气宣言风格，大字报排版，奖杯奖牌元素，金色红色为主，气势磅礴',
  '简约战绩': '简约现代风格，干净的卡片式布局，数据可视化展示，专业感'
}

export async function generatePoster(record, style, photoPaths = []) {
  const settings = settingsStore.get()
  if (!settings.aiServiceUrl || !settings.aiApiKey) {
    throw new Error('请先在设置中配置 AI 服务地址和 API Key')
  }

  const styleDesc = STYLE_PROMPTS[style] || STYLE_PROMPTS['简约战绩']

  const catSummary = {}
  record.items.forEach(item => {
    if (!catSummary[item.category]) catSummary[item.category] = 0
    catSummary[item.category] += item.quantity
  })
  const catText = Object.entries(catSummary).map(([cat, qty]) => `${cat}${qty}`).join('、')

  const prompt = `生成一张大胃王战绩海报。
风格：${styleDesc}
战绩信息：
- 店铺：${record.shopName}
- ${record.tierName ? '档位：' + record.tierName : ''}
- 战斗力评分：${record.score}分
- 菜品：${catText}
- 就餐时长：${record.duration}分钟

要求：突出战绩数据，视觉冲击力强，适合发朋友圈炫耀。`

  const content = [{ type: 'text', text: prompt }]
  for (const photoPath of photoPaths.slice(0, 3)) {
    const base64 = await imageToBase64(photoPath)
    content.push({ type: 'image_url', image_url: { url: base64 } })
  }

  const response = await uni.request({
    url: `${settings.aiServiceUrl}/v1/images/generations`,
    method: 'POST',
    header: {
      'Authorization': `Bearer ${settings.aiApiKey}`,
      'Content-Type': 'application/json'
    },
    data: {
      model: 'wanx-v1',
      prompt,
      n: 1,
      size: '1024x1024'
    }
  })

  return response.data.data[0].url
}

function imageToBase64(path) {
  return new Promise((resolve, reject) => {
    uni.getFileSystemManager().readFile({
      filePath: path,
      encoding: 'base64',
      success: (res) => resolve(`data:image/jpeg;base64,${res.data}`),
      fail: reject
    })
  })
}
```

- [ ] **Step 3: 提交**

```bash
git add src/utils/ocr-service.js src/utils/ai-service.js
git commit -m "feat: AI 菜单识别与创意海报生成"
```

---

## Task 12: 数据备份与设置页面

> **Design Skill Required:** 本任务涉及页面设计，实施前必须调用 `frontend-design` 技能获取设计方案。

**Files:**
- Create: `src/pages/mine/backup.vue`
- Create: `src/pages/mine/settings.vue`

- [ ] **Step 1: 实现数据备份页面**

```vue
<!-- src/pages/mine/backup.vue -->
<template>
  <view class="backup-page">
    <view class="info-card">
      <text>上次备份：{{ lastBackup || '从未备份' }}</text>
    </view>

    <view class="action-card" @tap="exportData">
      <text class="action-icon">📤</text>
      <view class="action-info">
        <text class="action-title">导出数据到文件</text>
        <text class="action-desc">导出所有店铺、菜单、战绩数据，保存为 JSON 文件</text>
      </view>
    </view>

    <view class="action-card" @tap="importData">
      <text class="action-icon">📥</text>
      <view class="action-info">
        <text class="action-title">从文件导入数据</text>
        <text class="action-desc">选择之前导出的 JSON 文件恢复数据</text>
      </view>
    </view>

    <view class="warning">
      <text>⚠️ 导入将覆盖现有数据，请先导出备份</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { shopStore } from '../../store/shop-store'
import { recordStore } from '../../store/record-store'
import { Storage } from '../../store/storage'

const lastBackup = ref('')

function exportData() {
  const data = {
    version: '1.0',
    exportTime: new Date().toISOString(),
    shops: shopStore.getAll(),
    records: recordStore.getAll()
  }
  const json = JSON.stringify(data, null, 2)

  // 保存到临时文件并分享
  const fs = uni.getFileSystemManager()
  const filePath = `${uni.env.USER_DATA_PATH}/eater-backup-${Date.now()}.json`
  fs.writeFile({
    filePath,
    data: json,
    encoding: 'utf8',
    success: () => {
      uni.shareFile({
        filePath,
        success: () => {
          lastBackup.value = new Date().toLocaleString()
          uni.showToast({ title: '导出成功', icon: 'success' })
        }
      })
    }
  })
}

function importData() {
  uni.chooseMessageFile({
    count: 1,
    type: 'file',
    extension: ['.json'],
    success: (res) => {
      const fs = uni.getFileSystemManager()
      fs.readFile({
        filePath: res.tempFiles[0].path,
        encoding: 'utf8',
        success: (fileRes) => {
          try {
            const data = JSON.parse(fileRes.data)
            if (!data.shops || !data.records) throw new Error('格式错误')

            uni.showModal({
              title: '确认导入',
              content: `将导入 ${data.shops.length} 个店铺和 ${data.records.length} 条战绩，覆盖现有数据？`,
              success: (modalRes) => {
                if (modalRes.confirm) {
                  // 清空现有数据并导入
                  uni.clearStorageSync()
                  const shopStorage = new Storage('shops')
                  data.shops.forEach(s => shopStorage.save(s))
                  recordStore.importAll(JSON.stringify(data.records))
                  uni.showToast({ title: '导入成功', icon: 'success' })
                }
              }
            })
          } catch (e) {
            uni.showToast({ title: '文件格式错误', icon: 'none' })
          }
        }
      })
    }
  })
}
</script>

<style scoped>
.backup-page { padding: 20rpx; }
.info-card { background: #fff; border-radius: 12rpx; padding: 20rpx; margin-bottom: 20rpx; text-align: center; color: #666; }
.action-card {
  display: flex; align-items: center; gap: 20rpx;
  background: #fff; border-radius: 12rpx; padding: 24rpx; margin-bottom: 16rpx;
}
.action-icon { font-size: 48rpx; }
.action-title { font-size: 30rpx; font-weight: bold; }
.action-desc { font-size: 24rpx; color: #999; margin-top: 8rpx; }
.warning { text-align: center; color: #ff6b35; font-size: 24rpx; margin-top: 20rpx; }
</style>
```

- [ ] **Step 2: 实现设置页面**

```vue
<!-- src/pages/mine/settings.vue -->
<template>
  <view class="settings-page">
    <view class="section">
      <text class="section-title">通用</text>
      <view class="setting-item">
        <text>默认城市</text>
        <input v-model="settings.defaultCity" placeholder="如：北京" />
      </view>
      <view class="setting-item">
        <text>地图默认范围</text>
        <picker :value="rangeIndex" :range="ranges" @change="onRangeChange">
          <text>{{ settings.mapRange }}</text>
        </picker>
      </view>
    </view>

    <view class="section">
      <text class="section-title">挑战</text>
      <view class="setting-item">
        <text>倒计时 &lt;5min 提醒</text>
        <switch :checked="settings.countdownWarning" @change="onToggle('countdownWarning', $event)" />
      </view>
      <view class="setting-item">
        <text>长按输入精确数量</text>
        <switch :checked="settings.longPressInput" @change="onToggle('longPressInput', $event)" />
      </view>
    </view>

    <view class="section">
      <text class="section-title">AI 生图</text>
      <view class="setting-item vertical">
        <text>AI 服务地址</text>
        <input v-model="settings.aiServiceUrl" placeholder="如：https://api.openai.com" />
      </view>
      <view class="setting-item vertical">
        <text>AI API Key</text>
        <input v-model="settings.aiApiKey" :password="true" placeholder="输入 API Key" />
      </view>
    </view>

    <view class="section">
      <text class="section-title">数据</text>
      <view class="setting-item" @tap="goToBackup">
        <text>数据备份</text>
        <text class="arrow">></text>
      </view>
      <view class="setting-item danger" @tap="clearAll">
        <text>清除所有数据</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onShow } from '@dcloudio/uni-app'
import { settingsStore } from '../../store/settings-store'

const ranges = ['全国', '省', '城市']
const rangeIndex = ref(0)
const settings = ref(settingsStore.get())

onShow(() => { settings.value = settingsStore.get() })

function onRangeChange(e) {
  rangeIndex.value = e.detail.value
  settings.value.mapRange = ranges[e.detail.value]
  settingsStore.update({ mapRange: ranges[e.detail.value] })
}

function onToggle(key, e) {
  settings.value[key] = e.detail.value
  settingsStore.update({ [key]: e.detail.value })
}

function goToBackup() {
  uni.navigateTo({ url: '/pages/mine/backup' })
}

function clearAll() {
  uni.showModal({
    title: '确认清除',
    content: '将删除所有店铺和战绩数据，此操作不可恢复',
    confirmColor: '#ff3b30',
    success: (res) => {
      if (res.confirm) {
        uni.clearStorageSync()
        uni.showToast({ title: '已清除', icon: 'success' })
      }
    }
  })
}
</script>

<style scoped>
.settings-page { padding: 20rpx; }
.section { background: #fff; border-radius: 12rpx; padding: 20rpx; margin-bottom: 20rpx; }
.section-title { font-size: 26rpx; color: #999; margin-bottom: 16rpx; }
.setting-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20rpx 0; border-bottom: 1rpx solid #f5f5f5;
}
.setting-item.vertical { flex-direction: column; align-items: flex-start; gap: 12rpx; }
.setting-item.vertical input { width: 100%; }
.setting-item input { text-align: right; flex: 1; }
.arrow { color: #ccc; }
.danger { color: #ff3b30; }
</style>
```

- [ ] **Step 3: 提交**

```bash
git add src/pages/mine/backup.vue src/pages/mine/settings.vue
git commit -m "feat: 数据备份与设置页面"
```

---

## Task 13: 最终集成与验证

- [ ] **Step 1: 运行全部单元测试**

```bash
npm test
```

Expected: 全部通过

- [ ] **Step 2: 启动 H5 开发服务器，完整走一遍核心流程**

```bash
npm run dev:h5
```

验证流程：
1. 首页看板展示（无数据时的空状态）
2. 我的 → 新增店铺（含档位）
3. 我的 → 编辑店铺 → 图片识别导入菜单
4. 挑战 → 选择店铺 → 选择档位 → 点菜 → 倒计时 → 结束
5. 结果页查看雷达图、点餐明细
6. 生成小票 → 保存到相册
7. 战绩列表 → 店铺详情 → 单条详情
8. 首页看板数据更新
9. 地图足迹显示
10. 数据备份导出/导入
11. 设置页面修改并保存

- [ ] **Step 3: 提交最终代码**

```bash
git add .
git commit -m "chore: V1 完整功能集成"
```
