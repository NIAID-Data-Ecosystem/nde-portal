import React, { useMemo, useState } from 'react';
import { GetStaticProps, NextPage } from 'next';
import { Flex, HStack, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Error } from 'src/components/error';
import { Link } from 'src/components/link';
import { PageContainer, PageContent } from 'src/components/page-container';
import {
  StyleCardSubLabel,
  StyledCard,
  StyledCardButton,
  StyledCardDescription,
  StyledCardStack,
} from 'src/components/table-of-contents/components/card';
import { SectionHeader } from 'src/components/table-of-contents/layouts/section-header';
import { SectionSearch } from 'src/components/table-of-contents/layouts/section-search';
import {
  fetchProgramCollections,
  ProgramCollection,
} from 'src/views/program-collections/helpers';
import { queryFilterObject2String } from 'src/views/search-results-page/helpers';
import {
  Sidebar,
  SidebarItem,
} from 'src/components/table-of-contents/layouts/sidebar';

const ProgramCollections: NextPage<{ data: ProgramCollection[] }> = props => {
  const [searchValue, setSearchValue] = useState('');

  // Fetch program collections from the API
  const { data, isFetching, error } = useQuery({
    queryKey: ['program-collections'],
    queryFn: fetchProgramCollections,
    placeholderData: () => props.data,
    select: collections => {
      return collections.sort((a, b) => {
        // if sourceOrganization.name is null, sort by term
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
    },
    refetchOnWindowFocus: false,
  });

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
      title='Program Collections'
      metaDescription='Appendix of program collections available in the NIAID Data Ecosystem.'
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
            <Sidebar aria-label='Navigation for data sources.'>
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
                <SectionSearch
                  data={programCollections}
                  size='sm'
                  ariaLabel='Search for a source'
                  placeholder='Search for a source'
                  value={searchValue}
                  handleChange={e => setSearchValue(e.currentTarget.value)}
                />

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
                        isLoading={isFetching}
                        label={label}
                        subLabel={`${collection.count.toLocaleString()} resources available`}
                      >
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

                        {/* Link to program resources in the NDE */}
                        {collection.sourceOrganization?.name && (
                          <Flex
                            justifyContent={{ base: 'center', md: 'flex-end' }}
                            width='100%'
                          >
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
                          </Flex>
                        )}
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
  return { props: { data: await fetchProgramCollections() } };
};

export default ProgramCollections;
