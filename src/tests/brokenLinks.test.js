const axios = require('axios');
const puppeteer = require('puppeteer');
const fs = require('fs');

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
      await axios
        .get(href, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
          },
          maxRedirects: 10,
        })
        .catch(error => {
          if (error.response) {
            console.error(
              `${href} is broken with status ${error.response.status}`,
            );
            brokenLinks.push(`${href} (${error.response.status})`);
          } else {
            console.error(`${href} is broken with ${error}`);
            brokenLinks.push(`${href} (${error})`);
          }
        });
    }
    if (brokenLinks.length > 0) {
      const logFileName = 'broken_links.log';
      const logContent = brokenLinks.join(' ');

      fs.writeFileSync(logFileName, logContent, 'utf-8', err => {
        if (err) {
          console.error(`Failed to write log file: ${err}`);
        }
      });

      console.log(`Broken links logged to ${logFileName}`);
    }
    expect(brokenLinks).toEqual([]);
  }, 300000);
});
