const fs = require('fs');

const raw = fs.readFileSync('CHATBOT_AUDIT/21_UNSEEN_QUESTION_RESULTS.csv', 'utf-8');

// Simple CSV parser for quoted multi-line fields
function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let insideQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        currentField += '"';
        i++; // skip next quote
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuote) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentField);
      if (currentRow.some(f => f.trim().length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }
  return rows;
}

const parsed = parseCSV(raw);
const headers = parsed[0];
const data = parsed.slice(1);

console.log(`Parsed ${data.length} unseen records.`);
data.forEach(r => {
  const id = r[0];
  const q = r[2];
  const v = r[6];
  const s = r[7];
  const resp = r[10] || '';
  console.log(`\n===============================================================`);
  console.log(`[${id}] Q: ${q}`);
  console.log(`Verdict: ${v} (${s}%)`);
  console.log(`Response Preview:\n${resp.slice(0, 300)}...`);
});
