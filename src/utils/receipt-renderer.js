/**
 * 小票渲染器 - 将战绩记录绘制成热敏打印风格的小票图片
 */

// 先计算小票高度（供页面设置 canvas DOM 高度）
export function calcReceiptHeight(record) {
  const baseLines = 10 // 标题 + 分隔线 + 基本信息行 + 表头 + 汇总 + 战斗力 + 页脚
  const itemLines = record.items.length
  const tierLine = record.tierName ? 1 : 0
  const lineHeight = 30
  const headerHeight = 60
  const footerHeight = 90
  return headerHeight + lineHeight * (baseLines + tierLine + itemLines) + footerHeight
}

export function renderReceipt(record, canvasWidth) {
  return new Promise((resolve) => {
    const W = canvasWidth || 375
    const H = calcReceiptHeight(record)
    const pad = 28
    const lh = 30
    let y = 0

    const ctx = uni.createCanvasContext('receiptCanvas')

    // ── 纸张背景（微暖白） ──
    ctx.setFillStyle('#FAFAF5')
    ctx.fillRect(0, 0, W, H)

    // ── 顶部装饰线 ──
    y = 20
    ctx.setStrokeStyle('#FF6B35')
    ctx.setLineWidth(3)
    ctx.beginPath()
    ctx.moveTo(pad, y)
    ctx.lineTo(W - pad, y)
    ctx.stroke()
    y += 8
    ctx.setLineWidth(1)
    ctx.beginPath()
    ctx.moveTo(pad, y)
    ctx.lineTo(W - pad, y)
    ctx.stroke()
    y += 24

    // ── 标题 ──
    ctx.setFillStyle('#1A1A2E')
    ctx.setFontSize(24)
    ctx.setTextAlign('center')
    ctx.fillText('大 胃 王 战 绩', W / 2, y)
    y += lh + 6

    // ── 虚线分隔 ──
    drawDashedLine(ctx, pad, y, W - pad, y, '#CCCCCC')
    y += lh

    // ── 店铺名（突出显示） ──
    ctx.setTextAlign('center')
    ctx.setFillStyle('#1A1A2E')
    ctx.setFontSize(18)
    ctx.fillText(record.shopName, W / 2, y)
    y += lh

    // ── 档位（可选） ──
    if (record.tierName) {
      ctx.setFontSize(13)
      ctx.setFillStyle('#666')
      ctx.fillText(`【${record.tierName}】`, W / 2, y)
      y += lh
    }

    // ── 日期和时长 ──
    ctx.setFontSize(12)
    ctx.setFillStyle('#888')
    const dateStr = record.createdAt?.slice(0, 10) || ''
    const timeStr = record.createdAt?.slice(11, 16) || ''
    ctx.fillText(`${dateStr}  ${timeStr}  ·  ${record.duration}分钟`, W / 2, y)
    y += lh + 4

    // ── 虚线分隔 ──
    drawDashedLine(ctx, pad, y, W - pad, y, '#CCCCCC')
    y += lh

    // ── 菜品表头 ──
    ctx.setFontSize(11)
    ctx.setFillStyle('#999')
    ctx.setTextAlign('left')
    ctx.fillText('品名', pad, y)
    ctx.setTextAlign('right')
    ctx.fillText('数量', W - pad, y)
    y += lh - 4

    // ── 细线分隔 ──
    ctx.setStrokeStyle('#E0E0E0')
    ctx.setLineWidth(0.5)
    ctx.beginPath()
    ctx.moveTo(pad, y)
    ctx.lineTo(W - pad, y)
    ctx.stroke()
    y += 8

    // ── 菜品列表 ──
    ctx.setFontSize(14)
    ctx.setFillStyle('#333')
    record.items.forEach(item => {
      ctx.setTextAlign('left')
      // 菜名过长时截断
      const maxNameWidth = W - pad * 2 - 80
      let displayName = item.name
      if (ctx.measureText && ctx.measureText(displayName) > maxNameWidth) {
        displayName = displayName.slice(0, 8) + '…'
      }
      ctx.fillText(displayName, pad, y)
      ctx.setTextAlign('right')
      ctx.setFillStyle('#555')
      ctx.fillText(`${item.quantity}${item.unit}`, W - pad, y)
      ctx.setFillStyle('#333')
      y += lh
    })

    // ── 虚线分隔 ──
    y += 4
    drawDashedLine(ctx, pad, y, W - pad, y, '#CCCCCC')
    y += lh

    // ── 汇总 ──
    const catCount = new Set(record.items.map(i => i.category)).size
    ctx.setFontSize(13)
    ctx.setFillStyle('#555')
    ctx.setTextAlign('left')
    ctx.fillText(`共 ${record.items.length} 道菜 · ${catCount} 个分类`, pad, y)
    y += lh + 4

    // ── 战斗力（大号橙色） ──
    ctx.setFillStyle('#FF6B35')
    ctx.setFontSize(28)
    ctx.setTextAlign('center')
    ctx.fillText(`${record.score}`, W / 2, y)
    // "战斗力" 标签
    ctx.setFontSize(12)
    ctx.setFillStyle('#999')
    ctx.fillText('战 斗 力', W / 2, y + 20)
    y += 48

    // ── 虚线分隔 ──
    drawDashedLine(ctx, pad, y, W - pad, y, '#CCCCCC')
    y += lh

    // ── 页脚 ──
    ctx.setFontSize(11)
    ctx.setFillStyle('#AAA')
    ctx.setTextAlign('center')
    ctx.fillText('大胃王APP · 记录你的每一次战绩', W / 2, y)
    y += lh

    // ── 底部装饰线 ──
    y += 10
    ctx.setStrokeStyle('#FF6B35')
    ctx.setLineWidth(1)
    ctx.beginPath()
    ctx.moveTo(pad, y)
    ctx.lineTo(W - pad, y)
    ctx.stroke()
    y += 4
    ctx.setLineWidth(3)
    ctx.beginPath()
    ctx.moveTo(pad, y)
    ctx.lineTo(W - pad, y)
    ctx.stroke()

    ctx.draw(false, () => {
      setTimeout(() => {
        uni.canvasToTempFilePath({
          canvasId: 'receiptCanvas',
          x: 0,
          y: 0,
          width: W,
          height: H,
          destWidth: W * 2,
          destHeight: H * 2,
          success: (res) => resolve(res.tempFilePath),
          fail: (err) => {
            console.error('[Receipt] canvasToTempFilePath fail:', err)
            resolve(null)
          }
        })
      }, 500)
    })
  })
}

function drawDashedLine(ctx, x1, y, x2, y2, color) {
  ctx.setStrokeStyle(color || '#CCCCCC')
  ctx.setLineWidth(1)
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(x1, y)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  ctx.setLineDash([])
}

export async function saveReceiptToAlbum(record, canvasWidth) {
  const filePath = await renderReceipt(record, canvasWidth)
  if (!filePath) {
    uni.showToast({ title: '生成失败', icon: 'none' })
    return false
  }
  return new Promise((resolve) => {
    uni.saveImageToPhotosAlbum({
      filePath,
      success: () => {
        uni.showToast({ title: '已保存到相册', icon: 'success' })
        resolve(true)
      },
      fail: () => {
        uni.showToast({ title: '保存失败', icon: 'none' })
        resolve(false)
      }
    })
  })
}
