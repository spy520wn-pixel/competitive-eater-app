import { describe, it, expect } from 'vitest'
import { calculateScore } from '../../src/utils/score'

describe('战斗力评分', () => {
  it('空战绩返回0', () => {
    expect(calculateScore([])).toBe(0)
  })

  it('null/undefined 返回0', () => {
    expect(calculateScore(null)).toBe(0)
    expect(calculateScore(undefined)).toBe(0)
  })

  it('单分类单菜品正确计算', () => {
    const items = [{ category: '肉类', quantity: 3 }]
    // 3*3 = 9
    expect(calculateScore(items)).toBe(9)
  })

  it('多分类多菜品正确计算', () => {
    const items = [
      { category: '肉类', quantity: 5 },
      { category: '海鲜', quantity: 3 },
      { category: '主食', quantity: 2 },
      { category: '饮品', quantity: 1 }
    ]
    // 5*3 + 3*3 + 2*2 + 1*1 = 15+9+4+1 = 29
    expect(calculateScore(items)).toBe(29)
  })

  it('同分类多个菜品累加', () => {
    const items = [
      { category: '肉类', quantity: 2 },
      { category: '肉类', quantity: 3 }
    ]
    // (2+3)*3 = 15
    expect(calculateScore(items)).toBe(15)
  })

  it('多人就餐除以人数并四舍五入', () => {
    const items = [{ category: '肉类', quantity: 5 }]
    // 5*3 = 15, 15/3 = 5
    expect(calculateScore(items, 3)).toBe(5)
  })

  it('未知分类默认权重1', () => {
    const items = [{ category: '未知分类', quantity: 4 }]
    // 4*1 = 4
    expect(calculateScore(items)).toBe(4)
  })

  it('蔬菜分类权重为1', () => {
    const items = [{ category: '蔬菜', quantity: 5 }]
    expect(calculateScore(items)).toBe(5)
  })

  it('饮品分类权重为1', () => {
    const items = [{ category: '饮品', quantity: 3 }]
    expect(calculateScore(items)).toBe(3)
  })
})
