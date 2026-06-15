// Generate tab bar icons as PNG files using pure Node.js
// Creates 81x81 pixel RGBA PNG icons
const fs = require('fs')
const path = require('path')

const SIZE = 81
const CENTER = Math.floor(SIZE / 2)
const OUT_DIR = path.join(__dirname, '..', 'src', 'static', 'images')

// CRC32 for PNG
function crc32(buf) {
  let c = 0xFFFFFFFF
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let cc = n
    for (let k = 0; k < 8; k++) cc = cc & 1 ? 0xEDB88320 ^ (cc >>> 1) : cc >>> 1
    table[n] = cc
  }
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xFF] ^ (c >>> 8)
  return (c ^ 0xFFFFFFFF) >>> 0
}

function createPNG(pixels) {
  // IHDR
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(SIZE, 0)
  ihdr.writeUInt32BE(SIZE, 4)
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0

  // IDAT (uncompressed deflate)
  const rawData = Buffer.alloc(SIZE * (SIZE * 4 + 1))
  for (let y = 0; y < SIZE; y++) {
    rawData[y * (SIZE * 4 + 1)] = 0 // filter none
    for (let x = 0; x < SIZE; x++) {
      const si = (y * SIZE + x) * 4
      const di = y * (SIZE * 4 + 1) + 1 + x * 4
      rawData[di] = pixels[si]
      rawData[di + 1] = pixels[si + 1]
      rawData[di + 2] = pixels[si + 2]
      rawData[di + 3] = pixels[si + 3]
    }
  }

  // Wrap in deflate stream
  const deflate = Buffer.alloc(rawData.length + 6)
  deflate[0] = 0x78; deflate[1] = 0x01
  deflate[2] = 0x01; deflate[3] = rawData.length & 0xFF; deflate[4] = (rawData.length >> 8) & 0xFF
  rawData.copy(deflate, 5)
  const adler = adler32(rawData)
  deflate[deflate.length - 1] = adler & 0xFF
  deflate[deflate.length - 2] = (adler >> 8) & 0xFF
  deflate[deflate.length - 3] = (adler >> 16) & 0xFF
  deflate[deflate.length - 4] = (adler >> 24) & 0xFF

  function adler32(buf) {
    let a = 1, b = 0
    for (let i = 0; i < buf.length; i++) { a = (a + buf[i]) % 65521; b = (b + a) % 65521 }
    return ((b << 16) | a) >>> 0
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
    const typeB = Buffer.from(type)
    const crcData = Buffer.concat([typeB, data])
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(crcData))
    return Buffer.concat([len, typeB, data, crc])
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflate),
    chunk('IEND', Buffer.alloc(0))
  ])
}

function setPixel(pixels, x, y, r, g, b, a = 255) {
  if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return
  const i = (y * SIZE + x) * 4
  pixels[i] = r; pixels[i + 1] = g; pixels[i + 2] = b; pixels[i + 3] = a
}

function drawCircle(pixels, cx, cy, radius, r, g, b, a = 255, fill = false) {
  for (let y = -radius; y <= radius; y++) {
    for (let x = -radius; x <= radius; x++) {
      const d = Math.sqrt(x * x + y * y)
      if (fill ? d <= radius : Math.abs(d - radius) < 1.2) {
        setPixel(pixels, cx + x, cy + y, r, g, b, a)
      }
    }
  }
}

function drawLine(pixels, x0, y0, x1, y1, r, g, b, a = 255, width = 2) {
  const dx = x1 - x0, dy = y1 - y0
  const steps = Math.max(Math.abs(dx), Math.abs(dy))
  for (let i = 0; i <= steps; i++) {
    const x = Math.round(x0 + dx * i / steps)
    const y = Math.round(y0 + dy * i / steps)
    for (let w = -width; w <= width; w++) {
      setPixel(pixels, x + w, y, r, g, b, a)
      setPixel(pixels, x, y + w, r, g, b, a)
    }
  }
}

function drawRect(pixels, x, y, w, h, r, g, b, a = 255) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      setPixel(pixels, x + dx, y + dy, r, g, b, a)
    }
  }
}

function drawRoundRect(pixels, x, y, w, h, radius, r, g, b, a = 255) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const cx = Math.max(0, Math.max(radius - dx, dx - w + 1 + radius))
      const cy = Math.max(0, Math.max(radius - dy, dy - h + 1 + radius))
      if (cx * cx + cy * cy <= radius * radius + 1) {
        setPixel(pixels, x + dx, y + dy, r, g, b, a)
      }
    }
  }
}

// Home icon: bold house
function iconHome(color) {
  const [r, g, b] = color
  const pixels = new Uint8Array(SIZE * SIZE * 4)
  // Roof (thick triangle)
  for (let y = 0; y < 26; y++) {
    const halfW = Math.round(8 + y * 1.0)
    for (let x = -halfW; x <= halfW; x++) {
      for (let t = -2; t <= 2; t++) setPixel(pixels, CENTER + x, 18 + y + t, r, g, b)
    }
  }
  // Walls
  drawRect(pixels, CENTER - 18, 42, 6, 26, r, g, b)
  drawRect(pixels, CENTER + 12, 42, 6, 26, r, g, b)
  // Floor
  drawRect(pixels, CENTER - 20, 66, 40, 4, r, g, b)
  // Door
  drawRect(pixels, CENTER - 6, 50, 12, 18, r, g, b)
  return pixels
}

// Record icon: bold chart bars
function iconRecord(color) {
  const [r, g, b] = color
  const pixels = new Uint8Array(SIZE * SIZE * 4)
  // Bar 1
  drawRect(pixels, CENTER - 24, 30, 14, 34, r, g, b)
  // Bar 2
  drawRect(pixels, CENTER - 6, 18, 14, 46, r, g, b)
  // Bar 3
  drawRect(pixels, CENTER + 12, 36, 14, 28, r, g, b)
  // Base
  drawRect(pixels, CENTER - 28, 64, 56, 4, r, g, b)
  return pixels
}

// Challenge icon: bold fire
function iconChallenge(color) {
  const [r, g, b] = color
  const pixels = new Uint8Array(SIZE * SIZE * 4)
  // Outer flame
  for (let y = 0; y < 48; y++) {
    const t = y / 48
    const w = Math.round(24 * Math.sin(t * Math.PI) * (1 - t * 0.25))
    for (let x = -w; x <= w; x++) {
      for (let t2 = -1; t2 <= 1; t2++) setPixel(pixels, CENTER + x, 16 + y + t2, r, g, b)
    }
  }
  // Inner flame
  for (let y = 0; y < 32; y++) {
    const t = y / 32
    const w = Math.round(15 * Math.sin(t * Math.PI) * (1 - t * 0.3))
    for (let x = -w; x <= w; x++) {
      setPixel(pixels, CENTER + x, 26 + y, 255, 220, 120)
    }
  }
  return pixels
}

// Mine icon: bold person
function iconMine(color) {
  const [r, g, b] = color
  const pixels = new Uint8Array(SIZE * SIZE * 4)
  // Head
  drawCircle(pixels, CENTER, 24, 14, r, g, b, 255, true)
  // Body
  for (let y = 0; y < 34; y++) {
    const t = y / 34
    const w = Math.round(22 * Math.sin(t * Math.PI * 0.7 + 0.3))
    for (let x = -w; x <= w; x++) {
      for (let t2 = -1; t2 <= 1; t2++) setPixel(pixels, CENTER + x, 40 + y + t2, r, g, b)
    }
  }
  return pixels
}

// Generate all icons
const icons = [
  { name: 'tab-home', fn: iconHome, inactive: [160, 160, 180], active: [255, 107, 53] },
  { name: 'tab-record', fn: iconRecord, inactive: [160, 160, 180], active: [255, 107, 53] },
  { name: 'tab-challenge', fn: iconChallenge, inactive: [160, 160, 180], active: [255, 107, 53] },
  { name: 'tab-mine', fn: iconMine, inactive: [160, 160, 180], active: [255, 107, 53] }
]

for (const icon of icons) {
  const inactivePixels = icon.fn(icon.inactive)
  const activePixels = icon.fn(icon.active)
  fs.writeFileSync(path.join(OUT_DIR, `${icon.name}.png`), createPNG(inactivePixels))
  fs.writeFileSync(path.join(OUT_DIR, `${icon.name}-active.png`), createPNG(activePixels))
  console.log(`Generated: ${icon.name}.png, ${icon.name}-active.png`)
}

console.log('All tab icons generated.')
