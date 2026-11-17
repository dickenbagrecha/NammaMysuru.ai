const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = 'C:\\Users\\dicke\\AppData\\Local\\Temp\\chrome-hero-responsive';
const DEBUG_PORT = 9228;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch(e) { resolve(d); } });
    }).on('error', reject);
  });
}

function sendCDP(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1000000);
    const handler = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      } catch (err) {}
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function main() {
  const auditDir = path.resolve('CHATBOT_AUDIT');
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    '--disable-gpu',
    '--no-first-run',
    'http://localhost:5001/'
  ], { detached: false, stdio: 'ignore' });

  try {
    let wsUrl = null;
    for (let i = 0; i < 30; i++) {
      try {
        const list = await httpGet(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
        if (Array.isArray(list)) {
          const page = list.find(t => t.type === 'page');
          if (page && page.webSocketDebuggerUrl) { wsUrl = page.webSocketDebuggerUrl; break; }
        }
      } catch (e) {}
      await sleep(300);
    }
    const ws = new WebSocket(wsUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    await sendCDP(ws, 'Page.enable');

    const viewports = [
      { name: 'hero_1920x1080.png', w: 1920, h: 1080, dpr: 1, mobile: false, label: 'Full HD Desktop (1920x1080)' },
      { name: 'hero_1536x864.png', w: 1536, h: 864, dpr: 1, mobile: false, label: 'Standard Laptop (1536x864)' },
      { name: 'hero_1366x768.png', w: 1366, h: 768, dpr: 1, mobile: false, label: 'Compact Desktop / Tablet (1366x768)' },
      { name: 'hero_390x844.png', w: 390, h: 844, dpr: 2, mobile: true, label: 'Mobile Viewport (iPhone 14, 390x844)' },
      { name: 'hero_3840x2160_4k.png', w: 3840, h: 2160, dpr: 1, mobile: false, label: '4K Ultra HD Display (3840x2160)' }
    ];

    for (const vp of viewports) {
      console.log(`Setting viewport for ${vp.label}...`);
      await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
        width: vp.w,
        height: vp.h,
        deviceScaleFactor: vp.dpr,
        mobile: vp.mobile
      });
      await sleep(1500);

      const shot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png', fromSurface: true });
      const outPath = path.join(auditDir, vp.name);
      fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
      console.log(`Saved ${vp.name} (${fs.statSync(outPath).size} bytes)`);
    }

    console.log('\nAll responsive hero screenshots successfully captured!');
    ws.close();
  } finally {
    try { chromeProc.kill(); } catch (e) {}
  }
}

main().catch(console.error);
