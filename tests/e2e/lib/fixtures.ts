import { mkdirSync, writeFileSync } from 'fs'
import path from 'path'

import sharp from 'sharp'

const FIXTURE_DIR = path.join(process.cwd(), 'tests', 'e2e', '.tmp')
const TARGET_MIN_BYTES = 2.4 * 1024 * 1024
const TARGET_MAX_BYTES = 4.8 * 1024 * 1024

export function getFixturePaths(): { smallAvatar: string; largeAvatar: string; logo: string } {
  mkdirSync(FIXTURE_DIR, { recursive: true })

  const smallAvatar = path.join(FIXTURE_DIR, 'avatar-small.png')
  const largeAvatar = path.join(FIXTURE_DIR, 'avatar-large.png')
  const logo = path.join(FIXTURE_DIR, 'logo.png')

  return { smallAvatar, largeAvatar, logo }
}

async function renderPng(width: number, height: number): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 30, g: 120, b: 200, alpha: 1 },
    },
  })
    .png({ compressionLevel: 9, adaptiveFiltering: false })
    .toBuffer()
}

async function generateLargeAvatarBuffer(): Promise<Buffer> {
  let low = 800
  let high = 4000
  let best: Buffer | null = null

  while (low <= high) {
    const size = Math.floor((low + high) / 2)
    const buffer = await renderPng(size, size)

    if (buffer.length >= TARGET_MIN_BYTES && buffer.length <= TARGET_MAX_BYTES) {
      return buffer
    }

    if (buffer.length < TARGET_MIN_BYTES) {
      low = size + 50
      best = buffer
    } else {
      high = size - 50
    }
  }

  if (best && best.length < TARGET_MAX_BYTES) {
    return best
  }

  throw new Error('Could not generate a large avatar fixture within the upload size limit.')
}

export async function ensureImageFixtures(): Promise<{
  smallAvatar: string
  largeAvatar: string
  logo: string
}> {
  const paths = getFixturePaths()

  await sharp({
    create: {
      width: 64,
      height: 64,
      channels: 3,
      background: { r: 255, g: 204, b: 0 },
    },
  })
    .png()
    .toFile(paths.smallAvatar)

  await sharp({
    create: {
      width: 64,
      height: 64,
      channels: 3,
      background: { r: 40, g: 40, b: 40 },
    },
  })
    .png()
    .toFile(paths.logo)

  const largeBuffer = await generateLargeAvatarBuffer()
  writeFileSync(paths.largeAvatar, largeBuffer)

  return paths
}
