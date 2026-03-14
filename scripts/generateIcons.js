import sharp from 'sharp';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgPath   = resolve(__dirname, 'icon.svg');
const svgBuffer = readFileSync(svgPath);
const resDir    = resolve(__dirname, '../android/app/src/main/res');

const targets = [
  // Legacy launcher icons
  { file: 'mipmap-mdpi/ic_launcher.png',          size: 48  },
  { file: 'mipmap-hdpi/ic_launcher.png',          size: 72  },
  { file: 'mipmap-xhdpi/ic_launcher.png',         size: 96  },
  { file: 'mipmap-xxhdpi/ic_launcher.png',        size: 144 },
  { file: 'mipmap-xxxhdpi/ic_launcher.png',       size: 192 },
  // Round launcher icons
  { file: 'mipmap-mdpi/ic_launcher_round.png',    size: 48  },
  { file: 'mipmap-hdpi/ic_launcher_round.png',    size: 72  },
  { file: 'mipmap-xhdpi/ic_launcher_round.png',   size: 96  },
  { file: 'mipmap-xxhdpi/ic_launcher_round.png',  size: 144 },
  { file: 'mipmap-xxxhdpi/ic_launcher_round.png', size: 192 },
  // Adaptive icon foreground (108dp per density)
  { file: 'mipmap-mdpi/ic_launcher_foreground.png',    size: 81  },
  { file: 'mipmap-hdpi/ic_launcher_foreground.png',    size: 108 },
  { file: 'mipmap-xhdpi/ic_launcher_foreground.png',   size: 162 },
  { file: 'mipmap-xxhdpi/ic_launcher_foreground.png',  size: 216 },
  { file: 'mipmap-xxxhdpi/ic_launcher_foreground.png', size: 324 },
];

for (const { file, size } of targets) {
  const out = resolve(resDir, file);
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(out);
  console.log(`✓ ${file} (${size}×${size})`);
}

console.log('\nAll icons generated.');
