import React from 'react';
import {
  Button,
  Flex,
  usePrefersReducedMotion,
  Stack,
  ButtonProps,
} from '@chakra-ui/react';
import { FormattedResource } from 'src/utils/api/types';
import NextLink from 'next/link';
import { FaArrowRight } from 'react-icons/fa6';
import {
  SourceLogo,
  getSourceDetails,
} from 'src/views/search-results-page/components/card/source-logo';

interface DataAccessProps {
  isLoading: boolean;
  includedInDataCatalog?: FormattedResource['includedInDataCatalog'];
  url?: FormattedResource['url'];
  recordType?: string | null;
  children?: React.ReactNode;
  colorScheme?: ButtonProps['colorScheme'];
}

export const DataAccess: React.FC<DataAccessProps> = ({
  isLoading,
  includedInDataCatalog,
  url,
  recordType,
  colorScheme = 'primary',
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (!isLoading && !includedInDataCatalog) {
    return <></>;
  }

  const sources =
    !isLoading && includedInDataCatalog && recordType !== 'ResourceCatalog'
      ? getSourceDetails(includedInDataCatalog)
      : [];

  return (
    <Stack mt={4} flexDirection='column' alignItems='flex-start' spacing={4}>
      {sources.map(source => {
        return (
          <React.Fragment key={source.name}>
            <SourceLogo
              sources={[source]}
              url={source.url}
              imageProps={{
                width: 'auto',
                height: 'unset',
                maxHeight: '80px',
                mb: 1,
              }}
            />
            {source.dataset ? (
              <Flex
                w='100%'
                mt={2}
                justifyContent='flex-end'
                sx={{
                  svg: {
                    transform: 'translateX(-2px)',
                    transition: 'transform 0.2s ease-in-out',
                  },
                }}
                _hover={{
                  svg: prefersReducedMotion
                    ? {}
                    : {
                        transform: 'translateX(4px)',
                        transition: 'transform 0.2s ease-in-out',
                      },
                }}
              >
                <NextLink href={source.dataset} target='_blank'>
                  <Button
                    colorScheme={colorScheme}
                    size='sm'
                    rightIcon={<FaArrowRight />}
                  >
                    Access Resource
                  </Button>
                </NextLink>
              </Flex>
            ) : (
              <></>
            )}
          </React.Fragment>
        );
      })}
    </Stack>
  );
};
