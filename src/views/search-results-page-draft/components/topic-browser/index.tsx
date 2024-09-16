import { useState } from 'react';
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Icon,
  Select,
  Text,
} from '@chakra-ui/react';
import { FaMinus, FaPlus } from 'react-icons/fa6';
import { useFilterQueries } from '../filters/hooks/useFilterQueries';
import { Params } from 'src/utils/api';
import {
  OLSOntologyResponse,
  queryData,
  transformAncestorsArraysToTree,
} from './helpers';
import { FacetTermWithDetails } from '../filters/types';
import { FacetParams } from '../filters/utils/queries';

interface SearchResultsVisualizationsProps {
  queryParams: Params;
}

const config = [
  {
    _id: 'infectiousAgent.identifier',
    name: 'Pathogen',
    property: 'infectiousAgent.identifier',
    description: '',
    ontology: 'ncbitaxon',
    createQueries: queryData({
      params: {
        facet_size: 10,
        // Note: can use multi_terms_fields and multi_terms_size to get multiple facets in one query
        // multi_terms_fields:
        //   'infectiousAgent.identifier,infectiousAgent.displayName',
        // multi_terms_size: '10',
      } as FacetParams,
    }),
  },
  // {
  //   _id: 'species.identifier',
  //   name: 'Host Species',
  //   property: 'species.identifier',
  //   description: '',
  //   // [Note]: queryData() is a function that returns an array of query objects including _exists_ terms which we don't use here.
  //   // Consider writing a new fn that returns only the terms we need.
  //   ontology: 'ncbitaxon',
  //   createQueries: queryData(),
  // },
  // {
  //   _id: 'topicCategory.identifier',
  //   name: 'Topic Categories',
  //   property: 'topicCategory.identifier',
  //   description: '',
  //   ontology: 'edam',
  //   createQueries: queryData(),
  // },
];

// export interface QueryData {
//   [facet: string]: Omit<UseQueryResult<FacetTermWithDetails[]>, 'data'> & {
//     data: FacetTermWithDetails[];
//   };
// }

interface DataProps extends FacetTermWithDetails {}

export const SearchResultsVisualizations = ({
  queryParams,
}: SearchResultsVisualizationsProps) => {
  const [selectedFacetID, setSelectedFacetID] = useState(config[0]._id);

  const {
    results: queryResults,
    error,
    isLoading,
    isUpdating,
  } = useFilterQueries({
    initialParams: {
      q: queryParams.q,
    },
    updateParams: queryParams,
    config,
  });

  const data = (queryResults &&
    queryResults[selectedFacetID]?.data) as OLSOntologyResponse[];

  const tree = data && transformAncestorsArraysToTree(data);
  console.log(tree);

  return (
    <>
      <Accordion defaultIndex={[0]} allowToggle>
        <AccordionItem
          borderColor='page.alt'
          borderRadius='md'
          borderBottom='none'
        >
          {({ isExpanded }) => (
            <>
              <h2>
                <AccordionButton
                  px={2}
                  justifyContent='flex-end'
                  _hover={{ bg: 'secondary.50' }}
                >
                  <Text mx={2} fontSize='xs'>
                    {isExpanded ? 'Hide' : 'Show'} ontology browser
                  </Text>
                  <Icon
                    as={isExpanded ? FaMinus : FaPlus}
                    color='gray.600'
                    boxSize={3}
                  />
                </AccordionButton>
              </h2>
              <AccordionPanel w='100%' px={2} my={2} py={4}>
                <>
                  <Select
                    id='sorting-order-select'
                    value={selectedFacetID}
                    onChange={e => {
                      setSelectedFacetID(e.target.value);
                    }}
                    size='sm'
                    aria-label='Select data to display in the visual summary'
                    maxWidth='200px'
                    borderRadius='md'
                    cursor='pointer'
                    mb={2}
                  >
                    {config.map(option => (
                      <option key={option._id} value={option._id}>
                        {option.name}
                      </option>
                    ))}
                  </Select>
                  <>Topic Browser Viz</>
                </>
              </AccordionPanel>
            </>
          )}
        </AccordionItem>
      </Accordion>
    </>
  );
};
