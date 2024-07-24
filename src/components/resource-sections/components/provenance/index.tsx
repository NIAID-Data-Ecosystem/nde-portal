import React from 'react';
import {
  Box,
  Button,
  Divider,
  Flex,
  FlexProps,
  Image,
  Skeleton,
  Tag,
  Text,
  usePrefersReducedMotion,
} from '@chakra-ui/react';
import { FormattedResource } from 'src/utils/api/types';
import { getRepositoryImage } from 'src/utils/helpers';
import { formatDate } from 'src/utils/api/helpers';
import { FaArrowRight } from 'react-icons/fa6';
import NextLink from 'next/link';
import { ScrollContainer } from 'src/components/scroll-container';
import { Link } from 'src/components/link';

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
                as='span'
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
        color='text.body'
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
          <Text as='span' fontStyle='italic' color='gray.800'>
            No data
          </Text>
        )}
      </Text>
    </>
  );

  return (
    <Skeleton isLoaded={!isLoading}>
      <ScrollContainer display='flex' py={2}>
        {provenanceCatalogs.map(includedInDataCatalog => {
          return (
            <Block
              key={includedInDataCatalog.name}
              label='Provided By'
              url={url}
              mr={3}
              ml={0}
            >
              <Flex minW='100px' mt={4}>
                {includedInDataCatalog?.url ? (
                  <a href={includedInDataCatalog?.url} target='_blank'>
                    <Image
                      width='auto'
                      height='40px'
                      maxH='40px'
                      fallbackSrc='/assets/resources/empty-source.png'
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
                    fallbackSrc='/assets/resources/empty-source.png'
                    src={
                      getRepositoryImage(includedInDataCatalog.name) ||
                      undefined
                    }
                    alt={`Logo for ${includedInDataCatalog.name}`}
                  />
                )}
              </Flex>
              <dl>
                <Field label='Name'>{includedInDataCatalog.name}</Field>
                <Field label='Version Date'>
                  {includedInDataCatalog.versionDate
                    ? formatDate(includedInDataCatalog.versionDate)
                    : undefined}
                </Field>
              </dl>
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
                <dl>
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
                </dl>
              </>
            )}

            {/* Original Publisher */}
            {sdPublisher && (
              <Box>
                <Text fontSize='xs' fontWeight='semibold' lineHeight='tall'>
                  Original Source
                </Text>
                <Divider />
                <dl>
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
                </dl>
              </Box>
            )}
          </Block>
        )}
      </ScrollContainer>
    </Skeleton>
  );
};

export default Provenance;
