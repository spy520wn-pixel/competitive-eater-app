# AI 创作提示词增强功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 改进 AI 创作功能的提示词构建逻辑，通过 LLM 生成高质量提示词，让生成的图片更能体现用户实际吃的内容。

**Architecture:** 在 `ai-service.js` 中新增两个 LLM 提示词生成函数（`generatePrompt` 和 `generatePromptWithPhoto`），修改 `generateImage` 函数调用这些新函数，使用现有的 OCR LLM 配置生成提示词，失败时降级使用本地模板。

**Tech Stack:** uni-app, Vue 3, JavaScript, LLM API (复用 ocrServiceUrl)

---

## 文件结构

- **Modify:** `src/utils/ai-service.js`
  - 新增 `generatePrompt(record, style)` 函数
  - 新增 `generatePromptWithPhoto(record, style, photoPaths)` 函数
  - 修改 `generateImage` 函数调用新函数

---

### Task 1: 新增 LLM 提示词生成函数

**Files:**
- Modify: `src/utils/ai-service.js:373-432`

- [ ] **Step 1: 添加文生图 System Prompt 常量**

在 `IMAGE_STYLES` 常量之后添加：

```javascript
const TEXT_TO_IMAGE_SYSTEM_PROMPT = `你是一个专业的 AI 创作提示词生成助手。你的任务是根据用户的大胃王挑战战绩数据，生成高质量的图像生成提示词。

## 输入数据
- 店铺名称
- 档位名称（可选）
- 菜品列表（名称、数量、分类）
- 风格选择
- 战斗力评分
- 时长

## 输出要求
1. 生成一段画面感强的场景描述
2. 突出具体菜品名称，而非分类汇总
3. 结合风格特点，添加相应的视觉元素
4. 适合生成朋友圈炫耀的图片
5. 长度控制在 200-300 字
6. 直接输出提示词内容，不要添加任何解释或说明

## 示例输入
- 店铺：海底捞火锅
- 菜品：肥牛卷x3、虾滑x2、毛肚x1、羊肉卷x2、冰淇淋x1
- 风格：搞笑夸张
- 战斗力：85分
- 时长：90分钟

## 示例输出
在海底捞火锅的热闹氛围中，一位大胃王正在享用丰盛的美食。桌上摆满了肥牛卷、虾滑、毛肚、羊肉卷等8道美味，搭配冰淇淋作为完美收尾。战斗力评分85分，用时90分钟。搞笑夸张风格，食物放大变大，添加表情包元素，色彩鲜艳，有趣幽默。`

const IMAGE_TO_IMAGE_SYSTEM_PROMPT = `你是一个专业的 AI 创作提示词生成助手。你的任务是根据用户上传的照片和大胃王挑战战绩数据，生成高质量的图像生成提示词。

## 输入数据
- 用户上传的照片（将作为参考图）
- 店铺名称
- 档位名称（可选）
- 菜品列表（名称、数量、分类）
- 风格选择
- 战斗力评分
- 时长

## 输出要求
1. 先描述照片中的食物内容
2. 结合战绩数据，补充照片中可能未体现的菜品
3. 生成融合照片内容和战绩数据的场景描述
4. 结合风格特点，添加相应的视觉元素
5. 提示词中注明"参考图片中的内容"
6. 长度控制在 200-300 字
7. 直接输出提示词内容，不要添加任何解释或说明

## 示例输入
- 照片：火锅照片
- 店铺：海底捞火锅
- 菜品：肥牛卷x3、虾滑x2、毛肚x1、羊肉卷x2、冰淇淋x1
- 风格：搞笑夸张
- 战斗力：85分
- 时长：90分钟

## 示例输出
参考图片中的火锅场景，桌上摆满了各种美食。结合战绩数据，补充了照片中可能未体现的菜品：肥牛卷、虾滑、毛肚、羊肉卷等8道美味，搭配冰淇淋作为完美收尾。在海底捞火锅的氛围下，大胃王挑战成功，战斗力评分85分，用时90分钟。搞笑夸张风格，保留原图构图，增加夸张表现元素，食物放大变大，添加表情包元素。`
```

- [ ] **Step 2: 添加 `generatePrompt` 函数**

在 `recognizeMenu` 函数之后添加：

```javascript
export async function generatePrompt(record, style) {
  const settings = settingsStore.get()
  if (!settings.ocrServiceUrl || !settings.ocrApiKey) {
    // 降级使用本地模板
    return generateLocalPrompt(record, style)
  }

  const styleDesc = IMAGE_STYLES[style] || IMAGE_STYLES['简约战绩']

  // 构建菜品列表文本
  const itemsText = record.items.map(item =>
    `${item.name}x${item.quantity}`
  ).join('、')

  const userMessage = `请根据以下数据生成图像提示词：
- 店铺：${record.shopName}
${record.tierName ? '- 档位：' + record.tierName : ''}
- 菜品：${itemsText}
- 风格：${style}（${styleDesc}）
- 战斗力：${record.score}分
- 时长：${record.duration}分钟`

  try {
    const response = await withRetry(() => new Promise((resolve, reject) => {
      uni.request({
        url: settings.ocrServiceUrl,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.ocrApiKey}`
        },
        data: {
          model: settings.ocrModel || 'agnes-2.0-flash',
          messages: [
            { role: 'system', content: TEXT_TO_IMAGE_SYSTEM_PROMPT },
            { role: 'user', content: userMessage }
          ],
          max_tokens: 1000,
          temperature: 0.7
        },
        success: (res) => resolve(res),
        fail: (err) => reject(err)
      })
    }), { label: 'LLM 提示词生成' })

    if (response.statusCode === 200 && response.data.choices?.[0]) {
      return response.data.choices[0].message.content.trim()
    }
  } catch (e) {
    console.warn('LLM 提示词生成失败，降级使用本地模板:', e.message)
  }

  return generateLocalPrompt(record, style)
}
```

- [ ] **Step 3: 添加 `generatePromptWithPhoto` 函数**

在 `generatePrompt` 函数之后添加：

```javascript
export async function generatePromptWithPhoto(record, style, photoPaths) {
  const settings = settingsStore.get()
  if (!settings.ocrServiceUrl || !settings.ocrApiKey) {
    // 降级使用本地模板
    return generateLocalPrompt(record, style)
  }

  const styleDesc = IMAGE_STYLES[style] || IMAGE_STYLES['简约战绩']

  // 构建菜品列表文本
  const itemsText = record.items.map(item =>
    `${item.name}x${item.quantity}`
  ).join('、')

  const userMessage = `请根据以下数据和照片生成图像提示词：
- 照片：用户上传了${photoPaths.length}张照片（将作为参考图）
- 店铺：${record.shopName}
${record.tierName ? '- 档位：' + record.tierName : ''}
- 菜品：${itemsText}
- 风格：${style}（${styleDesc}）
- 战斗力：${record.score}分
- 时长：${record.duration}分钟

请先识别照片中的食物内容，然后结合战绩数据生成融合提示词。`

  // 将照片转为 base64
  const imageContent = []
  for (const path of photoPaths.slice(0, 3)) {
    try {
      const base64 = await imageToBase64(path)
      if (base64) {
        imageContent.push({
          type: 'image_url',
          image_url: { url: base64 }
        })
      }
    } catch (e) {
      console.warn('照片转 base64 失败:', e.message)
    }
  }

  // 如果没有成功转换照片，降级为文生图模式
  if (imageContent.length === 0) {
    return generatePrompt(record, style)
  }

  imageContent.push({ type: 'text', text: userMessage })

  try {
    const response = await withRetry(() => new Promise((resolve, reject) => {
      uni.request({
        url: settings.ocrServiceUrl,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.ocrApiKey}`
        },
        data: {
          model: settings.ocrModel || 'agnes-2.0-flash',
          messages: [
            { role: 'system', content: IMAGE_TO_IMAGE_SYSTEM_PROMPT },
            { role: 'user', content: imageContent }
          ],
          max_tokens: 1000,
          temperature: 0.7
        },
        success: (res) => resolve(res),
        fail: (err) => reject(err)
      })
    }), { label: 'LLM 提示词生成' })

    if (response.statusCode === 200 && response.data.choices?.[0]) {
      return response.data.choices[0].message.content.trim()
    }
  } catch (e) {
    console.warn('LLM 提示词生成失败，降级使用本地模板:', e.message)
  }

  return generateLocalPrompt(record, style)
}
```

- [ ] **Step 4: 添加 `generateLocalPrompt` 降级函数**

在 `generatePromptWithPhoto` 函数之后添加：

```javascript
function generateLocalPrompt(record, style) {
  const styleDesc = IMAGE_STYLES[style] || IMAGE_STYLES['简约战绩']

  const catSummary = {}
  record.items.forEach(item => {
    if (!catSummary[item.category]) catSummary[item.category] = 0
    catSummary[item.category] += item.quantity
  })
  const catText = Object.entries(catSummary).map(([cat, qty]) => `${cat}${qty}`).join('、')

  return `${styleDesc}。
大胃王战绩海报：
- 店铺：${record.shopName}
- 战斗力：${record.score}分
- 菜品：${catText}
- 时长：${record.duration}分钟
要求：突出战绩数据，视觉冲击力强，适合发朋友圈炫耀。`
}
```

- [ ] **Step 5: 提交代码**

```bash
git add src/utils/ai-service.js
git commit -m "feat: 添加 LLM 提示词生成函数"
```

---

### Task 2: 修改 generateImage 函数

**Files:**
- Modify: `src/utils/ai-service.js:373-432`

- [ ] **Step 1: 修改 `generateImage` 函数**

将现有的 `generateImage` 函数替换为：

```javascript
export async function generateImage({ record, style, photoPaths = [] }) {
  const settings = settingsStore.get()
  if (!settings.aiServiceUrl || !settings.aiApiKey) {
    throw new Error('请先在设置中配置生图大模型服务地址和 API Key')
  }

  // 根据是否有照片选择不同的提示词生成方式
  let prompt
  if (photoPaths.length > 0) {
    prompt = await generatePromptWithPhoto(record, style, photoPaths)
  } else {
    prompt = await generatePrompt(record, style)
  }

  const requestData = {
    model: settings.aiModel || 'agnes-image-2.0-flash',
    prompt,
    size: '1024x1024'
  }

  // 尝试将照片转为 base64 作为参考图（图生图模式）
  if (photoPaths.length > 0) {
    try {
      const base64Photos = []
      for (const path of photoPaths.slice(0, 3)) {
        const base64 = await imageToBase64(path)
        if (base64) base64Photos.push(base64)
      }
      if (base64Photos.length > 0) {
        requestData.extra_body = {
          image: base64Photos,
          response_format: 'url'
        }
      }
    } catch (e) {
      console.warn('照片转 base64 失败，降级为纯文生图:', e.message)
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

- [ ] **Step 2: 提交代码**

```bash
git add src/utils/ai-service.js
git commit -m "feat: 修改 generateImage 使用 LLM 生成的提示词"
```

---

### Task 3: 测试验证

**Files:**
- 无新增文件，手动测试

- [ ] **Step 1: 测试文生图模式**

1. 打开 APP，进入 AI 创作页面
2. 选择一条已完成的挑战记录
3. 不选择照片，直接点击"下一步"
4. 选择"AI 海报"类型
5. 选择一个风格（如"搞笑夸张"）
6. 点击"开始创作"
7. 验证生成的图片是否包含具体菜品名称

- [ ] **Step 2: 测试图生图模式**

1. 打开 APP，进入 AI 创作页面
2. 选择一条有照片的挑战记录
3. 选择 1-2 张照片
4. 选择"AI 海报"类型
5. 选择一个风格
6. 点击"开始创作"
7. 验证生成的图片是否融合了照片内容和战绩数据

- [ ] **Step 3: 测试错误降级**

1. 临时修改设置中的 `ocrServiceUrl` 为无效地址
2. 尝试生成图片
3. 验证是否降级使用本地模板
4. 恢复正确的配置

- [ ] **Step 4: 提交最终代码**

```bash
git add -A
git commit -m "feat: AI 创作提示词增强功能完成"
```

---

## 自我审查

**1. Spec 覆盖检查：**
- ✅ 文生图模式：通过 `generatePrompt` 函数实现
- ✅ 图生图模式：通过 `generatePromptWithPhoto` 函数实现
- ✅ 配置复用：使用 `ocrServiceUrl` 和 `ocrApiKey`
- ✅ 错误处理：降级使用 `generateLocalPrompt`

**2. Placeholder 扫描：**
- ✅ 无 TBD、TODO 或不完整部分
- ✅ 所有函数都有完整实现

**3. 类型一致性：**
- ✅ 函数签名一致
- ✅ 参数名称一致
