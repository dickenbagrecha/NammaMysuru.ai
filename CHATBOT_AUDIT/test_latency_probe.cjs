const http = require('http');

async function createConversation() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ title: "Perf Baseline Test" });
    const req = http.request({
      hostname: 'localhost',
      port: 5001,
      path: '/api/conversations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function probeQuery(conversationId, question, language = "English") {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    let ackTime = null;
    let firstTokenTime = null;
    let finalTokenTime = null;
    let tokenCount = 0;
    let fullText = '';

    const payload = JSON.stringify({ content: question, language });
    const req = http.request({
      hostname: 'localhost',
      port: 5001,
      path: `/api/conversations/${conversationId}/messages`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      ackTime = Date.now();
      let buffer = '';

      res.on('data', (chunk) => {
        buffer += chunk.toString('utf8');
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          const match = block.match(/data:\s*(.*)/);
          if (match) {
            try {
              const data = JSON.parse(match[1]);
              if (data.content) {
                if (!firstTokenTime) {
                  firstTokenTime = Date.now();
                }
                tokenCount++;
                fullText += data.content;
              }
              if (data.done) {
                finalTokenTime = Date.now();
              }
            } catch (e) {}
          }
        }
      });

      res.on('end', () => {
        if (!finalTokenTime) finalTokenTime = Date.now();
        const totalDuration = finalTokenTime - startTime;
        const subToAck = (ackTime || startTime) - startTime;
        const ackToTTFT = firstTokenTime ? (firstTokenTime - (ackTime || startTime)) : totalDuration;
        const ttft = firstTokenTime ? (firstTokenTime - startTime) : totalDuration;
        const ttftToEnd = firstTokenTime ? (finalTokenTime - firstTokenTime) : 0;

        resolve({
          question,
          language,
          subToAckMs: subToAck,
          ackToTtftMs: ackToTTFT,
          ttftMs: ttft,
          ttftToEndMs: ttftToEnd,
          totalDurationMs: totalDuration,
          charCount: fullText.length,
          tokensReceived: tokenCount,
          samplePreview: fullText.slice(0, 100).replace(/\n/g, ' ')
        });
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  console.log("Creating test conversation...");
  const conv = await createConversation();
  console.log("Conversation ID:", conv.id);

  const testQueries = [
    { q: "Hello, what can you help me with in Mysuru?", lang: "English" },
    { q: "Tell me about Mysore Palace visiting hours and tickets.", lang: "English" },
    { q: "Which restaurants are confirmed as Jain-friendly?", lang: "English" },
    { q: "ಮೈಸೂರು ಅರಮನೆಯ ಪ್ರವೇಶ ಶುಲ್ಕ ಎಷ್ಟು?", lang: "Kannada" },
    { q: "मैसूर पैलेस घूमने का समय क्या है?", lang: "Hindi" },
  ];

  console.log("\n--- RUNNING BASELINE PROBE ---");
  for (const item of testQueries) {
    console.log(`\nProbing [${item.lang}]: "${item.q}"`);
    const metrics = await probeQuery(conv.id, item.q, item.lang);
    console.log(`  Sub-to-Ack: ${metrics.subToAckMs} ms`);
    console.log(`  Ack-to-TTFT: ${metrics.ackToTtftMs} ms`);
    console.log(`  TTFT (First Token): ${metrics.ttftMs} ms`);
    console.log(`  TTFT-to-End: ${metrics.ttftToEndMs} ms`);
    console.log(`  Total Duration: ${metrics.totalDurationMs} ms`);
    console.log(`  Chunks: ${metrics.tokensReceived}, Chars: ${metrics.charCount}`);
    console.log(`  Preview: ${metrics.samplePreview}`);
  }
}

main().catch(console.error);
