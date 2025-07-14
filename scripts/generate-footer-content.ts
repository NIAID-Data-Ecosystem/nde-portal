import fs from 'fs/promises';
import axios from 'axios';
import { SiteConfig } from 'src/components/page-container/types';

const CONFIG_FILE_PATH = 'configs/site.config.json';

// Fetch NDE PORTAL repository information from GitHub
const fetchRepositoryInfo = async () => {
  try {
    console.log('Generating footer content...');

    const owner = 'NIAID-Data-Ecosystem';
    const repo = 'nde-portal';
    const branch = process.env.GITHUB_BRANCH;

    if (!branch) {
      console.warn('GITHUB_BRANCH environment variable is not set');
      return;
    }

    const url = `https://api.github.com/repos/${owner}/${repo}/branches/${branch}`;
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (err: any) {
    console.error('Error fetching repository info:', err.message);
    throw err;
  }
};

// Read existing config file or create empty one
const readOrCreateConfig = async () => {
  try {
    const data = await fs.readFile(CONFIG_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      // File doesn't exist, create empty config
      const emptyConfig = {};
      await fs.writeFile(
        CONFIG_FILE_PATH,
        JSON.stringify(emptyConfig, null, 2),
      );
      return emptyConfig;
    }
    // If JSON is invalid, return empty object
    console.warn('Invalid JSON in config file, using empty config');
    return {};
  }
};

// Update config file with footer information
const updateConfigWithFooter = async (config: SiteConfig, repoData: any) => {
  const commitDate = repoData?.commit?.commit?.committer?.date;
  const formattedDate = commitDate ? commitDate.split('T')[0] : '';

  const updatedConfig = {
    ...config,
    footer: {
      ...config.footer,
      lastUpdate: [
        {
          label: formattedDate ? `Content updated: ${formattedDate}` : '',
          href: '/changelog/',
        },
      ],
    },
  };

  await fs.writeFile(CONFIG_FILE_PATH, JSON.stringify(updatedConfig, null, 2));
  console.log('Config file updated successfully');
};

// Main execution
const main = async () => {
  try {
    const repoData = await fetchRepositoryInfo();
    const config = await readOrCreateConfig();
    await updateConfigWithFooter(config, repoData);
  } catch (err: any) {
    console.error('Failed to update config:', err.message);
    process.exit(1);
  }
};

main();
