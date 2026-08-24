import { Accordion, Flex, Icon, SimpleGrid, Tag, Text } from '@chakra-ui/react';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import dynamic from 'next/dynamic';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa6';
import { SchemaDefinitions } from 'scripts/generate-schema-definitions/types';
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
  const paddingCard = [4, 6, 8, 10];

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
  return (
    <>
      {/* Details expandable drawer */}
      <Accordion.Root collapsible p={0} my={0}>
        <Accordion.Item value='item-0'>
          <Accordion.ItemContext>
            {({ expanded }) => (
              <>
                <h2>
                  <Accordion.ItemTrigger
                    px={paddingCard}
                    _hover={{ bg: 'page.alt' }}
                    flexDirection={{ base: 'column', md: 'row' }}
                  >
                    <Flex
                      flex='1'
                      textAlign='left'
                      flexWrap='wrap'
                      alignItems='center'
                    >
                      {sortedMetadataContent.map(
                        ({ label, property, disabled }) => {
                          const colorPalette = disabled
                            ? 'gray'
                            : getMetadataTheme(property);
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
                                  disabled
                                    ? `No ${label.toLocaleLowerCase()} data.`
                                    : description
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
                        },
                      )}
                    </Flex>
                    <Flex alignItems='center' mt={[2, 2, 0]}>
                      <Text mx={2} fontSize='xs'>
                        Show metadata
                      </Text>
                      <Icon
                        as={expanded ? FaMinus : FaPlus}
                        color='gray.600'
                        boxSize={3}
                      />
                    </Flex>
                  </Accordion.ItemTrigger>
                </h2>
                <Accordion.ItemContent w='100%' px={paddingCard} my={2} py={4}>
                  <Accordion.ItemBody>
                    {expanded ? (
                      <SimpleGrid
                        minChildWidth={{
                          base: 'unset',
                          sm: '280px',
                          xl: '300px',
                        }}
                        rowGap={20}
                        columnGap={10}
                        px={4}
                      >
                        {sortedMetadataContent.map(
                          ({ img, items, name, url, ...props }) => {
                            const maxItemsCount = 3;
                            return (
                              <MetadataBlock
                                key={`property-${props.id}`}
                                glyph={props.property}
                                {...props}
                              >
                                {name && (
                                  <MetadataContent
                                    name={name}
                                    img={img}
                                    url={url}
                                    {...content}
                                  />
                                )}
                                {items && items.length > 0 && (
                                  <>
                                    <MetadataList>
                                      {items
                                        .slice(0, maxItemsCount)
                                        .map(({ key, ...item }) => {
                                          return (
                                            <MetadataListItem
                                              key={key}
                                              property={props.property}
                                            >
                                              <MetadataContent
                                                includeOntology
                                                colorPalette={getMetadataTheme(
                                                  props.property,
                                                )}
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
                                      <NextLink href={url}>
                                        <Link
                                          as='div'
                                          lineHeight='short'
                                          display='flex'
                                          ml={4}
                                        >
                                          <Text
                                            fontSize='xs'
                                            lineHeight='short'
                                          >
                                            Show more details
                                          </Text>
                                        </Link>
                                      </NextLink>
                                    )}
                                    {items.length > 3 && (
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
                                        <Link
                                          as='div'
                                          lineHeight='short'
                                          display='flex'
                                          ml={4}
                                        >
                                          <Text
                                            fontSize='xs'
                                            lineHeight='short'
                                          >
                                            Show {items.length - maxItemsCount}{' '}
                                            more item
                                            {items.length - maxItemsCount > 1
                                              ? 's'
                                              : ''}
                                          </Text>
                                        </Link>
                                      </NextLink>
                                    )}
                                  </>
                                )}
                              </MetadataBlock>
                            );
                          },
                        )}
                      </SimpleGrid>
                    ) : (
                      <></>
                    )}
                  </Accordion.ItemBody>
                </Accordion.ItemContent>
              </>
            )}
          </Accordion.ItemContext>
        </Accordion.Item>
      </Accordion.Root>
    </>
  );
};

export default MetadataAccordion;
