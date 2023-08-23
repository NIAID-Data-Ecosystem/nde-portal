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
  theme,
  Card,
  CardTitle,
  CardBody,
} from 'nde-design-system';
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
import { FaChevronRight } from 'react-icons/fa';
import { useRepoData } from 'src/hooks/api';
import { queryFilterObject2String } from 'src/components/filters/helpers';
import { FaRegEnvelope, FaGithub } from 'react-icons/fa';
import axios from 'axios';
import { serialize } from 'next-mdx-remote/serialize';
import { Carousel } from 'src/components/carousel';
import { NewsProps } from './news';
import { formatDate } from 'src/utils/api/helpers';
import { MDXRemote } from 'next-mdx-remote';
import { useMDXComponents } from 'mdx-components';

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
      >
        <TabList
          flexWrap={['wrap', 'nowrap']}
          justifyContent={['center', 'flex-start']}
        >
          {types.map(type => (
            <Tab
              key={type.property}
              w={['100%', 'unset']}
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
              <Heading as='h3' size='md' fontWeight='semibold' color='inherit'>
                {type.label}
              </Heading>
              <Tag
                className='tag'
                borderRadius='full'
                ml={2}
                px={4}
                my={[4, 0]}
                size='sm'
                opacity={0.25}
                colorScheme='gray'
              >
                {
                  repositories.filter(({ type: t }) => t === type.property)
                    .length
                }
              </Tag>
            </Tab>
          ))}
        </TabList>
      </Tabs>

      {children}
    </Flex>
  );
};

const Home: NextPage<NewsProps> = props => {
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
          <NextLink
            href={{ pathname: '/advanced-search' }}
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
                    as={FaChevronRight}
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
                <RepositoryTable
                  isLoading={isLoading}
                  repositories={repositories}
                  selectedType={selectedType}
                />
              </RepositoryTabs>
              <ButtonGroup
                spacing={[0, 2]}
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
              {/* {props.data.news.length > 0 && (
                <Box mt={20} p={6} minH='500px' width='100%' borderRadius='lg'>
                  <Heading
                    as='h3'
                    fontSize='lg'
                    color='primary.600'
                    fontWeight='normal'
                    pb={4}
                    mb={4}
                    borderBottom='1px solid'
                    borderBottomColor='primary.200'
                  >
                    Recent News Releases
                  </Heading>

                  <Carousel>
                    {props.data.news.slice(0, 5).map(news => {
                      return (
                        <Card key={news.id}>
                          {news.attributes.image.data ? (
                            <Box h='150px' overflow='hidden' p={0}>
                              <Image
                                src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${news.attributes.image.data[0].attributes.url}`}
                                alt={
                                  news.attributes.image.data[0].attributes
                                    .alternativeText
                                }
                                objectFit='contain'
                                width='100%'
                                p={0}
                              />
                            </Box>
                          ) : (
                            <Box bg='gray.100' w='100%' h='150px'></Box>
                          )}
                          <Box p={4}>
                            <CardTitle p={0} fontSize='lg' lineHeight='short'>
                              {news.attributes.name}
                            </CardTitle>
                            <CardBody p={0}>
                              {
                                <Text
                                  as='span'
                                  mt={2}
                                  fontSize='sm'
                                  lineHeight='short'
                                  noOfLines={3}
                                >
                                  {formatDate(news.attributes.publishedAt)}{' '}
                                  &mdash;
                                  {news.attributes.shortDescription ? (
                                    news.attributes.shortDescription
                                  ) : news.mdx.description ? (
                                    <MDXRemote
                                      {...news.mdx.description}
                                      components={{
                                        // remove formatting for p elements so that they call in line with date.
                                        p: (props: any) => (
                                          <>{props.children}</>
                                        ),
                                      }}
                                    />
                                  ) : (
                                    <></>
                                  )}
                                </Text>
                              }
                            </CardBody>
                          </Box>
                        </Card>
                      );
                    })}
                  </Carousel>
                  <Flex flex={1} justifyContent='center' mt={4}>
                    <NextLink
                      href={{
                        pathname: `/news`,
                      }}
                      passHref
                      prefetch={false}
                    >
                      <Button
                        size='sm'
                        rightIcon={<Icon as={FaChevronRight} />}
                      >
                        All news releases
                      </Button>
                    </NextLink>
                  </Flex>
                </Box>
              )} */}
            </Box>
          </PageContent>
        )}
      </>
    </PageContainer>
  );
};

export async function getStaticProps() {
  // const fetchData = async () => {
  //   try {
  //     const news = await axios.get(
  //       `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/news-reports?populate=*&sort=publishedAt:DESC&pagination[page]=1&pagination[pageSize]=5`,
  //     );

  //     return { news: news.data.data };
  //   } catch (err) {
  //     throw err;
  //   }
  // };
  try {
    // const contents = await fetchData();
    // const news = await Promise.all(
    //   contents.news.map(async (doc: any) => {
    //     try {
    //       if (doc?.attributes?.description) {
    //         const body = doc.attributes.description
    //           .replace(/{/g, '(')
    //           .replace(/}/g, ')');

    //         const compiledMDXDescription = await serialize(body);
    //         return {
    //           ...doc,
    //           mdx: { description: compiledMDXDescription },
    //         };
    //       }
    //       return doc;
    //     } catch (err) {
    //       throw err;
    //     }
    //   }),
    // );

    return { props: { data: { news: [] } } };
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
