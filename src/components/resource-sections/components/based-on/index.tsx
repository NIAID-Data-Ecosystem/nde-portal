import React from 'react';
import {
  Box,
  Flex,
  Link,
  ListIcon,
  ListItem,
  SimpleGrid,
  Text,
  UnorderedList,
} from 'nde-design-system';
import { FormattedResource } from 'src/utils/api/types';
import LoadingSpinner from 'src/components/loading';
import NextLink from 'next/link';
import { IconType } from 'react-icons';

interface BasedOn {
  isLoading: boolean;
  isBasedOn?: FormattedResource['isBasedOn'];
  icon?: IconType;
}

const BasedOn: React.FC<BasedOn> = ({ isLoading, isBasedOn, icon }) => {
  if (isLoading) {
    return <LoadingSpinner isLoading={isLoading} />;
  }

  if (!isBasedOn || isBasedOn.length === 0) {
    return (
      <Box overflow='auto'>
        <Text>No data available.</Text>
      </Box>
    );
  }
  return (
    <UnorderedList ml={0}>
      <SimpleGrid
        gridTemplateColumns={{
          base: 'repeat(1, minmax(0, 1fr))',
          sm: `repeat(${
            isBasedOn.length > 5 ? 'auto-fit' : 1
          }, minmax(min(100%, max(150px, 100%/2)),1fr))`,
        }}
      >
        {isBasedOn.map((basedOn, i) => {
          const {
            _id,
            abstract,
            citation,
            datePublished,
            description,
            doi,
            identifier,
            name,
            pmid,
            url,
          } = basedOn;

          return (
            <ListItem
              key={i}
              m={
                // responsive margin height based on number of properties present.
                Object.keys(basedOn).length > 4 ? 4 : 1
              }
              display='flex'
              alignItems='center'
            >
              {icon && <ListIcon as={icon} color='primary.400' />}

              {(identifier || name) && (
                <>
                  {_id ? (
                    <NextLink
                      href={{
                        pathname: '/resources/',
                        query: { _id },
                      }}
                      passHref
                    >
                      <Link>
                        <Text fontSize='sm' lineHeight='short'>
                          {name || identifier}
                        </Text>
                      </Link>
                    </NextLink>
                  ) : (
                    <Text fontSize='sm' lineHeight='short'>
                      {name || identifier}
                    </Text>
                  )}
                </>
              )}

              {basedOn['@type'] && (
                <Text fontSize='sm' lineHeight='short'>
                  <strong>Type:</strong> {basedOn['@type'] || '-'}
                </Text>
              )}

              {(pmid || doi) && (
                <Flex>
                  {pmid && (
                    <Text fontSize='sm' lineHeight='short' mr={2}>
                      <strong>PMID:</strong> {pmid || '-'}
                    </Text>
                  )}
                  {doi && (
                    <Text fontSize='sm' lineHeight='short'>
                      <strong>DOI:</strong> {doi || '-'}
                    </Text>
                  )}
                </Flex>
              )}

              {datePublished && (
                <Text fontSize='sm' lineHeight='short'>
                  <strong>Date Published:</strong> {datePublished || '-'}
                </Text>
              )}
              {abstract && (
                <Text fontSize='sm' lineHeight='short'>
                  <strong>Abstract:</strong> {abstract || '-'}
                </Text>
              )}
              {description && (
                <Text fontSize='sm' lineHeight='short'>
                  <strong>Description:</strong> {description || '-'}
                </Text>
              )}
              {citation && (
                <Text fontSize='sm' lineHeight='short'>
                  <strong>Citation:</strong> {citation || '-'}
                </Text>
              )}
              {url && (
                <Text fontSize='sm' lineHeight='short'>
                  <strong>URL:</strong>{' '}
                  <Link href={url} isExternal>
                    {url || '-'}
                  </Link>
                </Text>
              )}
            </ListItem>
          );
        })}
      </SimpleGrid>
    </UnorderedList>
  );
};

export default BasedOn;
