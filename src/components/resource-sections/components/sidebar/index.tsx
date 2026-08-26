import { Box, Card, Collapsible, Flex, Icon, List } from '@chakra-ui/react';
import NextLink from 'next/link';
import React, { useEffect } from 'react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { Link } from 'src/components/link';
import { CompletenessBadgeCircle } from 'src/components/metadata-completeness-badge/Circular';
import { Navigation } from 'src/components/resource-sections/components';
import { CardContainer } from 'src/components/resource-sections/components/card-container';
import { Route } from 'src/components/resource-sections/helpers';
import { ScrollContainer } from 'src/components/scroll-container';
import { ResourceData } from 'src/pages/resources';
import { useLocalStorage } from 'usehooks-ts';

import { ExternalAccess, UsageInfo } from './components/external';

export const Sidebar = ({
  data,
  loading,
  sections,
}: {
  loading: boolean;
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
        <Card.Root
          flex={1}
          ml={[0, 0, 4]}
          my={[2, 2, 0]}
          css={{
            '& >*': { p: 0 },
          }}
        >
          {data && data['_meta'] && (
            <CompletenessBadgeCircle
              type={data['@type']}
              stats={data['_meta']}
              p={6}
            />
          )}
          {/* External links to access data, documents or dataset at the source. */}
          <ExternalAccess data={data} loading={loading} hasDivider={true} />
          <UsageInfo data={data} loading={loading} />
        </Card.Root>

        {/* Local navigation for page */}
        {sections.length > 0 && (
          <Card.Root
            flex={1}
            ml={[0, 0, 4]}
            my={2}
            css={{
              '& >*': { p: [2, 4, 4, 6] },
            }}
          >
            <Navigation routes={sections} />
          </Card.Root>
        )}

        {/* Search History links */}
        {isMounted && (
          <Collapsible.Root open={!!searchHistory.length}>
            <Collapsible.Content>
              <CardContainer heading='Previous Searches'>
                <ScrollContainer maxH={250}>
                  <List.Root as='ul' ml={0} gap={2} my={2}>
                    {searchHistory.slice(0, 3).map((search, idx) => (
                      <List.Item key={idx} lineHeight='short' display='flex'>
                        <Icon
                          color='link'
                          boxSize={3}
                          m={1}
                          mr={1.5}
                          mt={1.5}
                          lineHeight='short'
                          asChild
                        >
                          <FaMagnifyingGlass />
                        </Icon>
                        <Link as='span' fontSize='sm'>
                          <NextLink
                            href={{
                              pathname: '/search',
                              query: { q: search },
                            }}
                            asChild
                          >
                            {search}
                          </NextLink>
                        </Link>
                      </List.Item>
                    ))}
                  </List.Root>
                </ScrollContainer>
              </CardContainer>
            </Collapsible.Content>
          </Collapsible.Root>
        )}
      </Box>
    </Flex>
  );
};
