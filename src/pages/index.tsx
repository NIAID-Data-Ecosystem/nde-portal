import React, { useMemo, useState } from 'react';
import type { NextPage } from 'next';
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Heading,
  Image,
  Link,
  SkeletonCircle,
  SkeletonText,
  Table as StyledTable,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  TableSortToggle,
  TableWrapper,
  Tabs,
  TabList,
  Tab,
  Tag,
  Text,
  useBreakpointValue,
  theme,
} from 'nde-design-system';
import {
  PageHeader,
  PageContainer,
  PageContent,
  SearchQueryLink,
} from 'src/components/page-container';
import HOMEPAGE_COPY from 'configs/homepage.json';
import { fetchMetadata } from 'src/utils/api';
import { useQuery } from 'react-query';
import { Metadata } from 'src/utils/api/types';
import NextLink from 'next/link';
import { SearchBarWithDropdown } from 'src/components/search-bar';
import { AdvancedSearchOpen } from 'src/components/advanced-search/components/buttons';
import NIAID_FUNDED from 'configs/niaid-sources.json';
import SOURCES from 'configs/resource-sources.json';

const sample_queries = [
  {
    title: 'Asthma',
    searchTerms: ['"Asthma"'],
  },
  {
    title: 'COVID-19',
    searchTerms: [
      '"SARS-CoV-2"',
      '"Covid-19"',
      '"Wuhan coronavirus"',
      '"Wuhan pneumonia"',
      '"2019-nCoV"',
      '"HCoV-19"',
    ],
  },
  {
    title: 'HIV/AIDS',
    searchTerms: ['"HIV"', '"AIDS"'],
  },
  { title: 'Influenza', searchTerms: ['"Influenza"', '"Flu"'] },
  {
    title: 'Malaria',
    searchTerms: [
      '"Malaria"',
      '"Plasmodium falciparum"',
      '"Plasmodium malariae"',
      '"Plasmodium ovale curtisi"',
      '"Plasmodium ovale wallikeri"',
      '"Plasmodium vivax"',
      '"Plasmodium knowlesi"',
    ],
  },
  {
    title: 'Tuberculosis',
    searchTerms: [
      '"Tuberculosis"',
      '"Mycobacterium bovis"',
      '"Mycobacterium africanum"',
      '"Mycobacterium canetti"',
      '"Mycobacterium microti"',
      '"Phthisis"',
    ],
  },
];

const Home: NextPage = () => {
  const size = useBreakpointValue({ base: 300, lg: 350 });

  interface Repository {
    identifier: string;
    name: string;
    type: 'generalist' | 'iid';
    url?: string;
    abstract?: string;
    icon?: string;
  }
  const types: { property: Repository['type']; label: string }[] = [
    { property: 'iid', label: 'IID Domain Repositories' },
    { property: 'generalist', label: 'Generalist Repositories' },
  ];
  const [selectedType, setSelectedType] = useState<Repository['type']>(
    types[0].property,
  );

  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  const [repositories, setRepositories] = useState<Repository[]>([]);

  const { isLoading, error } = useQuery<Metadata | undefined, Error>({
    queryKey: ['metadata'],
    queryFn: fetchMetadata,
    onSuccess: data => {
      const sources = data?.src || [];
      const repositories = Object.values(sources).map(({ sourceInfo }) => {
        const { identifier, name, url } = sourceInfo || {};

        const data = {
          identifier,
          name,
          url,
          type: 'generalist',
        };
        const icon = SOURCES.repositories.find(
          ({ sourceName }) => sourceName === identifier,
        )?.icon;
        const niaidSource = NIAID_FUNDED.niaid.repositories.find(
          ({ id }) => id === identifier,
        );
        if (niaidSource) {
          return {
            ...data,
            icon,
            type: 'iid' as const,
            abstract: niaidSource?.abstract || '',
          };
        } else {
          const generalRepo = NIAID_FUNDED.generalist.repositories.find(
            ({ id }) => id === identifier,
          );
          return {
            ...data,
            icon,
            type: 'generalist' as const,
            abstract: generalRepo?.abstract || '',
          };
        }
      });

      setRepositories(
        repositories.sort((a, b) => a.name.localeCompare(b.name)),
      );
    },
  });

  const TABLE_COLUMNS = [
    { title: 'name', property: 'name', isSortable: true },
    { title: 'description', property: 'abstract' },
  ];

  const rows = useMemo(
    () =>
      repositories
        .filter(({ type }) => type === selectedType)
        .sort((a, b) =>
          sortOrder === 'ASC'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name),
        ),
    [repositories, selectedType, sortOrder],
  );
  return (
    <>
      <PageContainer
        hasNavigation
        title='Home'
        metaDescription='Find and access allergic, infectious and immune-mediated disease data by searching across biomedical data repositories with the NIAID Data Discovery Portal'
        keywords='omics, data, infectious disease, epidemiology, clinical trial, immunology, bioinformatics, surveillance, search, repository'
        disableSearchBar
      >
        {/**** Hero banner + search bar *****/}
        <PageHeader
          title={HOMEPAGE_COPY.sections.hero.heading}
          subtitle={HOMEPAGE_COPY.sections.hero.subtitle}
          body={[HOMEPAGE_COPY.sections.hero.body]}
        >
          <Flex w='100%' justifyContent='flex-end' mb={2}>
            <NextLink
              href={{ pathname: 'advanced-search' }}
              passHref
              prefetch={false}
            >
              <Box>
                <AdvancedSearchOpen
                  onClick={() => {}}
                  variant='outline'
                  bg='whiteAlpha.500'
                  color='white'
                  _hover={{ bg: 'whiteAlpha.800', color: 'primary.600' }}
                />
              </Box>
            </NextLink>
          </Flex>
          <SearchBarWithDropdown
            placeholder='Search for datasets'
            ariaLabel='Search for datasets'
            size='md'
          />

          <Flex mt={2} flexWrap={['wrap']}>
            <Text color='whiteAlpha.800' mr={2}>
              Try:
            </Text>
            {sample_queries.map((query, i) => {
              return (
                <NextLink
                  key={query.title}
                  href={{
                    pathname: `/search`,
                    query: { q: query.searchTerms.join(' OR ') },
                  }}
                  passHref
                  prefetch={false}
                >
                  <Box>
                    <SearchQueryLink
                      title={query.title}
                      display={[i > 2 ? 'none' : 'block', 'block']}
                    />
                  </Box>
                </NextLink>
              );
            })}
          </Flex>
        </PageHeader>

        {/**** Repositories Table section *****/}
        {!error && (
          <PageContent
            flexDirection='column'
            bg='#fff'
            mb={20}
            alignItems='center'
          >
            <Box maxW='1600px' width='100%'>
              <Heading
                pb={[4, 4, 8]}
                as='h2'
                fontWeight='semibold'
                size='lg'
                textAlign={['center', 'left']}
              >
                {HOMEPAGE_COPY.sections.repositories.heading}
              </Heading>

              <Flex flexDirection='column'>
                <Tabs
                  w='100%'
                  colorScheme='primary'
                  mb={4}
                  onChange={index => {
                    setSelectedType(types[index].property);
                  }}
                >
                  <TabList
                    flexWrap={['wrap', 'nowrap']}
                    justifyContent={['center', 'flex-start']}
                  >
                    {types.map(type => (
                      <Tab
                        w={['100%', 'unset']}
                        key={type.property}
                        color='blackAlpha.500'
                        _selected={{
                          borderBottom: '4px solid',
                          borderBottomColor: 'primary.400',
                          color: 'text.heading',
                          ['.tag']: {
                            opacity: 1,
                          },
                        }}
                        _focus={{ outline: 'none' }}
                      >
                        <Heading
                          as='h3'
                          size='md'
                          fontWeight='semibold'
                          color='inherit'
                        >
                          {type.label}
                        </Heading>
                        <Tag
                          className='tag'
                          borderRadius='full'
                          ml={2}
                          px={4}
                          size='sm'
                          opacity={0.25}
                          colorScheme='gray'
                        >
                          {
                            repositories.filter(
                              ({ type: t }) => t === type.property,
                            ).length
                          }
                        </Tag>
                      </Tab>
                    ))}
                  </TabList>
                </Tabs>

                <TableWrapper colorScheme='gray' w='100%'>
                  <TableContainer>
                    <StyledTable variant='simple' bg='white' colorScheme='gray'>
                      {TABLE_COLUMNS && (
                        <Thead>
                          <Tr>
                            {TABLE_COLUMNS.map(column => {
                              return (
                                <Th
                                  key={column.property}
                                  role='columnheader'
                                  scope='col'
                                  bg='page.alt'
                                  borderBottom='1px solid !important'
                                  borderBottomColor={`${theme.colors.gray[200]} !important`}
                                >
                                  {column.title}
                                  {column.isSortable && (
                                    <TableSortToggle
                                      isSelected
                                      sortBy={sortOrder}
                                      handleToggle={isAsc => {
                                        setSortOrder(isAsc ? 'ASC' : 'DESC');
                                      }}
                                    />
                                  )}
                                </Th>
                              );
                            })}
                          </Tr>
                        </Thead>
                      )}
                      <Tbody>
                        {(rows.length ? rows : Array.from(Array(10))).map(
                          (_, i) => {
                            return (
                              <Tr key={i} id={`${i}`}>
                                {Array.from(Array(TABLE_COLUMNS.length)).map(
                                  (_, j) => {
                                    if (TABLE_COLUMNS && rows) {
                                      const row = rows[i];

                                      if (!isLoading && !row) {
                                        return (
                                          <React.Fragment key={`${i}-${j}`} />
                                        );
                                      }
                                      let column = TABLE_COLUMNS[j];
                                      let cell =
                                        row?.[
                                          column.property as keyof Repository
                                        ] || '';
                                      return (
                                        <Td
                                          role='cell'
                                          key={`${cell}-${i}-${j}`}
                                          id={`${cell}-${i}-${j}`}
                                          whiteSpace='break-spaces'
                                          minW='50px'
                                          isNumeric={typeof cell === 'number'}
                                        >
                                          <Flex
                                            alignItems={[
                                              'flex-start',
                                              'center',
                                            ]}
                                            flexDirection={['column', 'row']}
                                            justifyContent='flex-start'
                                          >
                                            {column.property === 'name' && (
                                              <SkeletonCircle
                                                h='30px'
                                                w='30px'
                                                isLoaded={!isLoading}
                                              >
                                                {row?.icon && (
                                                  <>
                                                    {row?.url ? (
                                                      <Link
                                                        href={row.url}
                                                        fontWeight='medium'
                                                        target='_blank'
                                                      >
                                                        <Image
                                                          src={`${row.icon}`}
                                                          alt={`Logo for data source ${row.name}`}
                                                          objectFit='contain'
                                                          width='30px'
                                                          height='30px'
                                                        />
                                                      </Link>
                                                    ) : (
                                                      <Image
                                                        src={`${row.icon}`}
                                                        alt={`Logo for data source ${row.name}`}
                                                        objectFit='contain'
                                                        width='30px'
                                                        height='30px'
                                                      />
                                                    )}
                                                  </>
                                                )}
                                              </SkeletonCircle>
                                            )}
                                            <SkeletonText
                                              noOfLines={1}
                                              spacing='2'
                                              skeletonHeight={4}
                                              isLoaded={!isLoading}
                                              minW='75%'
                                              ml={[0, 4]}
                                            >
                                              {row?.identifier &&
                                              column.property === 'name' ? (
                                                <NextLink
                                                  href={{
                                                    pathname: `/search`,
                                                    query: {
                                                      q: '',
                                                      filters: `includedInDataCatalog.name:${row.identifier}`,
                                                    },
                                                  }}
                                                  passHref
                                                  prefetch={false}
                                                >
                                                  <Link fontWeight='medium'>
                                                    {cell}
                                                  </Link>
                                                </NextLink>
                                              ) : (
                                                <Text fontSize='sm'>
                                                  {cell || '-'}
                                                </Text>
                                              )}
                                            </SkeletonText>
                                          </Flex>
                                        </Td>
                                      );
                                    }
                                  },
                                )}
                              </Tr>
                            );
                          },
                        )}
                      </Tbody>
                    </StyledTable>
                  </TableContainer>
                </TableWrapper>
              </Flex>
              <ButtonGroup
                flexWrap={['wrap', 'nowrap']}
                w='100%'
                display='flex'
                justifyContent='flex-end'
                mt={4}
              >
                {HOMEPAGE_COPY.sections.help.routes.map(
                  (
                    route: {
                      title: string;
                      path: string;
                      isExternal?: boolean;
                    },
                    index,
                  ) => {
                    return (
                      <NextLink key={route.title} href={route.path} passHref>
                        <Button
                          w='100%'
                          variant={index % 2 ? 'solid' : 'outline'}
                          size='sm'
                          m={[0, 2, 0]}
                          my={[1, 2, 0]}
                          py={[6]}
                          maxWidth='200px'
                        >
                          {route.title}
                        </Button>
                      </NextLink>
                    );
                  },
                )}
              </ButtonGroup>
            </Box>
          </PageContent>
        )}
      </PageContainer>
    </>
  );
};

export default Home;
