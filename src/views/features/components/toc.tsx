import { Box, Card, Flex, Skeleton } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { FeatureQueryResponse } from 'src/api/features/types';
import { PageContent } from 'src/components/page-container';
import { Section } from 'src/components/section';
import { TOC } from 'src/components/toc';

const TOC_COPY = {
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
    <Flex bg='#fff'>
      <TOC.SidebarList aria-label={TOC_COPY.sidebar['aria-label']}>
        {data?.map(page => {
          return (
            <TOC.SidebarItem
              key={page.id}
              title={page?.title}
              href={`#${page.slug}`}
            />
          );
        })}
      </TOC.SidebarList>
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
        <Section.Wrapper hasSeparator heading={TOC_COPY.heading} w='100%'>
          <Box flex={1}>
            {/* Search bar */}
            <Flex justifyContent='flex-end' flex={1}>
              <Section.Search
                data={sortedPages}
                size='sm'
                ariaLabel={TOC_COPY.search['aria-label']}
                placeholder={TOC_COPY.search['placeholder']}
                value={searchValue}
                handleChange={e => setSearchValue(e.currentTarget.value)}
              />
            </Flex>

            {/* Display list of featured pages in cards */}
            <TOC.CardStack>
              {sortedPages.map(page => {
                // const label = page?.title;
                const image = {
                  src: page?.thumbnail?.url.startsWith('/')
                    ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL}${page.thumbnail.url}`
                    : page?.thumbnail?.url,
                  alternativeText: page?.thumbnail?.alternativeText || '',
                };

                return (
                  <Skeleton
                    key={page.id}
                    loading={isLoading}
                    flex={1}
                    w='100%'
                    display='flex'
                    justifyContent='center'
                  >
                    <TOC.Card
                      key={page.id}
                      id={page.slug}
                      title={page?.title || ''}
                      image={image?.src ? image : undefined}
                      cta={[
                        {
                          href: `/features/${page.slug}`,
                          children: page?.title || 'Read more',
                          hasArrow: true,
                        },
                      ]}
                    >
                      {page.abstract && (
                        <Flex flex={1}>
                          <Card.Description>{page.abstract}</Card.Description>
                        </Flex>
                      )}
                    </TOC.Card>
                  </Skeleton>
                );
              })}
            </TOC.CardStack>
          </Box>
        </Section.Wrapper>
      </PageContent>
    </Flex>
  );
};
