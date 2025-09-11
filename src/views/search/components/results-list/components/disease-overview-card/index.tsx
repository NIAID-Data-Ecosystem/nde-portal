import React from 'react';
import { Card, CardHeader, CardBody, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { FormattedResource } from 'src/utils/api/types';
import { TypeBanner } from 'src/components/resource-sections/components';
import { DisplayHTMLContent } from 'src/components/html-content';
import { isSourceFundedByNiaid } from 'src/utils/helpers/sources';
import { Skeleton } from 'src/components/skeleton';

interface DiseaseOverviewCardProps {
  data?: FormattedResource | null;
  referrerPath?: string;
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
  referrerPath,
  isLoading = false,
}: DiseaseOverviewCardProps) => {
  const {
    ['@type']: type,
    id,
    alternateName,
    name,
    includedInDataCatalog,
    description,
  } = data || {};

  const lastParagraph = `Learn about ${name} resources in the NIAID Data Ecosystem.`;

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
          type={type || 'ResourceCatalog'}
          p={0}
          pl={[2, 4, 6]}
          flexDirection={['column', 'row']}
          isNiaidFunded={isSourceFundedByNiaid(includedInDataCatalog)}
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
              pathname: '/resources/',
              query: { id, referrerPath },
            }}
            as={`/resources?id=${id}`}
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
              content={name || alternateName || ''}
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
        p={0}
        sx={{
          '>*': {
            my: 0,
          },
        }}
      >
        {/* Description */}
        <Skeleton isLoaded={!isLoading} flex='1' px={2} mt={2} mb={1}>
          {description && (
            <>
              <Text fontSize='xs' lineHeight='short' noOfLines={4}>
                {description.trim()}
              </Text>
              <Text fontSize='xs' lineHeight='short' mt={2}>
                {lastParagraph}
              </Text>
            </>
          )}
        </Skeleton>
      </CardBody>
    </Card>
  );
};
