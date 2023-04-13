import time
import requests
import logging
import os

from datetime import datetime
from selenium import webdriver

PROD = os.environ.get('PROD', False)

if PROD:
    base_url = 'https://data.niaid.nih.gov'
else:
    base_url = 'https://data-staging.niaid.nih.gov'
site_links = [
    '/',
    '/search/',
    '/changelog/',
    '/sources/',
    '/advanced-search/',
    '/about/',
    '/faq/',
]


# driver = webdriver.Chrome()
op = webdriver.ChromeOptions()
op.add_argument('--headless')
driver = webdriver.Chrome(options=op)



broken_links = []

for site_link in site_links:
    full_url = f"{base_url}{site_link}"
    logging.info(f'Current page: {full_url}')

    driver.get(full_url)

    time.sleep(5)

    links = driver.find_elements("tag name", "a")

    for link in links:
        href = link.get_attribute("href")
        if href is not None and "http" in href:
            if 'altmetric' in href:
                continue
            logging.info(f'Checking {href}...')
            headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36'}
            response = requests.get(href,headers=headers, allow_redirects=True)
            try:
                response.raise_for_status()
            except requests.exceptions.HTTPError as e:
                logging.info(e)
                logging.info(f"{href} is broken")
                broken_links.append(href)


driver.close()

log_file_name = f"broken_links_{datetime.today().strftime('%Y-%m-%d')}.log"
logging.basicConfig(filename=log_file_name, level=logging.DEBUG, format='%(asctime)s %(message)s')
for link in set(broken_links):
    logging.error(link)

assert not broken_links, f"Broken links: {set(broken_links)}"
