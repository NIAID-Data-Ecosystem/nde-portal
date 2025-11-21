import { Accordion, Flex, SimpleGrid, Tag, Text } from '@chakra-ui/react';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import dynamic from 'next/dynamic';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa6';
import { SchemaDefinitions } from 'scripts/generate-schema-definitions/types';
import { Link } from 'src/components/link';
import { SORT_ORDER, SORT_ORDER_COMPTOOL } from 'src/components/metadata';
import {
  generateMetadataContent,
  generateMetadataContentforCompToolCard,
  sortMetadataArray,
} from 'src/components/metadata';
import { getMetadataTheme } from 'src/components/metadata/helpers';
import { Tooltip } from 'src/components/tooltip';
import { FormattedResource } from 'src/utils/api/types';

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
      <Accordion.Root
        collapsible
        p={0}
        my={0}
        lazyMount
        variant='enclosed'
        borderRadius='none'
        borderX='none'
      >
        <Accordion.Item value='metadata-accordion'>
          <Accordion.ItemTrigger
            flexDirection={{ base: 'column', md: 'row' }}
            _hover={{ bg: 'page.alt' }}
            cursor='pointer'
          >
            <Flex flex='1' textAlign='left' flexWrap='wrap' alignItems='center'>
              {sortedMetadataContent.map(({ label, property, isDisabled }) => {
                const colorPalette = isDisabled
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
                  <Tooltip
                    key={`tag-${id}-${label}`}
                    content={
                      isDisabled
                        ? `No ${label.toLocaleLowerCase()} data.`
                        : description
                    }
                  >
                    <Tag.Root
                      size='md'
                      variant='surface'
                      borderRadius='full'
                      colorPalette={colorPalette}
                      // darker for variableMeasured
                      color={`${colorPalette}.${
                        property === 'variableMeasured' ? '900' : '700'
                      }`}
                      m={0.5}
                      aria-disabled={isDisabled}
                      opacity={isDisabled ? 0.65 : 1}
                    >
                      <Tag.Label>{label}</Tag.Label>
                    </Tag.Root>
                  </Tooltip>
                );
              })}
            </Flex>
            <Flex alignItems='center' mt={[2, 2, 0]}>
              <Text mx={2} fontSize='xs'>
                Show metadata
              </Text>
              <Accordion.ItemIndicator
                as={FaPlus}
                _open={{ display: 'none' }}
              />
              <Accordion.ItemIndicator
                as={FaMinus}
                _closed={{ display: 'none' }}
              />
            </Flex>
          </Accordion.ItemTrigger>
          <Accordion.ItemContent bg='#fff' px={0}>
            <Accordion.ItemBody px={2}>
              <SimpleGrid
                minChildWidth={{ base: 'unset', sm: '280px', xl: '300px' }}
                gapX={20}
                gapY={10}
                px={4}
              >
                {sortedMetadataContent.map(
                  ({ img, items, name, url, ...props }) => {
                    const maxItemsCount = 3;
                    return (
                      <MetadataBlock key={`property-${props.id}`} {...props}>
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
                          </>
                        )}
                      </MetadataBlock>
                    );
                  },
                )}
              </SimpleGrid>
            </Accordion.ItemBody>
          </Accordion.ItemContent>
        </Accordion.Item>
      </Accordion.Root>
    </>
  );
};

export default MetadataAccordion;
