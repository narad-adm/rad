import sharp from 'sharp'
import { mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const INPUT = join(ROOT, 'public', 'icons', 'icon-512.png')
const OUTPUT_DIR = join(ROOT, 'public', 'icons')

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

mkdirSync(OUTPUT_DIR, { recursive: true })

for (const size of SIZES) {
  await sharp(INPUT)
    .resize(size, size)
    .png()
    .toFile(join(OUTPUT_DIR, `icon-${size}.png`))
  console.log(`✓ icon-${size}.png`)
}

console.log('Ícones gerados com sucesso!')
