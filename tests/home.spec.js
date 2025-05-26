// test-script.js
import { chromium } from 'playwright';
import { promises as fs } from 'fs';
import selectors from '../selectors.json' assert { type: "json" };
import { smartFill, smartClick, smartVisible } from '../ai-helpers.js';

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    try {
        await page.goto('http://127.0.0.1:5500/index.html');
        console.log('Page title:', await page.title());

        await smartVisible(page, 'heading', selectors.heading);
        await smartFill(page, 'name', selectors.nameInput, 'Alice Johnson');
        await smartFill(page, 'email', selectors.emailInput, 'alice@example.com');
        await smartFill(page, 'password', selectors.passwordInput, '12345678');
        await smartFill(page, 'confirmPassword', selectors.confirmPasswordInput, '12345678');
        await smartClick(page, 'registerButton', selectors.registerButton);

        // Optional: validate success
        // await page.waitForSelector('.success-message', { timeout: 3000 });

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        const content = await page.content();
        await fs.writeFile('error-page.html', content);
        await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
    } finally {
        // await browser.close();
        console.log('✅ Test complete.');
    }
})();
