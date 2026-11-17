const fs = require('fs');
const path = require('path');
const { evaluateAccurate } = require('./evaluate_results_lib.cjs');

const BASE_URL = 'http://localhost:5001';
const QA_FILE = path.join(__dirname, 'NammaMysuru_100_ReadyMade_QA.json');
const OUT_CSV = path.join(__dirname, '17_100_QUESTION_EXECUTION.csv');
const OUT_JSON = path.join(__dirname, '18_100_QUESTION_EXECUTION.json');

async function createConversation(title) {
  const res = await fetch(`${BASE_URL}/api/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: title || 'Benchmark Turn' })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} creating conversation`);
  return await res.json();
}

async function sendChat(convId, prompt, language = 'Auto', maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const start = Date.now();
    try {
      const res = await fetch(`${BASE_URL}/api/conversations/${convId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: prompt, language })
      });

      const latency = Date.now() - start;

      if (!res.ok) {
        if ((res.status === 429 || res.status >= 500) && attempt < maxRetries) {
          console.log(`    [Retry ${attempt}/${maxRetries}] HTTP ${res.status}, waiting ${attempt * 3}s...`);
          await new Promise(r => setTimeout(r, attempt * 3000));
          continue;
        }
        return {
          status: res.status,
          text: '',
          latency,
          error: `HTTP ${res.status}`
        };
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim();
            if (jsonStr) {
              try {
                const parsed = JSON.parse(jsonStr);
                if (parsed.content) fullText += parsed.content;
              } catch (e) {}
            }
          }
        }
      }

      if (!fullText.trim() && attempt < maxRetries) {
        console.log(`    [Retry ${attempt}/${maxRetries}] Empty response stream, retrying...`);
        await new Promise(r => setTimeout(r, attempt * 2000));
        continue;
      }

      return {
        status: 200,
        text: fullText.trim(),
        latency: Date.now() - start,
        error: null
      };
    } catch (err) {
      if (attempt < maxRetries) {
        console.log(`    [Retry ${attempt}/${maxRetries}] Network error: ${err.message}, retrying...`);
        await new Promise(r => setTimeout(r, attempt * 3000));
        continue;
      }
      return {
        status: 500,
        text: '',
        latency: Date.now() - start,
        error: err.message
      };
    }
  }
}

function escapeCsv(str) {
  if (str === null || str === undefined) return '""';
  const val = String(str).replace(/"/g, '""');
  return `"${val}"`;
}

async function runBenchmark() {
  console.log('===============================================================');
  console.log('🚀 NAMMAMYSURU.AI — 100-QUESTION BENCHMARK EXECUTION SUITE');
  console.log('===============================================================\n');

  const testCases = JSON.parse(fs.readFileSync(QA_FILE, 'utf-8'));
  console.log(`Loaded ${testCases.length} ready-made benchmark questions from ${QA_FILE}`);

  const results = [];
  const multiTurnSessions = new Map();

  let passCount = 0;
  let partialCount = 0;
  let failCount = 0;
  let criticalCount = 0;
  let totalLatency = 0;

  for (let idx = 0; idx < testCases.length; idx++) {
    const tc = testCases[idx];
    const testNum = idx + 1;

    let convId;
    if (tc.conversation_type === 'multi-turn') {
      const match = tc.test_id.match(/^(CTX-\d{3})([AB])$/);
      if (match) {
        const rootId = match[1];
        const turn = match[2];
        if (turn === 'A') {
          const conv = await createConversation(`Multi-Turn ${rootId}`);
          convId = conv.id;
          multiTurnSessions.set(rootId, convId);
        } else {
          convId = multiTurnSessions.get(rootId);
          if (!convId) {
            const conv = await createConversation(`Multi-Turn ${rootId}-Fallback`);
            convId = conv.id;
          }
        }
      } else {
        const conv = await createConversation(`Turn: ${tc.test_id}`);
        convId = conv.id;
      }
    } else {
      const conv = await createConversation(`Test ${tc.test_id}`);
      convId = conv.id;
    }

    const langPref = tc.language === 'Kannada' ? 'Kannada' : (tc.language === 'Hindi' ? 'Hindi' : 'Auto');
    const sendResult = await sendChat(convId, tc.question, langPref);

    const evalResult = evaluateAccurate(tc, sendResult.text, sendResult.error);

    if (evalResult.verdict === 'PASS') passCount++;
    else if (evalResult.verdict === 'PARTIAL') partialCount++;
    else if (evalResult.verdict === 'CRITICAL FAIL') { failCount++; criticalCount++; }
    else failCount++;

    totalLatency += sendResult.latency;

    const record = {
      test_id: tc.test_id,
      category: tc.category,
      question: tc.question,
      language: tc.language,
      conversation_type: tc.conversation_type,
      expected_answer: tc.expected_answer,
      actual_response: sendResult.text,
      http_status: sendResult.status,
      latency_ms: sendResult.latency,
      verdict: evalResult.verdict,
      score: evalResult.score,
      evaluation_reason: evalResult.reason,
      error: sendResult.error || ''
    };

    results.push(record);

    console.log(`[${String(testNum).padStart(3, ' ')}/100] [${tc.test_id.padEnd(8, ' ')}] ${tc.question.slice(0, 42).padEnd(45, ' ')} -> ${evalResult.verdict.padEnd(8, ' ')} (${String(evalResult.score).padStart(3, ' ')}%) [${sendResult.latency}ms]`);

    // Pacing delay to keep Gemini rate limits calm and steady
    await new Promise(r => setTimeout(r, 2200));
  }

  // Write CSV
  const csvHeaders = [
    'test_id',
    'category',
    'question',
    'language',
    'conversation_type',
    'http_status',
    'latency_ms',
    'verdict',
    'score',
    'evaluation_reason',
    'expected_answer',
    'actual_response',
    'error'
  ];

  const csvRows = [csvHeaders.join(',')];
  for (const r of results) {
    const row = [
      escapeCsv(r.test_id),
      escapeCsv(r.category),
      escapeCsv(r.question),
      escapeCsv(r.language),
      escapeCsv(r.conversation_type),
      r.http_status,
      r.latency_ms,
      escapeCsv(r.verdict),
      r.score,
      escapeCsv(r.evaluation_reason),
      escapeCsv(r.expected_answer),
      escapeCsv(r.actual_response),
      escapeCsv(r.error)
    ];
    csvRows.push(row.join(','));
  }
  fs.writeFileSync(OUT_CSV, csvRows.join('\n'), 'utf-8');

  // Write JSON
  fs.writeFileSync(OUT_JSON, JSON.stringify(results, null, 2), 'utf-8');

  console.log('\n===============================================================');
  console.log('📊 BENCHMARK EXECUTION SUMMARY');
  console.log('===============================================================');
  console.log(`Total Executed:   ${results.length}`);
  console.log(`Strict Passed:    ${passCount} (${((passCount / results.length) * 100).toFixed(1)}%)`);
  console.log(`Partial Passed:   ${partialCount} (${((partialCount / results.length) * 100).toFixed(1)}%)`);
  console.log(`Failed:           ${failCount} (${((failCount / results.length) * 100).toFixed(1)}%)`);
  console.log(`Critical Fails:   ${criticalCount}`);
  console.log(`Non-Failure Rate: ${(((passCount + partialCount) / results.length) * 100).toFixed(1)}%`);
  console.log(`Average Latency:  ${Math.round(totalLatency / results.length)} ms`);
  console.log(`Saved Deliverables:`);
  console.log(`  - ${OUT_CSV}`);
  console.log(`  - ${OUT_JSON}`);
  console.log('===============================================================\n');
}

runBenchmark().catch(err => {
  console.error('FATAL Benchmark Runner Crash:', err);
  process.exit(1);
});
