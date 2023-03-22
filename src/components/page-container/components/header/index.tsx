import React from 'react';
import { PageContent } from 'src/components/page-container';
import {
  Box,
  Flex,
  Heading,
  Icon,
  Link,
  LinkProps as ChakraLinkProps,
  Text,
  theme,
  usePrefersReducedMotion,
} from 'nde-design-system';
import { fade, StyledSection } from './styles';
import { assetPrefix } from 'next.config';
import { FaChevronRight } from 'react-icons/fa';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  body?: string[];
  bg?: string;
  bgImg?: string;
  color?: string;
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
  // Don't animate based on users preference (uses window.matchMedia).
  // const prefersReducedMotion = usePrefersReducedMotion();
  // const animation = prefersReducedMotion
  //   ? undefined
  //   : `${fade} 1.2s ease-in-out both`;

  return (
    <>
      <PageContent
        bg={
          bg ||
          `linear-gradient(180deg, ${theme.colors.primary[500]}, ${theme.colors.tertiary[700]})`
        }
        bgImg={bgImg || `${assetPrefix || ''}/assets/home-bg.png`}
        backgroundSize='cover'
        flexWrap='wrap'
        minH='unset'
        justifyContent={{ xl: 'center' }}
      >
        {/* Header section */}
        <StyledSection
          id='header'
          flexDirection={'column'}
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

// Display for pre-written queries.
interface SearchQueryLinkProps extends Omit<ChakraLinkProps, 'href'> {
  title: string;
}

export const SearchQueryLink: React.FC<SearchQueryLinkProps> = ({
  title,
  _hover,
  _visited,
  ...props
}) => {
  if (!title) {
    return null;
  }
  return (
    <Link
      px={2}
      color='whiteAlpha.800'
      _hover={{
        color: 'white',
        textDecoration: 'underline',
        svg: { transform: 'translateX(0)', transition: '0.2s ease-in-out' },
        ..._hover,
      }}
      _visited={{ color: 'white', ..._visited }}
      {...props}
    >
      <Text>{title}</Text>
      <Icon
        as={FaChevronRight}
        ml={2}
        boxSize={3}
        transform='translateX(-5px)'
        transition='0.2s ease-in-out'
      ></Icon>
    </Link>
  );
};
