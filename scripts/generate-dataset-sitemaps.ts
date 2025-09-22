// This script generates a sitemap for the datasets in the NDE Portal.
// It fetches from the NDE API:
// 1. All datasets belonging to IID sources from the NDE API.
// 2. The top 5 scoring results (meta.completeness.total_score) for Generalist sources.
//    - Note: For Omics, it fetches the top 5 scoring results for each of the SD publishers from the Omics Discovery Index (OmicsDI).
// The results are then written to a separate sitemap XML file (by source).
import fs from 'fs';
import { fetchMetadata } from 'src/hooks/api/helpers';
import {
  fetchAllSearchResults,
  fetchSearchResults,
  Params,
} from 'src/utils/api';
import { FacetTerm, FormattedResource } from 'src/utils/api/types';
import path from 'path';
import { getFundedByNIAID } from 'src/utils/helpers';

// ------------------ Constants ------------------
const OUTPUT_CSV_PATH = './public/sitemap-datasets.csv';
const OUTPUT_SITEMAP_DIR = './public/sitemaps/datasets';
const LOC_PATH = `${process.env.BASE_URL}/resources?id=`;

// Sources that should be omitted from the sitemap.
const OMITTED_SOURCES = ['Data Discovery Engine', 'Protein Data Bank'];

// [SCORING CRITERIA] used for fetching top scoring results.
// Note: Scoring criteria are defined in this issue: https://github.com/NIAID-Data-Ecosystem/nde-portal/issues/346#issuecomment-3164920234.
const SCORING_CRITERIA = {
  '_meta.completeness.total_score': '>=17',
  '_meta.completeness.required_ratio': '>=0.75',
  _exists_: 'infectiousAgent',
};

const DELAY = 450; // Delay in milliseconds to prevent rate limiting

// ------------------ Utilities ------------------

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const resourceUrl = (id: string) => `${LOC_PATH}${id}`;

const buildScoringQuery = (criteria: Record<string, string>) =>
  Object.entries(criteria)
    .map(([k, v]) => `${k}:${v}`)
    .join(' AND ');

const buildSitemapXML = (urls: string[]): string => {
  const urlSet = urls.map(url => `<url><loc>${url}</loc></url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlSet}
</urlset>`;
};

const toCsv = (groups: { source: string; results: FormattedResource[] }[]) => {
  const header = [
    'Source',
    'Metadata Completeness Score',
    'Ratio of Required',
    'Ratio of Recommended',
    'URL',
  ].join(',');

  const lines = groups
    .sort((a, b) => a.source.localeCompare(b.source))
    .flatMap(({ source, results }) =>
      results.map(r => {
        const sdPublisher = Array.isArray(r?.sdPublisher)
          ? r.sdPublisher.map(x => x.name).join(', ')
          : r.sdPublisher?.name || '';

        const cols = [
          source + (sdPublisher ? ` (via ${sdPublisher})` : ''),
          r._meta?.completeness?.total_score ?? 'N/A',
          r._meta?.completeness?.required_ratio ?? 'N/A',
          r._meta?.completeness?.recommended_score_ratio ?? 'N/A',
          resourceUrl(r._id),
        ].map(v => `"${String(v).replace(/"/g, '""')}"`);

        return cols.join(',');
      }),
    );

  return [header, ...lines].join('\n');
};

// ------------------ API Helpers ------------------

// Fetch the source ids grouped by domain (e.g. iid, generalist) from the NDE API.
const fetchSourceIdsGroupedByDomain = async (): Promise<
  Record<Domains, string[]>
> => {
  // Metadata endpoint to fetch all sources by domain.
  const metadata = await fetchMetadata();

  if (!metadata || !metadata.src) {
    throw new Error('Failed to fetch metadata from API');
  }

  return Object.values(metadata.src).reduce<Record<Domains, string[]>>(
    (acc, src) => {
      if (src?.sourceInfo?.parentCollection) {
        return acc; // Skip if the source has a parent collection
      }

      const id = src?.sourceInfo?.identifier;
      const name = src?.sourceInfo?.name;
      // Only allow known domains; default to 'Generalist' if unknown
      const genre =
        src?.sourceInfo?.genre === 'IID' ||
        src?.sourceInfo?.genre === 'Generalist'
          ? src?.sourceInfo?.genre
          : 'Generalist';

      if (!id || OMITTED_SOURCES.includes(id)) return acc;

      const funded = getFundedByNIAID(name);

      // Add the source to the NIAID array if it is funded by NIAID. Otherwise, add it to the domain array.
      // This ensures that NIAID sources are prioritized in the sitemap.
      funded ? acc.NIAID.push(id) : acc[genre].push(id);

      return acc;
    },
    { IID: [], Generalist: [], NIAID: [] },
  );
};

// Fetch the _id of all datasets belonging to a specific source from the NDE API.
const fetchAllResourcesBySource = async (
  source: string,
  fields: string[] = ['_id'],
): Promise<FormattedResource[]> => {
  console.log('🔍 Fetching top scoring results for source:', source);
  const { results } = await fetchAllSearchResults({
    q: `includedInDataCatalog.name:"${source}"`,
    show_meta: fields.some(f => f.startsWith('_meta')),
  });

  return results || [];
};

const fetchSDPublishersForSource = async (
  source: string,
): Promise<string[]> => {
  // Uncomment and use this code to fetch the SD publishers dynamically from the API.
  const data = await fetchSearchResults({
    q: `includedInDataCatalog.name:"${source}"`,
    facets: 'sdPublisher.name',
    facet_size: 100,
    size: 0,
  });

  return (
    data?.facets?.['sdPublisher.name']?.terms.map((t: FacetTerm) => t.term) ||
    []
  );
};

const fetchTopScoringResultsForSDPublishers = async (
  params: Params,
  sdPublishers: string[],
): Promise<FormattedResource[]> => {
  const results = [];
  for (const sdPublisher of sdPublishers) {
    const query = {
      ...params,
      q: params.q
        ? `${params.q} AND sdPublisher.name:"${sdPublisher}"`
        : `sdPublisher.name:"${sdPublisher}"`,
      fields: [...(params.fields || []), 'sdPublisher.name'],
    };
    try {
      const data = await fetchAllSearchResults(query);
      if (!data?.results?.length) {
        console.warn(
          `  └⚠️  No results found for SD publisher: ${sdPublisher}`,
        );
        continue;
      }
      results.push(...data.results);
    } catch (err: any) {
      console.error(
        `❌ Failed to fetch results for SD publisher "${sdPublisher}":`,
        err.message,
      );
    }
  }
  return results;
};

// Fetch the top scoring results (based on scoring criteria) for each source provided.
const fetchTopScoringResults = async (
  sources: string[],
  fields: string[] = ['_id'],
): Promise<{ source: string; results: FormattedResource[] }[]> => {
  const groupedTopScoringResults: {
    source: string;
    results: FormattedResource[];
  }[] = [];

  const scoring_query = buildScoringQuery(SCORING_CRITERIA);

  for (const source of sources) {
    const params: Params = {
      q: `includedInDataCatalog.name:"${source}" AND ${scoring_query}`,
      sort: '-_meta.completeness.total_score',
      fields,
    };

    try {
      console.log('🔍 Fetching top scoring results for source:', source);
      const data =
        source === 'Omics Discovery Index (OmicsDI)'
          ? await fetchSDPublishersForSource(source).then(sdPublishers =>
              fetchTopScoringResultsForSDPublishers(params, sdPublishers),
            )
          : (await fetchAllSearchResults(params))?.results || [];

      groupedTopScoringResults.push({ source, results: data });
    } catch (err: any) {
      console.error(`❌ Failed to fetch results for "${source}":`, err.message);
    }

    await delay(DELAY); // Throttle to prevent rate limiting
  }

  return groupedTopScoringResults;
};

// ------------------ Main : Datasets ------------------
type Domains = 'IID' | 'Generalist' | 'NIAID';

const generateSitemapDatasetsBySource = async (
  domains: Domains[] = ['IID', 'Generalist'],
  fields?: string[],
) => {
  try {
    console.log('🔍 Generating from API:', process.env.NEXT_PUBLIC_API_URL);

    const sources = await fetchSourceIdsGroupedByDomain();
    const sitemapDatasets: { source: string; results: FormattedResource[] }[] =
      [];

    //  IID(and NIAID) results → fetch all the dataset ids.
    if (domains.includes('IID')) {
      const iidSources = Array.from(
        new Set([...(sources['NIAID'] || []), ...(sources['IID'] || [])]),
      );

      const iidResults = await Promise.all(
        iidSources.map(async source => ({
          source,
          results: await fetchAllResourcesBySource(source, fields),
        })),
      );

      sitemapDatasets.push(...iidResults);
    }

    // Generalist → top scoring only
    if (domains.includes('Generalist')) {
      const generalistResults = await fetchTopScoringResults(
        sources['Generalist'] || [],
        fields,
      );

      sitemapDatasets.push(...generalistResults);
    }

    // Log count of datasets per source
    sitemapDatasets.forEach(({ source, results }) => {
      console.log(`ℹ️ Source: ${source}, Datasets Count: ${results.length}`);
    });

    // log count of all results
    const totalResultsCount = sitemapDatasets.reduce(
      (sum, { results }) => sum + results.length,
      0,
    );

    console.log(
      `ℹ️ Total results to include in sitemaps: ${totalResultsCount}`,
    );

    return sitemapDatasets;
  } catch (error: any) {
    console.error(
      '❌ Failed to fetch results for sitemap generation:',
      error.message,
    );
    throw error;
  }
};

// ------------------ Writers ------------------

const writeToCSV = async (
  groups: { source: string; results: FormattedResource[] }[],
  outfile = OUTPUT_CSV_PATH,
) => {
  const csv = toCsv(groups);

  fs.writeFile(outfile, csv, error => {
    if (error) {
      console.error('❌ Error writing CSV:', error.message);
    } else {
      console.log(`✅ CSV written to ${outfile}`);
    }
  });
};

const MAX_URLS_PER_SITEMAP = 50000; // Google limit per sitemap

// Split an array into chunks of a specified size.
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

const writeSitemapContentPerSource = async (
  sources: { source: string; results: FormattedResource[] }[],
) => {
  const totalSitemapURLSCount = sources.reduce(
    (sum, { results }) => sum + results.length,
    0,
  );
  console.log(`ℹ️ Total sitemap URLs to write: ${totalSitemapURLSCount}`);

  if (!fs.existsSync(OUTPUT_SITEMAP_DIR)) {
    fs.mkdirSync(OUTPUT_SITEMAP_DIR, { recursive: true });
  }

  for (const { source, results } of sources) {
    if (results.length === 0) {
      console.warn(`⚠️ No results found for source: ${source}`);
      continue;
    }

    const safeSourceName = source.replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase();
    const urls = results.map(r => `${LOC_PATH}${r._id}`);

    // Split into chunks
    const chunks = chunkArray(urls, MAX_URLS_PER_SITEMAP);

    chunks.forEach((chunk, index) => {
      const label = String(index + 1).padStart(2, '0'); // 01, 02, 03
      const sitemapPath =
        chunks.length === 1
          ? path.join(OUTPUT_SITEMAP_DIR, `${safeSourceName}.xml`)
          : path.join(OUTPUT_SITEMAP_DIR, `${safeSourceName}-${label}.xml`);

      const sitemapContent = buildSitemapXML(chunk);

      try {
        fs.writeFileSync(sitemapPath, sitemapContent);
        console.log(
          `✅ Sitemap written for ${source} [part ${index + 1}/${
            chunks.length
          }]: ${sitemapPath}`,
        );
      } catch (error: any) {
        console.error(
          `❌ Error writing sitemap for ${source} [part ${index + 1}]:`,
          error.message,
        );
      }
    });
  }
};

// ------------------ Run (choose one or both) ------------------

// 1) Generate XML sitemaps
(async () => {
  try {
    const groups = await generateSitemapDatasetsBySource();
    await writeSitemapContentPerSource(groups);
    console.log('🎉 All source sitemaps generated successfully.');
  } catch (e: any) {
    console.error('🚨 Sitemap generation failed:', e.message);
    process.exitCode = 1;
  }
})();

// 2) Generate CSV (Generalist, top-scoring only)
// (async () => {
//   try {
//     const data = await generateSitemapDatasetsBySource(
//       ['Generalist'],
//       ['_id', '_meta.completeness', 'includedInDataCatalog.name'],
//     );
//     await writeToCSV(data);
//   } catch (e: any) {
//     console.error('🚨 CSV generation failed:', e.message);
//     process.exitCode = 1;
//   }
// })();
