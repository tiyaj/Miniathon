import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const inputDir = path.resolve('assets-src/hero');
const outputDir = path.resolve('public/images/hero');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const files = fs.readdirSync(inputDir).filter(f => /\.(jpe?g|png|webp)$/i.test(f));

console.log(`Processing ${files.length} images from ${inputDir} -> ${outputDir}...`);

for (const file of files) {
  const baseName = path.parse(file).name;
  const inputPath = path.join(inputDir, file);

  for (const width of [640, 960]) {
    const outputPath = path.join(outputDir, `${baseName}-${width}.webp`);
    try {
      await sharp(inputPath)
        .resize({ width, withoutEnlargement: true })
        .modulate({ saturation: 0.92, brightness: 0.95 })
        .linear(1.06, -6)
        .webp({ quality: 80 })
        .toFile(outputPath);
      console.log(`  ✓ Created ${baseName}-${width}.webp`);
    } catch (err) {
      console.error(`  ✗ Error creating ${outputPath}:`, err);
    }
  }
}

console.log('All hero photos successfully optimized and graded with sharp!');
