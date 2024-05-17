import axios from 'axios';
import { useQuery } from 'react-query';
import { FormattedResource } from 'src/utils/api/types';

const fetchPaths2Root = async (urls: string[]) => {
  if (!urls || urls.length === 0) {
    return [];
  }
  const apiKey = process.env.NEXT_PUBLIC_BIOONTOLOGY_API_KEY;
  const requests = urls.map(url =>
    axios.get(
      `https://data.bioontology.org/ontologies/EDAM/classes/${encodeURIComponent(
        url,
      )}/paths_to_root/?apikey=${apiKey}`,
    ),
  );
  const responses = await Promise.all(requests);
  return responses.map(response => response.data);
};

// GET ontology paths by topic url
// https://data.bioontology.org/ontologies/EDAM/classes/${url}/paths_to_root/?apikey=3b484bca-7879-41dc-b015-7e1f9e729f24
export function useEDAMPaths2Root(topics: FormattedResource['topicCategory']) {
  const urls =
    topics?.map(topic => topic.url || '').filter(item => !!item) || [];
  return useQuery<any, Error>({
    queryKey: ['paths2root', ...urls],
    queryFn: () => fetchPaths2Root(urls),
    refetchOnWindowFocus: false,
  });
}
// // NOTE:paths_to_root isn't supported in batching
// const fetchBatchPaths2Root = async () => {
//   // [paths_to_root] endpoint is used to retrieve the paths from a class to the root of the ontology.
//   // Note that there are possibly multiple paths to the root of an ontology, so the response is a list of paths.
//   const data = await axios
//     .post(
//       `https://data.bioontology.org/batch/?apikey=${process.env.NEXT_PUBLIC_BIOONTOLOGY_API_KEY}`,
//       {
//         'http://www.w3.org/2002/07/owl#Class': {
//           collection: [
//             {
//               class: 'http://edamontology.org/topic_0003',
//               ontology: 'http://data.bioontology.org/ontologies/EDAM',
//             },
//             {
//               class: 'http://edamontology.org/topic_3679',
//               ontology: 'http://data.bioontology.org/ontologies/EDAM',
//             },
//           ],
//           display: 'prefLabel,synonym,semanticType,obsolete',
//         },
//       },
//     )
//     .then(function (response) {
//       console.log(response);
//     })
//     .catch(function (error) {
//       console.log(error);
//     });
//   return data;
// };

// // Batch requests for ontology data by topic ids
// export function useBatchDAMPaths2Root(
//   topics: FormattedResource['topicCategory'],
// ) {
//   // const body = topics.map(topic => ({}));
//   return useQuery<any, Error>({
//     queryKey: ['batchpaths2root'],
//     queryFn: () => fetchBatchPaths2Root(),
//     refetchOnWindowFocus: false,
//   });
// }
