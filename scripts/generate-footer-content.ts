import fs from 'fs';
import axios from 'axios';
// Fetch NDE PORTAL repository information from github
const fetchRepositoryInfo = async () => {
  try {
    console.log('Generating footer content...');

    const owner = 'NIAID-Data-Ecosystem';
    const repo = 'nde-portal';
    const branch = process.env.GITHUB_BRANCH;
    const url = `https://api.github.com/repos/${owner}/${repo}/branches/${branch}`;
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.data;
    return { data };
  } catch (err: any) {
    return {
      data: null,
      error: {
        type: 'error',
        status: err.response.status,
        message: err.response.statusText,
      },
    };
  }
};

fetchRepositoryInfo().then(response => {
  const file_path = './src/components/footer/routes.json';
  let rawdata = fs.readFileSync(file_path);
  let properties = [];
  try {
    let prevData = JSON.parse(rawdata.toString());
    properties = prevData;
  } catch (err) {
    // JSON file is empty.
    if (err) {
      properties = [];
    }
  }
  // Write update to json
  response &&
    response.data &&
    fs.writeFile(
      file_path,
      JSON.stringify({
        ...properties,
        lastUpdate: [
          {
            label:
              response.data && response.data.commit.commit.committer.date
                ? `Content updated: ${
                    response.data.commit.commit.committer.date.split('T')[0]
                  }`
                : '',
            href: '/changelog/',
          },
        ],
      }),
      err => {
        if (err) {
          console.error('error writing to file.');
        }
      },
    );
});
