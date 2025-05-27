// ai-helpers.js
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyBK66v3yx1XmxKu0Q6VC92wKxXYVnCOsWQ" });


export async function getAlternativeLocator(htmlContent, failedSelectors, fieldName) {
    const prompt = `
The following HTML page was loaded, but none of the selectors [${failedSelectors.join(', ')}] for "${fieldName}" could be found.
Suggest an alternative CSS selector or XPath that can be used to locate the same element.
Return only the selector string, nothing else.

HTML:
${htmlContent}
    `;
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
    });
    let suggestion = response.text.trim();
    suggestion = suggestion.replace(/[`"' ]/g, '').replace(/^css:/i, '');
    return suggestion || failedSelectors[0];
}

export async function smartFill(page, fieldName, selectorList, value) {
    let allFailed = true;
    for (const selector of selectorList) {
        try {
            await page.locator(selector).first().fill(value, { timeout: 1000 });
            console.log(`Filled ${fieldName} with selector: ${selector}`);
            allFailed = false;
            return;
        } catch (e) {
            console.warn(`Failed to fill ${fieldName} with: ${selector}`);
        }
    }
    if (allFailed) {
        console.warn(`AI healing for ${fieldName}...`);
        const dom = await page.content();
        const healedSelector = await getAlternativeLocator(dom, selectorList, fieldName);
        await page.locator(healedSelector).fill(value);
        console.log(`Healed ${fieldName} using AI selector: ${healedSelector}`);
    }
}

export async function smartClick(page, fieldName, selectorList) {
    let allFailed = true;
    for (const selector of selectorList) {
        try {
            await page.locator(selector).first().click({ timeout: 1000 });
            console.log(`Clicked ${fieldName} using: ${selector}`);
            allFailed = false;
            return;
        } catch (e) {
            console.warn(`Failed to click ${fieldName} with: ${selector} `);
        }
    }

    if (allFailed) {
        const dom = await page.content();
        const healedSelector = await getAlternativeLocator(dom, selectorList, fieldName);
        await page.locator(healedSelector).click();
        console.log(`🛠️ Clicked ${fieldName} using AI selector: ${healedSelector}`);
        // console.log(allFailed, dom, healedSelector);
    }
}

