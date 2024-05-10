import React, { useEffect } from 'react';
import NextLink from 'next/link';
import {
  Box,
  Card,
  Collapse,
  Flex,
  Icon,
  ListItem,
  UnorderedList,
} from '@chakra-ui/react';
import {
  Navigation,
  RelatedDatasets,
} from 'src/components/resource-sections/components';
import { Route } from 'src/components/resource-sections/helpers';
import { useLocalStorage } from 'usehooks-ts';
import { CardContainer } from 'src/components/resource-sections/components/related-datasets';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { External } from './components/external';
import { ScrollContainer } from 'src/components/scroll-container';
import { ResourceData } from 'src/pages/resources';
import { CompletenessBadgeCircle } from 'src/components/completeness-badge/Circular';
import { Link } from 'src/components/link';

export const Sidebar = ({
  data,
  isLoading,
  sections,
}: {
  isLoading: boolean;
  data?: ResourceData;
  sections: Route[];
}) => {
  const [searchHistory] = useLocalStorage<string[]>('basic-searches', []);

  const [isMounted, setIsMounted] = React.useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Flex
      flex={1}
      flexDirection='column'
      minW='350px'
      display={{ base: 'none', lg: 'block' }}
    >
      <Box className='sidebar' position='sticky' top='0px'>
        <Card flex={1} ml={[0, 0, 4]} my={[2, 2, 0]} sx={{ '>*': { p: 0 } }}>
          {data && data['_meta'] && (
            <CompletenessBadgeCircle
              type={data['@type']}
              stats={data['_meta']}
              p={6}
            />
          )}
          {/* External links to access data, documents or dataset at the source. */}
          <External data={data} isLoading={isLoading} hasDivider={true} />
        </Card>

        {/* Local navigation for page */}
        {sections.length > 0 && (
          <Card
            flex={1}
            ml={[0, 0, 4]}
            my={2}
            sx={{ '>*': { p: [2, 4, 4, 6] } }}
          >
            <Navigation routes={sections} />
          </Card>
        )}

        {/* Associated Resources with current page */}
        <RelatedDatasets
          isLoading={isLoading}
          relatedDatasets={data?.relatedDatasets}
        />

        {/* Search History links */}
        {isMounted && (
          <Collapse in={!!searchHistory.length}>
            <CardContainer heading='Previous Searches'>
              <ScrollContainer maxH={250}>
                <UnorderedList ml={0}>
                  {searchHistory.slice(0, 3).map((search, idx) => (
                    <ListItem
                      key={idx}
                      my={3}
                      lineHeight='short'
                      display='flex'
                    >
                      <Icon
                        as={FaMagnifyingGlass}
                        color='link.color'
                        boxSize={3}
                        m={1}
                        mr={1.5}
                        mt={1.5}
                        lineHeight='short'
                      />
                      <NextLink
                        href={{
                          pathname: '/search',
                          query: { q: search },
                        }}
                      >
                        <Link as='span' fontSize='sm'>
                          {search}
                        </Link>
                      </NextLink>
                    </ListItem>
                  ))}
                </UnorderedList>
              </ScrollContainer>
            </CardContainer>
          </Collapse>
        )}
      </Box>
    </Flex>
  );
};
