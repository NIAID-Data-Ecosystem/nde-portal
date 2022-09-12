import React, { useCallback } from 'react';
import { Box, Link, ListItem, Text, UnorderedList } from 'nde-design-system';
import { FormattedResource } from 'src/utils/api/types';
import Table, { Row } from 'src/components/table';
import LoadingSpinner from 'src/components/loading';
import { FormatLinkCell, getTableColumns } from 'src/components/table/helpers';

interface BasedOn {
  isLoading: boolean;
  isBasedOn?: FormattedResource['isBasedOn'];
}

const BasedOn: React.FC<BasedOn> = ({ isLoading, isBasedOn }) => {
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
    <UnorderedList ml={2}>
      {isBasedOn.map((basedOn, i) => {
        const {
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
          <ListItem key={i} my={2}>
            {(identifier || name) && (
              <Text fontSize='xs' lineHeight='short'>
                <strong>{name || identifier}</strong>
              </Text>
            )}

            {basedOn['@type'] && (
              <Text fontSize='xs' lineHeight='short'>
                <strong>Type:</strong> {basedOn['@type'] || '-'}
              </Text>
            )}

            {(pmid || doi) && (
              <Text fontSize='xs' lineHeight='short'>
                <strong>PMID/DOI:</strong> {pmid || '-'}/{doi || '-'}
              </Text>
            )}
            {datePublished && (
              <Text fontSize='xs' lineHeight='short'>
                <strong>Date Published:</strong> {datePublished || '-'}
              </Text>
            )}
            {abstract && (
              <Text fontSize='xs' lineHeight='short'>
                <strong>Abstract:</strong> {abstract || '-'}
              </Text>
            )}
            {description && (
              <Text fontSize='xs' lineHeight='short'>
                <strong>Description:</strong> {description || '-'}
              </Text>
            )}
            {citation && (
              <Text fontSize='xs' lineHeight='short'>
                <strong>Citation:</strong> {citation || '-'}
              </Text>
            )}
            {url && (
              <Text fontSize='xs' lineHeight='short'>
                <strong>URL:</strong>{' '}
                <Link href={url} isExternal>
                  {url || '-'}
                </Link>
              </Text>
            )}
          </ListItem>
        );
      })}
    </UnorderedList>
  );
};

export default BasedOn;
