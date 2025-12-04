import React from 'react';
import { Flex, Stack, ButtonProps } from '@chakra-ui/react';
import { FormattedResource } from 'src/utils/api/types';
import {
  getSourceDetails,
  SourceLogo,
} from 'src/views/search/components/results-list/components/card/source-logo';
import { ArrowButton } from 'src/components/button/arrow-button';

interface DataAccessProps {
  isLoading: boolean;
  includedInDataCatalog?: FormattedResource['includedInDataCatalog'];
  url?: FormattedResource['url'];
  recordType?: string | null;
  children?: React.ReactNode;
  colorPalette?: ButtonProps['colorPalette'];
}

const AccessResourceButton: React.FC<{
  url: string;
  colorPalette: ButtonProps['colorPalette'];
}> = ({ url, colorPalette }) => (
  <ArrowButton colorPalette={colorPalette} href={url} isExternal hasArrow>
    Access Resource
  </ArrowButton>
);

export const DataAccess: React.FC<DataAccessProps> = ({
  isLoading,
  includedInDataCatalog,
  url,
  recordType,
  colorPalette = 'secondary',
}) => {
  const sources =
    !isLoading && includedInDataCatalog
      ? getSourceDetails(
          recordType === 'ResourceCatalog'
            ? (Array.isArray(includedInDataCatalog)
                ? includedInDataCatalog.find(
                    source => source.name === 'Data Discovery Engine',
                  )
                : includedInDataCatalog.name === 'Data Discovery Engine'
                ? includedInDataCatalog
                : null) ?? []
            : includedInDataCatalog,
        )
      : [];

  return (
    <Stack mt={4} flexDirection='column' alignItems='flex-start' gap={4}>
      {sources.map(source => (
        <React.Fragment key={source.name}>
          <SourceLogo
            imageProps={{
              width: 'auto',
              height: 'unset',
              maxHeight: '80px',
              mb: 1,
            }}
            source={source}
            url={
              Array.isArray(source?.archivedAt)
                ? source?.archivedAt[0]
                : source?.archivedAt
            }
          />
          {source?.archivedAt && (
            <Flex w='100%' mt={2} justifyContent='flex-end'>
              <AccessResourceButton
                url={
                  recordType === 'ResourceCatalog'
                    ? url ?? ''
                    : Array.isArray(source?.archivedAt)
                    ? source?.archivedAt[0]
                    : source?.archivedAt
                }
                colorPalette={colorPalette}
              />
            </Flex>
          )}
        </React.Fragment>
      ))}
    </Stack>
  );
};
