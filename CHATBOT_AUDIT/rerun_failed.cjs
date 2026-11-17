const fs = require('fs');

const BASE_URL = 'http://localhost:5001';

async function createConversation(title) {
  const res = await fetch(`${BASE_URL}/api/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: title || 'Rerun Chat' }),
  });
  if (!res.ok) throw new Error(`Failed to create conversation: ${res.status}`);
  return await res.json();
}

async function sendMessage(convId, content, language = 'Auto') {
  const start = Date.now();
  const res = await fetch(`${BASE_URL}/api/conversations/${convId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, language }),
  });

  if (!res.ok) {
    const latency = Date.now() - start;
    return {
      status: res.status,
      text: '',
      latency,
      error: `HTTP ${res.status}`,
    };
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let fullText = '';
  let done = false;
  let buffer = '';

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    if (readerDone) break;
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
            if (parsed.done) done = true;
          } catch (e) {}
        }
      }
    }
  }

  const latency = Date.now() - start;
  return {
    status: 200,
    text: fullText.trim(),
    latency,
    error: null,
  };
}

const { evaluateAccurate } = require('./evaluate_results_lib.cjs');

async function rerun() {
  const jsonPath = 'CHATBOT_AUDIT/07_FINAL_REGRESSION_RESULTS.json';
  const csvPath = 'CHATBOT_AUDIT/07_FINAL_REGRESSION_RESULTS.csv';
  const testCases = JSON.parse(fs.readFileSync('CHATBOT_AUDIT/03_TEST_CASES.json', 'utf8'));
  const currentResults = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const failedItems = currentResults.filter(r => r.verdict === 'FAIL');
  console.log(`Rerunning ${failedItems.length} failed tests with 2500ms pacing...`);

  for (let i = 0; i < failedItems.length; i++) {
    const failedItem = failedItems[i];
    const tc = testCases.find(c => c.test_id === failedItem.test_id);
    if (!tc) continue;

    process.stdout.write(`[${i + 1}/${failedItems.length}] Rerunning ${tc.test_id} (${tc.category.slice(0, 15)})... `);

    const conv = await createConversation(`Rerun ${tc.test_id}`);
    let langPref = 'Auto';
    if (tc.language === 'Kannada') langPref = 'Kannada';
    else if (tc.language === 'Hindi') langPref = 'Hindi';
    else if (tc.language === 'English') langPref = 'English';

    // If multi-turn second turn (B), send previous turn (A) first to establish context
    if (tc.test_id.endsWith('B')) {
      const parentA = testCases.find(c => c.test_id === tc.test_id.slice(0, -1) + 'A');
      if (parentA) {
        await sendMessage(conv.id, parentA.question, langPref);
        await new Promise(r => setTimeout(r, 1500));
      }
    }

    const execResult = await sendMessage(conv.id, tc.question, langPref);
    const evaluation = evaluateAccurate(tc, execResult.text, execResult.error);

    console.log(`${evaluation.verdict} (${evaluation.score}/100, ${execResult.latency}ms)`);

    // Update in currentResults
    const idx = currentResults.findIndex(r => r.test_id === tc.test_id);
    if (idx !== -1) {
      currentResults[idx] = {
        ...currentResults[idx],
        actual_response: execResult.text,
        latency_ms: execResult.latency,
        http_status: execResult.status,
        verdict: evaluation.verdict,
        score: evaluation.score,
        evaluation_notes: evaluation.reason,
      };
    }

    await new Promise(r => setTimeout(r, 2500));
  }

  fs.writeFileSync(jsonPath, JSON.stringify(currentResults, null, 2), 'utf8');

  // Generate CSV
  function escapeCsv(str) {
    if (str === null || str === undefined) return '""';
    const s = String(str);
    return '"' + s.replace(/"/g, '""').replace(/\r\n/g, '\n').replace(/\n/g, ' ') + '"';
  }

  const csvHeaders = [
    'test_id', 'category', 'question', 'language', 'conversation_type',
    'verdict', 'score', 'latency_ms', 'http_status', 'evaluation_notes',
    'actual_response', 'expected_answer', 'ground_truth_source', 'severity'
  ];

  let csvContent = csvHeaders.join(',') + '\n';
  for (const r of currentResults) {
    const row = [
      r.test_id, r.category, r.question, r.language, r.conversation_type,
      r.verdict, r.score, r.latency_ms, r.http_status, r.evaluation_notes,
      r.actual_response, r.expected_answer, r.ground_truth_source, r.severity
    ].map(escapeCsv);
    csvContent += row.join(',') + '\n';
  }

  fs.writeFileSync(csvPath, csvContent, 'utf8');

  const summary = {
    total: currentResults.length,
    passed: currentResults.filter(r => r.verdict === 'PASS').length,
    partial: currentResults.filter(r => r.verdict === 'PARTIAL').length,
    failed: currentResults.filter(r => r.verdict === 'FAIL').length,
    critical_failed: currentResults.filter(r => r.verdict === 'CRITICAL FAIL').length,
  };
  console.log('\nFinal Rerun Summary:', summary);
  console.log(`Pass Rate: ${((summary.passed / summary.total) * 100).toFixed(1)}%`);
  console.log(`Pass + Partial Rate: ${(((summary.passed + summary.partial) / summary.total) * 100).toFixed(1)}%`);
}

rerun().catch(err => {
  console.error('Rerun failed:', err);
  process.exit(1);
});
