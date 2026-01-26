import { chromium } from 'playwright';

async function testPixel() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const fbRequests = [];

  // Listen for network requests to Facebook
  page.on('request', request => {
    const url = request.url();
    if (url.includes('facebook.com') || url.includes('fbevents')) {
      fbRequests.push({
        url: url.substring(0, 150),
        method: request.method()
      });
    }
  });

  page.on('response', response => {
    const url = response.url();
    if (url.includes('facebook.com') || url.includes('fbevents')) {
      console.log(`✓ FB Response: ${response.status()} - ${url.substring(0, 100)}`);
    }
  });

  console.log('Loading https://exploretheclubhouse.co.uk ...\n');

  try {
    await page.goto('https://exploretheclubhouse.co.uk', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait a bit more for any delayed scripts
    await page.waitForTimeout(3000);

    console.log('\n--- Facebook/Meta Requests ---');
    if (fbRequests.length === 0) {
      console.log('❌ No requests to Facebook detected!');
    } else {
      fbRequests.forEach(r => {
        console.log(`→ ${r.method}: ${r.url}`);
      });
    }

    // Check if fbq is defined
    const fbqDefined = await page.evaluate(() => typeof window.fbq !== 'undefined');
    console.log(`\nfbq defined: ${fbqDefined ? '✓ Yes' : '❌ No'}`);

    // Check for any console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    // Check the pixel ID in the page
    const pixelId = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script');
      for (const script of scripts) {
        const match = script.innerHTML.match(/fbq\('init',\s*'(\d+)'/);
        if (match) return match[1];
      }
      return null;
    });
    console.log(`Pixel ID in page: ${pixelId || '❌ Not found'}`);

  } catch (error) {
    console.error('Error:', error.message);
  }

  await browser.close();
}

testPixel();
