import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionButton,
  Flex,
  Icon,
  Tag,
  TagLabel,
  Text,
  SimpleGrid,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { FaMinus, FaPlus } from 'react-icons/fa6';
import { Link } from 'src/components/link';
import { FormattedResource } from 'src/utils/api/types';
import Tooltip from 'src/components/tooltip';
import { getMetadataTheme } from 'src/components/icon/helpers';
import {
  generateMetadataContent,
  generateMetadataContentforCompToolCard,
  sortMetadataArray,
} from 'src/components/metadata';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import { SchemaDefinitions } from 'scripts/generate-schema-definitions/types';
import dynamic from 'next/dynamic';

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

  const sortedMetadataContent = sortMetadataArray(content);

  const schema = SCHEMA_DEFINITIONS as SchemaDefinitions;
  return (
    <>
      {/* Details expandable drawer */}
      <Accordion allowToggle p={0} my={0}>
        <AccordionItem>
          {({ isExpanded }) => (
            <>
              <h2>
                <AccordionButton
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
                      ({ label, property, glyph, isDisabled }) => {
                        const colorScheme = isDisabled
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
                          <Tag
                            key={`tag-${id}-${label}`}
                            size='sm'
                            variant='subtle'
                            borderRadius='full'
                            colorScheme={colorScheme}
                            // darker for variableMeasured
                            color={`${colorScheme}.${
                              property === 'variableMeasured' ? '900' : '700'
                            }`}
                            m={0.5}
                            aria-disabled={isDisabled}
                            opacity={isDisabled ? 0.65 : 1}
                          >
                            <Tooltip
                              label={
                                isDisabled
                                  ? `No ${label.toLocaleLowerCase()} data.`
                                  : description
                              }
                            >
                              <Flex alignItems='center'>
                                <TagLabel lineHeight='none'>
                                  <Text fontSize='xs' m={0.5} color='inherit'>
                                    {label}
                                  </Text>
                                </TagLabel>
                              </Flex>
                            </Tooltip>
                          </Tag>
                        );
                      },
                    )}
                  </Flex>
                  <Flex alignItems='center' mt={[2, 2, 0]}>
                    <Text mx={2} fontSize='xs'>
                      Show metadata
                    </Text>
                    <Icon
                      as={isExpanded ? FaMinus : FaPlus}
                      color='gray.600'
                      boxSize={3}
                    />
                  </Flex>
                </AccordionButton>
              </h2>
              <AccordionPanel w='100%' px={paddingCard} my={2} py={4}>
                {isExpanded ? (
                  <SimpleGrid
                    minChildWidth={{ base: 'unset', sm: '280px', xl: '300px' }}
                    spacingX={20}
                    spacingY={10}
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
                                            colorScheme={getMetadataTheme(
                                              props.property,
                                            )}
                                            {...item}
                                          />
                                        </MetadataListItem>
                                      );
                                    })}
                                </MetadataList>
                                {items.length > 3 && (
                                  <NextLink
                                    href={
                                      props.property === 'funding'
                                        ? `/resources?id=${id}#funding`
                                        : `/resources?id=${id}#overview`
                                    }
                                  >
                                    <Link
                                      as='div'
                                      lineHeight='short'
                                      display='flex'
                                      ml={4}
                                    >
                                      <Text fontSize='xs' lineHeight='short'>
                                        Show {items.length - maxItemsCount} more
                                        item
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
              </AccordionPanel>
            </>
          )}
        </AccordionItem>
      </Accordion>
    </>
  );
};

export default MetadataAccordion;
