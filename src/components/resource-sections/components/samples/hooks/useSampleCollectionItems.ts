import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { SampleAggregate } from 'src/utils/api/types';

export const fetchSamplesByParentIdentifier = async (
  parentIdentifier: string,
): Promise<SampleAggregate[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('API URL is undefined');

  const q = `isBasisFor.identifier:"${parentIdentifier}" AND @type:"Sample"`;
  const response = await axios.get(`${apiUrl}/query`, {
    params: { q, size: 1000 },
  });

  const hits = response.data?.hits;
  if (!hits || hits.length === 0) return [];
  return hits as SampleAggregate[];
};

export const useSampleCollectionItems = (
  parentIdentifier: string | undefined,
  enabled: boolean,
) => {
  return useQuery<SampleAggregate[]>({
    queryKey: ['sample-collection-items', parentIdentifier],
    queryFn: () => fetchSamplesByParentIdentifier(parentIdentifier!),
    enabled: enabled && Boolean(parentIdentifier),
    refetchOnWindowFocus: false,
  });
};
