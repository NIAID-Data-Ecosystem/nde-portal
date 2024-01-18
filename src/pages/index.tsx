import React, { useEffect, useMemo, useState } from 'react';
import type { NextPage } from 'next';
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Heading,
  Icon,
  Image,
  SkeletonCircle,
  SkeletonText,
  Table as StyledTable,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tabs,
  TabList,
  Tab,
  Tag,
  Text,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react';
import { theme } from 'src/theme';
import { Link } from 'src/components/link';
import {
  PageHeader,
  PageContainer,
  PageContent,
} from 'src/components/page-container';
import HOMEPAGE_COPY from 'configs/homepage.json';
import HOME_QUERIES from 'configs/queries/home-queries.json';
import NextLink from 'next/link';
import { SearchBarWithDropdown } from 'src/components/search-bar';
import { AdvancedSearchOpen } from 'src/components/advanced-search/components/buttons';
import { FaAngleRight, FaRegEnvelope, FaGithub } from 'react-icons/fa6';
import { useRepoData } from 'src/hooks/api/useRepoData';
import { queryFilterObject2String } from 'src/components/filters/helpers';
import { NewsOrEventsObject } from './news';
import {
  NewsCarousel,
  fetchNews,
} from 'src/views/home/components/NewsCarousel';
import { TableSortToggle } from 'src/components/table/components/sort-toggle';
import { TableWrapper } from 'src/components/table/components/wrapper';

interface Repository {
  identifier: string;
  label: string;
  type: 'generalist' | 'iid';
  url?: string;
  abstract?: string;
  icon?: string;
}

export const RepositoryTable: React.FC<{
  isLoading: boolean;
  repositories: Repository[];
  selectedType: Repository['type'];
}> = ({ repositories, isLoading, selectedType }) => {
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  const TABLE_COLUMNS = [
    { title: 'name', property: 'label', isSortable: true },
    { title: 'description', property: 'abstract' },
  ];

  const rowsByType = useMemo(
    () => repositories.filter(({ type }) => type === selectedType),
    [repositories, selectedType],
  );

  const rows = useMemo(
    () =>
      rowsByType.sort((a, b) =>
        sortOrder === 'ASC'
          ? a.label.localeCompare(b.label)
          : b.label.localeCompare(a.label),
      ),
    [rowsByType, sortOrder],
  );

  return (
    <TableWrapper colorScheme='gray' w='100%'>
      <TableContainer>
        <StyledTable
          variant='simple'
          bg='white'
          colorScheme='gray'
          role='table'
        >
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
                      px={4}
                      borderBottom='1px solid !important'
                      borderBottomColor={`${theme.colors.gray[200]} !important`}
                      minW='250px'
                      w={column.property === 'label' ? '40%' : 'unset'}
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
            {(rows.length ? rows : Array.from(Array(10))).map((_, i) => {
              return (
                <Tr key={i} id={`${i}`}>
                  {Array.from(Array(TABLE_COLUMNS.length)).map((_, j) => {
                    if (TABLE_COLUMNS && rows) {
                      const row = rows[i];
                      let column = TABLE_COLUMNS[j];
                      let cell =
                        row?.[column.property as keyof Repository] || '';
                      return (
                        <Td
                          role='cell'
                          key={`${cell}-${i}-${j}`}
                          id={`${cell}-${i}-${j}`}
                          whiteSpace='break-spaces'
                          minW='250px'
                          w={column.property === 'label' ? '30%' : 'unset'}
                          isNumeric={typeof cell === 'number'}
                          sx={{
                            px: `${theme.space[4]} !important`,
                            py: `${theme.space[2]} !important`,
                          }}
                          verticalAlign={
                            column.property === 'label' ? 'top' : 'middle'
                          }
                        >
                          <Flex
                            alignItems={['flex-start', 'center']}
                            flexDirection={['column', 'row']}
                            justifyContent='flex-start'
                          >
                            {column.property === 'label' && (
                              <SkeletonCircle
                                data-testid={isLoading ? 'loading' : 'loaded'}
                                isLoaded={!isLoading && rows.length > 0}
                                h='30px'
                                w='30px'
                                m={2}
                                ml={0}
                              >
                                {row?.icon && (
                                  <>
                                    {row?.url ? (
                                      <Link
                                        href={row.url}
                                        fontWeight='medium'
                                        target='_blank'
                                        _focus={{
                                          boxShadow: 'none',
                                        }}
                                      >
                                        <Image
                                          src={`${row.icon}`}
                                          alt={`Logo for data source ${row.label}`}
                                          objectFit='contain'
                                          width='30px'
                                          height='30px'
                                        />
                                      </Link>
                                    ) : (
                                      <Image
                                        src={`${row.icon}`}
                                        alt={`Logo for data source ${row.label}`}
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
                              data-testid={isLoading ? 'loading' : 'loaded'}
                              isLoaded={!isLoading && rows.length > 0}
                              noOfLines={2}
                              spacing='2'
                              w='100%'
                              ml={[0, 2]}
                            >
                              {row?.identifier &&
                              column.property === 'label' ? (
                                <NextLink
                                  href={{
                                    pathname: `/search`,
                                    query: {
                                      q: '',
                                      filters: queryFilterObject2String({
                                        'includedInDataCatalog.name': [
                                          row.identifier,
                                        ],
                                      }),
                                    },
                                  }}
                                  passHref
                                  prefetch={false}
                                >
                                  <Link as='div' fontWeight='medium'>
                                    {cell}
                                  </Link>
                                </NextLink>
                              ) : (
                                <Text fontSize='sm'>{cell}</Text>
                              )}
                            </SkeletonText>
                          </Flex>
                        </Td>
                      );
                    }
                  })}
                </Tr>
              );
            })}
          </Tbody>
        </StyledTable>
      </TableContainer>
    </TableWrapper>
  );
};

export const RepositoryTabs: React.FC<{
  children: React.ReactNode;
  repositories: Repository[];
  setSelectedType: React.Dispatch<React.SetStateAction<Repository['type']>>;
}> = ({ children, repositories, setSelectedType }) => {
  const types: { property: Repository['type']; label: string }[] = [
    { property: 'iid', label: 'IID Domain Repositories' },
    { property: 'generalist', label: 'Generalist Repositories' },
  ];

  return (
    <Flex flexDirection='column'>
      <Tabs
        w='100%'
        colorScheme='primary'
        mb={4}
        onChange={index => {
          setSelectedType(types[index].property);
        }}
        size='sm'
      >
        <TabList
          flexWrap={['wrap', 'nowrap']}
          justifyContent={['center', 'flex-start']}
          mx={4}
        >
          {types.map((type, idx) => (
            <Tab
              key={type.property}
              w={['100%', 'unset']}
              color='gray.800'
              _selected={{
                borderBottom: '2px solid',
                borderBottomColor: 'primary.400',
                color: 'text.heading',
                ['.tag']: {
                  bg: 'primary.100',
                },
              }}
              _focus={{ outline: 'none' }}
            >
              <Heading as='h3' size='sm' fontWeight='medium' color='inherit'>
                {type.label}
              </Heading>
              <Tag
                className='tag'
                borderRadius='full'
                ml={2}
                px={4}
                my={[4, 0]}
                size='sm'
                colorScheme='gray'
                variant='subtle'
                fontWeight='semibold'
              >
                {
                  repositories.filter(({ type: t }) => t === type.property)
                    .length
                }
              </Tag>
            </Tab>
          ))}
        </TabList>
        <TabPanels>{children}</TabPanels>
      </Tabs>
    </Flex>
  );
};

const Home: NextPage<{
  data: {
    news: NewsOrEventsObject[];
  };
  error?: { message: string };
}> = props => {
  // For repositories table
  const [repositories, setRepositories] = useState<Repository[]>([]);

  const [selectedType, setSelectedType] = useState<Repository['type']>('iid');

  const { isLoading, data, error } = useRepoData();

  useEffect(() => {
    data && setRepositories([...data]);
  }, [data]);

  return (
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
        <Flex w='100%' justifyContent='flex-end' mt={[15, 20, 24]} mb={2}>
          <Box mb={2}>
            <NextLink
              href={{ pathname: '/advanced-search' }}
              passHref
              prefetch={false}
            >
              <AdvancedSearchOpen
                onClick={() => {}}
                variant='outline'
                bg='whiteAlpha.500'
                color='white'
                _hover={{ bg: 'whiteAlpha.800', color: 'primary.600' }}
              />
            </NextLink>
          </Box>
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
          {HOME_QUERIES.map((query, i) => {
            return (
              <Link
                key={query.title}
                as='div'
                px={2}
                color='whiteAlpha.800'
                _hover={{
                  color: 'white',
                  svg: {
                    transform: 'translateX(0)',
                    transition: '0.2s ease-in-out',
                  },
                }}
                _visited={{ color: 'white' }}
                // display less options in mobile
                display={[i > 2 ? 'none' : 'block', 'block']}
              >
                <NextLink
                  href={{
                    pathname: `/search`,
                    query: { q: query.searchTerms.join(' OR ') },
                  }}
                  prefetch={false}
                >
                  <Text color='inherit'>{query.title}</Text>
                  <Icon
                    as={FaAngleRight}
                    ml={2}
                    boxSize={3}
                    transform='translateX(-5px)'
                    transition='0.2s ease-in-out'
                  />
                </NextLink>
              </Link>
            );
          })}
        </Flex>
      </PageHeader>
      <>
        {/**** Repositories Table section *****/}
        {!error && (
          <PageContent
            flexDirection='column'
            bg='#fff'
            mb={20}
            alignItems='center'
          >
            <Box maxW='1200px' width='100%'>
              <Heading
                pb={[4, 4, 8]}
                as='h2'
                fontWeight='semibold'
                size='lg'
                textAlign={['center', 'left']}
              >
                {HOMEPAGE_COPY.sections.repositories.heading}
              </Heading>
              <RepositoryTabs
                repositories={repositories}
                setSelectedType={setSelectedType}
              >
                <TabPanel id='iid'>
                  <RepositoryTable
                    isLoading={isLoading}
                    repositories={repositories}
                    selectedType='iid'
                  />
                </TabPanel>
                <TabPanel id='generalist'>
                  <RepositoryTable
                    isLoading={isLoading}
                    repositories={repositories}
                    selectedType='generalist'
                  />
                </TabPanel>
              </RepositoryTabs>
              <ButtonGroup
                spacing={[0, 2]}
                flexWrap={['wrap', 'nowrap']}
                w='100%'
                display='flex'
                justifyContent='flex-end'
                mt={4}
                px={4}
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
                    const icon = route.title.includes('question')
                      ? FaRegEnvelope
                      : FaGithub;
                    return (
                      <Box key={route.title} w={['100%', 'unset']}>
                        <NextLink
                          href={route.path}
                          passHref
                          target={route.isExternal ? '_blank' : '_self'}
                        >
                          <Button
                            w='100%'
                            minWidth='200px'
                            fontSize='sm'
                            variant={index % 2 ? 'solid' : 'outline'}
                            m={[0, 0, 0]}
                            my={[1, 2, 0]}
                            maxWidth={['unset', '250px']}
                            leftIcon={<Icon as={icon} />}
                          >
                            {route.title}
                          </Button>
                        </NextLink>
                      </Box>
                    );
                  },
                )}
              </ButtonGroup>
              {/* NEWS */}
              {!props?.error?.message && props.data?.news && (
                <NewsCarousel news={props.data.news} />
              )}
            </Box>
          </PageContent>
        )}
      </>
    </PageContainer>
  );
};

export async function getStaticProps() {
  try {
    const { news } = await fetchNews({ paginate: { page: 1, pageSize: 5 } });
    return { props: { data: { news } } };
  } catch (err: any) {
    return {
      props: {
        data: [],
        error: {
          type: 'error',
          message: '' + err,
        },
      },
    };
  }
}

export default Home;
