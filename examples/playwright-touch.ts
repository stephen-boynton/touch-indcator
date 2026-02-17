import { chromium, type Browser, type Page } from 'playwright';

interface TouchMessage {
  type: 'move' | 'tap';
  x: number;
  y: number;
  timestamp: number;
}

async function runTouchIndicatorPlaywright(wsUrl: string, targetUrl: string) {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log(`Opening ${targetUrl}...`);
  await page.goto(targetUrl);

  console.log(`Connecting to WebSocket at ${wsUrl}...`);
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('Connected to WebSocket server');
  };

  ws.onmessage = async event => {
    try {
      const message: TouchMessage = JSON.parse(event.data);

      if (message.type === 'move') {
        console.log(`Moving mouse to (${message.x}, ${message.y})`);
        await page.mouse.move(message.x, message.y);
      } else if (message.type === 'tap') {
        console.log(`Clicking at (${message.x}, ${message.y})`);
        await page.mouse.move(message.x, message.y);
        await page.mouse.down();
        await page.mouse.up();
      }
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  };

  ws.onclose = () => {
    console.log('WebSocket disconnected');
  };

  ws.onerror = error => {
    console.error('WebSocket error:', error);
  };

  process.on('SIGINT', async () => {
    console.log('Shutting down...');
    ws.close();
    await browser.close();
    process.exit(0);
  });
}

const wsUrl = process.env.WS_URL || 'ws://localhost:8080';
const targetUrl = process.env.TARGET_URL || 'https://example.com';

console.log('Touch Indicator Playwright Controller');
console.log('=====================================');
console.log(`WebSocket URL: ${wsUrl}`);
console.log(`Target URL: ${targetUrl}`);
console.log('');

runTouchIndicatorPlaywright(wsUrl, targetUrl).catch(console.error);
