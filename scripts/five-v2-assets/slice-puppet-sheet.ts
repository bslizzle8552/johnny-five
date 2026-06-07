import { createReadStream, createWriteStream, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const root = fileURLToPath(new URL('../..', import.meta.url));
const sourceDir = join(root, 'src/assets/five-v2/source');
const partsDir = join(root, 'src/assets/five-v2/parts');
const reviewDir = join(root, 'src/assets/five-v2/review');

mkdirSync(partsDir, { recursive: true });
mkdirSync(reviewDir, { recursive: true });

const puppetSource = join(sourceDir, 'five_v2_puppet_sheet.png');
const treadSource = join(sourceDir, 'five_v2_tread_frames_sheet.png');

const puppetCrops = [
  ['head_bar', puppetSource, 110, 50, 410, 205],
  ['left_eye_housing', puppetSource, 585, 72, 210, 200],
  ['right_eye_housing', puppetSource, 855, 72, 210, 200],
  ['left_lens', puppetSource, 1090, 70, 118, 112],
  ['right_lens', puppetSource, 1245, 70, 118, 112],
  ['left_eye_glow', puppetSource, 1090, 205, 118, 118],
  ['right_eye_glow', puppetSource, 1245, 205, 118, 118],
  ['neck_mount', puppetSource, 125, 302, 208, 142],
  ['torso', puppetSource, 426, 288, 310, 350],
  ['red_toolbox', puppetSource, 775, 315, 255, 170],
  ['indicator_light_amber', puppetSource, 1090, 330, 96, 122],
  ['left_tread_housing', puppetSource, 258, 585, 260, 240],
  ['right_tread_housing', puppetSource, 960, 585, 265, 250],
  ['chassis', puppetSource, 575, 585, 345, 248],
  ['left_shoulder_joint', puppetSource, 48, 500, 130, 116],
  ['left_upper_arm', puppetSource, 48, 565, 120, 168],
  ['left_lower_arm', puppetSource, 58, 680, 120, 178],
  ['left_gripper', puppetSource, 70, 778, 150, 120],
  ['right_shoulder_joint', puppetSource, 1268, 495, 128, 118],
  ['right_upper_arm', puppetSource, 1285, 565, 118, 165],
  ['right_lower_arm', puppetSource, 1290, 680, 118, 178],
  ['right_gripper', puppetSource, 1302, 778, 150, 120],
  ['antenna', puppetSource, 115, 304, 118, 76],
  ['sensor_top_left', puppetSource, 500, 872, 115, 72],
  ['sensor_top_right', puppetSource, 1140, 868, 115, 78],
  ['small_wires', puppetSource, 888, 858, 235, 96],
];

const treadCrops = [
  ['left_tread_belt_00', treadSource, 85, 105, 345, 255],
  ['left_tread_belt_01', treadSource, 520, 105, 345, 255],
  ['left_tread_belt_02', treadSource, 955, 105, 345, 255],
  ['left_tread_belt_03', treadSource, 1388, 105, 345, 255],
  ['right_tread_belt_00', treadSource, 85, 520, 345, 255],
  ['right_tread_belt_01', treadSource, 520, 520, 345, 255],
  ['right_tread_belt_02', treadSource, 955, 520, 345, 255],
  ['right_tread_belt_03', treadSource, 1388, 520, 345, 255],
];

const crops = [...puppetCrops, ...treadCrops];

function loadPng(path) {
  return new Promise((resolve, reject) => {
    createReadStream(path)
      .pipe(new PNG())
      .on('parsed', function parsed() {
        resolve(this);
      })
      .on('error', reject);
  });
}

function writePng(path, png) {
  mkdirSync(dirname(path), { recursive: true });
  return new Promise((resolve, reject) => {
    png.pack().pipe(createWriteStream(path)).on('finish', resolve).on('error', reject);
  });
}

function isMagenta(r, g, b) {
  return r > 180 && b > 170 && g < 90;
}

function copyCleanCrop(source, x, y, width, height) {
  const cropped = new PNG({ width, height, colorType: 6 });
  for (let cy = 0; cy < height; cy += 1) {
    for (let cx = 0; cx < width; cx += 1) {
      const sourceIndex = ((y + cy) * source.width + (x + cx)) * 4;
      const targetIndex = (cy * width + cx) * 4;
      let r = source.data[sourceIndex];
      const g = source.data[sourceIndex + 1];
      let b = source.data[sourceIndex + 2];
      let a = source.data[sourceIndex + 3];

      if (isMagenta(r, g, b)) {
        a = 0;
      } else if (r > 150 && b > 140 && g < 130) {
        r = Math.min(r, 120);
        b = Math.min(b, 120);
      }

      cropped.data[targetIndex] = r;
      cropped.data[targetIndex + 1] = g;
      cropped.data[targetIndex + 2] = b;
      cropped.data[targetIndex + 3] = a;
    }
  }
  return trimTransparent(cropped, 12);
}

function trimTransparent(source, padding) {
  let minX = source.width;
  let minY = source.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const index = (y * source.width + x) * 4 + 3;
      if (source.data[index] > 8) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < 0) {
    return source;
  }

  const width = maxX - minX + 1 + padding * 2;
  const height = maxY - minY + 1 + padding * 2;
  const target = new PNG({ width, height, colorType: 6 });
  target.data.fill(0);

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const sourceIndex = (y * source.width + x) * 4;
      const targetX = x - minX + padding;
      const targetY = y - minY + padding;
      const targetIndex = (targetY * width + targetX) * 4;
      source.data.copy(target.data, targetIndex, sourceIndex, sourceIndex + 4);
    }
  }

  return target;
}

function drawImage(target, image, atX, atY, maxWidth, maxHeight) {
  const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
  const drawWidth = Math.max(1, Math.round(image.width * scale));
  const drawHeight = Math.max(1, Math.round(image.height * scale));

  for (let y = 0; y < drawHeight; y += 1) {
    for (let x = 0; x < drawWidth; x += 1) {
      const sourceX = Math.floor(x / scale);
      const sourceY = Math.floor(y / scale);
      const sourceIndex = (sourceY * image.width + sourceX) * 4;
      const alpha = image.data[sourceIndex + 3] / 255;
      if (alpha <= 0) {
        continue;
      }
      const targetIndex = ((atY + y) * target.width + atX + x) * 4;
      for (let channel = 0; channel < 3; channel += 1) {
        target.data[targetIndex + channel] = Math.round(
          image.data[sourceIndex + channel] * alpha + target.data[targetIndex + channel] * (1 - alpha),
        );
      }
      target.data[targetIndex + 3] = 255;
    }
  }
}

function drawLabel(target, text, x, y) {
  const bytes = Buffer.from(text.slice(0, 24), 'ascii');
  for (let i = 0; i < bytes.length; i += 1) {
    for (let bit = 0; bit < 7; bit += 1) {
      if ((bytes[i] >> bit) & 1) {
        const px = x + i * 5 + bit % 3;
        const py = y + Math.floor(bit / 3);
        const index = (py * target.width + px) * 4;
        target.data[index] = 45;
        target.data[index + 1] = 45;
        target.data[index + 2] = 45;
        target.data[index + 3] = 255;
      }
    }
  }
}

async function makeContactSheet(partPaths) {
  const cellWidth = 210;
  const cellHeight = 170;
  const columns = 5;
  const rows = Math.ceil(partPaths.length / columns);
  const sheet = new PNG({ width: columns * cellWidth, height: rows * cellHeight, colorType: 6 });

  for (let y = 0; y < sheet.height; y += 1) {
    for (let x = 0; x < sheet.width; x += 1) {
      const index = (y * sheet.width + x) * 4;
      const checker = (Math.floor(x / 12) + Math.floor(y / 12)) % 2 === 0 ? 238 : 220;
      sheet.data[index] = checker;
      sheet.data[index + 1] = checker;
      sheet.data[index + 2] = checker;
      sheet.data[index + 3] = 255;
    }
  }

  for (let i = 0; i < partPaths.length; i += 1) {
    const part = await loadPng(partPaths[i].path);
    const col = i % columns;
    const row = Math.floor(i / columns);
    const x = col * cellWidth + 16;
    const y = row * cellHeight + 20;
    drawImage(sheet, part, x, y, cellWidth - 32, cellHeight - 54);
    drawLabel(sheet, partPaths[i].name, col * cellWidth + 12, row * cellHeight + cellHeight - 24);
  }

  await writePng(join(reviewDir, 'five_v2_asset_contact_sheet.png'), sheet);
}

const sourceCache = new Map();
const written = [];

for (const [name, sourcePath, x, y, width, height] of crops) {
  if (!sourceCache.has(sourcePath)) {
    sourceCache.set(sourcePath, await loadPng(sourcePath));
  }
  const source = sourceCache.get(sourcePath);
  const part = copyCleanCrop(source, x, y, width, height);
  const out = join(partsDir, `${name}.png`);
  await writePng(out, part);
  written.push({ name: `${name}.png`, path: out });
}

await makeContactSheet(written);

console.log(`Sliced ${written.length} V2 PNG parts.`);
console.log('Wrote src/assets/five-v2/review/five_v2_asset_contact_sheet.png.');
