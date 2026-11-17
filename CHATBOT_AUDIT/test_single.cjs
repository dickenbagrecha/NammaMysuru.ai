const http = require('http');

async function askChatbot(prompt) {
  const conv = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5001,
      path: '/api/conversations',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify({ title: 'Single Test' }));
    req.end();
  });

  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5001,
      path: `/api/conversations/${conv.id}/messages`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let content = '';
        body.split('\n\n').forEach(block => {
          if (block.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(block.slice(6));
              if (parsed.content) content += parsed.content;
            } catch (e) {}
          }
        });
        resolve(content);
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify({ content: prompt }));
    req.end();
  });
}

const prompt = process.argv[2] || "What is today's current date and time in Mysuru, and what day of the week is it?";

askChatbot(prompt).then(response => {
  console.log("=== CHATBOT RESPONSE ===");
  console.log(response);
}).catch(err => {
  console.error("Error:", err);
});
