import { useState } from "react";
import type { NextPage } from "next";
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Image,
  Link,
  LinkProps,
  SearchInput,
  SimpleGrid,
  Text,
  useBreakpointValue,
  usePrefersReducedMotion,
} from "nde-design-system";
import { PageContainer, PageContent } from "src/components/page-container";
import { useRouter } from "next/router";
import homepageCopy from "configs/homepage.json";
import { FaChevronRight } from "react-icons/fa";
import { fetchSearchResults } from "src/utils/api";
import { useQuery } from "react-query";
import { FetchSearchResultsResponse } from "src/utils/api/types";
import LoadingSpinner from "src/components/loading";
import { formatNumber } from "src/utils/helpers";
import PieChart from "src/components/home/components/pie-chart";
import {
  fade,
  StyledSection,
  StyledSectionHeading,
  StyledText,
  StyledBody,
  StyledSectionButtonGroup,
} from "src/components/home/styles";
import { assetPrefix, env } from "next.config";
import NextLink from "next/link";

const sample_queries = [
  {
    title: "Asthma",
    searchTerms: ['"Asthma"'],
  },
  {
    title: "Covid-19",
    searchTerms: [
      '"SARS-CoV-2"',
      ' "Covid-19"',
      ' "Wuhan coronavirus"',
      ' "Wuhan pneumonia"',
      ' "2019-nCoV"',
      ' "HCoV-19"',
    ],
  },
  {
    title: "HIV/AIDS",
    searchTerms: ['"HIV"', '"AIDS"'],
  },
  { title: "Influenza", searchTerms: ['"Influenza"', '"Flu"'] },
  {
    title: "Malaria",
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
    title: "Tuberculosis",
    searchTerms: [
      '"Tuberculosis"',
      '"Mycobacterium bovis"',
      '"Mycobacterium africanum"',
      '"Mucobacterium canetti"',
      '"Mycobacterium microti"',
      '"Phthisis"',
    ],
  },
];

interface QuickQueryLinkProps extends LinkProps {
  title: string;
  queryString: string;
}
// Text under search bar with quick queries for users to get started with.
const QuickQueryLink: React.FC<QuickQueryLinkProps> = ({
  title,
  queryString,
  ...props
}) => {
  if (!title || !queryString) {
    return null;
  }
  return (
    <NextLink
      href={{ pathname: `/search`, query: { q: queryString } }}
      passHref
    >
      <Link
        mx={2}
        color="whiteAlpha.800"
        _hover={{
          color: "white",
          textDecoration: "underline",
          svg: { transform: "translateX(0)", transition: "0.2s ease-in-out" },
        }}
        _visited={{ color: "white" }}
        {...props}
      >
        <Text>{title}</Text>
        <Icon
          as={FaChevronRight}
          ml={2}
          boxSize={3}
          transform="translateX(-5px)"
          transition="0.2s ease-in-out"
        ></Icon>
      </Link>
    </NextLink>
  );
};

const Home: NextPage = () => {
  const router = useRouter();
  const size = useBreakpointValue({ base: 200, sm: 200, lg: 250, xl: 300 });

  // Search term entered in search bar
  const [searchTerm, setSearchTerm] = useState("");
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void =>
    setSearchTerm(e.target.value);

  // Don't animate based on users preference (uses window.matchMedia).
  const prefersReducedMotion = usePrefersReducedMotion();
  const animation = prefersReducedMotion
    ? undefined
    : `${fade} 1.2s ease-in-out both`;

  // Fetch stats about number of resources
  const params = {
    q: "__all__",
    size: 0,
    facets: [
      "@type",
      "measurementTechnique.name",
      "includedInDataCatalog.name",
    ].join(","),
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
    queryKey: ["stats", params],
    queryFn: () => fetchSearchResults(params),
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      let stat = { ...stats };
      if (data) {
        const { facets } = data;

        // Data types - we're interested in computationaltool and datasets.
        const types: { [key: string]: Stat } = facets["@type"].terms.reduce(
          (r: { [key: string]: Stat }, v: Stat) => {
            const key = v.term.toLowerCase();
            if (key === "dataset" || key === "computationaltool") {
              if (!r[`${key}`]) {
                r[`${key}`] = { term: "", count: 0 };
              }
              r[`${key}`].term =
                key === "computationaltool" ? "Tools" : "Datasets";
              r[`${key}`].count += v.count;
            }
            return r;
          },
          {}
        );
        // Get number of measurement techniques
        const measurementTechnique = {
          term: "Measurement techniques",
          count: facets["measurementTechnique.name"].total,
        };

        const sources = [...facets["includedInDataCatalog.name"].terms];

        // Get number of repositories
        const repositories = {
          term: "Repositories",
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
    <>
      <PageContainer
        hasNavigation
        title="Search"
        metaDescription="Discovery Portal home page."
        disableSearchBar
      >
        <PageContent
          bgImg={`${assetPrefix}/assets/home-bg.png`}
          backgroundSize="cover"
          flexWrap="wrap"
          minH="unset"
          justifyContent={{ xl: "center" }}
        >
          {/* Header section */}
          <StyledSection
            id="header"
            flexDirection={"column"}
            alignItems={{ base: "flex-start", xl: "center" }}
            textAlign={{ xl: "center" }}
          >
            <Box maxW="600px">
              <Heading
                as="h1"
                size="h1"
                color="white"
                fontWeight="bold"
                letterSpacing={1}
                lineHeight="shorter"
                animation={animation}
              >
                {homepageCopy.sections[0].heading}
              </Heading>
              <Text
                color="white"
                fontSize="xl"
                fontWeight="semibold"
                mt={4}
                animation={animation}
                sx={{ animationDelay: "1s" }}
              >
                {homepageCopy.sections[0].subtitle}
              </Text>
              <Text
                color="white"
                fontWeight="light"
                fontSize="lg"
                lineHeight="short"
                mt={2}
                maxWidth={{ base: "400px", xl: "unset" }}
                animation={animation}
                sx={{ animationDelay: "1.5s" }}
              >
                {homepageCopy.sections[0].body}
              </Text>
            </Box>
            <Flex w="100%" mt={[15, 20, 24]} justifyContent="center">
              <Flex
                flexDirection="column"
                maxW={{ base: "600px", xl: "1000px" }}
                w="100%"
              >
                <SearchInput
                  w="100%"
                  isResponsive={false}
                  colorScheme="primary"
                  ariaLabel="Search for datasets or tools"
                  placeholder="Search for datasets or tools"
                  value={searchTerm}
                  handleChange={handleChange}
                  handleSubmit={(e) => {
                    e.preventDefault();

                    router.push({
                      pathname: `/search`,
                      query: { q: searchTerm.trim() },
                    });
                  }}
                />
                <Flex mt={2} flexWrap={["wrap"]}>
                  <Text color="whiteAlpha.800" mr={2}>
                    Try:
                  </Text>
                  {sample_queries.map((query, i) => {
                    return (
                      <QuickQueryLink
                        key={query.title}
                        title={query.title}
                        queryString={query.searchTerms.join(" OR ")}
                        display={[i > 2 ? "none" : "block", "block"]}
                      />
                    );
                  })}
                </Flex>
              </Flex>
            </Flex>
          </StyledSection>
        </PageContent>

        {/* NIAID Data Ecosystem section */}
        <PageContent justifyContent="center" bg="white" minH="unset">
          <StyledSection
            id="nde"
            alignItems="center"
            flexDirection="column"
            maxWidth={["100%", "100%", "750px"]}
          >
            <StyledSectionHeading>
              {homepageCopy.sections[1].heading}
            </StyledSectionHeading>

            <StyledText
              textAlign={["start", "center"]}
              mt={4}
              fontSize={["lg", "xl"]}
              lineHeight="taller"
              maxW="unset"
            >
              {homepageCopy.sections[1].body}
            </StyledText>
            <StyledSectionButtonGroup variant="solid" justifyContent="center">
              {homepageCopy.sections[1]?.routes &&
                homepageCopy.sections[1].routes.map((route) => {
                  return (
                    <Button
                      key={route.title}
                      href={`${route.path}`}
                      w="100%"
                      my={2}
                      target="_self"
                      isExternal={route.isExternal || false}
                    >
                      {route.title}
                    </Button>
                  );
                })}
            </StyledSectionButtonGroup>
          </StyledSection>
        </PageContent>

        {/* Display stats about the Biothings API */}
        {!error && (
          <PageContent
            w="100%"
            bg="white"
            minH="unset"
            flexDirection="column"
            justifyContent="space-around"
            alignItems="center"
            py={[6, 10]}
          >
            <SimpleGrid
              columns={[1, 2, Object.values(stats).length]}
              w="100%"
              spacing={[6, 8, 4]}
            >
              {Object.values(stats).map((stat, i) => {
                return (
                  <LoadingSpinner key={i} isLoading={isLoading}>
                    {stat?.term && (
                      <Flex
                        alignItems="center"
                        flexDirection="column"
                        textAlign="center"
                      >
                        <Image
                          src={`${assetPrefix}/assets/${stat.term
                            .toLowerCase()
                            .replaceAll(" ", "-")}.svg`}
                          alt={`Icon for ${stat.term}`}
                          boxSize="50px"
                          objectFit="contain"
                          mb={1}
                        />
                        <Heading size="md" fontWeight="bold" my={1}>
                          {formatNumber(stat.count)}
                        </Heading>
                        <Heading
                          size="xs"
                          fontWeight="medium"
                          lineHeight="shorter"
                        >
                          {stat.term}
                        </Heading>
                      </Flex>
                    )}
                  </LoadingSpinner>
                );
              })}
            </SimpleGrid>
          </PageContent>
        )}

        {/* Data repository viz section */}
        <PageContent
          bg="page.alt"
          minH="unset"
          flexDirection="column"
          alignItems="center"
        >
          <StyledSection id="explore-date">
            <LoadingSpinner isLoading={isLoading}>
              {/* Pie chart with number repositories and associated resources*/}
              {stats?.repositories?.stats && (
                <PieChart
                  width={size || 200}
                  height={size || 200}
                  data={stats.repositories.stats.sort(
                    (a, b) => b.count - a.count
                  )}
                ></PieChart>
              )}
            </LoadingSpinner>
            <StyledBody>
              <StyledSectionHeading mt={[4, 6]}>
                {homepageCopy.sections[2].heading}
              </StyledSectionHeading>
              <StyledText>{homepageCopy.sections[2].body}</StyledText>
              {homepageCopy.sections[2]?.routes &&
                homepageCopy.sections[2].routes.map(
                  (route: {
                    title: string;
                    path: string;
                    isExternal?: boolean;
                  }) => {
                    return (
                      <StyledSectionButtonGroup key={route.title}>
                        <Button
                          href={route.path}
                          w="100%"
                          variant="outline"
                          isExternal={route.isExternal || false}
                        >
                          {route.title}
                        </Button>
                      </StyledSectionButtonGroup>
                    );
                  }
                )}
            </StyledBody>
          </StyledSection>
        </PageContent>

        {/* Connect to the workspace section */}
        <PageContent
          bg="#fff"
          minH="unset"
          flexDirection="column"
          alignItems="center"
        >
          <StyledSection id="workspace" flexDirection={{ md: "row-reverse" }}>
            <Image
              w="100%"
              p={4}
              maxW={{ base: 300, xl: 400 }}
              src={`${assetPrefix}/assets/home-analyze.png`}
              alt={""}
            ></Image>
            <StyledBody>
              <StyledSectionHeading mt={[4, 6]}>
                {homepageCopy.sections[3].heading}
              </StyledSectionHeading>
              <StyledText>{homepageCopy.sections[3].body}</StyledText>
              {homepageCopy.sections[3]?.routes &&
                homepageCopy.sections[3].routes.map((route) => {
                  return (
                    <StyledSectionButtonGroup key={route.title}>
                      <Button href={route.path} w="100%" isExternal>
                        {route.title}
                      </Button>
                    </StyledSectionButtonGroup>
                  );
                })}
            </StyledBody>
          </StyledSection>
        </PageContent>
      </PageContainer>
    </>
  );
};

export default Home;
