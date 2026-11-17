const fs = require('fs');

const finalJson = JSON.parse(fs.readFileSync('CHATBOT_AUDIT/07_FINAL_REGRESSION_RESULTS.json', 'utf8'));
const failed = finalJson.filter(r => r.verdict === 'FAIL');

console.log('=== REMAINING 18 FAILED TESTS ===\n');

for (let i = 0; i < failed.length; i++) {
  const f = failed[i];
  console.log(`[${i + 1}] ID: ${f.test_id} | Category: ${f.category} | Severity: ${f.severity}`);
  console.log(`Question: ${f.question}`);
  console.log(`Expected: ${f.expected_answer}`);
  console.log(`Evaluation Note: ${f.evaluation_notes}`);
  console.log(`Actual Response Preview (first 250 chars):\n${f.actual_response.slice(0, 250)}...`);
  console.log('--------------------------------------------------\n');
}
