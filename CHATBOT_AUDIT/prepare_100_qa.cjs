const fs = require('fs');

const cases = JSON.parse(fs.readFileSync('CHATBOT_AUDIT/03_TEST_CASES.json', 'utf8'));

// Filter down to the 100 core ready-made questions
const selectedIds = new Set([
  // Attractions (12)
  'ATTR-001', 'ATTR-002', 'ATTR-003', 'ATTR-004', 'ATTR-005',
  'ATTR-006', 'ATTR-007', 'ATTR-008', 'ATTR-009', 'ATTR-010',
  'ATTR-011', 'ATTR-012',
  // Dining (12)
  'DINE-001', 'DINE-002', 'DINE-003', 'DINE-004', 'DINE-005',
  'DINE-006', 'DINE-007', 'DINE-008', 'DINE-009', 'DINE-010',
  'DINE-011', 'DINE-012',
  // Itinerary (8)
  'PLAN-001', 'PLAN-002', 'PLAN-003', 'PLAN-004', 'PLAN-005',
  'PLAN-006', 'PLAN-007', 'PLAN-008',
  // Culture (8)
  'CULT-001', 'CULT-002', 'CULT-003', 'CULT-004', 'CULT-005',
  'CULT-006', 'CULT-007', 'CULT-008',
  // Safety / Helpline (10)
  'SAFE-001', 'SAFE-002', 'SAFE-003', 'SAFE-004', 'SAFE-005',
  'SAFE-006', 'SAFE-007', 'SAFE-008', 'SAFE-009', 'SAFE-010',
  // Multilingual (10)
  'LANG-001', 'LANG-002', 'LANG-003', 'LANG-004', 'LANG-005',
  'LANG-006', 'LANG-007', 'LANG-008', 'LANG-009', 'LANG-010',
  // Context (10)
  'CTX-001A', 'CTX-001B', 'CTX-002A', 'CTX-002B', 'CTX-003A',
  'CTX-003B', 'CTX-004A', 'CTX-004B', 'CTX-005A', 'CTX-005B',
  // Identity (6)
  'IDEN-001', 'IDEN-002', 'IDEN-003', 'IDEN-004', 'IDEN-005', 'IDEN-006',
  // Security (6)
  'SEC-001', 'SEC-002', 'SEC-003', 'SEC-004', 'SEC-005', 'SEC-006',
  // Hallucination (6)
  'HAL-001', 'HAL-002', 'HAL-003', 'HAL-004', 'HAL-005', 'HAL-006',
  // Dates / Time (6)
  'TIME-001', 'TIME-002', 'TIME-003', 'TIME-004', 'TIME-005', 'TIME-006',
  // UI (6)
  'UI-001', 'UI-002', 'UI-003', 'UI-004', 'UI-005', 'UI-006'
]);

const readyMade100 = cases.filter(c => selectedIds.has(c.test_id));
console.log(`Selected ${readyMade100.length} ready-made QA benchmark items.`);

// Save JSON in CHATBOT_AUDIT and root
fs.writeFileSync('CHATBOT_AUDIT/NammaMysuru_100_ReadyMade_QA.json', JSON.stringify(readyMade100, null, 2), 'utf8');
fs.writeFileSync('NammaMysuru_100_ReadyMade_QA.json', JSON.stringify(readyMade100, null, 2), 'utf8');

// Build CSV
function escapeCsv(str) {
  if (str === null || str === undefined) return '""';
  const s = String(str);
  return '"' + s.replace(/"/g, '""').replace(/\r\n/g, '\n').replace(/\n/g, ' ') + '"';
}

const headers = [
  'test_id', 'category', 'question', 'language', 'conversation_type',
  'expected_answer', 'required_facts', 'acceptable_variations', 'forbidden_claims',
  'ground_truth_source', 'evaluation_criteria', 'severity'
];

let csvContent = headers.join(',') + '\n';
for (const item of readyMade100) {
  const row = [
    escapeCsv(item.test_id),
    escapeCsv(item.category),
    escapeCsv(item.question),
    escapeCsv(item.language),
    escapeCsv(item.conversation_type),
    escapeCsv(item.expected_answer),
    escapeCsv(JSON.stringify(item.required_facts)),
    escapeCsv(JSON.stringify(item.acceptable_variations)),
    escapeCsv(JSON.stringify(item.forbidden_claims)),
    escapeCsv(item.ground_truth_source),
    escapeCsv(item.evaluation_criteria),
    escapeCsv(item.severity)
  ];
  csvContent += row.join(',') + '\n';
}

fs.writeFileSync('CHATBOT_AUDIT/NammaMysuru_100_ReadyMade_QA.csv', csvContent, 'utf8');
fs.writeFileSync('NammaMysuru_100_ReadyMade_QA.csv', csvContent, 'utf8');

// Build Markdown
let mdContent = `# NammaMysuru.ai — 100 Ready-Made QA Benchmark Reference

This document defines the 100 prepared benchmark questions, expected answers, required factual claims, acceptable variations, forbidden claims, and evaluation criteria for the NammaMysuru.ai chatbot concierge.

Total Questions: **${readyMade100.length}**

---

`;

readyMade100.forEach((item, idx) => {
  mdContent += `### [${idx + 1}/100] ${item.test_id}: ${item.category}\n\n`;
  mdContent += `**Question:** "${item.question}"\n\n`;
  mdContent += `**Language:** ${item.language} | **Type:** ${item.conversation_type} | **Severity:** ${item.severity}\n\n`;
  mdContent += `**Expected Answer:**\n${item.expected_answer}\n\n`;
  mdContent += `**Required Factual Claims:**\n`;
  item.required_facts.forEach(rf => {
    mdContent += `- ${rf}\n`;
  });
  mdContent += `\n**Acceptable Variations:**\n`;
  item.acceptable_variations.forEach(av => {
    mdContent += `- ${av}\n`;
  });
  mdContent += `\n**Forbidden Claims (Hallucination Traps):**\n`;
  item.forbidden_claims.forEach(fc => {
    mdContent += `- ⚠️ ${fc}\n`;
  });
  mdContent += `\n**Ground Truth Source:** \`${item.ground_truth_source}\`\n\n`;
  mdContent += `**Evaluation Criteria:** ${item.evaluation_criteria}\n\n`;
  mdContent += `---\n\n`;
});

fs.writeFileSync('CHATBOT_AUDIT/NammaMysuru_100_ReadyMade_QA.md', mdContent, 'utf8');
fs.writeFileSync('NammaMysuru_100_ReadyMade_QA.md', mdContent, 'utf8');

console.log('Successfully written NammaMysuru_100_ReadyMade_QA.json, .csv, and .md in both CHATBOT_AUDIT/ and root.');
