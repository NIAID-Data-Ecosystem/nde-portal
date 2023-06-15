import React, { useMemo, useState } from 'react';
import type { NextPage } from 'next';
import { Heading, theme, useBreakpointValue } from 'nde-design-system';
import { PageContainer, PageContent } from 'src/components/page-container';
import { fetchMetadata } from 'src/utils/api';
import { useQuery } from 'react-query';
import { Metadata } from 'src/utils/api/types';
import REPOSITORIES from 'configs/repositories.json';

const Home: NextPage = () => {
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
