import { Flex, SimpleGrid, Stack, Tag, Text } from '@chakra-ui/react';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import dynamic from 'next/dynamic';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { SchemaDefinitions } from 'scripts/generate-schema-definitions/types';
import { DetailsAccordion } from 'src/components/details-accordion';
import { getMetadataTheme } from 'src/components/icon/helpers';
import { Link } from 'src/components/link';
import { SORT_ORDER, SORT_ORDER_COMPTOOL } from 'src/components/metadata';
import {
  generateMetadataContent,
  generateMetadataContentforCompToolCard,
  sortMetadataArray,
} from 'src/components/metadata';
import Tooltip from 'src/components/tooltip';
import { FormattedResource } from 'src/utils/api/types';
import { SHOW_SAMPLE_UI_PILL } from 'src/utils/feature-flags';

const MetadataBlock = dynamic(
  () => import('src/components/metadata').then(mod => mod.MetadataBlock),
  {
    loading: () => <p></p>,
  },
);

const MetadataContent = dynamic(
  () => import('src/components/metadata').then(mod => mod.MetadataContent),
  {
    loading: () => <p></p>,
  },
);

const MetadataList = dynamic(
  () => import('src/components/metadata').then(mod => mod.MetadataList),
  {
    loading: () => <p></p>,
  },
);

const MetadataListItem = dynamic(
  () => import('src/components/metadata').then(mod => mod.MetadataListItem),
  {
    loading: () => <p></p>,
  },
);

interface MetadataAccordionProps {
  data?: FormattedResource | null;
}

const MetadataAccordion: React.FC<MetadataAccordionProps> = ({ data }) => {
  const type = data?.['@type'] || 'Dataset';

  const id = data?.id;

  const content =
    type == 'ComputationalTool'
      ? generateMetadataContentforCompToolCard({
          id: data?.id,
          availableOnDevice: data?.availableOnDevice,
          featureList: data?.featureList,
          funding: data?.funding,
          input: data?.input,
          license: data?.license,
          output: data?.output,
          softwareHelp: data?.softwareHelp,
          softwareRequirements: data?.softwareRequirements,
          softwareVersion: data?.softwareVersion,
        })
      : generateMetadataContent({
          id: data?.id,
          healthCondition: data?.healthCondition,
          infectiousAgent: data?.infectiousAgent,
          funding: data?.funding,
          license: data?.license,
          measurementTechnique: data?.measurementTechnique,
          // Include sample data only when the feature flag is enabled. Data
          // Collections aggregate records from other sources rather than
          // describing a sample source, so the pill is omitted there instead
          // of rendering permanently disabled.
          ...(SHOW_SAMPLE_UI_PILL && type !== 'DataCollection'
            ? { sample: data?.sample }
            : {}),
          species: data?.species,
          usageInfo: data?.usageInfo,
          variableMeasured: data?.variableMeasured,
        });

  const sortedMetadataContent =
    type == 'ComputationalTool'
      ? sortMetadataArray(content, SORT_ORDER_COMPTOOL)
      : sortMetadataArray(content, SORT_ORDER);

  const schema = SCHEMA_DEFINITIONS as SchemaDefinitions;
  const router = useRouter();
  const referrerPath = router.query.referrerPath || '/search';

  // A pill per metadata property, greyed out when the resource has no data for it.
  const summary = (
    <Flex flexWrap='wrap' alignItems='center'>
      {sortedMetadataContent.map(({ label, property, disabled }) => {
        const colorPalette = disabled ? 'gray' : getMetadataTheme(property);
        const schemaProperty = schema[property];
        // Get the description for the specific type, if available. Otherwise, use the abstract. If neither, use the dataset description.
        const description =
          schemaProperty?.description?.[type] ||
          schemaProperty?.abstract?.[type] ||
          schemaProperty?.description?.['Dataset'] ||
          '';
        return (
          <Tag.Root
            key={`tag-${id}-${label}`}
            size='md'
            variant='subtle'
            borderRadius='full'
            colorPalette={colorPalette}
            // darker for variableMeasured
            color={`${colorPalette}.${
              property === 'variableMeasured' ? '900' : '700'
            }`}
            m={0.5}
            aria-disabled={disabled}
            opacity={disabled ? 0.65 : 1}
          >
            <Tooltip
              content={
                disabled ? `No ${label.toLocaleLowerCase()} data.` : description
              }
            >
              <Flex alignItems='center'>
                <Tag.Label>
                  <Text color='inherit'>{label}</Text>
                </Tag.Label>
              </Flex>
            </Tooltip>
          </Tag.Root>
        );
      })}
    </Flex>
  );

  return (
    <DetailsAccordion
      summary={summary}
      headingLevel='h2'
      showLabel='show metadata'
      hideLabel='hide metadata'
      triggerProps={{ px: 'var(--card-padding)' }}
    >
      <SimpleGrid
        minChildWidth={{
          base: 'unset',
          sm: '280px',
          xl: '300px',
        }}
        rowGap={20}
        columnGap={10}
        px='calc(var(--card-padding))'
      >
        {sortedMetadataContent.map(({ img, items, url, ...props }) => {
          const maxItemsCount = 3;
          return (
            <MetadataBlock
              key={`property-${props.id}`}
              glyph={props.property}
              {...props}
            >
              {items && items.length > 0 && (
                <Stack gap={1}>
                  <MetadataList>
                    {items.slice(0, maxItemsCount).map(({ key, ...item }) => {
                      return (
                        <MetadataListItem key={key} property={props.property}>
                          <MetadataContent
                            includeOntology
                            colorPalette={getMetadataTheme(props.property)}
                            {...item}
                          />
                        </MetadataListItem>
                      );
                    })}
                  </MetadataList>
                  {/* For the sample property, render a bullet-free
                      "Show more details" link below the list using
                      the top-level url set by createSampleContent. */}
                  {props.property === 'sample' && url && (
                    <Link asChild>
                      <NextLink href={url}>Show more details</NextLink>
                    </Link>
                  )}
                  {items.length > 3 && (
                    <Link asChild>
                      <NextLink
                        href={{
                          pathname: '/resources',
                          query: {
                            id,
                            referrerPath,
                          },
                          hash:
                            props.property === 'funding'
                              ? 'funding'
                              : 'overview',
                        }}
                      >
                        Show {items.length - maxItemsCount} more item
                        {items.length - maxItemsCount > 1 ? 's' : ''}
                      </NextLink>
                    </Link>
                  )}
                </Stack>
              )}
            </MetadataBlock>
          );
        })}
      </SimpleGrid>
    </DetailsAccordion>
  );
};

export default MetadataAccordion;
