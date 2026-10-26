import {
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  List,
  Separator,
  Skeleton,
  Tag,
  Text,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import React from 'react';
import { FaArrowRight, FaMagnifyingGlass } from 'react-icons/fa6';
import { InfoLabel } from 'src/components/info-label';
import { Link } from 'src/components/link';
import { getMetadataDescription } from 'src/components/metadata';
import { SourceLogo } from 'src/components/source-logo';
import { getSourceLogoLinkOut } from 'src/components/source-logo/helpers';
import Tooltip from 'src/components/tooltip';
import { formatDate } from 'src/utils/api/helpers';
import { FormattedResource } from 'src/utils/api/types';
import { SHOW_PROGRAM_RESOURCE_UI } from 'src/utils/feature-flags';
import { queryFilterObject2String } from 'src/views/search/components/filters';

interface Provenance {
  loading: boolean;
  includedInDataCatalog?: FormattedResource['includedInDataCatalog'];
  sdPublisher?: FormattedResource['sdPublisher'];
  sourceOrganization?: FormattedResource['sourceOrganization'];
  type?: FormattedResource['@type'];
}

// Builds the anchor slug used to link a sourceOrganization's name to its
// matching section on the Program Collections page (e.g. "NIAID ACTG Network"
// -> "niaid-actg-network").
const generateProgramCollectionSlug = (name: string) =>
  name.trim().toLowerCase().replace(/\s+/g, '-');

interface ProvenanceSectionProps {
  children: React.ReactNode;
  label: string;
  tooltip?: string;
}

// Heading + card grid shared by "Source information" and "Collection
// information", so cards in both sections line up on the same columns.
const ProvenanceSection = ({
  children,
  label,
  tooltip,
}: ProvenanceSectionProps) => (
  <Box mt={4}>
    <InfoLabel
      label={label}
      fontWeight='semibold'
      lineHeight='tall'
      tooltipProps={{ content: tooltip }}
    />
    <Grid
      templateColumns='repeat(auto-fill, minmax(min(100%, 400px), 1fr))'
      gap={4}
      py={2}
    >
      {children}
    </Grid>
  </Box>
);

interface ProvenanceCardProps {
  children: React.ReactNode;
  label: string;
  // Renders the label as a link (e.g. the sourceOrganization name). A linked
  // label has no tooltip, since the label text itself is the hover target.
  href?: string;
  tooltip?: string;
  // Actions pinned to the bottom of the card.
  footer?: React.ReactNode;
}

const ProvenanceCard = ({
  children,
  footer,
  href,
  label,
  tooltip,
}: ProvenanceCardProps) => (
  <Flex
    border='1px solid'
    borderColor='gray.200'
    borderRadius='semi'
    flexDirection='column'
    p={4}
  >
    {href ? (
      <Text fontSize='sm' color='text.body'>
        <Link as={NextLink} href={href}>
          {label}
        </Link>
      </Text>
    ) : (
      <>
        <InfoLabel label={label} tooltipProps={{ content: tooltip }} />
        <Separator />
      </>
    )}
    <Box flex={1}>{children}</Box>
    {footer && (
      <Flex justifyContent='space-between' flexWrap='wrap' gap={2} mt={4}>
        {footer}
      </Flex>
    )}
  </Flex>
);

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
      fontSize='sm'
      color='text.body'
      fontWeight='medium'
      lineHeight='tall'
      mt={2}
    >
      {label}
    </Text>

    <Text
      as='dd'
      fontSize='sm'
      lineHeight='moderate'
      whiteSpace='pre-wrap'
      wordBreak='break-word'
      fontWeight='normal'
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

const Provenance: React.FC<Provenance> = ({
  includedInDataCatalog,
  loading,
  sourceOrganization,
  sdPublisher,
  type,
}) => {
  const sources =
    !loading && includedInDataCatalog
      ? Array.isArray(includedInDataCatalog)
        ? includedInDataCatalog
        : [includedInDataCatalog]
      : [];

  const publishers = sdPublisher
    ? Array.isArray(sdPublisher)
      ? sdPublisher
      : [sdPublisher]
    : [];

  return (
    <Skeleton loading={!!loading}>
      <ProvenanceSection label='Source information'>
        {sources.map(source => (
          <ProvenanceCard
            key={source.name}
            label='Provided By'
            tooltip={getMetadataDescription('includedInDataCatalog', type)}
          >
            <Flex minW='100px' mt={2} bg='#fff'>
              <SourceLogo.Component
                imageProps={{
                  width: 'auto',
                  height: 'unset',
                  maxWidth: '100%',
                  maxHeight: '80px',
                  mb: 1,
                }}
                source={source}
                url={getSourceLogoLinkOut(source)}
              />
            </Flex>
            <dl>
              <Field label='Name'>{source.name}</Field>
              <Field label='Version Date'>
                {source.versionDate
                  ? formatDate(source.versionDate)
                  : undefined}
              </Field>
            </dl>
          </ProvenanceCard>
        ))}

        {publishers.length > 0 && (
          <ProvenanceCard
            label='Original Source'
            tooltip={getMetadataDescription('sdPublisher', type)}
          >
            <dl>
              <Field label='Name'>
                {/* Only bullet (and indent for) multiple publishers, so a
                    single one sits flush like the other cards' values. */}
                <List.Root
                  as='ul'
                  {...(publishers.length > 1
                    ? { variant: 'marker' }
                    : { variant: 'plain', ps: 0 })}
                >
                  {publishers.map(publisher => (
                    <List.Item key={publisher.identifier || publisher.name}>
                      <HStack alignItems='center' flexWrap='wrap' gap={2}>
                        {publisher.url ? (
                          <Link href={publisher.url} isExternal>
                            {publisher.name}
                          </Link>
                        ) : (
                          publisher.name
                        )}
                        {publisher.identifier && (
                          <Tag.Root
                            variant='subtle'
                            size='xs'
                            colorPalette='primary'
                          >
                            <Tag.Label>ID | {publisher.identifier}</Tag.Label>
                          </Tag.Root>
                        )}
                      </HStack>
                    </List.Item>
                  ))}
                </List.Root>
              </Field>
            </dl>
          </ProvenanceCard>
        )}
      </ProvenanceSection>

      {sourceOrganization && (
        <ProvenanceSection
          label='Collection information'
          tooltip={getMetadataDescription('sourceOrganization', type)}
        >
          {sourceOrganization.map(organization => {
            // Anchor slug linking this organization's name to its
            // matching section on the Program Collections page.
            const programCollectionSlug = generateProgramCollectionSlug(
              organization.name,
            );

            const filters = {
              'sourceOrganization.name.raw': [organization.name],
            };

            return (
              <ProvenanceCard
                key={organization.name}
                label={organization.name}
                href={
                  SHOW_PROGRAM_RESOURCE_UI
                    ? `/program-collections#${programCollectionSlug}`
                    : undefined
                }
                footer={
                  <>
                    <Tooltip content='Search for results from this program collection.'>
                      <Button
                        variant='solid'
                        size='sm'
                        w={{ base: '100%', sm: 'auto' }}
                        asChild
                      >
                        <NextLink
                          href={{
                            pathname: '/search',
                            query: {
                              q: '',
                              filters: queryFilterObject2String(filters),
                            },
                          }}
                        >
                          <FaMagnifyingGlass />
                          <Text truncate color='inherit'>
                            View collection
                          </Text>
                        </NextLink>
                      </Button>
                    </Tooltip>
                    {organization.url && (
                      <Button variant='outline' size='sm' asChild>
                        <NextLink href={organization.url} target='_blank'>
                          View program site
                          <FaArrowRight />
                        </NextLink>
                      </Button>
                    )}
                  </>
                }
              >
                <dl>
                  <Field label='Parent Organization'>
                    {organization.parentOrganization}
                  </Field>
                  {organization.description && (
                    <Field label='About'>
                      <Text lineClamp={10}>{organization.description}</Text>
                    </Field>
                  )}
                </dl>
              </ProvenanceCard>
            );
          })}
        </ProvenanceSection>
      )}
    </Skeleton>
  );
};

export default Provenance;
