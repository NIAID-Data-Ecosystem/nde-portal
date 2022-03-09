import React from 'react';
import {Box, Image, Link, Text} from 'nde-design-system';
import {FormattedResource} from 'src/utils/api/types';
import {Skeleton} from '@chakra-ui/skeleton';
import {MetadataField} from '../section';
import {ResourceLinks} from 'src/components/resource/';

interface Provenance {
  isLoading: boolean;
  includedInDataCatalog?: FormattedResource['includedInDataCatalog'];
}

const Provenance: React.FC<Provenance> = ({
  includedInDataCatalog,
  isLoading,
}) => {
  return (
    <Skeleton isLoaded={!isLoading} p={4}>
      <Box>
        {includedInDataCatalog?.name && (
          <ResourceLinks
            isLoading={isLoading}
            showWorkspaceLink={false}
            includedInDataCatalog={{name: includedInDataCatalog.name}}
          />
        )}

        {includedInDataCatalog?.name && (
          <MetadataField isLoading={isLoading} label={`Organization's name`}>
            {includedInDataCatalog.url ? (
              <Link href={includedInDataCatalog.url} target='_blank' isExternal>
                {includedInDataCatalog.name}
              </Link>
            ) : (
              <Text>{includedInDataCatalog.name}</Text>
            )}
          </MetadataField>
        )}

        {includedInDataCatalog?.versionDate && (
          <MetadataField
            isLoading={isLoading}
            label='Version Date'
            value={new Date(includedInDataCatalog.versionDate).toLocaleString()}
          ></MetadataField>
        )}
      </Box>
    </Skeleton>
  );
};

export default Provenance;
