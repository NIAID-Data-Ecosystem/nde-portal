const axios = require('axios');
const puppeteer = require('puppeteer');
const core = require('@actions/core');

const baseURL = 'http://localhost:3000';
const siteLinks = [
  '/',
  // '/search/',
  // '/changelog/',
  // '/sources/',
  // '/advanced-search/',
  // '/about/',
  // '/faq/',
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
          savedLinks.push({ href, siteLink });
        }
      }
      savedLinks = [
        {
          href: 'https://dash.readme.com/project/niaid-data/v1.0/docs/how-do-i-filter-results-by',
          siteLink: '/',
        },
        { href: 'https://www.this.is.broken.com', siteLink: '/sources/' },
      ];
    }

    console.log(`Found ${savedLinks.length} links to check...`);
  }, 60000);
  test('Check all gathered links', async () => {
    for (const obj of savedLinks) {
      href = obj.href;
      console.log(href, 'href');
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
          const message = `${href} - ${obj.siteLink} (${
            error.response ? error.response.status : error
          })`;
          if (error.response) {
            console.error(
              `${href} is broken with status ${error.response.status} on page ${obj.siteLink}`,
            );
          } else {
            console.error(
              `${href} is broken with ${error} on page ${obj.siteLink}`,
            );
          }
          brokenLinks.push(message);
        });
      // .catch(error => {
      //   if (error.response) {
      //     console.error(
      //       `${href} is broken with status ${error.response.status}`,
      //     );
      //     // brokenLinks.push(`${href} (${error.response.status})`);
      //     brokenLinks.push(
      //       `| ${href} | ${obj.siteLink} | ${error.response.status} |`,
      //     );
      //   } else {
      //     console.error(`${href} is broken with ${error}`);
      //     // brokenLinks.push(`${href} (${error})`);
      //     brokenLinks.push(`| ${href} | ${obj.siteLink} | ${error} |`);
      //   }
      // });
    }
    // if (brokenLinks.length > 0) {
    //   const logFileName = 'broken_links.log';
    //   const logContent = brokenLinks.join('\n');

    //   fs.writeFileSync(logFileName, logContent, 'utf-8', err => {
    //     if (err) {
    //       console.error(`Failed to write log file: ${err}`);
    //     }
    //   });

    //   console.log(`Broken links logged to ${logFileName}`);
    // }
    if (brokenLinks.length > 0) {
      const logContent = brokenLinks.join('\\n');
      core.setOutput('broken_links', logContent);
      console.log(`Broken links: \n${logContent}`);
    }

    expect(brokenLinks).toEqual([]);
  }, 300000);
});
