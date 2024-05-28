import { useMemo } from 'react';
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Icon,
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
  '@type',
  'healthCondition.name',
  'includedInDataCatalog.name',
  'infectiousAgent.displayName',
  'species.displayName',
  'funding.funder.name',
  'conditionsOfAccess',
  'measurementTechnique.name',
  'topicCategory.url',
  'topicCategory.name',
];
export const SearchResultsVisualizations = ({
  queryParams,
}: SearchResultsVisualizationsProps) => {
  const [{ data, error, isLoading }] = useFacetsData({
    queryParams,
    facets,
  });

  const topics = useMemo(() => {
    return (
      (data &&
        data?.['topicCategory.url']?.filter(
          item =>
            !item.term.includes('_exists_') &&
            item.term.startsWith('http://edamontology.org/'),
        )) ||
      []
    );
  }, [data]);

  const species = useMemo(() => {
    return (
      (data &&
        data?.['species.name']
          ?.filter(item => !item.term.includes('_exists_'))
          .map(item => ({
            ...item,
            term: `http://purl.bioontology.org/ontology/NCBITAXON/${item.term}"`,
          }))) ||
      []
    );
  }, [data]);

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
                  {!isLoading && (
                    <TopicDisplay
                      topics={topics.slice(0, 10)}
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
