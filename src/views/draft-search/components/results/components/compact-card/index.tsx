import React from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Flex,
  Tooltip,
  Text,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { FormattedResource } from 'src/utils/api/types';
import { TypeBanner } from 'src/components/resource-sections/components';
import { DisplayHTMLContent } from 'src/components/html-content';
import { isSourceFundedByNiaid } from 'src/utils/helpers/sources';
import { Skeleton } from 'src/components/skeleton';
import { ConditionsOfAccess } from 'src/components/badges';
import { HasAPI } from 'src/components/badges/components/HasAPI';
import { MetadataLabel } from 'src/components/metadata';
import { ScrollContainer } from 'src/components/scroll-container';
import { SearchableItems } from 'src/components/searchable-items';

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
    date,
    conditionsOfAccess,
    hasAPI,
    about,
    description,
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
        pb={1}
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
        <Skeleton isLoaded={true} minHeight='27px' flex={1}>
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
      <CardBody p={0}>
        {date && (
          <Flex
            px={2}
            m={0}
            flex={1}
            bg='white'
            fontWeight='semibold'
            whiteSpace='nowrap'
            alignItems='center'
            justify='space-between'
            maxHeight='30px'
          >
            <Tooltip
              label='Corresponds to the most recent of date modified, date published and date created.'
              hasArrow
              bg='#fff'
              sx={{
                color: 'text.body',
              }}
            >
              <Text fontSize='xs'>{date}</Text>
            </Tooltip>
            {(conditionsOfAccess ||
              typeof hasAPI !== undefined ||
              typeof hasAPI != null) && (
              <Flex
                justifyContent={['flex-start']}
                alignItems='center'
                w={['100%', 'unset']}
                flex={[1]}
                p={[0.5, 0.5]}
              >
                <ConditionsOfAccess
                  type={data?.['@type']}
                  conditionsOfAccess={conditionsOfAccess}
                  mx={0.5}
                />
                <HasAPI type={data?.['@type']} hasAPI={data?.hasAPI} mx={0.5} />
              </Flex>
            )}
          </Flex>
        )}
        {about && (
          <Flex px={1} mt={1} mb={0} bg='white' direction='column'>
            <MetadataLabel label='Content Types' />
            <ScrollContainer overflow='auto' maxHeight='200px' fontSize='xs'>
              <SearchableItems
                fieldName='about'
                generateButtonLabel={(limit, length, itemLabel = 'types') =>
                  limit === length
                    ? `Show fewer ${itemLabel}`
                    : `Show all ${itemLabel} (${length - limit} more)`
                }
                itemLimit={3}
                items={about.map(item => item.displayName)}
              />
            </ScrollContainer>
          </Flex>
        )}
        {description && (
          <Text px={2} mt={2} fontSize='xs' lineHeight='short'>
            <p>
              {description.trim().split(/\s+/).slice(0, 20).join(' ') +
                (description.trim().split(/\s+/).length > 20 ? '...' : '')}
            </p>
          </Text>
        )}
      </CardBody>
    </Card>
  );
};
