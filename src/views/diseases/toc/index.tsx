import { Box, Flex, Image, Skeleton, Stack } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Appendix } from 'src/components/appendix';
import { PageContent } from 'src/components/page-container';
import { Section } from 'src/components/section';
import { fetchAllDiseasePages } from 'src/views/diseases/helpers';
import { DiseasePageProps } from 'src/views/diseases/types';

const APPENDIX_COPY = {
  heading: 'Diseases',
  sidebar: {
    'aria-label': 'Navigation for list of disease pages.',
  },
  search: {
    'aria-label': 'Search for a disease page',
    placeholder: 'Search for a disease page',
  },
};
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
          <Section.Heading>{APPENDIX_COPY.heading}</Section.Heading>
          <div>Error loading diseases: {error.message}</div>
        </Flex>
      </PageContent>
    );
  }

  return (
    <Flex>
      <Appendix.SidebarList aria-label={APPENDIX_COPY.sidebar['aria-label']}>
        {diseasePages.map(page => {
          return (
            <Appendix.SidebarItem
              key={page.id}
              title={page?.title}
              href={`#${page.slug}`}
            />
          );
        })}
      </Appendix.SidebarList>
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
        <Section.Wrapper hasSeparator heading={APPENDIX_COPY.heading} w='100%'>
          <Flex flexDirection='column' alignItems='center' flex={1}>
            {/* Search bar */}
            <Flex>
              <Section.Search
                data={diseasePages}
                size='sm'
                ariaLabel='Search for a disease'
                placeholder='Search for a disease'
                value={searchValue}
                handleChange={e => setSearchValue(e.currentTarget.value)}
              />
            </Flex>

            {/* Display list of disease pages in cards */}

            <Appendix.CardStack>
              {isLoading
                ? Array.from({ length: 3 }, (_, index) => (
                    <Skeleton key={`loading-${index}`} loading={true} />
                  ))
                : diseasePages.map(page => {
                    return (
                      <Appendix.Card
                        key={page.id}
                        id={page.slug}
                        title={page?.title || ''}
                        image={{
                          src: `${process.env.NEXT_PUBLIC_STRAPI_API_URL}${page.image.url}`,
                          alt: page.image.alternativeText,
                        }}
                        cta={[
                          {
                            href: `/diseases/${page.slug}`,
                            children: `Learn about ${page.title} resources in the NIAID Data Ecosystem`,
                          },
                        ]}
                      >
                        {page.description && (
                          <Flex flex={1}>
                            <Appendix.CardMarkdownContent>
                              {page.description}
                            </Appendix.CardMarkdownContent>
                          </Flex>
                        )}
                      </Appendix.Card>
                    );
                  })}
            </Appendix.CardStack>
          </Flex>
        </Section.Wrapper>
      </PageContent>
    </Flex>
  );
};
