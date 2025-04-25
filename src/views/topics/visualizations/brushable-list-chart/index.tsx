import NextLink from 'next/link';
import { Box, Flex, ListItem, Text, UnorderedList } from '@chakra-ui/react';
import { FacetTerm } from 'src/utils/api/types';
import { SectionTitle } from '../../layouts/section';
import { Link } from 'src/components/link';
import { UrlObject } from 'url';
import { ScrollContainer } from 'src/components/scroll-container';
import { BrushableBarChart } from './brushable-bar-chart';
import { useCallback, useState } from 'react';
import { FacetProps } from '../../types';

interface BrushableListChartProps {
  data: FacetTerm[];
  facet: FacetProps;
  getSearchRoute: (term: string) => UrlObject;
}

const SCROLL_HEIGHT = 360;

export const BrushableListChart = ({
  facet,
  data,
  getSearchRoute,
}: BrushableListChartProps) => {
  //  Data that is selected using the brush mechanism
  const [selectedData, setSelectedData] = useState<FacetTerm[]>(data);
  const chartDimensions = {
    defaultWidth: 480,
    defaultHeight: 80,
    margin: { top: 5, right: 5, bottom: 5, left: 7 },
  };

  const onBrushSelection = useCallback((data: FacetTerm[]) => {
    setSelectedData(data);
  }, []);

  return (
    <>
      <SectionTitle as='h5'>{facet.label}</SectionTitle>
      {/* Add Brush */}
      <BrushableBarChart
        data={data}
        colorScheme={facet.colorScheme}
        onBrushSelection={onBrushSelection}
        {...chartDimensions}
      />
      <Box width='100%' mt={4}>
        <Flex
          fontSize='xs'
          fontWeight='semibold'
          lineHeight='short'
          justifyContent='space-between'
          mr={4}
          ml={1}
          borderBottom='1px solid'
          borderBottomColor='niaid.placeholder'
        >
          <Text fontSize='inherit'>Terms</Text>
          <Text fontSize='inherit' mr={4}>
            Counts
          </Text>
        </Flex>
        {/* List of terms and associated counts */}
        <ScrollContainer
          as={UnorderedList}
          ml={1}
          mt={1}
          maxHeight={`${SCROLL_HEIGHT}px`}
          minHeight={`${SCROLL_HEIGHT}px`}
        >
          {selectedData.map(item => (
            <ListItem
              key={item.term}
              fontSize='sm'
              color='gray.500'
              display='flex'
              justifyContent='space-between'
              pr={4}
              pl={1}
              py={1}
              borderBottom='1px solid'
              borderBottomColor='#ededed'
              lineHeight='short'
            >
              {/* Term: Links to search results */}
              <NextLink href={getSearchRoute(item.term)} passHref>
                <Link as='p'>{item.term}</Link>
              </NextLink>

              {/* Count */}
              <Text>{item.count.toLocaleString()}</Text>
            </ListItem>
          ))}
        </ScrollContainer>
      </Box>
    </>
  );
};
