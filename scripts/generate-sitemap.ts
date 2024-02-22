import fs from 'fs';
import { fetchAllSearchResults } from 'src/utils/api';

// Define the path where the output will be saved.
const OUTPUT_PATH = './public/sitemap-datasets.xml';
const LOC_PATH = `${process.env.BASE_URL}/resources?id=`;

// Array of sources to include in the sitemap.
const SOURCES = [
  'AccessClinicalData@NIAID',
  'ClinEpiDB',
  'VDJServer',
  'ImmPort',
  'VEuPathDB',
];

// Fetch the _id of all datasets with includedInDataCatalog.name in the array from the NDE API.
const fetchAllIds = async (): Promise<string[]> => {
  const { results } = await fetchAllSearchResults({
    q: '__all__',
    extra_filter: SOURCES.map(
      source => `includedInDataCatalog.name:"${source}"`,
    ).join(' OR '),
    fields: ['_id'],
  });

  return results.map((result: { _id: string }) => result._id);
};

const generateDatasetsSitemap = async () => {
  try {
    console.log(
      `Retrieving sitemap information for following sources: ${SOURCES.join(
        ', ',
      )}`,
    );

    // Fetch fields from NDE API.
    const ids = await fetchAllIds();
    return ids.map(id => `<url><loc>${LOC_PATH}${id}</loc></url>`);
  } catch (error: any) {
    console.error('Error generating sitemap:', error.message);
    throw error;
  }
};

// Function to generate a dynamic sitemap using dataset ids.
generateDatasetsSitemap()
  .then(newSitemapContent => {
    fs.writeFile(
      OUTPUT_PATH,
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${newSitemapContent.join('\r\n')}
</urlset>
`,
      error => {
        if (error) {
          console.error('Error writing to file:', error.message);
        } else {
          console.log('Dataset sitemap updated successfully.');
        }
      },
    );
  })
  .catch(error => {
    console.error('Failed to update datasets sitemap:', error.message);
  });
