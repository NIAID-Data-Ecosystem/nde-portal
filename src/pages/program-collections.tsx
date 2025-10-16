import { Flex, HStack, Text } from '@chakra-ui/react';
import { GetStaticProps, NextPage } from 'next';
import React, { useMemo, useState } from 'react';
import { Error } from 'src/components/error';
import { Link } from 'src/components/link';
import {
  getPageSeoConfig,
  PageContainer,
  PageContent,
} from 'src/components/page-container';
import { Section } from 'src/components/section';
import { TOC } from 'src/components/toc';
import {
  fetchProgramCollections,
  ProgramCollection,
} from 'src/views/program-collections/helpers';
import { queryFilterObject2String } from 'src/views/search/components/filters/utils/query-builders';

const TOC_COPY = {
  heading: 'Program Collections',
  sidebar: {
    'aria-label': 'Navigation for program collections list.',
  },
  search: {
    'aria-label': 'Search for a program collection',
    placeholder: 'Search for a program collection',
  },
};
const ProgramCollections: NextPage<{
  data: ProgramCollection[];
  error: Error;
}> = ({ data, error }) => {
  const [searchValue, setSearchValue] = useState('');
  // const [isHydrated, setIsHydrated] = useState(false);

  // useEffect(() => {
  //   setIsHydrated(true);
  // }, []);

  // // Fetch program collections from the API
  // const { data, isFetching, error } = useQuery({
  //   queryKey: ['program-collections'],
  //   queryFn: isHydrated ? () => fetchProgramCollections(150) : undefined,
  //   placeholderData: () => props.data,
  //   enabled: isHydrated, // don’t refetch on first render
  // select: collections => {
  //   return collections.sort((a, b) => {
  //     if (
  //       !a.sourceOrganization ||
  //       !b.sourceOrganization ||
  //       a.sourceOrganization.name === null ||
  //       b.sourceOrganization.name === null
  //     ) {
  //       return a.term.localeCompare(b.term);
  //     }

  //     return a.sourceOrganization.name.localeCompare(
  //       b.sourceOrganization.name,
  //     );
  //   });
  // },
  //   refetchOnWindowFocus: false,
  // });

  const programCollections = useMemo(() => {
    return (
      data?.filter(collection => {
        const term = collection.term.toLowerCase();
        const name = collection.sourceOrganization?.name?.toLowerCase() || '';
        const alternateNames =
          collection.sourceOrganization?.alternateName
            ?.join(' ')
            .toLowerCase() || '';
        const searchTerm = searchValue.toLowerCase();

        return (
          term.includes(searchTerm) ||
          name.includes(searchTerm) ||
          alternateNames.includes(searchTerm)
        );
      }) || []
    );
  }, [data, searchValue]);

  return (
    <PageContainer
      id='program-page'
      meta={getPageSeoConfig('/program-collections')}
      px={0}
      py={0}
    >
      <Flex>
        {error ? (
          <Error>
            <Flex flexDirection='column' justifyContent='center'>
              <Text fontWeight='light' color='gray.600' fontSize='lg'>
                API Request:{' '}
                {error?.message ||
                  'It’s possible that the server is experiencing some issues.'}{' '}
              </Text>
            </Flex>
          </Error>
        ) : (
          <>
            <TOC.SidebarList aria-label={TOC_COPY.sidebar['aria-label']}>
              {data?.map(collection => {
                return (
                  <TOC.SidebarItem
                    key={collection.id}
                    title={
                      collection?.sourceOrganization?.name || collection.term
                    }
                    subtitle={collection.sourceOrganization?.alternateName?.join(
                      ', ',
                    )}
                    href={`#${collection.id}`}
                  />
                );
              })}
            </TOC.SidebarList>

            <PageContent
              id='program-page-content'
              bg='#fff'
              maxW={{ base: 'unset', lg: '1200px' }}
              justifyContent='center'
              margin='0 auto'
              px={4}
              py={4}
              mb={32}
              flex={3}
            >
              <Section.Wrapper hasSeparator heading={TOC_COPY.heading} w='100%'>
                <Flex flexDirection='column' width='100%'>
                  {/* Search bar */}
                  <Flex justifyContent='flex-end' flex={1}>
                    <Section.Search
                      data={programCollections}
                      size='sm'
                      ariaLabel='Search for a program collection'
                      placeholder='Search for a program collection'
                      value={searchValue}
                      handleChange={e => setSearchValue(e.currentTarget.value)}
                    />
                  </Flex>

                  {/* Display list of program collections in cards */}
                  <TOC.CardStack>
                    {programCollections.map((collection, index) => {
                      const label =
                        collection?.sourceOrganization?.name || collection.term;
                      const parentOrganizations = collection.sourceOrganization
                        ?.parentOrganization
                        ? Array.isArray(
                            collection.sourceOrganization?.parentOrganization,
                          )
                          ? collection.sourceOrganization?.parentOrganization
                          : [collection.sourceOrganization?.parentOrganization]
                        : [];

                      return (
                        <TOC.Card
                          key={collection.id}
                          id={collection.id}
                          title={label}
                          subtitle={`${collection.count.toLocaleString()} resources available`}
                          footerProps={{ alignItems: 'flex-end' }}
                          cta={
                            collection.sourceOrganization?.name
                              ? [
                                  {
                                    href: {
                                      pathname: `/search`,
                                      query: {
                                        q: '',
                                        filters: queryFilterObject2String({
                                          'sourceOrganization.name': [
                                            collection.sourceOrganization?.name,
                                          ],
                                        }),
                                      },
                                    },
                                    children: `Search for resources related to ${label}`,
                                    hasArrow: true,
                                  },
                                ]
                              : undefined
                          }
                        >
                          <>
                            {/* Description */}
                            {collection.sourceOrganization?.abstract && (
                              <TOC.CardMarkdownContent>
                                {collection.sourceOrganization?.abstract}
                              </TOC.CardMarkdownContent>
                            )}

                            {/* Parent Organization */}
                            {parentOrganizations.length && (
                              <HStack>
                                <TOC.CardSubtitle key={index}>
                                  {`Parent Organization(s): ${parentOrganizations.join(
                                    ', ',
                                  )}`}
                                </TOC.CardSubtitle>
                              </HStack>
                            )}

                            {/* Link to program website */}
                            {collection.sourceOrganization?.url && (
                              <Link
                                href={collection.sourceOrganization?.url}
                                isExternal
                                fontSize='sm'
                              >
                                {`${label} Website`}
                              </Link>
                            )}
                          </>
                        </TOC.Card>
                      );
                    })}
                  </TOC.CardStack>
                </Flex>
              </Section.Wrapper>
            </PageContent>
          </>
        )}
      </Flex>
    </PageContainer>
  );
};

export const getStaticProps: GetStaticProps = async context => {
  try {
    const data = await fetchProgramCollections(150).then(collections => {
      return collections.sort((a, b) => {
        if (
          !a.sourceOrganization ||
          !b.sourceOrganization ||
          a.sourceOrganization.name === null ||
          b.sourceOrganization.name === null
        ) {
          return a.term.localeCompare(b.term);
        }

        return a.sourceOrganization.name.localeCompare(
          b.sourceOrganization.name,
        );
      });
    });

    return { props: { data, error: null } };
  } catch (error: any) {
    // Allow error to break build
    throw error;
  }
};

export default ProgramCollections;
