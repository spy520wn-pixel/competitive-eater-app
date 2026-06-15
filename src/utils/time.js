/**
 * 时间格式化工具函数
 */

/**
 * 将日期转换为相对时间显示
 * @param {string|Date} date - 日期字符串或 Date 对象
 * @returns {string} 相对时间描述
 */
export function getRelativeTime(date) {
  const now = new Date()
  const target = new Date(date)
  const diff = now - target

  // 转换为秒
  const seconds = Math.floor(diff / 1000)

  // 刚刚（60秒内）
  if (seconds < 60) {
    return '刚刚'
  }

  // 分钟
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes}分钟前`
  }

  // 小时
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours}小时前`
  }

  // 天
  const days = Math.floor(hours / 24)
  if (days < 7) {
    return `${days}天前`
  }

  // 周
  const weeks = Math.floor(days / 7)
  if (weeks < 4) {
    return `${weeks}周前`
  }

  // 月
  const months = Math.floor(days / 30)
  if (months < 12) {
    return `${months}个月前`
  }

  // 年
  const years = Math.floor(days / 365)
  return `${years}年前`
}

/**
 * 格式化日期为 YYYY-MM-DD 格式
 * @param {string|Date} date - 日期字符串或 Date 对象
 * @returns {string} 格式化后的日期
 */
export function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 格式化日期为 MM月DD日 格式
 * @param {string|Date} date - 日期字符串或 Date 对象
 * @returns {string} 格式化后的日期
 */
export function formatDateCN(date) {
  if (!date) return ''
  const d = new Date(date)
  const month = d.getMonth() + 1
  const day = d.getDate()
  return `${month}月${day}日`
}
