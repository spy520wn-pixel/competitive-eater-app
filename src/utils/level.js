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
