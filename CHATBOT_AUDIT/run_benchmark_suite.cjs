const http = require('http');
const fs = require('fs');
const path = require('path');

const BENCHMARK_TESTS = [
  // Category 1: Greetings & Concierge Onboarding
  { id: "PERF-01", category: "Greeting", lang: "English", q: "Hello, what can you help me with in Mysuru?" },
  { id: "PERF-02", category: "Greeting", lang: "Kannada", q: "ನಮಸ್ಕಾರ, ನೀವು ನನಗೆ ಮೈಸೂರಿನಲ್ಲಿ ಹೇಗೆ ಸಹಾಯ ಮಾಡುತ್ತೀರಿ?" },
  { id: "PERF-03", category: "Greeting", lang: "Hindi", q: "नमस्ते, आप मैसूर में मेरी क्या मदद कर सकते हैं?" },

  // Category 2: Landmark Facts & Hours (Short Queries)
  { id: "PERF-04", category: "Landmark_Facts", lang: "English", q: "Tell me about Mysore Palace visiting hours and tickets." },
  { id: "PERF-05", category: "Landmark_Facts", lang: "English", q: "What are the darshan timings and entry fee for Chamundeshwari Temple?" },
  { id: "PERF-06", category: "Landmark_Facts", lang: "English", q: "Which day is Mysuru Zoo closed each week?" },
  { id: "PERF-07", category: "Landmark_Facts", lang: "Kannada", q: "ಮೈಸೂರು ಅರಮನೆಯ ಪ್ರವೇಶ ಶುಲ್ಕ ಎಷ್ಟು?" },
  { id: "PERF-08", category: "Landmark_Facts", lang: "Hindi", q: "मैसूर पैलेस घूमने का समय क्या है?" },

  // Category 3: Dining & Strict Dietary Intelligence
  { id: "PERF-09", category: "Dining_Dietary", lang: "English", q: "Which restaurants are confirmed as Jain-friendly?" },
  { id: "PERF-10", category: "Dining_Dietary", lang: "English", q: "Which cafes or restaurants are confirmed vegan in Mysuru?" },
  { id: "PERF-11", category: "Dining_Dietary", lang: "English", q: "Where can I get the original authentic Mylari butter dosa?" },
  { id: "PERF-12", category: "Dining_Dietary", lang: "English", q: "Where should I buy authentic fresh Mysore Pak?" },

  // Category 4: Multi-Stop Itineraries & Personalisation (Long Queries)
  { id: "PERF-13", category: "Itinerary_Long", lang: "English", q: "Plan a one-day Mysuru trip for a family with two children." },
  { id: "PERF-14", category: "Itinerary_Long", lang: "English", q: "Plan a one-day Mysuru trip for my elderly parents who cannot walk much." },
  { id: "PERF-15", category: "Itinerary_Long", lang: "English", q: "Plan a one-day Mysuru trip within ₹1,000 per person." },
  { id: "PERF-16", category: "Itinerary_Long", lang: "English", q: "Plan a one-day Mysuru trip focusing only on heritage and historical places." },

  // Category 5: Proximity, Transit & Weather Contingency
  { id: "PERF-17", category: "Transit_Proximity", lang: "English", q: "I have only 2 hours near Mysuru Railway Station before my train. What can I see?" },
  { id: "PERF-18", category: "Transit_Proximity", lang: "English", q: "I have reached Chamundi Hill. What else can I explore nearby?" },
  { id: "PERF-19", category: "Safety_Helpline", lang: "English", q: "What is the emergency helpline number in Mysuru?" },
  { id: "PERF-20", category: "Contingency", lang: "English", q: "It is raining heavily today. What indoor places should I visit?" },
];

async function createConversation() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ title: "Performance & UX Benchmark Suite" });
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

async function probeQuery(conversationId, testItem) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    let ackTime = null;
    let firstTokenTime = null;
    let finalTokenTime = null;
    let tokenCount = 0;
    let fullText = '';

    const payload = JSON.stringify({ content: testItem.q, language: testItem.lang });
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
          ...testItem,
          subToAckMs: subToAck,
          ackToTtftMs: ackToTTFT,
          ttftMs: ttft,
          ttftToEndMs: ttftToEnd,
          totalDurationMs: totalDuration,
          chunksReceived: tokenCount,
          charCount: fullText.length,
          preview: fullText.slice(0, 120).replace(/\r?\n|\r/g, ' ')
        });
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function runSuite() {
  console.log("=== INITIATING 20-CASE PERFORMANCE & UX BENCHMARK ===");
  const conv = await createConversation();
  console.log("Dedicated Conversation ID:", conv.id);

  const results = [];

  for (let i = 0; i < BENCHMARK_TESTS.length; i++) {
    const test = BENCHMARK_TESTS[i];
    console.log(`\n[${i + 1}/${BENCHMARK_TESTS.length}] Running ${test.id} [${test.lang}] (${test.category}): "${test.q}"`);
    const res = await probeQuery(conv.id, test);
    console.log(`  Sub-to-Ack: ${res.subToAckMs} ms | Ack-to-TTFT: ${res.ackToTtftMs} ms`);
    console.log(`  TTFT (First Token): ${res.ttftMs} ms | TTFT-to-End: ${res.ttftToEndMs} ms`);
    console.log(`  Total Duration: ${res.totalDurationMs} ms | Chunks: ${res.chunksReceived} | Chars: ${res.charCount}`);
    console.log(`  Preview: ${res.preview}`);
    results.push(res);
  }

  // Generate CSV
  let csvContent = "Test_ID,Category,Language,Query,Sub_to_Ack_ms,Ack_to_TTFT_ms,TTFT_ms,TTFT_to_End_ms,Total_Duration_ms,Chunks_Received,Char_Count,Status\n";
  for (const r of results) {
    const escapedQ = `"${r.q.replace(/"/g, '""')}"`;
    const status = r.ttftMs <= 1800 ? "OPTIMAL" : (r.ttftMs <= 2500 ? "ACCEPTABLE" : "ELEVATED");
    csvContent += `${r.id},${r.category},${r.lang},${escapedQ},${r.subToAckMs},${r.ackToTtftMs},${r.ttftMs},${r.ttftToEndMs},${r.totalDurationMs},${r.chunksReceived},${r.charCount},${status}\n`;
  }

  const csvPath = path.join(__dirname, '30_PERFORMANCE_BENCHMARK.csv');
  fs.writeFileSync(csvPath, csvContent, 'utf8');
  console.log(`\nSaved benchmark CSV to: ${csvPath}`);

  // Summary statistics
  const ttfts = results.map(r => r.ttftMs).sort((a, b) => a - b);
  const totalDurations = results.map(r => r.totalDurationMs).sort((a, b) => a - b);
  const subToAcks = results.map(r => r.subToAckMs).sort((a, b) => a - b);

  const avg = arr => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
  const p50 = arr => arr[Math.floor(arr.length * 0.5)];
  const p90 = arr => arr[Math.floor(arr.length * 0.9)];
  const p95 = arr => arr[Math.floor(arr.length * 0.95)];

  console.log("\n=== PERFORMANCE SUITE SUMMARY METRICS ===");
  console.log(`Sub-to-Ack (ms)      : Avg: ${avg(subToAcks)}, P50: ${p50(subToAcks)}, P90: ${p90(subToAcks)}, P95: ${p95(subToAcks)}`);
  console.log(`TTFT (First Token ms): Avg: ${avg(ttfts)}, P50: ${p50(ttfts)}, P90: ${p90(ttfts)}, P95: ${p95(ttfts)}`);
  console.log(`Total Duration (ms)  : Avg: ${avg(totalDurations)}, P50: ${p50(totalDurations)}, P90: ${p90(totalDurations)}, P95: ${p95(totalDurations)}`);
  console.log(`Total Tests Executed : ${results.length}`);
}

runSuite().catch(console.error);
