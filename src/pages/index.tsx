import { useState } from 'react';
import type { NextPage } from 'next';
import {
  Button,
  Flex,
  Heading,
  Image,
  SimpleGrid,
  Text,
  theme,
  useBreakpointValue,
} from 'nde-design-system';
import {
  PageHeader,
  PageContainer,
  PageContent,
  SearchQueryLink,
} from 'src/components/page-container';
import { useRouter } from 'next/router';
import homepageCopy from 'configs/homepage.json';
import { fetchSearchResults } from 'src/utils/api';
import { useQuery } from 'react-query';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import LoadingSpinner from 'src/components/loading';
import { formatNumber } from 'src/utils/helpers';
import {
  StyledSection,
  StyledSectionHeading,
  StyledText,
  StyledBody,
  StyledSectionButtonGroup,
  PieChart,
  Legend,
} from 'src/components/pie-chart';
import { assetPrefix } from 'next.config';
import NextLink from 'next/link';
import { AdvancedSearch } from 'src/components/advanced-search';
import { SearchBarWithDropdown } from 'src/components/search-bar';

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
  const router = useRouter();
  const size = useBreakpointValue({ base: 300, lg: 350 });

  // Search term entered in search bar
  const [searchTerm, setSearchTerm] = useState<string>('');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void =>
    setSearchTerm(e.target.value);

  // update value when changed
  // useEffect(() => setSearchTerm(value || ''), [value]);

  // Fetch stats about number of resources
  const params = {
    q: '__all__',
    size: 0,
    facets: [
      '@type',
      'measurementTechnique.name',
      'includedInDataCatalog.name',
    ].join(','),
    facet_size: 20,
  };

  interface Stat {
    term: string;
    count: number;
    stats?: Stat[];
  }

  interface Stats {
    datasets: Stat | null;
    computationaltool: Stat | null;
    measurementTechnique: Stat | null;
    repositories: Stat | null;
  }

  const [stats, setStats] = useState<Stats>({
    datasets: null,
    computationaltool: null,
    measurementTechnique: null,
    repositories: null,
  });

  const { isLoading, error } = useQuery<
    FetchSearchResultsResponse | undefined,
    Error
  >({
    queryKey: ['stats', params],
    queryFn: () => fetchSearchResults(params),
    refetchOnWindowFocus: false,
    onSuccess: data => {
      let stat = { ...stats };
      if (data) {
        const { facets } = data;

        // Data types - we're interested in computationaltool and datasets.
        const types: { [key: string]: Stat } = facets['@type'].terms.reduce(
          (r: { [key: string]: Stat }, v: Stat) => {
            const key = v.term.toLowerCase();
            if (key === 'dataset' || key === 'computationaltool') {
              if (!r[`${key}`]) {
                r[`${key}`] = { term: '', count: 0 };
              }
              r[`${key}`].term =
                key === 'computationaltool' ? 'Tools' : 'Datasets';
              r[`${key}`].count += v.count;
            }
            return r;
          },
          {},
        );
        // Get number of measurement techniques
        const measurementTechnique = {
          term: 'Measurement techniques',
          count: facets['measurementTechnique.name'].total,
        };

        const sources = [...facets['includedInDataCatalog.name'].terms];

        // Get number of repositories
        const repositories = {
          term: 'Repositories',
          count: sources.length,
          stats: sources,
        };
        stat = {
          datasets: types.dataset,
          computationaltool: types.computationaltool,
          measurementTechnique,
          repositories,
        };
      }

      setStats(stat);
    },
  });
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
        bgImg={`${assetPrefix || ''}/assets/home-bg.png`}
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
