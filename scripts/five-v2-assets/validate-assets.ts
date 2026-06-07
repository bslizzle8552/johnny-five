import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync, createReadStream } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const root = fileURLToPath(new URL('../..', import.meta.url));
const partsDir = join(root, 'src/assets/five-v2/parts');
const scanRoots = ['src/components/five-v2', 'src/five-v2'].map((item) => join(root, item));

export const requiredFiveV2PartFiles = [
  'left_tread_housing.png',
  'right_tread_housing.png',
  'left_tread_belt_00.png',
  'left_tread_belt_01.png',
  'left_tread_belt_02.png',
  'left_tread_belt_03.png',
  'right_tread_belt_00.png',
  'right_tread_belt_01.png',
  'right_tread_belt_02.png',
  'right_tread_belt_03.png',
  'chassis.png',
  'torso.png',
  'neck_mount.png',
  'head_bar.png',
  'left_eye_housing.png',
  'right_eye_housing.png',
  'left_lens.png',
  'right_lens.png',
  'left_eye_glow.png',
  'right_eye_glow.png',
  'left_shoulder_joint.png',
  'left_upper_arm.png',
  'left_lower_arm.png',
  'left_gripper.png',
  'right_shoulder_joint.png',
  'right_upper_arm.png',
  'right_lower_arm.png',
  'right_gripper.png',
  'red_toolbox.png',
  'indicator_light_amber.png',
];

const bannedReferencePatterns = [
  /assets\/five(?!-v2)/i,
  /visual_foundation/i,
  /production\/core|production\/movement/i,
  /sources\/approved|sources\/generated-green/i,
  /components\/five(?!-v2)/i,
  /animation\/five(?!-v2)/i,
  /five\/rig|five\\rig|five\/parts|five\\parts/i,
];

function walk(directory) {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    const stats = statSync(path);
    if (stats.isDirectory()) {
      return walk(path);
    }
    return ['.ts', '.tsx', '.js', '.jsx', '.css'].includes(extname(path)) ? [path] : [];
  });
}

function hash(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function legacyHashes() {
  const roots = ['assets/five', 'visual_foundation', 'src/assets/five'].map((item) => join(root, item));
  return new Set(
    roots
      .filter(existsSync)
      .flatMap(walkPng)
      .map((path) => hash(path)),
  );
}

function walkPng(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    const stats = statSync(path);
    if (stats.isDirectory()) {
      return walkPng(path);
    }
    return extname(path).toLowerCase() === '.png' ? [path] : [];
  });
}

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

function isMagenta(r, g, b, a) {
  return a > 220 && r > 200 && b > 190 && g < 90;
}

function isNearBlack(r, g, b, a) {
  return a > 240 && r < 12 && g < 12 && b < 12;
}

const failures = [];
const oldHashes = legacyHashes();

for (const filename of requiredFiveV2PartFiles) {
  const path = join(partsDir, filename);
  if (!existsSync(path)) {
    failures.push(`${filename}: missing`);
    continue;
  }

  if (statSync(path).size < 1200) {
    failures.push(`${filename}: suspiciously tiny file`);
  }

  if (oldHashes.has(hash(path))) {
    failures.push(`${filename}: exactly matches a legacy Johnny asset`);
  }

  const png = await loadPng(path);
  const pixels = png.width * png.height;
  let opaque = 0;
  let transparent = 0;
  let content = 0;
  let magenta = 0;
  let black = 0;
  let edgeOpaque = 0;

  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const index = (y * png.width + x) * 4;
      const r = png.data[index];
      const g = png.data[index + 1];
      const b = png.data[index + 2];
      const a = png.data[index + 3];
      if (a === 255) opaque += 1;
      if (a === 0) transparent += 1;
      if (a > 8) content += 1;
      if (isMagenta(r, g, b, a)) magenta += 1;
      if (isNearBlack(r, g, b, a)) black += 1;
      if ((x === 0 || y === 0 || x === png.width - 1 || y === png.height - 1) && a > 8) edgeOpaque += 1;
    }
  }

  if (png.width < 24 || png.height < 24) {
    failures.push(`${filename}: image dimensions are suspiciously tiny (${png.width}x${png.height})`);
  }
  if (content === 0) {
    failures.push(`${filename}: no non-transparent pixels`);
  }
  if (transparent === 0 || opaque === pixels) {
    failures.push(`${filename}: no usable transparency`);
  }
  if (edgeOpaque > (png.width + png.height) * 0.35) {
    failures.push(`${filename}: appears opaque to the image edge`);
  }
  if (magenta / pixels > 0.01) {
    failures.push(`${filename}: contains leftover chroma magenta`);
  }
  if (black / pixels > 0.35) {
    failures.push(`${filename}: contains a suspicious large solid black region`);
  }
}

for (const file of scanRoots.flatMap(walk)) {
  const text = readFileSync(file, 'utf8');
  for (const pattern of bannedReferencePatterns) {
    if (pattern.test(text)) {
      failures.push(`${relative(root, file)}: references legacy Johnny sprite assets`);
    }
  }
}

if (failures.length > 0) {
  console.error('Five V2 asset validation failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Five V2 asset validation passed: ${requiredFiveV2PartFiles.length} required transparent PNG parts are present.`);
