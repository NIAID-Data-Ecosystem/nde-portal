import fs from 'fs';
import axios from 'axios';
import JSON5 from 'json5';

/**
 * This script fetches the metadata completeness fields from the NIAID-Data-Ecosystem/nde-crawlers GitHub repository,
 * processes the data, and writes it to a JSON file.
 * The script uses axios to make HTTP requests and JSON5 to parse the data.
 * The output file is saved in the src/components/metadata-completeness-badge directory.
 */
const fetchMetadataCompletenessFields = async () => {
  try {
    console.log('Generating metadata completeness fields...');

    const owner = 'NIAID-Data-Ecosystem';
    const repo = 'nde-crawlers';
    const branch = 'main';
    const path = 'biothings-hub/files/nde-hub/scores.py';
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const base64Content = response.data.content;
    const data = Buffer.from(base64Content, 'base64').toString('utf-8');

    function extractArray(variableName: string, rawData: string): string[] {
      const match = rawData.match(
        new RegExp(`${variableName}\\s*=\\s*(\\[[\\s\\S]*?\\])`, 's'),
      );
      if (match && match[1]) {
        return JSON5.parse(match[1]);
      }
      return [];
    }

    // ComputationalTool
    const ComputationalTool = {
      required: [
        ...new Set([
          ...extractArray('COMPUTATIONAL_TOOL_REQUIRED', data),
          ...extractArray('COMPUTATIONAL_TOOL_REQUIRED_AUGMENTED', data),
        ]),
      ],
      recommended: [
        ...new Set([
          ...extractArray('COMPUTATIONAL_TOOL_RECOMMENDED', data),
          ...extractArray('COMPUTATIONAL_TOOL_RECOMMENDED_AUGMENTED', data),
        ]),
      ],
    };

    // Dataset
    const Dataset = {
      required: [
        ...new Set([
          ...extractArray('DATASET_REQUIRED_FIELDS', data),
          ...extractArray('DATASET_REQUIRED_AUGMENTED_FIELDS', data),
        ]),
      ],
      recommended: [
        ...new Set([
          ...extractArray('DATASET_RECOMMENDED_FIELDS', data),
          ...extractArray('DATASET_RECOMMENDED_AUGMENTED_FIELDS', data),
        ]),
      ],
    };

    // Dataset
    const ResourceCatalog = {
      required: [
        ...new Set([
          ...extractArray('RESOURCE_CATALOG_REQUIRED', data),
          ...extractArray('RESOURCE_CATALOG_REQUIRED_AUGMENTED', data),
        ]),
      ],
      recommended: [
        ...new Set([
          ...extractArray('RESOURCE_CATALOG_RECOMMENDED', data),
          ...extractArray('RESOURCE_CATALOG_RECOMMENDED_AUGMENTED', data),
        ]),
      ],
    };

    return {
      data: {
        ComputationalTool,
        Dataset,
        ResourceCatalog,
      },
      error: null,
    };
  } catch (err: any) {
    return {
      data: null,
      error: {
        type: 'error',
        status: err?.response?.status || 500,
        message: err?.response?.statusText || 'Unknown error',
      },
    };
  }
};

fetchMetadataCompletenessFields().then(response => {
  const file_path = './src/components/metadata-completeness-badge/fields.json';

  if (response?.data) {
    fs.writeFile(file_path, JSON.stringify(response.data, null, 2), err => {
      if (err) console.error('Error writing to file:', err);
      else console.log('Metadata completeness fields written to:', file_path);
    });
  }
});
