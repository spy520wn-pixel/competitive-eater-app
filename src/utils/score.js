const CATEGORY_WEIGHTS = {
  '肉类': 3,
  '海鲜': 3,
  '蔬菜': 1,
  '主食': 2,
  '饮品': 1,
  '甜点': 2,
  '其他': 1
}

export function calculateScore(items, diners = 1) {
  if (!items || items.length === 0) return 0

  const categoryTotals = {}
  items.forEach(item => {
    const cat = item.category
    if (!categoryTotals[cat]) categoryTotals[cat] = 0
    categoryTotals[cat] += item.quantity
  })

  let score = 0
  for (const [category, total] of Object.entries(categoryTotals)) {
    const weight = CATEGORY_WEIGHTS[category] || 1
    score += total * weight
  }

  if (diners > 1) {
    score = Math.round(score / diners)
  }

  return score
}
