import { withRetry } from './retry.js'

/**
 * 统一的 uni.request Promise 封装 + 重试
 * @param {Object} options - { url, method, header, data }
 * @param {Object} retryOptions - { retries, label }
 */
export function requestWithRetry(options, retryOptions) {
  return withRetry(() => new Promise((resolve, reject) => {
    uni.request({
      ...options,
      success: (res) => resolve(res),
      fail: (err) => reject(err)
    })
  }), retryOptions)
}
