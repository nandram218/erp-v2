const { chromium } = require('puppeteer');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

(async () => {
  const port = 3456;
  const server = spawn('npx', ['react-scripts', 'start', '--port', String(port)], { shell: true, cwd: 'c:\\Users\\Hello\\erp-v2' });

  let collected = [];
  server.stdout.setEncoding('utf8');
  server.stdout.on('data', chunk => {
    const text = chunk.toString();
    if (/You can now view/i.test(text) || /Compiled successfully/i.test(text)) {
      collected.push(text);
    }
  });
  server.stderr.setEncoding('utf8');
  server.stderr.on('data', chunk => collected.push(chunk.toString()));

  await new Promise(r => setTimeout(r, 15000));

  if (!collected.some(s => /You can now view/i.test(s))) {
    console.error('Dev server did not start in time. Collected output:');
    collected.forEach(s => console.error(s));
    process.exit(2);
  }

  const browser = await chromium.launch({ headless: 'new', devtools: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.setCacheEnabled(false);

  const result = { steps: [] };

  const dump = async (label) => {
    const keys = await page.evaluate(() => {
      const out = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        try { out[k] = JSON.parse(localStorage.getItem(k)); } catch (e) { out[k] = localStorage.getItem(k); }
      }
      return out;
    });
    result.steps.push({ label, keys, timestamp: new Date().toISOString() });
    console.log('===', label, '===');
    console.log(JSON.stringify(keys, null, 2));
  };

  await page.goto(`http://localhost:${port}`, { waitUntil: 'networkidle2', timeout: 90000 });
  await dump('initial');

  await page.goto(`http://localhost:${port}/school-profile`, { waitUntil: 'networkidle2', timeout: 90000 });
  await page.evaluate(() => {
    const event = new Event('devtools-ready', { bubbles: true });
    window.dispatchEvent(event);
  });
  await dump('school_profile_view_load');

  await page.screenshot({ path: 'runtime-proof/school-profile.png', fullPage: true }).catch(() => {});
  await browser.close();
  server.kill('SIGTERM');

  fs.mkdirSync('runtime-proof', { recursive: true });
  fs.writeFileSync('runtime-proof/school-profile-only.json', JSON.stringify(result, null, 2));
  console.log('Saved runtime-proof/school-profile-only.json');
})().catch(err => { console.error(err); process.exit(1); });