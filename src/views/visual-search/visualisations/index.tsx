import { useMemo, useState } from 'react';
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Icon,
  Select,
  Text,
} from '@chakra-ui/react';
import { useFacetsData } from 'src/components/filters/hooks/useFacetsData';
import { Params } from 'src/utils/api';
import { TopicDisplay } from 'src/components/resource-sections/components/topics';
import { FaMinus, FaPlus } from 'react-icons/fa6';

interface SearchResultsVisualizationsProps {
  queryParams: Params;
}

const facets = [
  'topicCategory.url',
  'topicCategory.name',
  'species.identifier',
  'infectiousAgent.identifier',
];

export const SearchResultsVisualizations = ({
  queryParams,
}: SearchResultsVisualizationsProps) => {
  const [selectedFacet, setSelectedFacet] = useState('topicCategory.url');
  const [{ data, error, isLoading }] = useFacetsData({
    queryParams: { ...queryParams, facet_size: 20 },
    facets,
  });

  const options = [
    { value: 'topicCategory.url', label: 'Topics' },
    { value: 'species.identifier', label: 'Species' },
    { value: 'infectiousAgent.identifier', label: 'Pathogen' },
  ];
  console.log('h', encodeURI('http://purl.obolibrary.org/obo/NCBITaxon_11652'));
  const facetTerms = useMemo(() => {
    const aggregatedData = data && data?.[selectedFacet];

    if (selectedFacet === 'topicCategory.url') {
      return (
        aggregatedData?.filter(
          item =>
            !item.term.includes('_exists_') &&
            item.term.startsWith('http://edamontology.org/'),
        ) || []
      );
    } else {
      return (
        aggregatedData
          ?.filter(item => !item.term.includes('_exists_'))
          .map(item => ({
            ...item,
            term: `http://purl.obolibrary.org/obo/NCBITAXON_${item.term}`,
          })) || []
      );
    }
  }, [data, selectedFacet]);

  return (
    <>
      <Accordion defaultIndex={[0]} allowToggle>
        <AccordionItem borderColor='page.alt' borderRadius='md'>
          {({ isExpanded }) => (
            <>
              <h2>
                <AccordionButton
                  px={2}
                  justifyContent='flex-end'
                  _hover={{ bg: 'page.alt' }}
                >
                  <Text mx={2} fontSize='xs'>
                    {isExpanded ? 'Hide' : 'Show'} visual summary
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
                    value={selectedFacet}
                    onChange={e => {
                      setSelectedFacet(e.target.value);
                    }}
                    size='sm'
                    aria-label='Select data to display in the visual summary'
                    maxWidth='200px'
                    borderRadius='md'
                    cursor='pointer'
                    mb={2}
                  >
                    {options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                  {!isLoading && (
                    <TopicDisplay
                      facet={selectedFacet}
                      facetTerms={facetTerms.slice(0, 10)}
                      margin={{ top: 20, left: 20, right: 80, bottom: 20 }}
                      initialZoom={{
                        scaleX: 0.8,
                        scaleY: 0.8,
                        translateX: 61.79999999999998,
                        translateY: 32.135999999999996,
                        skewX: 0,
                        skewY: 0,
                      }}
                      zoomFactor={2}
                    />
                  )}
                </>
              </AccordionPanel>
            </>
          )}
        </AccordionItem>
      </Accordion>
    </>
  );
};
