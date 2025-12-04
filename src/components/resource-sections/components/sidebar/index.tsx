import React, { useEffect } from 'react';
import NextLink from 'next/link';
import { Box, Card, Collapsible, Flex, Icon, List } from '@chakra-ui/react';
import { Route } from 'src/components/resource-sections/helpers';
import { useLocalStorage } from 'usehooks-ts';
import { CardContainer } from 'src/components/resource-sections/components/card-container';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { ExternalAccess, UsageInfo } from './components/external';
import { ScrollContainer } from 'src/components/scroll-container';
import { ResourceData } from 'src/pages/resources';
import { CompletenessBadgeCircle } from 'src/components/metadata-completeness-badge/Circular';
import { Link } from 'src/components/link';
import Navigation from '../navigation';

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
        <Card.Root flex={1} p={0} ml={[0, 0, 4]} my={[2, 2, 0]}>
          <Card.Body p={0}>
            {data && data['_meta'] && (
              <CompletenessBadgeCircle
                type={data['@type']}
                stats={data['_meta']}
                p={6}
              />
            )}
            {/* External links to access data, documents or dataset at the source. */}
            <ExternalAccess
              data={data}
              isLoading={isLoading}
              hasDivider={true}
            />
            <UsageInfo data={data} isLoading={isLoading} />
          </Card.Body>
        </Card.Root>

        {/* Local navigation for page */}
        {sections.length > 0 && (
          <Card.Root
            flex={1}
            ml={[0, 0, 4]}
            my={2}
            css={{ '& >*': { p: [2, 4, 4, 6] } }}
          >
            <Card.Body p={0}>
              <Navigation routes={sections} />
            </Card.Body>
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
                          as={FaMagnifyingGlass}
                          color='link.color'
                          boxSize={3}
                          m={1}
                          mr={1.5}
                          mt={1.5}
                          lineHeight='short'
                        />
                        <Link asChild fontSize='sm' lineClamp={3}>
                          <NextLink
                            href={{
                              pathname: '/search',
                              query: { q: search },
                            }}
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
