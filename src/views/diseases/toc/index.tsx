import { useMemo, useState } from 'react';
import { Flex, Image, Stack } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { DiseasePageProps } from 'src/views/diseases/types';
import { PageContent } from 'src/components/page-container';
import { fetchAllDiseasePages } from 'src/utils/api/strapi';
import {
  StyleCardLabel,
  StyledCard,
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

export const TableOfContents = () => {
  const [searchValue, setSearchValue] = useState('');

  // Fetch all disease pages from Strapi
  const { data, isLoading, error } = useQuery<DiseasePageProps[], Error>({
    queryKey: ['diseases'],
    queryFn: fetchAllDiseasePages,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const diseasePages = useMemo(() => {
    if (!data) return [];

    return data
      .filter(page => {
        const title = page.title.toLowerCase();
        const description = page.description?.toLowerCase() || '';
        const searchTerm = searchValue.toLowerCase();

        return title.includes(searchTerm) || description.includes(searchTerm);
      })
      .sort((a, b) =>
        a.title.localeCompare(b.title, undefined, {
          numeric: true,
        }),
      );
  }, [data, searchValue]);

  if (error) {
    return (
      <PageContent
        id='diseases-index-page'
        bg='#fff'
        maxW={{ base: 'unset', lg: '1200px' }}
        justifyContent='center'
        margin='0 auto'
        px={4}
        py={4}
        mb={32}
        flex={3}
      >
        <Flex flexDirection='column' flex={1} pb={32} width='100%' m='0 auto'>
          <SectionHeader title='Diseases' />
          <div>Error loading diseases: {error.message}</div>
        </Flex>
      </PageContent>
    );
  }

  return (
    <Flex>
      <Sidebar aria-label='Navigation for list of disease pages.'>
        {diseasePages?.map(page => {
          return (
            <SidebarItem
              key={page.id}
              label={page?.title}
              href={`#${page.slug}`}
            />
          );
        })}
      </Sidebar>
      <PageContent
        id='diseases-index-page'
        bg='#fff'
        maxW={{ base: 'unset', lg: '1200px' }}
        justifyContent='center'
        margin='0 auto'
        px={4}
        py={4}
        mb={32}
        flex={3}
      >
        <Flex flexDirection='column' flex={1} pb={32} width='100%' m='0 auto'>
          <SectionHeader title='Diseases'></SectionHeader>

          {/* Search bar */}
          <Flex>
            <SectionSearch
              data={diseasePages}
              size='sm'
              ariaLabel='Search for a disease'
              placeholder='Search for a disease'
              value={searchValue}
              handleChange={e => setSearchValue(e.currentTarget.value)}
            />
          </Flex>

          {/* Display list of disease pages in cards */}
          <StyledCardStack>
            {diseasePages.map(page => {
              const label = page?.title;

              return (
                <StyledCard key={page.id} id={page.slug} isLoading={isLoading}>
                  {/* Description */}
                  <Stack
                    spacing={{ base: 4, lg: 6, xl: 10 }}
                    flexDirection='row'
                    alignItems='unset'
                    flexWrap='wrap-reverse'
                  >
                    <Stack
                      flexDirection='column'
                      alignItems='unset'
                      minWidth={250}
                      flex={1}
                    >
                      {/* Name */}
                      <StyleCardLabel>{label}</StyleCardLabel>

                      {/* Description */}
                      {page.description && (
                        <Flex flex={1}>
                          <StyledCardDescription>
                            {page.description}
                          </StyledCardDescription>
                        </Flex>
                      )}
                    </Stack>

                    {page.image?.url && (
                      <Flex
                        minWidth={200}
                        maxWidth={{ base: 'unset', xl: '25%' }}
                        flex={1}
                        alignItems='flex-start'
                      >
                        <Image
                          borderRadius='base'
                          width='100%'
                          height='auto'
                          src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${page.image.url}`}
                          alt={page.image.alternativeText}
                          objectFit='contain'
                        />
                      </Flex>
                    )}
                  </Stack>
                  {/* Link to program resources in the NDE */}
                  {page.query && (
                    <Flex
                      justifyContent={{ base: 'center', md: 'flex-end' }}
                      width='100%'
                    >
                      <StyledCardButton
                        href={{
                          pathname: `/diseases/${page.slug}`,
                        }}
                      >
                        Learn about {label} resources in the NIAID Data
                        Ecosystem
                      </StyledCardButton>
                    </Flex>
                  )}
                </StyledCard>
              );
            })}
          </StyledCardStack>
        </Flex>
      </PageContent>
    </Flex>
  );
};
