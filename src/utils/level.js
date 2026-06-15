// 经验值等级体系
export const LEVELS = [
  { tier: 1, name: '青铜', level: 1, min: 0, max: 99, icon: '🥉' },
  { tier: 1, name: '青铜', level: 2, min: 100, max: 249, icon: '🥉' },
  { tier: 1, name: '青铜', level: 3, min: 250, max: 499, icon: '🥉' },
  { tier: 2, name: '白银', level: 1, min: 500, max: 799, icon: '🥈' },
  { tier: 2, name: '白银', level: 2, min: 800, max: 1199, icon: '🥈' },
  { tier: 2, name: '白银', level: 3, min: 1200, max: 1799, icon: '🥈' },
  { tier: 3, name: '黄金', level: 1, min: 1800, max: 2499, icon: '🥇' },
  { tier: 3, name: '黄金', level: 2, min: 2500, max: 3499, icon: '🥇' },
  { tier: 3, name: '黄金', level: 3, min: 3500, max: 4999, icon: '🥇' },
  { tier: 4, name: '铂金', level: 1, min: 5000, max: 6999, icon: '💎' },
  { tier: 4, name: '铂金', level: 2, min: 7000, max: 9499, icon: '💎' },
  { tier: 4, name: '铂金', level: 3, min: 9500, max: 12999, icon: '💎' },
  { tier: 5, name: '钻石', level: 1, min: 13000, max: 17499, icon: '💠' },
  { tier: 5, name: '钻石', level: 2, min: 17500, max: 22999, icon: '💠' },
  { tier: 5, name: '钻石', level: 3, min: 23000, max: 29999, icon: '💠' },
  { tier: 6, name: '星耀', level: 1, min: 30000, max: 39999, icon: '⭐' },
  { tier: 6, name: '星耀', level: 2, min: 40000, max: 52999, icon: '⭐' },
  { tier: 6, name: '星耀', level: 3, min: 53000, max: 69999, icon: '⭐' },
  { tier: 7, name: '王者', level: 0, min: 70000, max: Infinity, icon: '👑' }
]

// 将挑战分数转换为经验值
export function scoreToExp(score) {
  // 基础经验值 = 分数
  // 完成挑战额外奖励 50 经验值
  return score + 50
}

// 根据总经验值获取等级信息
export function getLevel(exp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (exp >= LEVELS[i].min) {
      const current = LEVELS[i]
      const next = LEVELS[i + 1] || null
      const progress = next
        ? (exp - current.min) / (next.min - current.min)
        : 1
      return {
        ...current,
        exp,
        progress: Math.min(progress, 1),
        nextExp: next ? next.min : null,
        levelText: current.level > 0 ? `${current.level}` : ''
      }
    }
  }
  return {
    ...LEVELS[0],
    exp,
    progress: exp / LEVELS[0].max,
    nextExp: LEVELS[0].max,
    levelText: '1'
  }
}

export function getLevelName(exp) {
  return getLevel(exp).name
}
