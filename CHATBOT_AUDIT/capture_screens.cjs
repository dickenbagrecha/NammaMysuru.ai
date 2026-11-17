const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const USER_DATA_DIR = "C:\\Users\\dicke\\AppData\\Local\\Temp\\chrome-stitch-audit";
const DEBUG_PORT = 9222;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

async function waitForChrome(port, maxTries = 30) {
  for (let i = 0; i < maxTries; i++) {
    try {
      const ver = await httpGet(`http://127.0.0.1:${port}/json/version`);
      if (ver && ver.Browser) return ver;
    } catch (e) {}
    await sleep(300);
  }
  throw new Error('Chrome remote debugging did not become available');
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
  console.log('Spawning Chrome headless on port', DEBUG_PORT);
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:5001/chat'
  ], {
    detached: false,
    stdio: 'ignore'
  });

  try {
    await waitForChrome(DEBUG_PORT);
    console.log('Chrome is ready. Fetching target list...');

    let wsUrl = null;
    for (let i = 0; i < 20; i++) {
      const list = await httpGet(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
      console.log('Targets:', Array.isArray(list) ? list.map(t => ({ title: t.title, type: t.type, url: t.url })) : list);
      if (Array.isArray(list)) {
        const page = list.find(t => t.type === 'page');
        if (page && page.webSocketDebuggerUrl) {
          wsUrl = page.webSocketDebuggerUrl;
          break;
        }
      }
      await sleep(500);
    }

    if (!wsUrl) throw new Error('Could not find page target with webSocketDebuggerUrl');
    console.log('Connecting to WebSocket:', wsUrl);

    const ws = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });
    console.log('WebSocket connected. Enabling Page & DOM...');

    await sendCDP(ws, 'Page.enable');
    await sendCDP(ws, 'DOM.enable');

    const auditDir = path.resolve(__dirname);

    const scenarios = [
      {
        name: 'light_theme_desktop.png',
        width: 1536,
        height: 864,
        dpr: 1,
        mobile: false,
        theme: 'light',
        sidebar: 'false',
        desc: 'Design 1 — Light Mode Desktop (Collapsed Sidebar by default)'
      },
      {
        name: 'light_theme_expanded.png',
        width: 1536,
        height: 864,
        dpr: 1,
        mobile: false,
        theme: 'light',
        sidebar: 'true',
        desc: 'Design 1 — Light Mode Desktop (Expanded History Sidebar)'
      },
      {
        name: 'dark_theme_desktop.png',
        width: 1536,
        height: 864,
        dpr: 1,
        mobile: false,
        theme: 'dark',
        sidebar: 'true',
        desc: 'Design 3 — Dark Mode Desktop (Royal Evening Illumination, Expanded Sidebar)'
      },
      {
        name: 'dark_theme_collapsed.png',
        width: 1536,
        height: 864,
        dpr: 1,
        mobile: false,
        theme: 'dark',
        sidebar: 'false',
        desc: 'Design 3 — Dark Mode Desktop (Collapsed Sidebar & Palace Bulb Shimmer)'
      },
      {
        name: 'mobile_light.png',
        width: 390,
        height: 844,
        dpr: 2,
        mobile: true,
        theme: 'light',
        sidebar: 'false',
        desc: 'Mobile Light Theme (iPhone 14 / modern smartphone)'
      },
      {
        name: 'mobile_dark.png',
        width: 390,
        height: 844,
        dpr: 2,
        mobile: true,
        theme: 'dark',
        sidebar: 'false',
        desc: 'Mobile Dark Theme (Royal Evening Mobile)'
      },
      {
        name: 'tablet_dark.png',
        width: 1024,
        height: 768,
        dpr: 1,
        mobile: false,
        theme: 'dark',
        sidebar: 'false',
        desc: 'Tablet Dark Theme (1024x768 iPad Viewport)'
      }
    ];

    for (const sc of scenarios) {
      console.log(`\nCapturing [${sc.name}]: ${sc.desc}...`);

      await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
        width: sc.width,
        height: sc.height,
        deviceScaleFactor: sc.dpr,
        mobile: sc.mobile
      });

      await sendCDP(ws, 'Runtime.evaluate', {
        expression: `
          (function() {
            localStorage.setItem('namma-mysuru-theme', '${sc.theme}');
            localStorage.setItem('namma-mysuru-chat-sidebar-desktop', '${sc.sidebar}');
            window.location.reload();
          })()
        `
      });

      // Wait for page reload and content render
      await sleep(2500);

      // Take screenshot
      const result = await sendCDP(ws, 'Page.captureScreenshot', {
        format: 'png',
        fromSurface: true
      });

      const outPath = path.join(auditDir, sc.name);
      fs.writeFileSync(outPath, Buffer.from(result.data, 'base64'));
      const stats = fs.statSync(outPath);
      console.log(`Saved ${sc.name} (${stats.size} bytes)`);
    }

    console.log('\nAll screenshots successfully captured!');
    ws.close();
  } finally {
    try {
      chromeProc.kill();
    } catch (e) {}
  }
}

main().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
