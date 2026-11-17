const fs = require('fs');
const d = JSON.parse(fs.readFileSync('CHATBOT_AUDIT/07_FINAL_REGRESSION_RESULTS.json', 'utf8'));
const partials = d.filter(x => x.verdict === 'PARTIAL');
console.log('Total PARTIAL:', partials.length);
partials.forEach((p, i) => {
  console.log(`${i+1}. [${p.test_id}] ${p.category} | Score: ${p.score}`);
  console.log(`   Q: ${p.question}`);
  console.log(`   Notes: ${p.evaluation_notes}\n`);
});
