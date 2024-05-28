import axios from 'axios';
import { useQuery } from 'react-query';
import { FacetTerm } from 'src/utils/api/types';

export interface OntologyPathsResponse {
  paths2Root: {
    prefLabel: string;
    synonym: string;
    definition: string[];
    obsolete: boolean;
    '@id': string;
    '@type': string;
    links: {
      self: string;
      ontology: string;
      children: string;
      parents: string;
      descendants: string;
      ancestors: string;
      instances: string;
      tree: string;
      notes: string;
      mappings: string;
      ui: string;
      '@context': {
        self: string;
        ontology: string;
        children: string;
        parents: string;
        descendants: string;
        ancestors: string;
        instances: string;
        tree: string;
        notes: string;
        mappings: string;
        ui: string;
      };
    };
    '@context': {
      '@vocab': string;
      prefLabel: string;
      synonym: string;
      definition: string;
      obsolete: string;
    };
  }[][];
  count: number;
  id: string;
  name: string;
  definition: string;
  term: string;
  displayAs: string;
}
const fetchPaths2Root = async (
  topics: FacetTerm[],
  ontology: string,
): Promise<OntologyPathsResponse[]> => {
  const apiKey = process.env.NEXT_PUBLIC_BIOONTOLOGY_API_KEY;
  const requests = topics.map(topic => {
    return axios
      .get(
        `https://data.bioontology.org/ontologies/${ontology}/classes/${encodeURIComponent(
          topic.term,
        )}/paths_to_root/?apikey=${apiKey}`,
      )
      .then(response => {
        const paths2Root = response.data;
        const topicInfo = paths2Root[0][paths2Root[0].length - 1];
        return {
          ...topic,
          paths2Root: paths2Root,
          count: topic.count,
          id: topicInfo['@id'],
          name: topicInfo.prefLabel,
          definition: topicInfo.definition[0],
        };
      });
  });
  const responses = await Promise.all(requests);
  return responses;
};

// GET ontology paths by topic url
// https://data.bioontology.org/ontologies/EDAM/classes/${url}/paths_to_root/?apikey=3b484bca-7879-41dc-b015-7e1f9e729f24
export function useOntologyPaths2Root(topics: FacetTerm[], ontology = 'EDAM') {
  return useQuery<OntologyPathsResponse[], Error>({
    queryKey: ['paths2root', ...topics],
    queryFn: () => fetchPaths2Root(topics, ontology),
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
