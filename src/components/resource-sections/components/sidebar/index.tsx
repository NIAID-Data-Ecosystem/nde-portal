import React, { useEffect } from 'react';
import NextLink from 'next/link';
import { FormattedResource } from 'src/utils/api/types';
import {
  Box,
  Card,
  Collapse,
  Flex,
  Icon,
  Link,
  ListItem,
  UnorderedList,
} from 'nde-design-system';
import {
  Navigation,
  RelatedDatasets,
} from 'src/components/resource-sections/components';
import { Route } from 'src/components/resource-sections/helpers';
import { useLocalStorage } from 'usehooks-ts';
import { CardContainer } from 'src/components/resource-sections/components/related-datasets';
import { FaSearch } from 'react-icons/fa';
import { External } from './components/external';
import { ScrollContainer } from 'src/components/scroll-container';

export const Sidebar = ({
  data,
  isLoading,
  sections,
}: {
  isLoading: boolean;
  data?: FormattedResource;
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
          {/* External links to access data, documents or dataset at the source. */}
          <External data={data} isLoading={isLoading} />
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
          isRelatedTo={data?.isRelatedTo || null}
          includedInDataCatalog={data?.includedInDataCatalog}
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
                        as={FaSearch}
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
