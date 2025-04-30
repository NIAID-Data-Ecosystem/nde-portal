import axios, { AxiosError } from 'axios';

export const fetchGithubCommits = async (sourcePath: string) => {
  if (!sourcePath) {
    throw new Error('Missing source path for GitHub commit fetch.');
  }
  try {
    const url = `https://api.github.com/repos/NIAID-Data-Ecosystem/nde-crawlers/commits`;
    const response = await axios.get(url, {
      headers: {
        Authorization: process.env.GH_API_KEY
          ? `Bearer ${process.env.GH_API_KEY}`
          : '',
        'Content-Type': 'application/json',
      },
      params: {
        path: sourcePath,
      },
    });

    return response.data;
  } catch (err: any) {
    const axiosError = err as AxiosError;
    const status = axiosError.response?.status || 500;
    const message =
      axiosError.response?.statusText ||
      axiosError.message ||
      'Unknown GitHub API error';
    throw new Error(`GitHub API error (${status}): ${message}`);
  }
};

export const extractCommitDates = (data: any[]) => {
  const dates: string[] = [];
  data.forEach((item: { commit: { author: { date: string } } }) => {
    dates.push(item.commit.author.date);
  });
  // Get the last date in the array which corresponds to the first commit.
  return dates[dates.length - 1];
};

// Function to fetch source information from GitHub for each source in the metadata.
export const fetchSourceInformationFromGithub = async (
  sourceData: any[],
): Promise<{
  data: Array<{ id: string; sourcePath: string | null; dateCreated?: string }>;
  error: null | { type: string; status: number; message: string };
}> => {
  try {
    const data = await Promise.all(
      sourceData.map(async ([k, source]: [string, any]) => {
        const sourceObject = {
          id: source?.sourceInfo?.identifier || k,
          sourcePath: source?.code?.file || null,
        };

        // Get parent collection source path if source path is not found for source.
        if (!sourceObject.sourcePath) {
          const parentId = source?.sourceInfo?.parentCollection?.id;
          if (parentId) {
            const parentSource = sourceData.find(
              (item: any) => item[0] === parentId,
            );
            sourceObject.sourcePath = parentSource?.[1]?.code?.file || null;
          }
        }

        // If no source path is found, skip fetching GitHub data
        if (!sourceObject.sourcePath) {
          return sourceObject;
        }

        // Fetch source information from GitHub.
        try {
          const githubData = await fetchGithubCommits(sourceObject.sourcePath);
          const dateCreated = extractCommitDates(githubData);
          return { ...sourceObject, dateCreated };
        } catch (err: any) {
          console.error(
            `Skipping ${sourceObject.sourcePath} due to error: ${err.message}`,
          );
          return sourceObject;
        }
      }),
    );
    return { error: null, data };
  } catch (err) {
    const axiosError = err as AxiosError;
    const status = axiosError.response?.status || 500;
    const message =
      axiosError.response?.statusText ||
      axiosError.message ||
      'Unknown processing error';
    return {
      data: [],
      error: {
        type: 'error',
        status,
        message,
      },
    };
  }
};
