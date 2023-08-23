import React from 'react';
import { PageContent } from 'src/components/page-container';
import {
  Box,
  Flex,
  Heading,
  HeadingProps,
  Text,
  TextProps,
  theme,
} from 'nde-design-system';
import { StyledSection } from './styles';

interface PageHeaderProps {
  bg?: string;
  bgImg?: string;
  body?: string[];
  bodyProps?: TextProps;
  children?: React.ReactNode;
  color?: string;
  subtitle?: string;
  subtitleProps?: TextProps;
  title: string;
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
          alignItems={{ base: 'flex-start', md: 'center' }}
          textAlign={{ xl: 'center' }}
        >
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
          {children && (
            <Flex w='100%' mt={[15, 20, 24]} justifyContent='center'>
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
