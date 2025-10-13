import { Box, Card, Flex, Skeleton } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { FeatureQueryResponse } from 'src/api/features/types';
import { Appendix } from 'src/components/appendix';
import { PageContent } from 'src/components/page-container';
import { Section } from 'src/components/section';

const APPENDIX_COPY = {
  heading: 'Features',
  sidebar: {
    'aria-label': 'Navigation for list of featured pages.',
  },
  search: {
    'aria-label': 'Search for a featured page',
    placeholder: 'Search for a featured page',
  },
};
export const TableOfContents = ({
  data,
}: {
  data?: FeatureQueryResponse[];
}) => {
  // [TO DO]: Fetch all pages from the Strapi API
  const isLoading = false;

  const [searchValue, setSearchValue] = useState('');

  const sortedPages = useMemo(() => {
    return (
      data
        ?.filter(page => {
          const title = page.title.toLowerCase();
          const description = page.abstract?.toLowerCase() || '';
          const searchTerm = searchValue.toLowerCase();

          return title.includes(searchTerm) || description.includes(searchTerm);
        })
        .sort((a, b) =>
          a.title.localeCompare(b.title, undefined, {
            numeric: true,
          }),
        ) || []
    );
  }, [data, searchValue]);
  return (
    <Flex>
      <Appendix.SidebarList aria-label={APPENDIX_COPY.sidebar['aria-label']}>
        {data?.map(page => {
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
        id='featured-index-page'
        bg='#fff'
        maxW={{ base: 'unset', lg: '1200px' }}
        justifyContent='center'
        margin='0 auto'
        px={{ base: 4, md: 10 }}
        py={4}
        mb={32}
        flex={3}
      >
        <Section.Wrapper hasSeparator heading={APPENDIX_COPY.heading} w='100%'>
          <Box flex={1}>
            {/* Search bar */}
            <Flex justifyContent='flex-end' flex={1}>
              <Section.Search
                data={sortedPages}
                size='sm'
                ariaLabel={APPENDIX_COPY.search['aria-label']}
                placeholder={APPENDIX_COPY.search['placeholder']}
                value={searchValue}
                handleChange={e => setSearchValue(e.currentTarget.value)}
              />
            </Flex>

            {/* Display list of featured pages in cards */}
            <Appendix.CardStack>
              {sortedPages.map(page => {
                // const label = page?.title;
                const image = {
                  src: page?.thumbnail?.url.startsWith('/')
                    ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL}${page.thumbnail.url}`
                    : page?.thumbnail?.url,
                  alternativeText: page?.thumbnail?.alternativeText || '',
                };

                return (
                  <Skeleton key={page.id} loading={isLoading} flex={1}>
                    <Appendix.Card
                      title={page?.title || ''}
                      image={image?.src ? image : undefined}
                      maxWidth={{
                        base: 'xl',
                        xl: 'unset',
                      }}
                    >
                      {page.abstract && (
                        <Flex flex={1}>
                          <Card.Description>{page.abstract}</Card.Description>
                        </Flex>
                      )}
                    </Appendix.Card>
                  </Skeleton>
                );
              })}
            </Appendix.CardStack>
          </Box>
        </Section.Wrapper>
      </PageContent>
    </Flex>
  );
};
