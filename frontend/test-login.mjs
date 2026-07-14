import puppeteer from 'puppeteer'; 

(async () => { 
  const browser = await puppeteer.launch(); 
  const page = await browser.newPage(); 
  await page.goto('http://localhost:5173'); 
  await page.type('input[name="email"]', 'demo@gmail.com'); 
  await page.type('input[name="password"]', 'demo1234'); 
  await page.click('button[type="submit"]'); 
  
  // Intercept the API call to see what happens
  page.on('response', async (response) => {
    if (response.url().includes('/api/auth/login')) {
      console.log('API STATUS:', response.status());
      try {
        console.log('API BODY:', await response.json());
      } catch (e) {
        console.log('API BODY text:', await response.text());
      }
    }
  });

  await page.waitForNetworkIdle(); 
  const error = await page.evaluate(() => document.querySelector('.text-red-500')?.textContent || document.querySelector('.text-red-400')?.textContent); 
  console.log('UI ERROR:', error); 
  await browser.close(); 
})();
