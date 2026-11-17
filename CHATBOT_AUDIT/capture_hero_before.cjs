const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = 'C:\\Users\\dicke\\AppData\\Local\\Temp\\chrome-hero-before';
const DEBUG_PORT = 9226;

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
    await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
    await sleep(2500);

    const shot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('CHATBOT_AUDIT/hero_before.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved CHATBOT_AUDIT/hero_before.png');
    ws.close();
  } finally {
    try { chromeProc.kill(); } catch (e) {}
  }
}
main().catch(console.error);
