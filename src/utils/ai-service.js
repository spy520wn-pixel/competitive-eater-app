import { settingsStore } from '../store/settings-store'
import { withRetry } from './retry'

function buildCategoryText(items) {
  const summary = {}
  items.forEach(item => {
    summary[item.category] = (summary[item.category] || 0) + item.quantity
  })
  return Object.entries(summary).map(([cat, qty]) => `${cat}${qty}`).join('、')
}

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

export async function generatePoster(record, style, photoPaths = []) {
  const settings = settingsStore.get()
  if (!settings.aiServiceUrl || !settings.aiApiKey) {
    throw new Error('请先在设置中配置生图大模型服务地址和 API Key')
  }

  const styleDesc = IMAGE_STYLES[style] || IMAGE_STYLES['简约战绩']

  const catText = buildCategoryText(record.items)

  const prompt = `生成一张大胃王战绩海报。
风格：${styleDesc}
战绩信息：
- 店铺：${record.shopName}
${record.tierName ? '- 档位：' + record.tierName : ''}
- 战斗力评分：${record.score}分
- 菜品：${catText}
- 就餐时长：${record.duration}分钟

要求：突出战绩数据，视觉冲击力强，适合发朋友圈炫耀。`

  const response = await withRetry(() => uni.request({
    url: settings.aiServiceUrl,
    method: 'POST',
    header: {
      'Authorization': `Bearer ${settings.aiApiKey}`,
      'Content-Type': 'application/json'
    },
    data: {
      model: settings.aiModel || 'agnes-image-2.0-flash',
      prompt,
      size: '1024x1024'
    }
  }), { label: '生图大模型' })

  if (!response.data?.data?.[0]?.url) {
    throw new Error('生图服务返回数据格式错误')
  }
  return response.data.data[0].url
}

export const AVAILABLE_STYLES = Object.keys(IMAGE_STYLES)

export function imageToBase64(path) {
  return new Promise((resolve, reject) => {
    // #ifdef H5
    fetch(path).then(r => r.blob()).then(blob => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.readAsDataURL(blob)
    }).catch(reject)
    // #endif

    // #ifdef APP-PLUS
    plus.io.resolveLocalFileSystemURL(path, (entry) => {
      entry.file((file) => {
        const reader = new plus.io.FileReader()
        reader.onloadend = (e) => {
          resolve(e.target.result)
        }
        reader.onerror = (e) => {
          reject(new Error('读取图片失败'))
        }
        reader.readAsDataURL(file)
      }, (err) => {
        reject(new Error('获取文件失败'))
      })
    }, (err) => {
      reject(new Error('解析文件路径失败'))
    })
    // #endif

    // #ifdef MP
    uni.getFileSystemManager().readFile({
      filePath: path,
      encoding: 'base64',
      success: (res) => resolve(`data:image/jpeg;base64,${res.data}`),
      fail: reject
    })
    // #endif
  })
}

// 菜单图片识别功能
const MENU_SYSTEM_PROMPT = `你是一个菜单图片识别助手。你的任务是从图片中识别出菜品信息，并返回结构化的JSON数据。

## 返回格式要求

你必须严格按照以下JSON格式返回，不要返回任何其他内容：

\`\`\`json
{
  "success": true,
  "menu": [
    {
      "name": "菜品名称",
      "category": "分类",
      "unit": "单位"
    }
  ],
  "tiers": [
    {
      "name": "档位名称",
      "menu": [
        {
          "name": "菜品名称",
          "category": "分类",
          "unit": "单位"
        }
      ]
    }
  ]
}
\`\`\`

## 字段说明

### menu（基础菜单）
- 如果店铺没有档位区分，所有菜品放在 menu 数组中
- 如果有档位区分，基础菜单可以为空数组

### tiers（档位菜单）
- 如果店铺有不同价位的档位（如：午市套餐、晚市套餐、VIP套餐等），每个档位的菜品放在对应的 tiers 数组中
- 如果没有档位区分，tiers 为空数组

### 菜品字段说明
- **name**: 菜品名称（字符串，必填）
- **category**: 菜品分类，必须是以下之一：
  - "肉类"（包括猪肉、牛肉、羊肉、鸡肉等）
  - "海鲜"（包括鱼、虾、蟹、贝类等）
  - "主食"（包括米饭、面条、馒头、饺子等）
  - "甜点"（包括蛋糕、冰淇淋、布丁等）
  - "饮料"（包括酒水、果汁、茶饮等）
  - "其他"（不属于以上分类的）
- **unit**: 计量单位（字符串，必填），常见值：
  - "份"（最常用）
  - "盘"
  - "碗"
  - "杯"
  - "个"
  - "串"
  - "只"
  - "斤"
  - "克"

## 识别规则

1. 如果图片模糊或无法识别，返回：{"success": false, "menu": [], "tiers": [], "error": "无法识别图片内容"}
2. 尽量识别所有可见的菜品，包括小字
3. 如果菜品名称不完整，根据上下文合理补全
4. 如果无法确定分类，默认使用"其他"
5. 如果无法确定单位，默认使用"份"
6. 如果图片中有明确的档位/套餐区分，使用 tiers 结构
7. 如果没有档位区分，所有菜品放在 menu 中

## 示例

### 示例1：普通菜单（无档位）
\`\`\`json
{
  "success": true,
  "menu": [
    {"name": "红烧肉", "category": "肉类", "unit": "份"},
    {"name": "清蒸鲈鱼", "category": "海鲜", "unit": "条"},
    {"name": "蛋炒饭", "category": "主食", "unit": "碗"},
    {"name": "可乐", "category": "饮料", "unit": "杯"}
  ],
  "tiers": []
}
\`\`\`

### 示例2：有档位的菜单
\`\`\`json
{
  "success": true,
  "menu": [],
  "tiers": [
    {
      "name": "午市套餐",
      "menu": [
        {"name": "宫保鸡丁", "category": "肉类", "unit": "份"},
        {"name": "米饭", "category": "主食", "unit": "碗"}
      ]
    },
    {
      "name": "晚市套餐",
      "menu": [
        {"name": "北京烤鸭", "category": "肉类", "unit": "只"},
        {"name": "凉拌黄瓜", "category": "其他", "unit": "份"}
      ]
    }
  ]
}
\`\`\`

请严格按照上述格式返回JSON，不要添加任何额外的解释或说明。`

// 修复被截断的 JSON 响应
function repairTruncatedJson(str) {
  // 找到最后一个完整的 }（最后一个完整的菜单项）
  const lastBrace = str.lastIndexOf('}')
  if (lastBrace === -1) {
    // 连一个完整项都没有，返回空结果
    return { success: true, menu: [], tiers: [] }
  }

  // 截取到最后一个完整项
  let repaired = str.substring(0, lastBrace + 1)

  // 去掉末尾可能残留的逗号
  repaired = repaired.replace(/,\s*$/, '')

  // 关闭 menu 数组和外层对象
  repaired += '], "tiers": []}'

  // 尝试修复可能的嵌套结构
  // 如果有 tiers 结构，需要关闭 tiers 数组
  if (repaired.includes('"tiers"')) {
    // 已经有 tiers，尝试直接解析
    try {
      return JSON.parse(repaired)
    } catch (e) {
      // 继续尝试
    }
  }

  // 确保有 success 字段
  if (!repaired.includes('"success"')) {
    repaired = '{"success": true, "menu": ' + repaired
  }

  try {
    return JSON.parse(repaired)
  } catch (e) {
    // 最后的尝试：提取所有完整的菜单项
    const items = []
    const itemRegex = /\{\s*"name"\s*:\s*"([^"]+)"\s*,\s*"category"\s*:\s*"([^"]+)"\s*,\s*"unit"\s*:\s*"([^"]+)"\s*\}/g
    let match
    while ((match = itemRegex.exec(str)) !== null) {
      items.push({ name: match[1], category: match[2], unit: match[3] })
    }
    return { success: true, menu: items, tiers: [] }
  }
}

export async function recognizeMenu(imagePath) {
  const settings = settingsStore.get()
  const { ocrServiceUrl, ocrApiKey, ocrModel } = settings

  if (!ocrServiceUrl) {
    throw new Error('请先在设置中配置识图大模型服务地址')
  }

  if (!ocrApiKey) {
    throw new Error('请先在设置中配置识图大模型 API Key')
  }

  // 将图片转为base64
  const imageBase64 = await imageToBase64(imagePath)

  const response = await withRetry(() => new Promise((resolve, reject) => {
    uni.request({
      url: ocrServiceUrl,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ocrApiKey}`
      },
      data: {
        model: ocrModel || 'agnes-2.0-flash',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: MENU_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '请识别这张菜单图片中的所有菜品，按照指定的JSON格式返回结果。'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        max_tokens: 65536,
        temperature: 0.1
      },
      success: (res) => resolve(res),
      fail: (err) => reject(err)
    })
  }), { label: '识图大模型' })

  if (response.statusCode !== 200) {
    throw new Error(`AI服务请求失败: ${response.statusCode}`)
  }

  const data = response.data
  if (!data.choices || !data.choices[0]) {
    throw new Error('AI服务返回数据格式错误')
  }

  const content = data.choices[0].message.content
  const finishReason = data.choices[0].finish_reason

  // 尝试解析JSON
  try {
    // 提取JSON部分（可能被包裹在```json...```中）
    let jsonStr = content
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1]
    } else {
      // 尝试直接解析
      jsonStr = content.trim()
    }

    let result
    try {
      result = JSON.parse(jsonStr)
    } catch (parseErr) {
      // 如果 finish_reason 是 length，说明响应被截断，尝试修复 JSON
      if (finishReason === 'length') {
        result = repairTruncatedJson(jsonStr)
      } else {
        throw parseErr
      }
    }

    // 验证返回格式
    if (typeof result.success !== 'boolean') {
      throw new Error('返回格式错误：缺少success字段')
    }

    if (!Array.isArray(result.menu)) {
      result.menu = []
    }

    if (!Array.isArray(result.tiers)) {
      result.tiers = []
    }

    return result
  } catch (e) {
    console.error('解析AI返回数据失败:', content, e)
    throw new Error('解析AI返回数据失败，请重试')
  }
}

export async function generatePrompt(record, style) {
  const settings = settingsStore.get()
  if (!settings.ocrServiceUrl || !settings.ocrApiKey) {
    return generateLocalPrompt(record, style)
  }

  const styleDesc = IMAGE_STYLES[style] || IMAGE_STYLES['简约战绩']
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
        // 复用 OCR 大模型配置（同一服务同时支持识图和文本生成）
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

export async function generatePromptWithPhoto(record, style, photoPaths) {
  const settings = settingsStore.get()
  if (!settings.ocrServiceUrl || !settings.ocrApiKey) {
    return generateLocalPrompt(record, style)
  }

  const styleDesc = IMAGE_STYLES[style] || IMAGE_STYLES['简约战绩']
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

  if (imageContent.length === 0) {
    return generatePrompt(record, style)
  }

  imageContent.push({ type: 'text', text: userMessage })

  try {
    const response = await withRetry(() => new Promise((resolve, reject) => {
      uni.request({
        // 复用 OCR 大模型配置（同一服务同时支持识图和文本生成）
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

function generateLocalPrompt(record, style) {
  const styleDesc = IMAGE_STYLES[style] || IMAGE_STYLES['简约战绩']

  const catText = buildCategoryText(record.items)

  return `${styleDesc}。
大胃王战绩海报：
- 店铺：${record.shopName}
- 战斗力：${record.score}分
- 菜品：${catText}
- 时长：${record.duration}分钟
要求：突出战绩数据，视觉冲击力强，适合发朋友圈炫耀。`
}

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

  const response = await withRetry(() => new Promise((resolve, reject) => {
    uni.request({
      url: settings.aiServiceUrl,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${settings.aiApiKey}`,
        'Content-Type': 'application/json'
      },
      data: requestData,
      success: (res) => resolve(res),
      fail: (err) => reject(err)
    })
  }), { label: '生图大模型' })

  if (response.statusCode !== 200) {
    throw new Error(`生图服务返回错误 (${response.statusCode}): ${JSON.stringify(response.data)}`)
  }
  if (!response.data?.data?.[0]?.url) {
    throw new Error('生图服务返回数据格式错误')
  }
  return response.data.data[0].url
}

export async function createVideoTask({ record, photoPath }) {
  const settings = settingsStore.get()
  if (!settings.videoServiceUrl || !settings.videoApiKey) {
    throw new Error('请先在设置中配置视频大模型服务地址和 API Key')
  }

  const catText = buildCategoryText(record.items)

  const prompt = `大胃王挑战精彩瞬间，${record.shopName}，战斗力${record.score}分，吃了${catText}，动感镜头，电影级画质。`

  const requestData = {
    model: settings.videoModel || 'agnes-video-v2.0',
    prompt,
    height: 768,
    width: 1152,
    num_frames: 121,
    frame_rate: 24
  }

  // 注意：视频 API 的 image 字段要求是公网 URL，不支持 base64
  // 当前不传 image，使用纯文生视频模式

  const response = await withRetry(() => new Promise((resolve, reject) => {
    uni.request({
      url: settings.videoServiceUrl,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${settings.videoApiKey}`,
        'Content-Type': 'application/json'
      },
      data: requestData,
      success: (res) => resolve(res),
      fail: (err) => reject(err)
    })
  }), { label: '视频大模型' })

  return {
    taskId: response.data.task_id,
    videoId: response.data.video_id
  }
}

export async function queryVideoResult(videoId) {
  const settings = settingsStore.get()

  const response = await uni.request({
    url: `https://apihub.agnes-ai.com/agnesapi?video_id=${videoId}`,
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
