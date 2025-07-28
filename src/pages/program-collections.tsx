import React, { useMemo, useState } from 'react';
import { GetStaticProps, NextPage } from 'next';
import { Flex, HStack, Text } from '@chakra-ui/react';
import { Error } from 'src/components/error';
import { Link } from 'src/components/link';
import {
  getPageSeoConfig,
  PageContainer,
  PageContent,
} from 'src/components/page-container';
import {
  StyledCard,
  StyleCardSubLabel,
  StyledCardButton,
  StyledCardDescription,
  StyledCardStack,
} from 'src/components/table-of-contents/components/card';
import { SectionHeader } from 'src/components/table-of-contents/layouts/section-header';
import { SectionSearch } from 'src/components/table-of-contents/layouts/section-search';
import {
  Sidebar,
  SidebarItem,
} from 'src/components/table-of-contents/layouts/sidebar';
import {
  fetchProgramCollections,
  ProgramCollection,
} from 'src/views/program-collections/helpers';
import { queryFilterObject2String } from 'src/views/search/components/filters/utils/query-builders';

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
            <Sidebar aria-label='Navigation for program collections list.'>
              {data?.map(collection => {
                return (
                  <SidebarItem
                    key={collection.id}
                    label={
                      collection?.sourceOrganization?.name || collection.term
                    }
                    subLabel={collection.sourceOrganization?.alternateName?.join(
                      ', ',
                    )}
                    href={`#${collection.id}`}
                  ></SidebarItem>
                );
              })}
            </Sidebar>
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
              <Flex
                flexDirection='column'
                flex={1}
                pb={32}
                width='100%'
                m='0 auto'
              >
                <SectionHeader title='Program Collections'></SectionHeader>

                {/* Search bar */}
                <Flex>
                  <SectionSearch
                    data={programCollections}
                    size='sm'
                    ariaLabel='Search for a program collection'
                    placeholder='Search for a program collection'
                    value={searchValue}
                    handleChange={e => setSearchValue(e.currentTarget.value)}
                  />
                </Flex>

                {/* Display list of program collections in cards */}
                <StyledCardStack>
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
                      <StyledCard
                        key={index}
                        id={collection.id}
                        title={label}
                        subtitle={`${collection.count.toLocaleString()} resources available`}
                        renderCTA={() =>
                          collection.sourceOrganization?.name ? (
                            <StyledCardButton
                              maxWidth='500px'
                              href={{
                                pathname: `/search`,
                                query: {
                                  q: '',
                                  filters: queryFilterObject2String({
                                    'sourceOrganization.name': [
                                      collection.sourceOrganization?.name,
                                    ],
                                  }),
                                },
                              }}
                            >
                              Search for resources related to {label}
                            </StyledCardButton>
                          ) : (
                            <></>
                          )
                        }
                      >
                        <>
                          {/* Description */}
                          {collection.sourceOrganization?.abstract && (
                            <StyledCardDescription>
                              {collection.sourceOrganization?.abstract}
                            </StyledCardDescription>
                          )}

                          {/* Parent Organization */}
                          {parentOrganizations.length && (
                            <HStack>
                              <StyleCardSubLabel key={index}>
                                {`Parent Organization(s): ${parentOrganizations.join(
                                  ', ',
                                )}`}
                              </StyleCardSubLabel>
                            </HStack>
                          )}

                          {/* Link to program website */}
                          {collection.sourceOrganization?.url && (
                            <Link
                              href={collection.sourceOrganization?.url}
                              isExternal
                            >
                              {`${label} Website`}
                            </Link>
                          )}
                        </>
                      </StyledCard>
                    );
                  })}
                </StyledCardStack>
              </Flex>
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
