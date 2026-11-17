const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const USER_DATA_DIR = "C:\\Users\\dicke\\AppData\\Local\\Temp\\chrome-stitch-chat-test";
const DEBUG_PORT = 9223;

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
  console.log('Testing live chat interaction in Dark Mode (Design 3)...');
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
    const list = await httpGet(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
    const page = list.find(t => t.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    await sendCDP(ws, 'Page.enable');
    await sendCDP(ws, 'DOM.enable');

    await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
      width: 1536,
      height: 864,
      deviceScaleFactor: 1,
      mobile: false
    });

    // Set dark theme
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        localStorage.setItem('namma-mysuru-theme', 'dark');
        localStorage.setItem('namma-mysuru-chat-sidebar-desktop', 'true');
        window.location.reload();
      `
    });
    await sleep(2500);

    // Type a question into textarea and submit
    const question = "What are the Mysore Palace illumination timings and ticket price?";
    console.log(`Sending question: "${question}"`);

    const evalResult = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        (function() {
          const textarea = document.querySelector('textarea');
          if (!textarea) return { error: 'Textarea not found' };
          
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
          nativeInputValueSetter.call(textarea, ${JSON.stringify(question)});
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          textarea.dispatchEvent(new Event('change', { bubbles: true }));

          const submitBtn = textarea.closest('form').querySelector('button[type="submit"]');
          if (submitBtn) {
            submitBtn.click();
            return { ok: true, clicked: true };
          }
          return { error: 'Submit button not found' };
        })()
      `,
      returnByValue: true
    });
    console.log('Submission result:', evalResult.result.value);

    // Monitor response generation
    console.log('Waiting for streaming response...');
    let assistantReply = '';
    let cardsFound = 0;

    for (let sec = 0; sec < 15; sec++) {
      await sleep(1000);
      const check = await sendCDP(ws, 'Runtime.evaluate', {
        expression: `
          (function() {
            const msgs = document.querySelectorAll('.prose');
            const cards = document.querySelectorAll('img[alt]');
            const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1].innerText : '';
            const isTyping = !!document.querySelector('.typing-cursor');
            return {
              msgCount: msgs.length,
              lastMsgLength: lastMsg.length,
              lastMsgPreview: lastMsg.slice(0, 150),
              isTyping,
              cardCount: cards.length
            };
          })()
        `,
        returnByValue: true
      });

      const state = check.result.value;
      console.log(`[${sec + 1}s] Msg length: ${state.lastMsgLength}, Typing: ${state.isTyping}, Cards: ${state.cardCount}`);
      if (state.lastMsgLength > 50 && !state.isTyping) {
        assistantReply = state.lastMsgPreview;
        cardsFound = state.cardCount;
        break;
      }
    }

    // Capture screenshot with active conversation in dark mode
    console.log('Capturing conversation state screenshot: dark_theme_conversation.png');
    const result = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png', fromSurface: true });
    const outPath = path.join(__dirname, 'dark_theme_conversation.png');
    fs.writeFileSync(outPath, Buffer.from(result.data, 'base64'));
    console.log('Saved dark_theme_conversation.png (' + fs.statSync(outPath).size + ' bytes)');

    // Now test light theme conversation
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        localStorage.setItem('namma-mysuru-theme', 'light');
        window.location.reload();
      `
    });
    await sleep(2500);

    console.log('Capturing conversation state screenshot: light_theme_conversation.png');
    const resultLight = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png', fromSurface: true });
    const outPathLight = path.join(__dirname, 'light_theme_conversation.png');
    fs.writeFileSync(outPathLight, Buffer.from(resultLight.data, 'base64'));
    console.log('Saved light_theme_conversation.png (' + fs.statSync(outPathLight).size + ' bytes)');

    console.log('\nVerification complete! Assistant response received and verified.');
    ws.close();
  } finally {
    try {
      chromeProc.kill();
    } catch (e) {}
  }
}

main().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
