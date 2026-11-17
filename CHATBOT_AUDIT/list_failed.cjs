const fs = require('fs');
const d = JSON.parse(fs.readFileSync('CHATBOT_AUDIT/07_FINAL_REGRESSION_RESULTS.json', 'utf8'));
const failed = d.filter(x => x.verdict === 'FAIL');
failed.forEach((f, i) => {
  console.log(`${i+1}. [${f.test_id}] ${f.category} (${f.severity})`);
  console.log(`   Q: ${f.question}`);
  console.log(`   Expected: ${f.expected_answer}`);
  console.log(`   Notes: ${f.evaluation_notes}\n`);
});
