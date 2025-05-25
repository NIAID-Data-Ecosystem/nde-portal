import React from 'react';
import { Card, CardHeader } from '@chakra-ui/react';
import NextLink from 'next/link';
import { FormattedResource } from 'src/utils/api/types';
import { TypeBanner } from 'src/components/resource-sections/components';
import { DisplayHTMLContent } from 'src/components/html-content';
import { isSourceFundedByNiaid } from 'src/utils/helpers/sources';
import { Skeleton } from 'src/components/skeleton';

interface CompactCardProps {
  data?: FormattedResource | null;
  referrerPath?: string;
}

export const CompactCard = ({ data, referrerPath }: CompactCardProps) => {
  const {
    ['@type']: type,
    id,
    alternateName,
    name,
    includedInDataCatalog,
  } = data || {};

  return (
    <Card
      variant='niaid'
      boxShadow='none'
      border='1px solid'
      borderColor='gray.100'
    >
      <TypeBanner
        type={type || 'Dataset'}
        p={0}
        pl={[2, 4, 6]}
        flexDirection={['column', 'row']}
        isNiaidFunded={isSourceFundedByNiaid(includedInDataCatalog)}
      />
      <CardHeader
        bg='transparent'
        position='relative'
        px={2}
        pt={1}
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
        w='100%'
      >
        <Skeleton isLoaded={true} minHeight='81px' flex={1}>
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
              fontSize='lg'
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
    </Card>
  );
};
