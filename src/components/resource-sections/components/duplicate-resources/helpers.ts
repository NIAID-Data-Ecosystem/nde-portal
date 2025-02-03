import axios from 'axios';

export interface Duplicate {
  url: string;
  provider: string;
}

// Fetch provider names from API. Each name will be used as an anchor
// text on the resource page.
export const fetchDuplicateProviders = async (
  sameAs?: string | string[],
): Promise<Duplicate[]> => {
  if (!sameAs) return [];

  if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error('API url undefined');
  }

  const urls = Array.isArray(sameAs) ? sameAs : [sameAs];

  const results = await Promise.all(
    urls.map(async url => {
      const match = url.match(/[?&]id=([^&]+)/);
      if (url.startsWith('https://data.niaid.nih.gov/') && match) {
        const id = match[1];
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/query?&q=_id:${id}&fields=includedInDataCatalog.name`;
        try {
          const { data } = await axios.get(apiUrl);
          const provider = data?.hits?.[0]?.includedInDataCatalog?.name;

          if (provider) {
            return { url, provider };
          }
        } catch (err) {
          console.error('Error fetching provider:', err);
        }
      }
      return null;
    }),
  );
  // remove null values and return
  return results.filter(Boolean) as Duplicate[];
};
