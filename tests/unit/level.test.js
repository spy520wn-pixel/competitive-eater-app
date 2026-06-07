import { describe, it, expect } from 'vitest'
import { getLevel, getLevelName, LEVELS } from '../../src/utils/level'

describe('等级系统', () => {
  it('0分是青铜', () => {
    const level = getLevel(0)
    expect(level.name).toBe('青铜')
    expect(level.tier).toBe(1)
  })

  it('49分是青铜', () => {
    expect(getLevel(49).name).toBe('青铜')
  })

  it('50分是白银', () => {
    expect(getLevel(50).name).toBe('白银')
  })

  it('100分是黄金', () => {
    expect(getLevel(100).name).toBe('黄金')
  })

  it('200分是铂金', () => {
    expect(getLevel(200).name).toBe('铂金')
  })

  it('350分是钻石', () => {
    expect(getLevel(350).name).toBe('钻石')
  })

  it('500分是星耀', () => {
    expect(getLevel(500).name).toBe('星耀')
  })

  it('800分是王者', () => {
    expect(getLevel(800).name).toBe('王者')
  })

  it('getLevelName 返回正确名称', () => {
    expect(getLevelName(150)).toBe('黄金')
  })

  it('LEVELS 包含7个等级', () => {
    expect(LEVELS).toHaveLength(7)
  })
})
