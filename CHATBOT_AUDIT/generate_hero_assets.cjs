const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = 'C:\\Users\\dicke\\AppData\\Local\\Temp\\chrome-generate-assets';
const DEBUG_PORT = 9227;

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
  const sourceImageAbs = path.resolve('temp_palace_night_view_6831x3421.jpg').replace(/\\/g, '/');
  const targetDir = path.resolve('frontend/public/images/hero');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <body>
        <h1>Processing...</h1>
        <img id="source" src="file://${sourceImageAbs}" />
        <canvas id="cv"></canvas>
      </body>
    </html>
  `;
  const tempHtml = path.resolve('temp_asset_builder.html');
  fs.writeFileSync(tempHtml, htmlContent);

  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    '--disable-gpu',
    '--no-first-run',
    '--allow-file-access-from-files',
    `file://${tempHtml.replace(/\\/g, '/')}`
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
    await sendCDP(ws, 'Runtime.enable');
    await sleep(2000);

    // Check if image loaded
    const imgInfo = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        new Promise((resolve) => {
          const img = document.getElementById('source');
          if (img.complete && img.naturalWidth) {
            resolve({ w: img.naturalWidth, h: img.naturalHeight });
          } else {
            img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
            img.onerror = (e) => resolve({ error: 'Failed to load' });
          }
        })
      `,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Source Image dimensions:', imgInfo.result.value);

    // List of responsive resolutions to generate:
    // 1. 4K Ultra HD (3840 x 2160) - 16:9
    // 2. QHD / 2K (2560 x 1440) - 16:9
    // 3. Full HD (1920 x 1080) - 16:9
    // 4. Laptop (1536 x 864) - 16:9
    // 5. Mobile / Tablet (1080 x 1350 or 1080 x 1080) - 4:5 vertical
    const sizes = [
      { name: 'mysore_palace_hero_4k.webp', mime: 'image/webp', q: 0.88, w: 3840, h: 2160, crop: 'cover' },
      { name: 'mysore_palace_hero_4k.jpg', mime: 'image/jpeg', q: 0.88, w: 3840, h: 2160, crop: 'cover' },
      { name: 'mysore_palace_hero_2560.webp', mime: 'image/webp', q: 0.88, w: 2560, h: 1440, crop: 'cover' },
      { name: 'mysore_palace_hero_1920.webp', mime: 'image/webp', q: 0.88, w: 1920, h: 1080, crop: 'cover' },
      { name: 'mysore_palace_hero_1920.jpg', mime: 'image/jpeg', q: 0.88, w: 1920, h: 1080, crop: 'cover' },
      { name: 'mysore_palace_hero_1536.webp', mime: 'image/webp', q: 0.88, w: 1536, h: 864, crop: 'cover' },
      { name: 'mysore_palace_hero_mobile.webp', mime: 'image/webp', q: 0.88, w: 1080, h: 1350, crop: 'cover' }
    ];

    for (const s of sizes) {
      console.log(`Generating ${s.name} (${s.w}x${s.h})...`);
      const exportRes = await sendCDP(ws, 'Runtime.evaluate', {
        expression: `
          (function() {
            const img = document.getElementById('source');
            const cv = document.getElementById('cv');
            cv.width = ${s.w};
            cv.height = ${s.h};
            const ctx = cv.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Calculate 'cover' framing with slight bias towards keeping the illuminated palace in center-bottom
            const srcW = img.naturalWidth;
            const srcH = img.naturalHeight;
            const targetRatio = ${s.w} / ${s.h};
            const srcRatio = srcW / srcH;

            let sWidth, sHeight, sx, sy;
            if (srcRatio > targetRatio) {
              // Source is wider than target
              sHeight = srcH;
              sWidth = srcH * targetRatio;
              sx = (srcW - sWidth) / 2; // Center horizontally
              sy = 0;
            } else {
              // Source is taller than target
              sWidth = srcW;
              sHeight = srcW / targetRatio;
              sx = 0;
              sy = (srcH - sHeight) * 0.35; // Slight top bias for sky
            }

            ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, ${s.w}, ${s.h});
            return cv.toDataURL('${s.mime}', ${s.q});
          })()
        `,
        returnByValue: true
      });

      const dataUrl = exportRes.result.value;
      const base64Data = dataUrl.split(',')[1];
      const outPath = path.join(targetDir, s.name);
      fs.writeFileSync(outPath, Buffer.from(base64Data, 'base64'));
      console.log(`Saved ${s.name} (${fs.statSync(outPath).size} bytes)`);
    }

    console.log('All hero assets successfully generated in frontend/public/images/hero/');
    ws.close();
  } finally {
    try { chromeProc.kill(); } catch (e) {}
  }
}

main().catch(console.error);
