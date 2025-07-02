import { useMemo, useState } from 'react';
import { Flex } from '@chakra-ui/react';
import { DiseasePageProps } from 'src/views/diseases/types';
import { PageContent } from 'src/components/page-container';
import {
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

export const TableOfContents = ({ data }: { data: DiseasePageProps[] }) => {
  // [TO DO]: Fetch all pages from the Strapi API
  const isLoading = false;

  const [searchValue, setSearchValue] = useState('');

  const diseasePages = useMemo(() => {
    return (
      data
        ?.filter(page => {
          const title = page.title.toLowerCase();
          const description = page.description?.toLowerCase() || '';
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
      <Sidebar aria-label='Navigation for list of disease pages.'>
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
              const title = page?.title;
              return (
                <StyledCard
                  key={page.id}
                  id={page.slug}
                  isLoading={isLoading}
                  title={title}
                  thumbnail={page.image}
                  renderCTA={() =>
                    page.query ? (
                      <StyledCardButton
                        href={{
                          pathname: `/diseases/${page.slug}`,
                        }}
                      >
                        Learn about {title} resources in the NIAID Data
                        Ecosystem
                      </StyledCardButton>
                    ) : (
                      <></>
                    )
                  }
                >
                  {/* Description */}
                  {page.description && (
                    <Flex flex={1}>
                      <StyledCardDescription>
                        {page.description}
                      </StyledCardDescription>
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
