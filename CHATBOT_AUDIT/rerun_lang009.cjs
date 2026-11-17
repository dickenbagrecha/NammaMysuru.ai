const fs = require('fs');
const path = require('path');
const { evaluateAccurate } = require('./evaluate_results_lib.cjs');

const QA_FILE = path.join(__dirname, 'NammaMysuru_100_ReadyMade_QA.json');
const OUT_CSV = path.join(__dirname, '17_100_QUESTION_EXECUTION.csv');
const OUT_JSON = path.join(__dirname, '18_100_QUESTION_EXECUTION.json');

async function rerun() {
  const data = JSON.parse(fs.readFileSync(OUT_JSON, 'utf-8'));
  const qa = JSON.parse(fs.readFileSync(QA_FILE, 'utf-8'));

  const tc = qa.find(x => x.test_id === 'LANG-009');
  console.log('Rerunning LANG-009...');

  const conv = await fetch('http://localhost:5001/api/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Rerun LANG-009' })
  }).then(r => r.json());

  const start = Date.now();
  const res = await fetch(`http://localhost:5001/api/conversations/${conv.id}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: tc.question, language: 'Auto' })
  });

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

  const latency = Date.now() - start;
  const evalRes = evaluateAccurate(tc, fullText.trim(), null);
  console.log(`LANG-009 Rerun Result: Verdict = ${evalRes.verdict} (${evalRes.score}%) in ${latency}ms`);
  console.log(`Reason: ${evalRes.reason}`);
  console.log(`Preview:\n${fullText.slice(0, 200)}...`);

  // Update in data array
  const recordIdx = data.findIndex(x => x.test_id === 'LANG-009');
  if (recordIdx !== -1) {
    data[recordIdx].actual_response = fullText.trim();
    data[recordIdx].latency_ms = latency;
    data[recordIdx].verdict = evalRes.verdict;
    data[recordIdx].score = evalRes.score;
    data[recordIdx].evaluation_reason = evalRes.reason;
    data[recordIdx].error = '';
  }

  // Resave JSON
  fs.writeFileSync(OUT_JSON, JSON.stringify(data, null, 2), 'utf-8');

  // Resave CSV
  function escapeCsv(str) {
    if (str === null || str === undefined) return '""';
    const val = String(str).replace(/"/g, '""');
    return `"${val}"`;
  }

  const csvHeaders = [
    'test_id', 'category', 'question', 'language', 'conversation_type',
    'http_status', 'latency_ms', 'verdict', 'score', 'evaluation_reason',
    'expected_answer', 'actual_response', 'error'
  ];

  const csvRows = [csvHeaders.join(',')];
  for (const r of data) {
    const row = [
      escapeCsv(r.test_id), escapeCsv(r.category), escapeCsv(r.question), escapeCsv(r.language),
      escapeCsv(r.conversation_type), r.http_status, r.latency_ms, escapeCsv(r.verdict),
      r.score, escapeCsv(r.evaluation_reason), escapeCsv(r.expected_answer),
      escapeCsv(r.actual_response), escapeCsv(r.error)
    ];
    csvRows.push(row.join(','));
  }
  fs.writeFileSync(OUT_CSV, csvRows.join('\n'), 'utf-8');

  // Recalculate summary
  const pass = data.filter(x => x.verdict === 'PASS').length;
  const partial = data.filter(x => x.verdict === 'PARTIAL').length;
  const fail = data.filter(x => x.verdict === 'FAIL' || x.verdict === 'CRITICAL FAIL').length;
  console.log(`\n===============================================================`);
  console.log(`UPDATED 100-QUESTION BENCHMARK TOTALS:`);
  console.log(`PASS:    ${pass}/100 (${pass}%)`);
  console.log(`PARTIAL: ${partial}/100 (${partial}%)`);
  console.log(`FAIL:    ${fail}/100 (${fail}%)`);
  console.log(`NON-FAILURE RATE: ${pass + partial}%`);
  console.log(`===============================================================\n`);
}

rerun().catch(e => console.error(e));
