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
  theme,
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
import REPOSITORIES from 'configs/repositories.json';

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
    label: string;
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
        const { identifier, url } = sourceInfo || {};

        const data = {
          identifier,
          url,
        };

        const repo = REPOSITORIES.repositories.find(
          ({ id }) => id === identifier,
        );
        return {
          ...data,
          label: repo?.label || '',
          type: (repo?.type || 'generalist') as Repository['type'],
          icon: repo?.icon || '',
          abstract: repo?.abstract || '',
        };
      });

      setRepositories(
        repositories.sort((a, b) => a.label.localeCompare(b.label)),
      );
    },
  });

  const TABLE_COLUMNS = [
    { title: 'name', property: 'label', isSortable: true },
    { title: 'description', property: 'abstract' },
  ];

  const rows = useMemo(
    () =>
      repositories
        .filter(({ type }) => type === selectedType)
        .sort((a, b) =>
          sortOrder === 'ASC'
            ? a.label.localeCompare(b.label)
            : b.label.localeCompare(a.label),
        ),
    [repositories, selectedType, sortOrder],
  );
  return (
    <PageContainer
      hasNavigation
      title='Home'
      metaDescription='NIAID Data Ecosystem Discovery Portal - Home.'
      disableSearchBar
    >
      <PageContent
        minH='400px'
        flex={1}
        bg={`linear-gradient(180deg, ${theme.colors.primary[500]}, ${theme.colors.tertiary[700]})`}
        bgImg={`/assets/home-bg.png`}
        backgroundSize='cover'
        flexWrap='wrap'
        justifyContent={{ xl: 'center' }}
        alignItems='center'
      >
        <Heading
          as='h1'
          size='h1'
          color='whiteAlpha.800'
          fontWeight='bold'
          letterSpacing={1}
          lineHeight='shorter'
        >
          Coming soon
        </Heading>
      </PageContent>
    </PageContainer>
  );
};

export default Home;
