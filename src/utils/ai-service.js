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
${record.tierName ? '- 档位：' + record.tierName : ''}
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

export const AVAILABLE_STYLES = Object.keys(STYLE_PROMPTS)

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
