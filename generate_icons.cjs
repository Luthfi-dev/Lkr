const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generate() {
  const svgPath = path.join(__dirname, 'public', 'icon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  // 1. icon-192.png
  await sharp(svgBuffer)
    .resize(192, 192)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(__dirname, 'public', 'icon-192.png'));
  console.log('Generated icon-192.png');

  // 2. icon-512.png
  await sharp(svgBuffer)
    .resize(512, 512)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(__dirname, 'public', 'icon-512.png'));
  console.log('Generated icon-512.png');

  // 3. icon-maskable-512.png (with padding for maskable safety circle)
  const maskableInner = await sharp(svgBuffer)
    .resize(410, 410)
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 4, g: 47, b: 46, alpha: 1 } // #042f2e
    }
  })
    .composite([{ input: maskableInner, gravity: 'center' }])
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(__dirname, 'public', 'icon-maskable-512.png'));
  console.log('Generated icon-maskable-512.png');

  // 4. apple-touch-icon.png
  await sharp(svgBuffer)
    .resize(180, 180)
    .png({ quality: 100 })
    .toFile(path.join(__dirname, 'public', 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // 5. favicon.png
  await sharp(svgBuffer)
    .resize(64, 64)
    .png({ quality: 100 })
    .toFile(path.join(__dirname, 'public', 'favicon.png'));
  console.log('Generated favicon.png');

  console.log('All icons generated successfully!');
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
