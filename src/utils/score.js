const CATEGORY_WEIGHTS = {
  '肉类': 3,
  '海鲜': 3,
  '主食': 2,
  '甜点': 2,
  '饮料': 1,
  '其他': 1
}

const CATEGORY_BONUS = 20

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

  const categoryCount = Object.keys(categoryTotals).length
  score += categoryCount * CATEGORY_BONUS

  // 根据就餐人数打折
  if (diners > 1) {
    score = Math.round(score / diners)
  }

  return score
}
