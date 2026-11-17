const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const USER_DATA_DIR = "C:\\Users\\dicke\\AppData\\Local\\Temp\\chrome-inspect-candidates";
const DEBUG_PORT = 9225;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
      });
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
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { margin: 0; background: #111; color: white; font-family: sans-serif; }
          .container { display: flex; flex-direction: column; gap: 20px; padding: 20px; }
          .card { border: 2px solid #gold; border-radius: 8px; overflow: hidden; background: #222; }
          h2 { margin: 10px; }
          img { width: 100%; max-height: 500px; object-fit: contain; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <h2>Candidate 1: Mysuru_Palace_-_Night_View.jpg (6831x3421, 18.9MB)</h2>
            <img src="file://${path.resolve('temp_palace_night_view_6831x3421.jpg').replace(/\\/g, '/')}" />
          </div>
          <div class="card">
            <h2>Candidate 2: Mysore_Palace_-_Night_lighting.jpg (5184x3086, 1.5MB)</h2>
            <img src="file://${path.resolve('temp_palace_night_lighting_5184x3086.jpg').replace(/\\/g, '/')}" />
          </div>
        </div>
      </body>
    </html>
  `;
  const inspectHtmlPath = path.resolve('temp_inspect.html');
  fs.writeFileSync(inspectHtmlPath, htmlContent);

  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    '--disable-gpu',
    '--no-first-run',
    '--allow-file-access-from-files',
    `file://${inspectHtmlPath.replace(/\\/g, '/')}`
  ], { detached: false, stdio: 'ignore' });

  try {
    let wsUrl = null;
    for (let i = 0; i < 30; i++) {
      try {
        const list = await httpGet(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
        if (Array.isArray(list)) {
          const page = list.find(t => t.type === 'page');
          if (page && page.webSocketDebuggerUrl) {
            wsUrl = page.webSocketDebuggerUrl;
            break;
          }
        }
      } catch (e) {}
      await sleep(300);
    }
    if (!wsUrl) throw new Error('No ws target');

    const ws = new WebSocket(wsUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    await sendCDP(ws, 'Page.enable');
    await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', { width: 1920, height: 1200, deviceScaleFactor: 1, mobile: false });
    await sleep(2000);

    const screenshot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('temp_candidates_comparison.png', Buffer.from(screenshot.data, 'base64'));
    console.log('Saved temp_candidates_comparison.png');
    ws.close();
  } finally {
    try { chromeProc.kill(); } catch (e) {}
  }
}

main().catch(console.error);
