/**
 * @jest-environment node
 */
const axios = require('axios');
const puppeteer = require('puppeteer');

const buildSlackBlocks = () => {
  const dividerBlock = {
    type: 'divider',
  };

  const blocks = [dividerBlock];

  for (const brokenLink of brokenLinks) {
    const [url, page, error] = brokenLink.split(' | ');

    const linkBlock = {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Broken URL:*\n<${url}|${url}>`,
        },
        {
          type: 'mrkdwn',
          text: `*Page:*\n${page}`,
        },
        {
          type: 'mrkdwn',
          text: `*Error Code:*\n${error}`,
        },
      ],
    };

    blocks.push(linkBlock, dividerBlock);
  }

  return blocks;
};

const sendSlackMessage = async blocks => {
  const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
  if (!SLACK_WEBHOOK_URL) {
    console.error('SLACK_WEBHOOK_URL is not set');
    return;
  }

  const headerText = `:boom: ${brokenLinks.length} link${
    brokenLinks.length > 1 ? 's' : ''
  } broken out of ${savedLinks.length} in ${process.env.GITHUB_REPOSITORY}`;

  const headerBlock = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: headerText,
    },
  };

  blocks.unshift(headerBlock);

  const payload = {
    blocks: blocks,
  };

  try {
    await axios.post(SLACK_WEBHOOK_URL, payload);
  } catch (error) {
    console.error(`Failed to send Slack message: ${error}`);
  }
};

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

const gatherLinks = async () => {
  const anchors = Array.from(document.querySelectorAll('a'));
  const validAnchors = anchors.filter(anchor => {
    const cardDescriptionElement = anchor.closest('[id="card-description"]');
    return !cardDescriptionElement;
  });

  return validAnchors.map(anchor => anchor.href);
};

let brokenLinks = [];
let savedLinks = [];

describe('Check for broken links', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: 'false' });
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

      const links = await page.evaluate(gatherLinks);

      for (const href of links) {
        if (
          href &&
          href.startsWith('http') &&
          !href.includes('altmetric') &&
          !savedLinks.some(item => item.href === href)
        ) {
          savedLinks.push({ href, siteLink });
        } else if (
          href &&
          !href.startsWith('http:') &&
          !href.startsWith('mailto:') &&
          !savedLinks.some(item => item.href === href)
        ) {
          savedLinks.push({ href, siteLink });
        }
      }
    }
    console.log(`Found ${savedLinks.length} links to check...`);
  }, 60000);

  test('Check all gathered links', async () => {
    for (const obj of savedLinks) {
      const { href } = obj;
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
          const message = `${href} | ${obj.siteLink} | ${
            error.response ? error.response.status : error.message
          }`;
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
    }

    if (brokenLinks.length > 0) {
      const blocks = buildSlackBlocks();
      await sendSlackMessage(blocks);
    }
    expect(brokenLinks).toEqual([]);
  }, 300000);
});
