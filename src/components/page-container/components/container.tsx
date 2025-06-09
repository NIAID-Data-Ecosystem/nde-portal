import { Box, Button, Flex, FlexProps, Icon, Stack } from '@chakra-ui/react';
import Head from 'next/head';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Footer } from 'src/components/footer';
import { Navigation } from 'src/components/navigation-bar';
import { SearchBarWithDropdown } from 'src/components/search-bar';
import NextLink from 'next/link';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { Breadcrumbs } from './breadcrumbs';
import { Banner } from './banner';

interface PageContainerProps extends FlexProps {
  title: string;
  metaCanonical?: string;
  metaDescription: string;
  keywords?: string;
  includeSearchBar?: boolean;
}

export interface NoticeProps {
  id: number | string;
  heading: string;
  description?: string | null;
  state: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  affectedRepository?: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  isActive: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  title,
  metaCanonical,
  metaDescription,
  includeSearchBar,
  ...props
}) => {
  // Fetch Notices from STRAPI API.
  const isProd = process.env.NEXT_PUBLIC_APP_ENV === 'production';
  const { data: notices } = useQuery<NoticeProps[]>({
    queryKey: ['notices'],
    queryFn: async () => {
      try {
        const notices = await axios
          .get(
            `${
              process.env.NEXT_PUBLIC_STRAPI_API_URL
            }/api/notices?populate=*&status=${isProd ? 'published' : 'draft'}`,
          )
          .then(res => res.data);
        return notices.data
          .filter((datum: NoticeProps) => datum.isActive === true)
          .map((datum: NoticeProps) => ({
            ...datum,
            id: datum.id,
          }));
      } catch (err: any) {
        throw err.response;
      }
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return (
    <>
      <Head>
        <title>{`NIAID Data Discovery Portal ${title && ` | ${title}`}`}</title>
        <meta
          name='description'
          content='Find and access allergic, infectious and immune-mediated disease data by searching across biomedical data repositories with the NIAID Data Discovery Portal'
        />
        <meta
          name='keywords'
          content='omics, data, infectious disease, epidemiology, clinical trial, immunology, bioinformatics, surveillance, search, repository'
        />
        {metaCanonical && <link rel='canonical' href={metaCanonical} />}
        {/* og meta */}
        <meta
          property='og:url'
          content={`${process.env.NEXT_PUBLIC_BASE_URL}`}
        />
        <meta property='og:title' content='NIAID Data Discovery Portal' />
        <meta
          property='og:description'
          content='Find and access allergic, infectious and immune-mediated disease data by searching across biomedical data repositories with the NIAID Data Discovery Portal'
        />
        <meta property='og:type' content='website' />
        <meta property='og:site_name' content='NIAID Data Discovery Portal' />
        <meta
          property='og:image'
          content={`${process.env.NEXT_PUBLIC_BASE_URL}/assets/preview.png`}
        />
        {/* twitter meta */}
        <meta property='twitter:title' content='NIAID Data Discovery Portal' />
        <meta property='twitter:description' content={metaDescription} />
        <meta property='twitter:card' content='summary' />
        <meta
          property='twitter:image'
          content={`${process.env.NEXT_PUBLIC_BASE_URL}/assets/preview.png`}
        />
      </Head>

      <Flex as='main' w='100%' flexDirection='column' minW='300px'>
        <Navigation />

        {/*Page content has margin-top to compensate for fixed nav bar. */}
        <Box id='pagebody' position='relative' {...props}>
          <Stack spacing='1px' bg='gray.100'>
            {/* <!-- Banner for dev and staging instance --> */}
            {!isProd && (
              <Banner
                id='banner-environment-notice'
                heading='This is the alpha version of the NIAID Data Ecosystem Discovery
            Portal.'
                description={`Currently using the: <a href="${
                  process.env.NEXT_PUBLIC_API_URL
                }/metadata" target="_blank">${
                  process.env.NEXT_PUBLIC_API_URL?.includes('api-staging')
                    ? 'Staging'
                    : process.env.NEXT_PUBLIC_API_URL?.includes('api.data')
                    ? 'Production'
                    : 'Development'
                } API </a>.`}
                state='INFO'
              />
            )}
            {/* <!-- Banner for service warnings and notices --> */}
            {notices &&
              notices.map(notice => (
                <Banner
                  key={notice.id}
                  id={`banner-${notice.id}-notice`}
                  heading={notice.heading}
                  description={notice.description}
                  state={notice.state}
                />
              ))}
          </Stack>

          {/* <!-- Breadcrumbs --> */}
          <Breadcrumbs />

          {/* <!-- Search bar for datasets across site --> */}
          {includeSearchBar && (
            <Flex
              justifyContent='center'
              px={{ base: 4, sm: 4, lg: 6, xl: '5vw' }}
              borderBottom='1px solid'
              borderColor='gray.100'
            >
              <Stack flexDirection='column' py={4} flex={1} maxW='2600px'>
                <NextLink
                  href={{ pathname: '/advanced-search' }}
                  passHref
                  prefetch={false}
                  style={{ alignSelf: 'flex-end' }}
                >
                  <Button
                    as='span'
                    variant='outline'
                    size='sm'
                    transition='0.2s ease-in-out'
                    colorScheme='primary'
                    fontWeight='semibold'
                    _hover={{
                      bg: 'primary.600',
                      color: 'white',
                      transition: '0.2s ease-in-out',

                      svg: {
                        transform: 'translateX(-8px)',
                        transition: '0.2s transform ease-in-out',
                      },
                    }}
                    leftIcon={
                      <Icon
                        as={FaMagnifyingGlass}
                        ml={2}
                        boxSize={3}
                        transform='translateX(-4px)'
                        transition='0.2s transform ease-in-out'
                      />
                    }
                  >
                    Advanced Search
                  </Button>
                </NextLink>
                <SearchBarWithDropdown
                  ariaLabel='Search for resources'
                  placeholder='Search for resources'
                  size='md'
                  showSearchHistory
                />
              </Stack>
            </Flex>
          )}

          {children}
          <Footer />
        </Box>
      </Flex>
    </>
  );
};
