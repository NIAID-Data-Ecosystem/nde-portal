import { Box, Button, Flex, FlexProps, Icon } from '@chakra-ui/react';
import Head from 'next/head';
import { Footer } from 'src/components/footer';
import { Navigation } from 'src/components/navigation-bar';
import { SearchBarWithDropdown } from 'src/components/search-bar';
import NextLink from 'next/link';
import { FaMagnifyingGlass } from 'react-icons/fa6';
// import Notice from 'src/components/notice';

interface PageContainerProps extends FlexProps {
  title: string;
  metaDescription: string;
  keywords?: string;
  disableSearchBar?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  title,
  metaDescription,
  disableSearchBar,
}) => {
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
        {/* <meta property='twitter:site' content='@NIAID' />
        <meta property='twitter:creator' content='@NIAID' /> */}
        <meta property='twitter:card' content='summary' />
        <meta
          property='twitter:image'
          content={`${process.env.NEXT_PUBLIC_BASE_URL}/assets/preview.png`}
        />
      </Head>

      <Flex as='main' w='100%' flexDirection='column' minW={300}>
        <Navigation />

        {/*Page content has margin-top to compensate for fixed nav bar. */}
        <Box id='pagebody' position='relative'>
          {/* <Notice /> */}

          {!disableSearchBar && (
            <Flex
              bg='#fff'
              borderBottom='1px solid'
              borderColor='gray.100'
              flexDirection='column'
              px={{ base: 4, sm: 6, lg: 10, xl: '5vw' }}
              py={4}
            >
              <Flex w='100%' justifyContent='flex-end' mb={2}>
                <NextLink
                  href={{ pathname: 'advanced-search' }}
                  passHref
                  prefetch={false}
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
              </Flex>
              <SearchBarWithDropdown
                ariaLabel='Search for datasets'
                placeholder='Search for datasets'
                size='md'
              />
            </Flex>
          )}

          {children}
          <Footer />
        </Box>
      </Flex>
    </>
  );
};
