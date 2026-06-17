import { describe, it, expect } from 'vitest'
import { getLevel, getLevelName, LEVELS, scoreToExp } from '../../src/utils/level'

describe('等级系统', () => {
  it('LEVELS 包含19个等级条目', () => {
    expect(LEVELS).toHaveLength(19)
  })

  it('scoreToExp = score + 50', () => {
    expect(scoreToExp(0)).toBe(50)
    expect(scoreToExp(100)).toBe(150)
    expect(scoreToExp(500)).toBe(550)
  })

  describe('青铜段位', () => {
    it('0经验是青铜1', () => {
      const level = getLevel(0)
      expect(level.name).toBe('青铜')
      expect(level.tier).toBe(1)
      expect(level.levelText).toBe('1')
    })
    it('99经验是青铜1', () => {
      expect(getLevel(99).levelText).toBe('1')
    })
    it('100经验是青铜2', () => {
      expect(getLevel(100).levelText).toBe('2')
    })
    it('300经验是青铜3', () => {
      expect(getLevel(300).levelText).toBe('3')
    })
  })

  describe('白银段位', () => {
    it('600经验是白银1', () => {
      const level = getLevel(600)
      expect(level.name).toBe('白银')
      expect(level.tier).toBe(2)
      expect(level.levelText).toBe('1')
    })
    it('1200经验是白银2', () => {
      expect(getLevel(1200).levelText).toBe('2')
    })
    it('2000经验是白银3', () => {
      expect(getLevel(2000).levelText).toBe('3')
    })
  })

  describe('黄金段位', () => {
    it('3200经验是黄金1', () => {
      const level = getLevel(3200)
      expect(level.name).toBe('黄金')
      expect(level.tier).toBe(3)
    })
    it('5000经验是黄金2', () => {
      expect(getLevel(5000).levelText).toBe('2')
    })
    it('7500经验是黄金3', () => {
      expect(getLevel(7500).levelText).toBe('3')
    })
  })

  describe('铂金段位', () => {
    it('11000经验是铂金1', () => {
      const level = getLevel(11000)
      expect(level.name).toBe('铂金')
      expect(level.tier).toBe(4)
    })
    it('16000经验是铂金2', () => {
      expect(getLevel(16000).levelText).toBe('2')
    })
    it('22000经验是铂金3', () => {
      expect(getLevel(22000).levelText).toBe('3')
    })
  })

  describe('钻石段位', () => {
    it('30000经验是钻石1', () => {
      const level = getLevel(30000)
      expect(level.name).toBe('钻石')
      expect(level.tier).toBe(5)
    })
    it('40000经验是钻石2', () => {
      expect(getLevel(40000).levelText).toBe('2')
    })
    it('52000经验是钻石3', () => {
      expect(getLevel(52000).levelText).toBe('3')
    })
  })

  describe('星耀段位', () => {
    it('65000经验是星耀1', () => {
      const level = getLevel(65000)
      expect(level.name).toBe('星耀')
      expect(level.tier).toBe(6)
    })
    it('80000经验是星耀2', () => {
      expect(getLevel(80000).levelText).toBe('2')
    })
    it('100000经验是星耀3', () => {
      expect(getLevel(100000).levelText).toBe('3')
    })
  })

  describe('王者段位', () => {
    it('130000经验是王者', () => {
      const level = getLevel(130000)
      expect(level.name).toBe('王者')
      expect(level.tier).toBe(7)
      expect(level.levelText).toBe('')
    })
    it('999999经验仍是王者', () => {
      expect(getLevel(999999).name).toBe('王者')
    })
  })

  it('getLevelName 返回正确名称', () => {
    expect(getLevelName(0)).toBe('青铜')
    expect(getLevelName(600)).toBe('白银')
    expect(getLevelName(3200)).toBe('黄金')
    expect(getLevelName(11000)).toBe('铂金')
    expect(getLevelName(30000)).toBe('钻石')
    expect(getLevelName(65000)).toBe('星耀')
    expect(getLevelName(130000)).toBe('王者')
  })

  it('progress 在0到1之间', () => {
    const level = getLevel(600)
    expect(level.progress).toBeGreaterThanOrEqual(0)
    expect(level.progress).toBeLessThanOrEqual(1)
  })

  it('王者progress为1', () => {
    const level = getLevel(130000)
    expect(level.progress).toBe(1)
  })

  it('nextExp 正确指向下一等级阈值', () => {
    expect(getLevel(0).nextExp).toBe(100)
    expect(getLevel(100).nextExp).toBe(300)
    expect(getLevel(600).nextExp).toBe(1200)
    expect(getLevel(130000).nextExp).toBeNull()
  })
})
