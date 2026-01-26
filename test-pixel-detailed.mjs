import { chromium } from 'playwright';

async function testPixel() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const allRequests = [];

  // Listen for ALL network requests
  page.on('request', request => {
    const url = request.url();
    if (url.includes('facebook.com/tr') || url.includes('fbevents')) {
      allRequests.push({
        type: 'REQUEST',
        url: url,
        method: request.method()
      });
      console.log(`📤 REQUEST: ${request.method()} ${url.substring(0, 120)}...`);
    }
  });

  page.on('response', response => {
    const url = response.url();
    if (url.includes('facebook.com/tr') || url.includes('fbevents')) {
      console.log(`📥 RESPONSE: ${response.status()} ${url.substring(0, 120)}...`);
    }
  });

  page.on('console', msg => {
    if (msg.text().includes('fbq') || msg.text().includes('Facebook') || msg.type() === 'error') {
      console.log(`🖥️  CONSOLE [${msg.type()}]: ${msg.text()}`);
    }
  });

  console.log('Loading https://exploretheclubhouse.co.uk ...\n');

  try {
    await page.goto('https://exploretheclubhouse.co.uk', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for pixel to fire
    await page.waitForTimeout(5000);

    console.log('\n--- Summary ---');
    console.log(`Total FB requests: ${allRequests.length}`);

    // Check if PageView was sent
    const pageViewSent = allRequests.some(r => r.url.includes('ev=PageView') || r.url.includes('PageView'));
    console.log(`PageView sent: ${pageViewSent ? '✓ Yes' : '❌ No'}`);

    // Check fbq
    const fbqInfo = await page.evaluate(() => {
      if (typeof window.fbq === 'undefined') return { defined: false };
      return {
        defined: true,
        queue: window.fbq.queue?.length || 0,
        loaded: window.fbq.loaded,
        version: window.fbq.version
      };
    });
    console.log('fbq status:', fbqInfo);

  } catch (error) {
    console.error('Error:', error.message);
  }

  await browser.close();
}

testPixel();
