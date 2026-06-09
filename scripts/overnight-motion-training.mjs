import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const progressPath = 'public/motion-training-progress.json';
const objectivePath = 'docs/motion-training/motion-objective-score.json';
const montageDir = 'docs/motion-training/montage';
const logPath = 'docs/motion-training/overnight-training.log';
const passThreshold = 92;
const cycleIterations = Number(process.argv.find((arg) => arg.startsWith('--cycle-iterations='))?.split('=')[1] ?? 25);
const captureEvery = Number(process.argv.find((arg) => arg.startsWith('--capture-every='))?.split('=')[1] ?? 3);
const deadline = getDeadline();
let devServer = null;
let captures = [];

function getDeadline() {
  const explicit = process.argv.find((arg) => arg.startsWith('--until='))?.split('=')[1];
  if (explicit) {
    return new Date(explicit);
  }

  const now = new Date();
  const nextSix = new Date(now);
  nextSix.setHours(6, 0, 0, 0);
  if (nextSix <= now) {
    nextSix.setDate(nextSix.getDate() + 1);
  }
  return nextSix;
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function appendLog(message) {
  ensureDir(logPath);
  fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${message}\n`);
}

function writeProgress(nextProgress) {
  ensureDir(progressPath);
  fs.writeFileSync(progressPath, `${JSON.stringify({
    updatedAt: new Date().toISOString(),
    deadline: deadline.toISOString(),
    ...nextProgress,
  }, null, 2)}\n`);
}

function readObjective() {
  if (!fs.existsSync(objectivePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(objectivePath, 'utf8'));
}

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function serverReady() {
  try {
    const response = await fetch('http://127.0.0.1:5173/', { cache: 'no-store' });
    return response.ok;
  } catch {
    return false;
  }
}

async function ensureDevServer() {
  if (await serverReady()) {
    return;
  }

  appendLog('Starting local dev server on 127.0.0.1:5173');
  devServer = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'dev'], {
    cwd: process.cwd(),
    stdio: ['ignore', 'ignore', 'ignore'],
    windowsHide: true,
  });

  for (let i = 0; i < 30; i += 1) {
    if (await serverReady()) {
      return;
    }
    await wait(1000);
  }

  appendLog('Dev server was not reachable; training will continue without browser captures');
}

async function cdpRequest(url, method = 'GET') {
  const response = await fetch(url, { method });
  return response.json();
}

async function connectCdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });

  let id = 0;
  const callbacks = new Map();
  ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !callbacks.has(message.id)) {
      return;
    }
    const callback = callbacks.get(message.id);
    callbacks.delete(message.id);
    if (message.error) {
      callback.reject(new Error(JSON.stringify(message.error)));
    } else {
      callback.resolve(message.result);
    }
  });

  return {
    send(method, params = {}) {
      const requestId = ++id;
      ws.send(JSON.stringify({ id: requestId, method, params }));
      return new Promise((resolve, reject) => callbacks.set(requestId, { resolve, reject }));
    },
    close() {
      ws.close();
    },
  };
}

async function ensureChrome() {
  try {
    await cdpRequest('http://127.0.0.1:9222/json/version');
    return true;
  } catch {
    // Continue below.
  }

  if (!/^win/.test(process.platform)) {
    return false;
  }

  const profile = path.join(process.env.TEMP ?? '.', 'johnny-five-training-chrome-profile');
  fs.mkdirSync(profile, { recursive: true });
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  if (!fs.existsSync(chromePath)) {
    return false;
  }

  spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--use-angle=swiftshader',
    `--user-data-dir=${profile}`,
    'about:blank',
  ], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  }).unref();

  for (let i = 0; i < 12; i += 1) {
    await wait(1000);
    try {
      await cdpRequest('http://127.0.0.1:9222/json/version');
      return true;
    } catch {
      // Keep waiting.
    }
  }

  return false;
}

async function captureMilestone(iteration, score) {
  if (!await serverReady() || !await ensureChrome()) {
    return null;
  }

  fs.mkdirSync(montageDir, { recursive: true });
  const target = await cdpRequest('http://127.0.0.1:9222/json/new?http://127.0.0.1:5173/?brain=1', 'PUT');
  const cdp = await connectCdp(target.webSocketDebuggerUrl);
  try {
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Page.navigate', { url: 'http://127.0.0.1:5173/?brain=1' });
    await wait(6500);
    const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    const fileName = `training-${String(iteration).padStart(4, '0')}-${Math.round(score)}.png`;
    const filePath = path.join(montageDir, fileName);
    fs.writeFileSync(filePath, Buffer.from(screenshot.data, 'base64'));
    return fileName;
  } finally {
    cdp.close();
  }
}

function writeMontage() {
  fs.mkdirSync(montageDir, { recursive: true });
  const items = captures.map((capture) => `
    <figure>
      <img src="./${capture.file}" alt="Training capture ${capture.iteration}">
      <figcaption>Iteration ${capture.iteration} - score ${Math.round(capture.score)}%</figcaption>
    </figure>`).join('\n');
  fs.writeFileSync(path.join(montageDir, 'index.html'), `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Johnny Overnight Motion Training Montage</title>
  <style>
    body { margin: 0; background: #171512; color: #f4efe6; font-family: Inter, system-ui, sans-serif; }
    main { max-width: 1180px; margin: 0 auto; padding: 28px; }
    h1 { margin: 0 0 8px; font-size: 32px; }
    p { margin: 0 0 22px; color: #c8bfb2; }
    section { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
    figure { margin: 0; border: 1px solid rgba(244,239,230,.16); border-radius: 8px; overflow: hidden; background: #24211d; }
    img { display: block; width: 100%; height: auto; }
    figcaption { padding: 10px 12px; color: #f4efe6; font-size: 13px; font-weight: 750; }
  </style>
</head>
<body>
  <main>
    <h1>Johnny Overnight Motion Training</h1>
    <p>Generated ${new Date().toLocaleString()} with ${captures.length} milestone captures.</p>
    <section>${items}</section>
  </main>
</body>
</html>
`);
}

function runCoach(iteration) {
  const result = spawnSync(process.execPath, [
    'scripts/coach-reference-motion.mjs',
    `--iterations=${cycleIterations}`,
  ], {
    cwd: process.cwd(),
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 64,
    windowsHide: true,
  });

  if (result.error || result.status !== 0) {
    const errorText = result.error instanceof Error ? result.error.message : '';
    const outputText = result.stderr || result.stdout || '';
    appendLog(`Coach failed at iteration ${iteration}: ${errorText || outputText || `exit ${result.status}`}`);
    return false;
  }

  return true;
}

async function main() {
  const startedAt = new Date().toISOString();
  fs.mkdirSync(montageDir, { recursive: true });
  fs.writeFileSync(logPath, '');
  await ensureDevServer();

  writeProgress({
    status: 'running',
    startedAt,
    iteration: 0,
    totalIterations: 1,
    currentScore: 0,
    trainedScore: 0,
    passThreshold,
    captures: 0,
    currentSkill: 'walk',
    message: 'Starting overnight motion training',
  });

  let iteration = 0;
  while (Date.now() < deadline.getTime()) {
    iteration += 1;
    const coachPassed = runCoach(iteration);
    const objective = readObjective();
    const currentScore = objective?.currentScore?.overall ?? 0;
    const trainedScore = objective?.trainedScore?.overall ?? currentScore;
    const skills = Object.entries(objective?.trainedScore?.skillScores ?? {});
    const weakest = skills.sort((a, b) => (a[1].score ?? 0) - (b[1].score ?? 0))[0]?.[0] ?? 'walk';

    if (iteration === 1 || iteration % captureEvery === 0) {
      try {
        const file = await captureMilestone(iteration, trainedScore);
        if (file) {
          captures.push({ file, iteration, score: trainedScore });
          writeMontage();
        }
      } catch (error) {
        appendLog(`Capture failed at iteration ${iteration}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    writeProgress({
      status: trainedScore >= passThreshold ? 'passing' : 'running',
      startedAt,
      iteration,
      totalIterations: Math.max(iteration + 1, 1),
      currentScore,
      trainedScore,
      passThreshold,
      captures: captures.length,
      currentSkill: weakest,
      message: !coachPassed
        ? 'Coach cycle failed; retrying with existing profile data'
        : trainedScore >= passThreshold
        ? 'Profile target is passing; continuing refinement until deadline'
        : `Training toward ${passThreshold}% target; weakest skill is ${weakest}`,
    });

    appendLog(`Iteration ${iteration}: current ${currentScore}, trained ${trainedScore}, weakest ${weakest}`);

    if (Date.now() + 45000 >= deadline.getTime()) {
      break;
    }
    await wait(30000);
  }

  writeMontage();
  const objective = readObjective();
  writeProgress({
    status: 'complete',
    startedAt,
    iteration,
    totalIterations: iteration,
    currentScore: objective?.currentScore?.overall ?? 0,
    trainedScore: objective?.trainedScore?.overall ?? 0,
    passThreshold,
    captures: captures.length,
    currentSkill: 'summary',
    message: 'Overnight motion training complete',
  });

  if (devServer) {
    devServer.kill();
  }
}

main().catch((error) => {
  appendLog(error instanceof Error ? error.stack ?? error.message : String(error));
  writeProgress({
    status: 'error',
    iteration: 0,
    totalIterations: 0,
    currentScore: 0,
    trainedScore: 0,
    passThreshold,
    captures: captures.length,
    currentSkill: 'error',
    message: error instanceof Error ? error.message : String(error),
  });
  process.exitCode = 1;
});
