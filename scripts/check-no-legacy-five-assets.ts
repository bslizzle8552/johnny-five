import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const scanRoots = ['src/components/five-v2', 'src/five-v2'].map((item) => join(root, item));
const checkedExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.css']);

const bannedPatterns = [
  { pattern: /assets\/five(?!-v2)/i, reason: 'references legacy src/assets/five or assets/five art' },
  { pattern: /\.\.\/assets\/five(?!-v2)/i, reason: 'imports legacy src/assets/five art' },
  { pattern: /visual_foundation/i, reason: 'references legacy visual foundation sheets' },
  { pattern: /production\/core|production\/movement/i, reason: 'references legacy full-body production poses' },
  { pattern: /sources\/approved|sources\/generated-green/i, reason: 'references legacy source pose art' },
  { pattern: /components\/five(?!-v2)/i, reason: 'references legacy Five component tree' },
  { pattern: /animation\/five(?!-v2)/i, reason: 'references legacy Five animation tree' },
  { pattern: /five\/rig|five\\rig|five\/parts|five\\parts/i, reason: 'references old extracted rig or parts' },
  { pattern: /<svg|\bcanvas\b|CanvasRenderingContext2D/i, reason: 'uses SVG or canvas-drawn character rendering in V2' },
  { pattern: /placeholder robot|debug dot|anchor dot|tracking dot|blur box|smear|black box/i, reason: 'uses banned placeholder or fake motion terminology in V2' },
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

    return checkedExtensions.has(extname(path)) ? [path] : [];
  });
}

const failures = [];

for (const file of scanRoots.flatMap(walk)) {
  const text = readFileSync(file, 'utf8');
  for (const rule of bannedPatterns) {
    if (rule.pattern.test(text)) {
      failures.push(`${relative(root, file)}: ${rule.reason}`);
    }
  }
}

if (failures.length > 0) {
  console.error('V2 legacy asset check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('V2 legacy asset check passed: no V2 references to deprecated Johnny assets.');
