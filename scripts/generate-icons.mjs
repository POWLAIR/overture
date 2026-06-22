// One-shot script — run once with: node scripts/generate-icons.mjs
import sharp from "sharp"
import { mkdir } from "fs/promises"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC = join(__dirname, "..", "public")

function makeSvg(size) {
  const radius = Math.round(size * 0.18)
  const fontSize = Math.round(size * 0.58)
  const half = size / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="#0d0a07"/>
  <text
    x="${half}" y="${half}"
    dominant-baseline="central"
    text-anchor="middle"
    font-family="Georgia, 'Times New Roman', serif"
    font-weight="700"
    font-size="${fontSize}"
    fill="#c8872a"
  >O</text>
</svg>`
}

async function generate(size, dest) {
  await sharp(Buffer.from(makeSvg(size))).png().toFile(dest)
  console.log("✓", dest)
}

async function main() {
  await mkdir(join(PUBLIC, "icons"), { recursive: true })
  await generate(192, join(PUBLIC, "icons", "icon-192.png"))
  await generate(512, join(PUBLIC, "icons", "icon-512.png"))
  await generate(96, join(PUBLIC, "icon-badge.png"))
  console.log("Done.")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
