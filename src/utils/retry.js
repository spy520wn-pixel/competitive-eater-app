/**
 * AI 接口重试工具
 * 默认重试 3 次，全部失败后弹窗提醒
 */

const DEFAULT_RETRIES = 3

export async function withRetry(fn, { retries = DEFAULT_RETRIES, label = 'AI 接口' } = {}) {
  let lastError
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      console.warn(`[${label}] 第 ${attempt}/${retries} 次请求失败:`, err.message || err)
      if (attempt < retries) {
        // 等待后重试：1s, 2s, 3s...
        await new Promise(r => setTimeout(r, attempt * 1000))
      }
    }
  }

  // 全部失败，弹窗提醒
  uni.showModal({
    title: 'AI 请求失败',
    content: `${label}连续 ${retries} 次请求失败，请检查网络或 API 配置后重试。\n\n错误：${lastError?.message || '未知错误'}`,
    showCancel: false,
    confirmText: '知道了'
  })

  throw lastError
}
