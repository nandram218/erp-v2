const { spawn } = require('child_process');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const RUNTIME_PROOF = path.join(ROOT, 'runtime-proof');
const START_CMD = 'npm';
const START_ARGS = ['start'];
const PORT = 3000;
const HOME_URL = `http://localhost:${PORT}/`;
const SCHOOL_PROFILE_URL = `http://localhost:${PORT}/school-profile`;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function waitForPort(host, port, timeout = 120000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    function attempt() {
      const net = require('net');
      const s = net.createConnection(port, host, () => {
        s.destroy();
        resolve();
      });
      s.on('error', () => {
        s.destroy();
        if (Date.now() - start > timeout) return reject(new Error('Timeout waiting for port'));
        setTimeout(attempt, 500);
      });
    }
    attempt();
  });
}

async function dumpLocalStorage(page) {
  return await page.evaluate(() => {
    const out = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      out[k] = localStorage.getItem(k);
    }
    return out;
  });
}

function diffLocalStorage(before, after) {
  const beforeKeys = new Set(Object.keys(before));
  const afterKeys = new Set(Object.keys(after));
  const added = [];
  const removed = [];
  const changed = [];
  for (const k of afterKeys) {
    if (!beforeKeys.has(k)) added.push(k);
    else if (before[k] !== after[k]) changed.push(k);
  }
  for (const k of beforeKeys) {
    if (!afterKeys.has(k)) removed.push(k);
  }
  return { added, removed, changed };
}

async function main() {
  ensureDir(RUNTIME_PROOF);

  console.log('Starting npm start...');
  const child = spawn(START_CMD, START_ARGS, {
    cwd: ROOT,
    shell: true,
    stdio: ['inherit', 'pipe', 'pipe']
  });

  child.stdout.on('data', (d) => {
    process.stdout.write(d);
  });
  child.stderr.on('data', (d) => {
    process.stderr.write(d);
  });

  let compiled = false;
  const compileLineRE = /Compiled successfully|webpack compiled/i;

  await new Promise((resolve, reject) => {
    child.stdout.on('data', (d) => {
      const text = d.toString();
      if (!compiled && compileLineRE.test(text)) {
        compiled = true;
        resolve();
      }
    });
    child.stderr.on('data', (d) => {
      const text = d.toString();
      if (!compiled && compileLineRE.test(text)) {
        compiled = true;
        resolve();
      }
    });
    setTimeout(() => {
      if (!compiled) reject(new Error('Did not detect "Compiled successfully" within timeout'));
    }, 300000);
  });

  console.log('Detected compile success. Waiting for port...');
  await waitForPort('127.0.0.1', PORT, 60000);

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log('Visiting /');
  await page.goto(HOME_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  const before = await dumpLocalStorage(page);
  fs.writeFileSync(path.join(RUNTIME_PROOF, 'storage-before.json'), JSON.stringify(before, null, 2));
  console.log('Saved storage-before.json');

  console.log('Visiting /school-profile');
  await page.goto(SCHOOL_PROFILE_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  const after = await dumpLocalStorage(page);
  fs.writeFileSync(path.join(RUNTIME_PROOF, 'storage-after.json'), JSON.stringify(after, null, 2));
  console.log('Saved storage-after.json');

  const diff = diffLocalStorage(before, after);
  fs.writeFileSync(path.join(RUNTIME_PROOF, 'storage-diff.json'), JSON.stringify(diff, null, 2));
  console.log('Saved storage-diff.json');

  await page.screenshot({ path: path.join(RUNTIME_PROOF, 'school-profile.png'), fullPage: true });
  console.log('Saved school-profile.png');

  await browser.close();
  child.kill('SIGINT');
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});