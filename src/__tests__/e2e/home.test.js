/**
 * @jest-environment node
 */
const axios = require('axios');
const exp = require('constants');
const puppeteer = require('puppeteer');

const baseURL = 'http://localhost:3000';

const getTableContents = async page => {
  return await page.evaluate(() => ({
    name: document
      .querySelector('[role="tab"][aria-selected="true"]')
      .textContent.trim(),
    columns: Array.from(document.querySelectorAll('th'), column =>
      column.textContent.trim(),
    ),
    cells: Array.from(document.querySelectorAll('td'), cell =>
      cell.textContent.trim(),
    ),
  }));
};

describe('Home Page', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: 'false' });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  test('Check that there are no empty cells in the table', async () => {
    await page.goto(baseURL);
    // wait for content to load.
    await page.waitForSelector('[data-testid="loaded"]', {
      visible: true,
    });

    const tabs = await page.$$('button[role="tab"]');
    let tables = [];

    for (let i = 0; i < tabs.length; i++) {
      // Click on the tab
      await tabs[i].click();

      // Wait a bit for potential page's reaction to the click event
      await page.waitForTimeout(1000); // Wait for 1 second

      // You may want to perform some action or assertion after each click...
      tables.push(await getTableContents(page));
    }

    const missingCells = [];
    tables.forEach(({ name, columns, cells }) => {
      cells.forEach((cell, i) => {
        if (!cell) {
          const message = `Missing text in cell:
            - tab: ${name}
            - row: ${Math.round(i / columns.length) + 1}
            - column: ${(i % columns.length) + 1}`;
          missingCells.push(message);
        }
      });
    });

    if (missingCells.length > 0) {
      console.error(missingCells.join('\n'));
    }
    expect(missingCells.length).toBe(0);
  }, 60000);
});
