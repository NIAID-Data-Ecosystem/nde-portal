import axios from 'axios';
import { MetadataSource } from 'src/utils/api/types';

interface fetchSourcesArgs {
  sourcePath: string;
  id: MetadataSource['sourceInfo']['identifier'];
  name: MetadataSource['sourceInfo']['name'];
  description: MetadataSource['sourceInfo']['description'];
  dateModified: MetadataSource['version'];
  numberOfRecords: number;
  schema: MetadataSource['sourceInfo']['schema'];
  url: MetadataSource['sourceInfo']['url'];
}

export interface SourceResponse {
  dateCreated: string;
  id: MetadataSource['sourceInfo']['identifier'];
  name: MetadataSource['sourceInfo']['name'];
  description: MetadataSource['sourceInfo']['description'];
  dateModified: MetadataSource['version'];
  numberOfRecords: number;
  schema: MetadataSource['sourceInfo']['schema'];
  url: MetadataSource['sourceInfo']['url'];
}

export const fetchSources = async ({
  sourcePath,
  ...props
}: fetchSourcesArgs) => {
  if (!sourcePath) {
    return null;
  }

  try {
    const url = `https://api.github.com/repos/NIAID-Data-Ecosystem/nde-crawlers/commits`;

    const data = await axios
      .get(`${url}?path=${sourcePath}`, {
        validateStatus: function (status) {
          return status < 500 && status !== 403;
        },
      })
      .then(res => res.data);

    const dates: string[] = [];
    data.forEach((jsonObj: { commit: { author: { date: string } } }) => {
      dates.push(jsonObj.commit.author.date);
    });
    return { ...props, dateCreated: dates[dates.length - 1] };
  } catch (err) {
    throw err;
  }
};
