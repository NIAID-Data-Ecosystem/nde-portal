import React from 'react';
import {
  Box,
  Button,
  Divider,
  Flex,
  FlexProps,
  Image,
  Link,
  Skeleton,
  Tag,
  Text,
  usePrefersReducedMotion,
} from 'nde-design-system';
import { FormattedResource } from 'src/utils/api/types';
import { getRepositoryImage } from 'src/utils/helpers';
import { formatDate } from 'src/utils/api/helpers';
import { FaArrowRight } from 'react-icons/fa6';
import NextLink from 'next/link';

interface Provenance {
  isLoading: boolean;
  includedInDataCatalog?: FormattedResource['includedInDataCatalog'];
  url?: FormattedResource['url'];
  sdPublisher?: FormattedResource['sdPublisher'];
  curatedBy?: FormattedResource['curatedBy'];
}

const Provenance: React.FC<Provenance> = ({
  includedInDataCatalog,
  isLoading,
  url,
  sdPublisher,
  curatedBy,
}) => {
  const provenanceCatalogs =
    !isLoading && includedInDataCatalog
      ? Array.isArray(includedInDataCatalog)
        ? includedInDataCatalog
        : [includedInDataCatalog]
      : [];

  const prefersReducedMotion = usePrefersReducedMotion();

  interface BlockProps extends FlexProps {
    children: React.ReactNode;
    label?: string;
    url?: string | null;
  }

  const Block = ({ children, label, url, ...props }: BlockProps) => {
    return (
      <Flex
        border='1px solid'
        borderColor='gray.200'
        borderRadius='semi'
        flexDirection='column'
        minW='300px'
        maxW='500px'
        p={4}
        mx={3}
        {...props}
      >
        {label && (
          <>
            <Text fontSize='xs' fontWeight='semibold' lineHeight='tall'>
              {label}
            </Text>
            <Divider />
          </>
        )}
        <Box>{children}</Box>
        {url ? (
          <Flex
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
                variant='outline'
                size='sm'
                rightIcon={<FaArrowRight />}
                mt={2}
              >
                Access Data
              </Button>
            </NextLink>
          </Flex>
        ) : (
          <></>
        )}
      </Flex>
    );
  };
  const Field = ({
    label,
    children,
  }: {
    label: string;
    children?: React.ReactNode;
  }) => (
    <>
      <Text
        as='dt'
        fontSize='xs'
        color='gray.600'
        fontWeight='medium'
        lineHeight='tall'
        mt={2}
      >
        {label}
      </Text>

      <Text
        as='dd'
        fontSize='xs'
        lineHeight='short'
        whiteSpace='pre-wrap'
        wordBreak='break-word'
        fontWeight='normal'
        mt={0.5}
      >
        {children ? (
          children
        ) : (
          <Text as='span' fontStyle='italic' color='niaid.placeholder'>
            No data
          </Text>
        )}
      </Text>
    </>
  );

  return (
    <Skeleton isLoaded={!isLoading}>
      <Flex
        overflow='auto'
        py={1}
        sx={{
          '&::-webkit-scrollbar': {
            width: '7px',
            height: '7px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'blackAlpha.100',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'gray.300',
            borderRadius: '10px',
          },
          _hover: {
            '&::-webkit-scrollbar-thumb': {
              background: 'niaid.placeholder',
            },
          },
        }}
      >
        {provenanceCatalogs.map(includedInDataCatalog => {
          return (
            <Block
              key={includedInDataCatalog.name}
              label='Provided By'
              url={url}
              mx={3}
            >
              <Flex minW='100px' mt={4}>
                {includedInDataCatalog?.url ? (
                  <a href={includedInDataCatalog?.url} target='_blank'>
                    <Image
                      width='auto'
                      height='40px'
                      maxH='40px'
                      src={
                        getRepositoryImage(includedInDataCatalog.name) ||
                        undefined
                      }
                      alt={`Logo for ${includedInDataCatalog.name}`}
                    />
                  </a>
                ) : (
                  <Image
                    width='auto'
                    height='40px'
                    maxH='40px'
                    src={
                      getRepositoryImage(includedInDataCatalog.name) ||
                      undefined
                    }
                    alt={`Logo for ${includedInDataCatalog.name}`}
                  />
                )}
              </Flex>

              <Field label='Name'>{includedInDataCatalog.name}</Field>
              <Field label='Version Date'>
                {includedInDataCatalog.versionDate
                  ? formatDate(includedInDataCatalog.versionDate)
                  : undefined}
              </Field>
            </Block>
          );
        })}
        {(curatedBy || sdPublisher) && (
          <Block>
            {curatedBy && curatedBy.name && (
              <>
                <Text fontSize='xs' fontWeight='semibold' lineHeight='tall'>
                  Curated By
                </Text>
                <Divider />
                <Field label='Name'>
                  {curatedBy?.url ? (
                    <Link isExternal>{curatedBy?.name}</Link>
                  ) : (
                    curatedBy?.name
                  )}
                </Field>
                <Field label='Version Date'>
                  {curatedBy.versionDate
                    ? formatDate(curatedBy.versionDate)
                    : undefined}
                </Field>
              </>
            )}

            {/* Original Publisher */}
            {sdPublisher && (
              <Box>
                <Text fontSize='xs' fontWeight='semibold' lineHeight='tall'>
                  Original Source
                </Text>
                <Divider />
                {sdPublisher.map(publisher => {
                  return (
                    <Field
                      key={publisher.identifier || publisher.name}
                      label='Name/Identifier'
                    >
                      {(publisher.name || publisher.identifier) && (
                        <>
                          {publisher?.url ? (
                            <Link href={publisher?.url} isExternal>
                              {publisher?.name}
                            </Link>
                          ) : (
                            publisher?.name
                          )}
                          <br />
                          {publisher?.identifier && (
                            <Tag size='sm' variant='subtle' my={0 / 5}>
                              ID | {publisher.identifier}
                            </Tag>
                          )}
                        </>
                      )}
                    </Field>
                  );
                })}
              </Box>
            )}
          </Block>
        )}
      </Flex>
    </Skeleton>
  );
};

export default Provenance;
