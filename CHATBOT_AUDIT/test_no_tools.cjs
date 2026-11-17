const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const env = fs.readFileSync('.env', 'utf8');
let apiKey = '';
env.split('\n').forEach(l => {
  if (l.startsWith('GEMINI_API_KEY=')) apiKey = l.slice(15).trim().replace(/["']/g, '');
});

const ai = new GoogleGenerativeAI(apiKey);
const model = ai.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });

const now = new Date();
const timeString = now.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: '2-digit', minute: '2-digit' });
const dateString = now.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const systemInstruction = `You are NammaMysuru.ai, a royal Mysuru concierge.
Today's date is ${dateString}. Current local time in Mysuru is ${timeString} IST (Asia/Kolkata).
Mid-November weather in Mysuru: Pleasant post-monsoon / mild winter, warm daytime (27-29°C), cool mornings and evenings (17-19°C), light layer/shawl recommended.`;

async function test(prompt) {
  const chat = model.startChat({
    systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] }
  });
  const res = await chat.sendMessageStream(prompt);
  let text = '';
  for await (const chunk of res.stream) {
    text += chunk.text();
  }
  return text;
}

(async () => {
  console.log('=== TEST 1: TIME-003 ===');
  console.log(await test("What is today's current date and time in Mysuru, and what day of the week is it?"));
  console.log('\n=== TEST 2: TIME-006 ===');
  console.log(await test("What seasonal weather should a visitor prepare for when visiting Mysuru in mid-November?"));
})();
