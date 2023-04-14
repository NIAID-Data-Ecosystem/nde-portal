const axios = require('axios');
const puppeteer = require('puppeteer');

const baseURL = 'http://localhost:3000';
const siteLinks = [
  '/',
  '/search/',
  '/changelog/',
  '/sources/',
  '/advanced-search/',
  '/about/',
  '/faq/',
];

let brokenLinks = [];
let savedLinks = [];

describe('Check for broken links', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  test('Gather all links', async () => {
    for (const siteLink of siteLinks) {
      const fullURL = `${baseURL}${siteLink}`;
      console.log(`Current page: ${fullURL}`);

      await page.goto(fullURL);

      const links = await page.$$eval('a', anchors => {
        return anchors.map(anchor => anchor.href);
      });

      for (const href of links) {
        if (
          href &&
          href.startsWith('http') &&
          !href.includes('altmetric') &&
          !savedLinks.includes(href)
        ) {
          savedLinks.push(href);
        }
      }
    }

    console.log(`Found ${savedLinks.length} links to check...`);
  }, 60000);

  test('Check all gathered links', async () => {
    for (const href of savedLinks) {
      console.log(`Checking ${href}`);
      try {
        const response = await axios.get(href, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
          },
          maxRedirects: 10,
        });

        if (response.status >= 400) {
          console.error(`${href} is broken with status ${response.status}`);
          brokenLinks.push(href);
        }
      } catch (error) {
        console.error(`${href} is broken`);
        brokenLinks.push(href);
      }
    }

    expect(brokenLinks).toEqual([]);
  }, 300000);
});
