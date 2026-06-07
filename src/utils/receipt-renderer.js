/**
 * 小票渲染器 —— 将战绩记录绘制成热敏打印风格的小票图片
 */
export function renderReceipt(record) {
  return new Promise((resolve) => {
    const width = 375
    const padding = 24
    const lineHeight = 32
    let y = 30

    // Calculate height based on items
    const itemsCount = record.items.length
    const catCount = new Set(record.items.map(i => i.category)).size
    const height = 30 + lineHeight * (10 + itemsCount) + 80

    const ctx = uni.createCanvasContext('receiptCanvas')

    // White background
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(0, 0, width, height)

    // Title
    ctx.setFillStyle('#333333')
    ctx.setFontSize(22)
    ctx.setTextAlign('center')
    ctx.fillText('大胃王战绩', width / 2, y)
    y += lineHeight

    // Dashed separator
    ctx.setStrokeStyle('#cccccc')
    ctx.setLineWidth(1)
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(width - padding, y)
    ctx.stroke()
    ctx.setLineDash([])
    y += lineHeight

    // Basic info
    ctx.setTextAlign('left')
    ctx.setFontSize(14)
    ctx.setFillStyle('#333')
    ctx.fillText(`店铺：${record.shopName}`, padding, y); y += lineHeight
    if (record.tierName) {
      ctx.fillText(`档位：${record.tierName}`, padding, y); y += lineHeight
    }
    ctx.fillText(`日期：${record.createdAt?.slice(0, 10) || ''}`, padding, y); y += lineHeight
    ctx.fillText(`时长：${record.duration}分钟`, padding, y); y += lineHeight

    // Dashed separator
    y += 4
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(width - padding, y)
    ctx.stroke()
    ctx.setLineDash([])
    y += lineHeight

    // Item list header
    ctx.setFontSize(12)
    ctx.setFillStyle('#999')
    ctx.fillText('菜品', padding, y)
    ctx.setTextAlign('right')
    ctx.fillText('数量', width - padding, y)
    y += lineHeight

    // Item list
    ctx.setTextAlign('left')
    ctx.setFillStyle('#333')
    ctx.setFontSize(14)
    record.items.forEach(item => {
      ctx.fillText(item.name, padding, y)
      ctx.setTextAlign('right')
      ctx.fillText(`${item.quantity}${item.unit}`, width - padding, y)
      ctx.setTextAlign('left')
      y += lineHeight
    })

    // Dashed separator
    y += 4
    ctx.setLineDash([4, 4])
    ctx.setStrokeStyle('#cccccc')
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(width - padding, y)
    ctx.stroke()
    ctx.setLineDash([])
    y += lineHeight

    // Summary
    ctx.setFontSize(14)
    ctx.setFillStyle('#333')
    ctx.fillText(`总计：${record.items.length}道菜 · ${catCount}类`, padding, y); y += lineHeight

    // Score (highlighted in orange)
    ctx.setFillStyle('#FF6B35')
    ctx.setFontSize(18)
    ctx.fillText(`战斗力：${record.score} ⭐`, padding, y); y += lineHeight + 10

    // Footer
    ctx.setTextAlign('center')
    ctx.setFontSize(12)
    ctx.setFillStyle('#999')
    ctx.fillText('大胃王APP - 记录你的每一次战绩', width / 2, y)

    ctx.draw(false, () => {
      setTimeout(() => {
        uni.canvasToTempFilePath({
          canvasId: 'receiptCanvas',
          success: (res) => resolve(res.tempFilePath),
          fail: () => resolve(null)
        })
      }, 300)
    })
  })
}

export async function saveReceiptToAlbum(record) {
  const filePath = await renderReceipt(record)
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
