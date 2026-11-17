const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
let apiKey = '';
env.split('\n').forEach(l => {
  if (l.startsWith('GEMINI_API_KEY=')) apiKey = l.slice(15).trim().replace(/["']/g, '');
});
if (!apiKey) {
  console.log('No GEMINI_API_KEY');
  process.exit(1);
}

const ai = new GoogleGenerativeAI(apiKey);
const model = ai.getGenerativeModel({
  model: 'gemini-3.5-flash-lite',
  tools: [
    {
      functionDeclarations: [
        {
          name: 'getTime',
          description: 'Get current time for a location',
          parameters: {
            type: 'OBJECT',
            properties: {
              location: { type: 'STRING', description: 'Location' }
            },
            required: ['location']
          }
        }
      ]
    }
  ]
});

async function run() {
  const chat = model.startChat();
  console.log('Sending message: What is the current time in Mysuru?');
  const result = await chat.sendMessageStream("What is the current time in Mysuru?");

  let functionCallFound = null;
  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) console.log('Chunk text:', text);
    const fc = chunk.functionCalls();
    if (fc && fc.length > 0) {
      console.log('Found function call:', fc[0]);
      functionCallFound = fc[0];
      // Do NOT break! Let stream finish naturally
    }
  }

  // await response promise
  try {
    const resp = await result.response;
    console.log('result.response candidates:', JSON.stringify(resp.candidates, null, 2));
    
    // Check if chat._history was not populated:
    console.log('chat._history length before manual fix:', chat._history.length);
    if (chat._history.length === 0) {
      console.log('chat._history was not populated! Manually populating valid turn with functionCall:');
      // Remove the empty text part from candidates if present:
      const cleanParts = resp.candidates[0].content.parts.filter(p => p.text !== "");
      chat._history.push({ role: 'user', parts: [{ text: "What is the current time in Mysuru?" }] });
      chat._history.push({ role: 'model', parts: cleanParts });
      console.log('Fixed chat._history:', JSON.stringify(chat._history, null, 2));
    }
  } catch (e) {
    console.log('result.response error:', e.message);
  }

  if (functionCallFound) {
    console.log('Sending function response...');
    const contents = [
      ...chat._history,
      {
        role: 'user',
        parts: [
          {
            functionResponse: {
              name: 'getTime',
              response: { name: 'getTime', content: { time: '12:00 AM IST', date: 'Monday, November 16, 2026' } }
            }
          }
        ]
      }
    ];
    console.log('Testing with role: "user" in generateContentStream...');
    try {
      const res = await model.generateContentStream({ contents });
      for await (const chunk of res.stream) {
        console.log('Stream chunk:', chunk.text());
      }
    } catch (e) {
      console.error('Error with role user:', e.message);
    }
  }
}

run();
