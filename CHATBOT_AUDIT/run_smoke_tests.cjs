const http = require('http');
const fs = require('fs');

const BASE_URL = 'http://localhost:5001';

const smokeQuestions = [
  { id: 1, q: "Hello, what can you help me with in Mysuru?" },
  { id: 2, q: "Tell me about Mysore Palace." },
  { id: 3, q: "Which restaurants are confirmed as Jain-friendly?" },
  { id: 4, q: "Plan a one-day Mysuru trip for my family." },
  { id: 5, q: "What is the emergency number in India?" }
];

async function createConversation(title) {
  const res = await fetch(`${BASE_URL}/api/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: title || 'Smoke Test' })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} creating conversation`);
  return await res.json();
}

async function sendChat(convId, prompt) {
  const start = Date.now();
  const res = await fetch(`${BASE_URL}/api/conversations/${convId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: prompt, language: 'Auto' })
  });

  const latency = Date.now() - start;
  if (!res.ok) {
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

  return {
    status: 200,
    text: fullText.trim(),
    latency,
    error: null
  };
}

async function run() {
  console.log('=== RUNNING 5 SMOKE TESTS ===\n');
  const results = [];

  for (const item of smokeQuestions) {
    console.log(`[Smoke Test ${item.id}] Question: "${item.q}"`);
    const conv = await createConversation(`Smoke Test ${item.id}`);
    const result = await sendChat(conv.id, item.q);

    console.log(`Status: ${result.status} | Latency: ${result.latency}ms`);
    console.log(`Response Preview:\n${result.text.slice(0, 300)}...\n`);
    console.log('--------------------------------------------------\n');

    results.push({
      id: item.id,
      question: item.q,
      status: result.status,
      latency_ms: result.latency,
      response: result.text,
      error: result.error
    });

    // Pacing
    await new Promise(r => setTimeout(r, 2000));
  }

  // Write CSV
  function escapeCsv(str) {
    if (str === null || str === undefined) return '""';
    const s = String(str);
    return '"' + s.replace(/"/g, '""').replace(/\r\n/g, '\n').replace(/\n/g, ' ') + '"';
  }

  let csv = 'smoke_test_id,question,http_status,latency_ms,response_text,error\n';
  for (const r of results) {
    csv += `${r.id},${escapeCsv(r.question)},${r.status},${r.latency_ms},${escapeCsv(r.response)},${escapeCsv(r.error)}\n`;
  }

  fs.writeFileSync('CHATBOT_AUDIT/16_SMOKE_TEST_RESULTS.csv', csv, 'utf8');
  console.log('Saved CHATBOT_AUDIT/16_SMOKE_TEST_RESULTS.csv');
}

run().catch(console.error);
