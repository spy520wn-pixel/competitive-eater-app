import { describe, it, expect } from 'vitest'
import { calculateScore } from '../../src/utils/score'

describe('战斗力评分', () => {
  it('空战绩返回0', () => {
    expect(calculateScore([])).toBe(0)
  })

  it('单分类单菜品正确计算', () => {
    const items = [{ category: '肉类', quantity: 3 }]
    // 3*3 + 20 = 29
    expect(calculateScore(items)).toBe(29)
  })

  it('多分类多菜品正确计算', () => {
    const items = [
      { category: '肉类', quantity: 5 },
      { category: '海鲜', quantity: 3 },
      { category: '主食', quantity: 2 },
      { category: '饮料', quantity: 1 }
    ]
    // 5*3 + 3*3 + 2*2 + 1*1 + 4*20 = 15+9+4+1+80 = 109
    expect(calculateScore(items)).toBe(109)
  })

  it('同分类多个菜品累加', () => {
    const items = [
      { category: '肉类', quantity: 2 },
      { category: '肉类', quantity: 3 }
    ]
    // (2+3)*3 + 1*20 = 35
    expect(calculateScore(items)).toBe(35)
  })
})
