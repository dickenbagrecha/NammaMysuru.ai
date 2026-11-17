const fs = require('fs');

function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentVal);
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentVal);
      if (currentRow.length > 1 || currentRow[0] !== '') {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal);
    rows.push(currentRow);
  }
  return rows;
}

const testCasesJson = JSON.parse(fs.readFileSync('CHATBOT_AUDIT/03_TEST_CASES.json', 'utf8'));
const initJson = JSON.parse(fs.readFileSync('CHATBOT_AUDIT/04_INITIAL_TEST_RESULTS.json', 'utf8'));
const finalJson = JSON.parse(fs.readFileSync('CHATBOT_AUDIT/07_FINAL_REGRESSION_RESULTS.json', 'utf8'));

const testCasesCsvRows = parseCSV(fs.readFileSync('CHATBOT_AUDIT/03_TEST_CASES.csv', 'utf8'));
const initCsvRows = parseCSV(fs.readFileSync('CHATBOT_AUDIT/04_INITIAL_TEST_RESULTS.csv', 'utf8'));
const finalCsvRows = parseCSV(fs.readFileSync('CHATBOT_AUDIT/07_FINAL_REGRESSION_RESULTS.csv', 'utf8'));

console.log('=== ROW COUNTS ===');
console.log('03_TEST_CASES.json:', testCasesJson.length);
console.log('03_TEST_CASES.csv data rows:', testCasesCsvRows.length - 1);
console.log('04_INITIAL_TEST_RESULTS.json:', initJson.length);
console.log('04_INITIAL_TEST_RESULTS.csv data rows:', initCsvRows.length - 1);
console.log('07_FINAL_REGRESSION_RESULTS.json:', finalJson.length);
console.log('07_FINAL_REGRESSION_RESULTS.csv data rows:', finalCsvRows.length - 1);

// Unique IDs
const jsonIds = testCasesJson.map(c => c.test_id);
const uniqueJsonIds = new Set(jsonIds);
console.log('\n=== ID INTEGRITY ===');
console.log('Total JSON IDs:', jsonIds.length);
console.log('Unique JSON IDs:', uniqueJsonIds.size);

const csvIds = testCasesCsvRows.slice(1).map(r => r[0]);
const uniqueCsvIds = new Set(csvIds);
console.log('Total CSV IDs:', csvIds.length);
console.log('Unique CSV IDs:', uniqueCsvIds.size);

// Check if any missing or duplicated
const idCounts = {};
for (const id of jsonIds) {
  idCounts[id] = (idCounts[id] || 0) + 1;
  if (idCounts[id] > 1) console.log('DUPLICATE JSON ID:', id);
}

// Check mapping
let mappedInit = 0;
let mappedFinal = 0;
for (const id of jsonIds) {
  if (initJson.some(r => r.test_id === id)) mappedInit++;
  if (finalJson.some(r => r.test_id === id)) mappedFinal++;
}
console.log(`Planned tests executed in initial run: ${mappedInit} / ${jsonIds.length}`);
console.log(`Planned tests executed in final run: ${mappedFinal} / ${jsonIds.length}`);

// Check category distribution
const catCounts = {};
for (const tc of testCasesJson) {
  catCounts[tc.category] = (catCounts[tc.category] || 0) + 1;
}
console.log('\n=== CATEGORIES IN 03_TEST_CASES.json ===');
let sumCats = 0;
for (const [cat, cnt] of Object.entries(catCounts)) {
  console.log(`- "${cat}": ${cnt}`);
  sumCats += cnt;
}
console.log('Total category sum:', sumCats);

// Check initial run outcomes
const initVerdicts = {};
for (const r of initJson) {
  initVerdicts[r.verdict] = (initVerdicts[r.verdict] || 0) + 1;
}
console.log('\n=== INITIAL RUN VERDICTS (04_INITIAL_TEST_RESULTS.json) ===', initVerdicts);

// Check final regression run outcomes
const finalVerdicts = {};
for (const r of finalJson) {
  finalVerdicts[r.verdict] = (finalVerdicts[r.verdict] || 0) + 1;
}
console.log('=== FINAL REGRESSION VERDICTS (07_FINAL_REGRESSION_RESULTS.json) ===', finalVerdicts);

// Latencies
const initLatencies = initJson.map(r => r.latency_ms || 0).sort((a,b) => a - b);
const finalLatencies = finalJson.map(r => r.latency_ms || 0).sort((a,b) => a - b);

function calcStats(lats) {
  const sum = lats.reduce((a, b) => a + b, 0);
  const avg = Math.round(sum / lats.length);
  const median = lats[Math.floor(lats.length / 2)];
  const p95 = lats[Math.floor(lats.length * 0.95)];
  const min = lats[0];
  const max = lats[lats.length - 1];
  return { avg, median, p95, min, max };
}

console.log('\n=== INITIAL RUN LATENCIES ===', calcStats(initLatencies));
console.log('=== FINAL RUN LATENCIES ===', calcStats(finalLatencies));
