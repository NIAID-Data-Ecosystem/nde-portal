import React from 'react';
import type { NextPage } from 'next';
import { Heading, theme } from 'nde-design-system';
import { PageContainer, PageContent } from 'src/components/page-container';

const Home: NextPage = () => {
  return (
    <PageContainer
      hasNavigation
      title='Home'
      metaDescription='NIAID Data Ecosystem Discovery Portal - Home.'
      disableSearchBar
    >
      <PageContent
        minH='80vh'
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
