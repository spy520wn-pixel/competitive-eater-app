export const CATEGORY_CSS = {
  '肉类': { color: 'var(--c-cat-meat)', glow: 'var(--c-cat-meat-glow)' },
  '海鲜': { color: 'var(--c-cat-seafood)', glow: 'var(--c-cat-seafood-glow)' },
  '主食': { color: 'var(--c-cat-staples)', glow: 'var(--c-cat-staples-glow)' },
  '甜点': { color: 'var(--c-cat-dessert)', glow: 'var(--c-cat-dessert-glow)' },
  '饮品': { color: 'var(--c-cat-drinks)', glow: 'var(--c-cat-drinks-glow)' },
  '饮料': { color: 'var(--c-cat-drinks)', glow: 'var(--c-cat-drinks-glow)' },
  '蔬菜': { color: 'var(--c-cat-vegetables)', glow: 'var(--c-cat-vegetables-glow)' },
  '其他': { color: 'var(--c-cat-other)', glow: 'var(--c-cat-other-glow)' }
}

// Canvas 专用：hex 色值（Canvas API 不支持 CSS 变量）
export const CATEGORY_CANVAS_COLORS = {
  '肉类': { dark: '#E8453C', light: '#C03030' },
  '海鲜': { dark: '#3B82F6', light: '#2563EB' },
  '主食': { dark: '#F59E0B', light: '#B45309' },
  '甜点': { dark: '#EC4899', light: '#BE185D' },
  '饮品': { dark: '#8B5CF6', light: '#6D28D9' },
  '饮料': { dark: '#8B5CF6', light: '#6D28D9' },
  '蔬菜': { dark: '#34D399', light: '#16A36A' },
  '其他': { dark: '#9CA3AF', light: '#4B5563' }
}

export function getCategoryColor(name) {
  return (CATEGORY_CSS[name] || CATEGORY_CSS['其他']).color
}

export function getCategoryGlow(name) {
  return (CATEGORY_CSS[name] || CATEGORY_CSS['其他']).glow
}

export function getCategoryCanvasColor(name, theme) {
  const entry = CATEGORY_CANVAS_COLORS[name] || CATEGORY_CANVAS_COLORS['其他']
  return entry[theme] || entry.dark
}
