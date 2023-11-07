import playwright from 'playwright';
import TurndownService from 'turndown';

/**
 * Get the content of a web page using playwright.
 * 
 * Ignore scripts, styles, headers, footers, and navigation elements.
 * 
 * @param url The URL of the web page to get the content of.
 * @returns The HTML content of the web page.
 */
async function getPlaywrightContent(url: string): Promise<string> {
  const browser = await playwright.chromium.launch();
  const context = await browser.newContext({
    javaScriptEnabled: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
  });
  const page = await context.newPage();
  await page.goto(url, {
    waitUntil: 'networkidle',
  });
  await page.evaluate(() => {
    const selectorRemovals = ['script', 'style', 'header', 'footer', 'nav'];
    selectorRemovals.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });
  });
  const content = await page.content();
  await browser.close();
  return content;
}

/**
 * Get the content of a web page as markdown.
 * 
 * @param url The URL of the web page to get the content of.
 * @returns The markdown content of the web page.
 */
export async function getMarkdownFromUrl(url: string): Promise<string> {
  const content = await getPlaywrightContent(url);
  var turndownService = new TurndownService();
  var markdown = turndownService.turndown(content);
  return markdown;
}
