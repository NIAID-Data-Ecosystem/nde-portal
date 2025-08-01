import { useMemo, useState } from 'react';
import { Flex, Image, Stack } from '@chakra-ui/react';
import { PageContent } from 'src/components/page-container';
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
import { FeaturedPageProps } from '../types';

export const TableOfContents = ({ data }: { data?: FeaturedPageProps[] }) => {
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
      <Sidebar aria-label='Navigation for list of featured pages.'>
        {data?.map(page => {
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
        id='featured-index-page'
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
          <SectionHeader title='Features'></SectionHeader>

          {/* Search bar */}
          <Flex>
            <SectionSearch
              data={sortedPages}
              size='sm'
              ariaLabel='Search for a featured page'
              placeholder='Search for a featured page'
              value={searchValue}
              handleChange={e => setSearchValue(e.currentTarget.value)}
            />
          </Flex>

          {/* Display list of featured pages in cards */}
          <StyledCardStack>
            {sortedPages.map(page => {
              const label = page?.title;
              const imageUrl = page?.thumbnail?.url.startsWith('/')
                ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL}${page.thumbnail.url}`
                : page?.thumbnail?.url;

              return (
                <StyledCard
                  key={page.id}
                  id={page.slug}
                  isLoading={isLoading}
                  title={label}
                  thumbnail={
                    imageUrl
                      ? {
                          url: imageUrl,
                          alternativeText:
                            page?.thumbnail?.alternativeText || '',
                        }
                      : null
                  }
                  renderCTA={() =>
                    page.slug ? (
                      <StyledCardButton
                        href={{
                          pathname: `/features/${page.slug}`,
                        }}
                      >
                        {page.title}
                      </StyledCardButton>
                    ) : (
                      <></>
                    )
                  }
                >
                  <>
                    {/* Description */}
                    {page.abstract && (
                      <Flex flex={1}>
                        <StyledCardDescription>
                          {page.abstract}
                        </StyledCardDescription>
                      </Flex>
                    )}
                  </>
                </StyledCard>
              );
            })}
          </StyledCardStack>
        </Flex>
      </PageContent>
    </Flex>
  );
};
