import React from 'react';
import { PageContent } from 'src/components/page-container';
import {
  Box,
  Flex,
  FlexProps,
  Heading,
  HeadingProps,
  Text,
  TextProps,
} from 'nde-design-system';
import { theme } from 'src/theme';
import { StyledSection } from './styles';

interface PageHeaderProps extends FlexProps {
  bg?: string;
  bgImg?: string;
  body?: string[];
  bodyProps?: TextProps;
  children?: React.ReactNode;
  color?: string;
  subtitle?: string;
  subtitleProps?: TextProps;
  title?: string;
  titleProps?: HeadingProps;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  bg,
  bgImg,
  body,
  bodyProps,
  children,
  color,
  subtitle,
  subtitleProps,
  title,
  titleProps,
  ...props
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
        px={0}
        py={0}
        {...props}
      >
        {/* Header section */}
        <StyledSection
          id='header'
          flexDirection='column'
          alignItems={{ base: 'flex-start', xl: 'center' }}
          textAlign={{ xl: 'center' }}
          px={{ base: 6, sm: 10, lg: 16, xl: '5vw' }}
          py={{ base: 6, sm: 10, xl: 16 }}
        >
          <Box w='100%' maxW='680px'>
            {title && (
              <Heading
                as='h1'
                size='h1'
                color={color || '#fff'}
                fontWeight='bold'
                letterSpacing={1}
                lineHeight='shorter'
                {...titleProps}
              >
                {title}
              </Heading>
            )}
            {subtitle && (
              <Text
                color={color || '#fff'}
                fontSize='xl'
                fontWeight='semibold'
                mt={4}
                {...subtitleProps}
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
                    color={color || 'whiteAlpha.800'}
                    fontWeight='medium'
                    fontSize='lg'
                    lineHeight='tall'
                    maxWidth={{ base: '400px', xl: 'unset' }}
                    mt={2}
                    {...bodyProps}
                  >
                    {text}
                  </Text>
                );
              })}
          </Box>
          {children && (
            <Flex w='100%' justifyContent='center'>
              <Flex
                flexDirection='column'
                maxW={{ base: '600px', xl: '1000px' }}
                w='100%'
              >
                {children}
              </Flex>
            </Flex>
          )}
        </StyledSection>
      </PageContent>
    </>
  );
};
