/**
 * Canvas / ECharts 专用主题色值
 * Canvas API 和 ECharts 不支持 CSS 变量，需要硬编码 hex/rgba 值
 * 统一在此维护，避免多处重复定义
 */

export const CANVAS_COLORS = {
  dark: {
    // 品类色
    category: {
      meat: '#E8453C',
      seafood: '#3B82F6',
      staples: '#F59E0B',
      dessert: '#EC4899',
      drinks: '#8B5CF6',
      vegetables: '#34D399',
      other: '#9CA3AF'
    },
    // 主题色
    accent: '#FF6B35',
    accentLight: '#FF8F60',
    accentDeep: '#E85520',
    accentMuted: '#CC5528',
    gold: '#FFD700',
    // 文字
    textPrimary: '#F0F0F5',
    textSecondary: '#9E9EB8',
    textTertiary: '#8080A0',
    // 背景
    bg: '#131320',
    bgDeep: '#0A0A12',
    surface: '#1A1A2E',
    // 雷达图网格
    gridLine: 'rgba(255, 255, 255, 0.1)',
    gridFill: 'rgba(255, 255, 255, 0.04)',
    axisLine: 'rgba(255, 255, 255, 0.18)',
    // 雷达图数据区
    polygonFill: 'rgba(255, 107, 53, 0.2)',
    polygonStroke: '#FF6B35',
    polygonFillAnim: 'rgba(255, 107, 53, 0.25)',
    polygonStrokeAnim: 'rgba(255, 107, 53, 0.9)',
    // 地图
    geoRegion: '#181828',
    geoBorder: '#10101A',
    scatterBg: 'rgba(255, 107, 53, 0.04)'
  },
  light: {
    category: {
      meat: '#C03030',
      seafood: '#2563EB',
      staples: '#B45309',
      dessert: '#BE185D',
      drinks: '#6D28D9',
      vegetables: '#16A36A',
      other: '#4B5563'
    },
    accent: '#D94F1E',
    accentLight: '#F06830',
    accentDeep: '#C04018',
    accentMuted: '#A03610',
    gold: '#C08B10',
    textPrimary: '#181820',
    textSecondary: '#3C3C54',
    textTertiary: '#545468',
    bg: '#F4F1EC',
    bgDeep: '#E8E5E0',
    surface: '#FFFFFF',
    gridLine: 'rgba(0, 0, 0, 0.06)',
    gridFill: 'rgba(0, 0, 0, 0.02)',
    axisLine: 'rgba(0, 0, 0, 0.12)',
    polygonFill: 'rgba(217, 79, 30, 0.12)',
    polygonStroke: '#D94F1E',
    polygonFillAnim: 'rgba(217, 79, 30, 0.18)',
    polygonStrokeAnim: 'rgba(217, 79, 30, 0.9)',
    geoRegion: '#E8E5E0',
    geoBorder: '#DDD9D3',
    scatterBg: 'rgba(217, 79, 30, 0.04)'
  }
}
