import { settingsStore } from '../store/settings-store'
import { createMenuItem } from '../store/models'
import { withRetry } from './retry'

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
  if (!settings.ocrServiceUrl || !settings.ocrApiKey) {
    throw new Error('请先在设置中配置识图大模型服务地址和 API Key')
  }

  const base64 = await imageToBase64(imagePath)

  const response = await withRetry(() => uni.request({
    url: settings.ocrServiceUrl,
    method: 'POST',
    header: {
      'Authorization': `Bearer ${settings.ocrApiKey}`,
      'Content-Type': 'application/json'
    },
    data: {
      model: settings.ocrModel || 'agnes-2.0-flash',
      max_tokens: 65536,
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
  }), { label: '识图大模型' })

  const content = response.data.choices[0].message.content
  const jsonMatch = content.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('AI 返回格式异常')

  const items = JSON.parse(jsonMatch[0])

  return items.map(item => ({
    name: item.name,
    category: guessCategory(item.name),
    unit: guessUnit(item.name)
  }))
}

function imageToBase64(path) {
  return new Promise((resolve, reject) => {
    // #ifdef H5
    fetch(path).then(r => r.blob()).then(blob => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.readAsDataURL(blob)
    }).catch(reject)
    // #endif

    // #ifndef H5
    uni.getFileSystemManager().readFile({
      filePath: path,
      encoding: 'base64',
      success: (res) => resolve(`data:image/jpeg;base64,${res.data}`),
      fail: reject
    })
    // #endif
  })
}
