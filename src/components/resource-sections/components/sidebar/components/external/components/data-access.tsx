import React from 'react';
import {
  Button,
  Flex,
  Image,
  ImageProps,
  usePrefersReducedMotion,
  Text,
  ButtonProps,
} from '@chakra-ui/react';
import { FormattedResource } from 'src/utils/api/types';
import { getRepositoryImage } from 'src/utils/helpers';
import NextLink from 'next/link';
import { FaArrowRight } from 'react-icons/fa6';

interface DataAccessProps {
  isLoading: boolean;
  includedInDataCatalog?: FormattedResource['includedInDataCatalog'];
  url?: FormattedResource['url'];
  children?: React.ReactNode;
  colorScheme?: ButtonProps['colorScheme'];
}

export const DataAccess: React.FC<DataAccessProps> = ({
  isLoading,
  includedInDataCatalog,
  url,
  colorScheme = 'primary',
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (!isLoading && !includedInDataCatalog) {
    return <></>;
  }

  const sources =
    !isLoading && includedInDataCatalog
      ? Array.isArray(includedInDataCatalog)
        ? includedInDataCatalog
        : [includedInDataCatalog]
      : [];

  const SourceLogo = ({ src, alt, ...props }: ImageProps) => {
    if (!src) return <></>;
    return (
      <Image width='auto' maxH='80px' src={`${src}`} alt={alt} {...props} />
    );
  };

  return (
    <Flex mt={[4, 4]} flexDirection='column' alignItems='flex-start'>
      {sources.map(source => {
        return (
          <React.Fragment key={source.name}>
            {/* Source Logo */}
            <Flex flexDirection='column'>
              {/* Link to repository if url exists */}
              {source?.url ? (
                <NextLink href={source.url} target='_blank'>
                  <SourceLogo
                    src={getRepositoryImage(source.name) || undefined}
                    alt={`Logo for ${source.name}`}
                  />
                </NextLink>
              ) : (
                <SourceLogo
                  src={getRepositoryImage(source.name) || undefined}
                  alt={`Logo for ${source.name}`}
                />
              )}
              <Text fontStyle='italic' mt={1} color='primary.800'>
                Provided by {source.name}
              </Text>
            </Flex>

            {url ? (
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
                <NextLink href={url} target='_blank'>
                  <Button
                    colorScheme={colorScheme}
                    size='sm'
                    rightIcon={<FaArrowRight />}
                  >
                    Access Data
                  </Button>
                </NextLink>
              </Flex>
            ) : (
              <></>
            )}
          </React.Fragment>
        );
      })}
    </Flex>
  );
};
