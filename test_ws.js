const WebSocket = require('ws');

const urlsToTest = [
  'wss://playspark.smtsigma.com/ws/chat',
  'wss://playspark.smtsigma.com/chat',
  'wss://playspark.smtsigma.com/api/v1/ws/chat',
  'wss://playspark.smtsigma.com/api/v1/chat',
  'wss://playspark.smtsigma.com',
  'wss://playspark.smtsigma.com/ws',
];

const testSocket = (url) => {
  return new Promise((resolve) => {
    console.log(`Testing ${url}...`);
    const ws = new WebSocket(url);
    
    ws.on('open', () => {
      console.log(`✅ SUCCESS: ${url}`);
      ws.close();
      resolve(true);
    });
    
    ws.on('error', (err) => {
      console.log(`❌ ERROR ${url}: ${err.message}`);
      resolve(false);
    });

    ws.on('unexpected-response', (req, res) => {
      console.log(`❌ UNEXPECTED RESPONSE ${url}: ${res.statusCode}`);
      resolve(false);
    });

    setTimeout(() => {
      console.log(`⚠️ TIMEOUT ${url}`);
      ws.close();
      resolve(false);
    }, 3000);
  });
};

(async () => {
  for (const url of urlsToTest) {
    await testSocket(url);
  }
})();
