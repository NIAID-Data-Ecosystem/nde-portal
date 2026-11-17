import { Box, Flex, List, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useCallback, useState } from 'react';
import { Link } from 'src/components/link';
import { ScrollContainer } from 'src/components/scroll-container';
import { FacetTerm } from 'src/utils/api/types';
import { UrlObject } from 'url';

import { FacetProps } from '../../../types';
import { BrushableBarChart } from './brushable-bar-chart';

interface BrushableListChartProps {
  data: FacetTerm[];
  facet: FacetProps;
  getSearchRoute: (term: string) => UrlObject;
  /** Callback for handling click events on linked term. */
  handleGATracking: (event: { label: string; count: number }) => void;
}

const SCROLL_HEIGHT = 360;

export const BrushableListChart = ({
  facet,
  data,
  getSearchRoute,
  handleGATracking,
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
      {/* Add Brush */}
      <BrushableBarChart
        data={data}
        colorPalette={facet.colorPalette}
        onBrushSelection={onBrushSelection}
        {...chartDimensions}
      />
      <Box width='100%' mt={4}>
        <Flex
          fontSize='xs'
          fontWeight='semibold'
          lineHeight='moderate'
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
          // The scroll-area recipe is `width: 100%`, which `ml` would push past the column.
          width='auto'
          ml={1}
          mt={1}
          maxHeight={`${SCROLL_HEIGHT}px`}
          minHeight={`${SCROLL_HEIGHT}px`}
        >
          {/* ScrollContainer is a ScrollArea, so the list sits inside its viewport rather than being rendered `as` a ul. */}
          <List.Root ps={0}>
            {selectedData.map(item => (
              <List.Item
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
                lineHeight='moderate'
              >
                {/* Term: Links to search results */}
                <Link asChild>
                  <NextLink
                    onClick={() =>
                      handleGATracking({ label: item.term, count: item.count })
                    }
                    href={getSearchRoute(item.term)}
                  >
                    {item.term}
                  </NextLink>
                </Link>

                {/* Count */}
                <Text>{item.count.toLocaleString()}</Text>
              </List.Item>
            ))}
          </List.Root>
        </ScrollContainer>
      </Box>
    </>
  );
};
