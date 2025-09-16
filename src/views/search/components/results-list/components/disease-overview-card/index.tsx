import React from 'react';
import { Card, CardHeader, CardBody, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { DiseasePageProps } from 'src/views/diseases/types';
import { TypeBanner } from 'src/components/resource-sections/components';
import { DisplayHTMLContent } from 'src/components/html-content';
import { Skeleton } from 'src/components/skeleton';
import { Link } from 'src/components/link';

interface DiseaseOverviewCardProps {
  data?: DiseasePageProps | null;
  isLoading?: boolean;
}

const CARD_HEIGHTS = {
  base: '310px',
  sm: '280px',
  md: '305px',
  lg: '305px',
  xl: '310px',
};

export const DiseaseOverviewCard = ({
  data,
  isLoading = false,
}: DiseaseOverviewCardProps) => {
  const { title, description, slug } = data || {};

  let diseaseDescription = description || '';
  let descriptionLinkText = '';
  let descriptionUrl = '';

  if (description) {
    // Capture "[text](url)" Markdown-style link
    const match = description.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (match) {
      diseaseDescription = description.replace(match[0], '').trim();
      descriptionLinkText = match[1];
      descriptionUrl = match[2];
    }
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
          {diseaseDescription && (
            <Text fontSize='xs' lineHeight='short' noOfLines={6}>
              {diseaseDescription}
            </Text>
          )}

          {descriptionLinkText && descriptionUrl && (
            <Text fontSize='xs' lineHeight='short' marginTop={1}>
              <Link href={descriptionUrl} isExternal>
                {descriptionLinkText}
              </Link>
            </Text>
          )}
        </Skeleton>
      </CardBody>
    </Card>
  );
};
