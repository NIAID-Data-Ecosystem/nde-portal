import React, { useMemo } from 'react';
import { Card, CardHeader, CardBody, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { DiseasePageProps } from 'src/views/diseases/types';
import { TypeBanner } from 'src/components/resource-sections/components';
import { DisplayHTMLContent } from 'src/components/html-content';
import { Skeleton } from 'src/components/skeleton';

interface DiseaseOverviewCardProps {
  data?: DiseasePageProps | null;
  isLoading?: boolean;
}

interface ProcessedDescription {
  cleanedDescription: string;
  invitation: string;
  hasContent: boolean;
}

const CARD_HEIGHTS = {
  base: '310px',
  sm: '280px',
  md: '305px',
  lg: '305px',
  xl: '310px',
} as const;

const MARKDOWN_LINK_REGEX = /\[([^\]]*)\]\(([^)]*)\)/g;

const processDescription = (
  description: string | undefined,
  title: string | undefined,
): ProcessedDescription => {
  if (!description?.trim()) {
    return {
      cleanedDescription: '',
      invitation: title
        ? `Learn about ${title} resources in the NIAID Data Ecosystem.`
        : '',
      hasContent: false,
    };
  }

  // Remove all markdown links and clean up whitespace
  const cleanedDescription = description
    .replace(MARKDOWN_LINK_REGEX, '')
    .replace(/\s+/g, ' ')
    .trim();

  const invitation = title
    ? `Learn about ${title} resources in the NIAID Data Ecosystem.`
    : '';

  return {
    cleanedDescription,
    invitation,
    hasContent: Boolean(cleanedDescription || invitation),
  };
};

export const DiseaseOverviewCard = ({
  data,
  isLoading = false,
}: DiseaseOverviewCardProps) => {
  const { title, description, slug } = data || {};

  const processedContent = useMemo(
    () => processDescription(description, title),
    [description, title],
  );

  if (!isLoading && !slug) {
    console.warn(
      'DiseaseOverviewCard: Missing slug for disease overview card',
      {
        title: title || 'No title',
        description: description
          ? `${description.substring(0, 50)}...`
          : 'No description',
      },
    );
    return null;
  }

  return (
    <Card
      variant='niaid'
      boxShadow='none'
      border='1px solid'
      borderColor='gray.200'
      height={CARD_HEIGHTS}
    >
      {/* TypeBanner */}
      <Skeleton
        isLoaded={!isLoading}
        height={isLoading ? '40px' : 'auto'}
        borderTopRadius='md'
      >
        <TypeBanner
          type='DiseaseOverview'
          p={0}
          pl={[2, 4, 6]}
          flexDirection={['column', 'row']}
        />
      </Skeleton>

      <CardHeader
        bg='transparent'
        position='relative'
        px={2}
        pt={1}
        pb={1}
        w='100%'
        color='link.color'
        _hover={{
          p: { textDecoration: 'none' },
          svg: {
            transform: 'translate(0px)',
            opacity: 0.9,
            transition: '0.2s ease-in-out',
          },
        }}
        _visited={{
          color: 'link.color',
          svg: { color: 'link.color' },
        }}
      >
        {/* Title */}
        <Skeleton isLoaded={!isLoading} minHeight='27px' flex={1}>
          {!isLoading && slug ? (
            <NextLink
              href={{
                pathname: '/diseases/[slug]',
                query: { slug },
              }}
              as={`/diseases/${slug}`}
              passHref
              prefetch={false}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <DisplayHTMLContent
                noOfLines={3}
                content={title || ''}
                fontWeight='semibold'
                color='inherit'
                fontSize='md'
                lineHeight='short'
                w='100%'
                textDecoration='underline'
                _hover={{
                  textDecoration: 'none',
                }}
                reactMarkdownProps={{
                  linkTarget: '_blank',
                  disallowedElements: ['a'],
                }}
              />
            </NextLink>
          ) : null}
        </Skeleton>
      </CardHeader>

      <CardBody
        p={2}
        sx={{
          '>*': {
            my: 0,
          },
        }}
        flex='1'
        display='flex'
        flexDirection='column'
      >
        {/* Description */}
        <Skeleton isLoaded={!isLoading} flex='1'>
          {processedContent.hasContent && (
            <>
              {processedContent.cleanedDescription && (
                <Text fontSize='xs' lineHeight='short' noOfLines={6}>
                  {processedContent.cleanedDescription}
                </Text>
              )}
              {processedContent.invitation && (
                <Text
                  fontSize='xs'
                  lineHeight='short'
                  marginTop={processedContent.cleanedDescription ? 7 : 0}
                >
                  {processedContent.invitation}
                </Text>
              )}
            </>
          )}
        </Skeleton>
      </CardBody>
    </Card>
  );
};
