import NextLink from 'next/link';
import {
  Box,
  Flex,
  HStack,
  ListItem,
  Text,
  UnorderedList,
} from '@chakra-ui/react';
import { FacetTerm } from 'src/utils/api/types';
import { SectionTitle } from '../../layouts/section';
import { getSearchResultsRoute } from '../../helpers';
import { TopicPageProps } from '../../types';
import { Link } from 'src/components/link';
import { UrlObject } from 'url';
import { ScrollContainer } from 'src/components/scroll-container';
import { BrushableBarChart } from './brushable-bar-chart';
import { useState } from 'react';

interface Facet {
  label: string;
  value: string;
  fill: string;
}

interface BrushableListChartProps {
  data: FacetTerm[];
  facet: Facet;
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
    width: 480,
    height: 80,
    margin: { top: 0, right: 5, bottom: 0, left: 7 },
  };

  return (
    <Box flex={1} width='400px' minWidth='400px' maxWidth='480px'>
      <SectionTitle as='h5'>{facet.label}</SectionTitle>
      {/* Add Brush */}
      <BrushableBarChart
        data={data}
        fill={facet.fill}
        onBrushSelection={selected => setSelectedData(selected)}
        {...chartDimensions}
      />
      {/* List of terms and associated counts */}
      <ScrollContainer
        as={UnorderedList}
        ml={1}
        mt={4}
        maxHeight={`${SCROLL_HEIGHT}px`}
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
  );
};
