import { test } from '@playwright/test';
import { promises as fs } from 'fs';
import selectors from '../selectors.json' assert { type: "json" };
import { smartFill, smartClick} from '../aiHelpers.js';

// Only run in Chromium (Chrome)
test.use({ browserName: 'chromium' });
test.setTimeout(60000);

test('Register form self-healing test', async ({ page }) => {
    try {
        await page.goto('http://127.0.0.1:5500/index.html');
        await smartFill(page, 'name', selectors.nameInput, 'Alice Johnson');
        await smartFill(page, 'email', selectors.emailInput, 'alice@example.com');
        await smartFill(page, 'password', selectors.passwordInput, '12345678');
        await smartFill(page, 'confirmPassword', selectors.confirmPasswordInput, '12345678');
        await smartClick(page, 'registerButton', selectors.registerButton);

    } catch (error) {
        console.error('Test failed:', error.message);
        const content = await page.content();
        await fs.writeFile('error-page.html', content);
        await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
        throw error;
    }
});
