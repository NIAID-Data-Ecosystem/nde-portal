import React from 'react';
import { PageContent } from 'src/components/page-container';
import { Box, Flex, Heading, Text, theme } from 'nde-design-system';
import { StyledSection } from './styles';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  body?: string[];
  bg?: string;
  bgImg?: string;
  color?: string;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  bg,
  bgImg,
  body,
  children,
  color,
}) => {
  return (
    <>
      <PageContent
        bg={
          bg ||
          `linear-gradient(180deg, ${theme.colors.primary[500]}, ${theme.colors.tertiary[700]})`
        }
        bgImg={bgImg || '/assets/home-bg.webp'}
        backgroundSize='cover'
        flexWrap='wrap'
        minH='unset'
        justifyContent={{ xl: 'center' }}
      >
        {/* Header section */}
        <StyledSection
          id='header'
          flexDirection='column'
          alignItems={{ base: 'flex-start', xl: 'center' }}
          textAlign={{ xl: 'center' }}
        >
          {/* <Box maxW='600px'> */}
          <Box maxW='680px'>
            <Heading
              as='h1'
              size='h1'
              color={color || '#fff'}
              fontWeight='bold'
              letterSpacing={1}
              lineHeight='shorter'
              // animation={animation}
            >
              {title}
            </Heading>
            {subtitle && (
              <Text
                color={color || '#fff'}
                fontSize='xl'
                fontWeight='semibold'
                mt={4}
                // animation={animation}
                sx={{ animationDelay: '1s' }}
              >
                {subtitle}
              </Text>
            )}
            {body &&
              body.length > 0 &&
              body.map((text, i) => {
                return (
                  <Text
                    key={i}
                    color={color || '#fff'}
                    fontWeight='light'
                    fontSize='lg'
                    lineHeight='short'
                    mt={2}
                    maxWidth={{ base: '400px', xl: 'unset' }}
                    // animation={animation}
                    sx={{ animationDelay: `${1.5 + i * 0.5}s` }}
                  >
                    {text}
                  </Text>
                );
              })}
          </Box>
          <Flex w='100%' mt={[15, 20, 24]} justifyContent='center'>
            <Flex
              flexDirection='column'
              maxW={{ base: '600px', xl: '1000px' }}
              w='100%'
            >
              {children}
            </Flex>
          </Flex>
        </StyledSection>
      </PageContent>
    </>
  );
};
