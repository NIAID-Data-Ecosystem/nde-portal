import { useMemo, useState } from 'react';
import { Flex, Image, Stack } from '@chakra-ui/react';
import { DiseasePageProps } from 'src/views/diseases/types';
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

export const TableOfContents = ({ data }: { data: DiseasePageProps[] }) => {
  // [TO DO]: Fetch all pages from the Strapi API
  const isLoading = false;

  const [searchValue, setSearchValue] = useState('');

  const diseasePages = useMemo(() => {
    return (
      data
        ?.filter(page => {
          const title = page.attributes.title.toLowerCase();
          const description = page.attributes.description?.toLowerCase() || '';
          const searchTerm = searchValue.toLowerCase();

          return title.includes(searchTerm) || description.includes(searchTerm);
        })
        .sort((a, b) =>
          a.attributes.title.localeCompare(b.attributes.title, undefined, {
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
              label={page?.attributes?.title}
              href={`#${page.attributes.slug}`}
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
        p={4}
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
              const label = page?.attributes?.title;

              return (
                <StyledCard
                  key={page.id}
                  id={page.attributes.slug}
                  isLoading={isLoading}
                >
                  {/* Description */}
                  <Stack
                    spacing={{ base: 4, lg: 6, xl: 8 }}
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
                      {page.attributes.description && (
                        <Flex flex={1}>
                          <StyledCardDescription>
                            {page.attributes.description}
                          </StyledCardDescription>
                        </Flex>
                      )}
                    </Stack>

                    {page.attributes.image?.data?.attributes?.url && (
                      <Flex
                        minWidth={200}
                        maxWidth={{ base: 'unset', xl: '30%' }}
                        flex={1}
                        alignItems='flex-start'
                      >
                        <Image
                          borderRadius='base'
                          width='100%'
                          height='auto'
                          src={page.attributes.image.data.attributes.url}
                          alt={
                            page.attributes.image.data.attributes
                              .alternativeText
                          }
                          objectFit='contain'
                        />
                      </Flex>
                    )}
                  </Stack>
                  {/* Link to program resources in the NDE */}
                  {page.attributes.query && (
                    <Flex
                      justifyContent={{ base: 'center', md: 'flex-end' }}
                      width='100%'
                    >
                      <StyledCardButton
                        href={{
                          pathname: `/diseases/${page.attributes.slug}`,
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
