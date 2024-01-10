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
  Link,
} from 'nde-design-system';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { FormattedResource } from 'src/utils/api/types';
import { MetadataToolTip, MetadataIcon } from 'src/components/icon';
import { getMetadataTheme } from 'src/components/icon/helpers';
import {
  MetadataBlock,
  MetadataContent,
  MetadataList,
  MetadataListItem,
  generateMetadataContent,
  sortMetadataArray,
} from 'src/components/metadata';
import NextLink from 'next/link';

interface MetadataAccordionProps {
  data?: FormattedResource | null;
}

const MetadataAccordion: React.FC<MetadataAccordionProps> = ({ data }) => {
  const paddingCard = [4, 6, 8, 10];

  const id = data?.id;
  const content = generateMetadataContent({
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
  return (
    <>
      {/* Details expandable drawer */}
      <Accordion allowToggle p={0} pt={1} my={0}>
        <AccordionItem>
          {({ isExpanded }) => (
            <>
              <h2>
                <AccordionButton
                  px={paddingCard}
                  _hover={{ bg: 'page.alt' }}
                  aria-label={`show more details about dataset id ${id}`}
                >
                  <Flex
                    flex='1'
                    textAlign='left'
                    flexWrap='wrap'
                    alignItems='center'
                  >
                    {sortedMetadataContent.map(
                      ({ label, property, isDisabled }) => {
                        const color = isDisabled
                          ? 'gray'
                          : getMetadataTheme(property);

                        return (
                          <Tag
                            key={`tag-${id}-${label}`}
                            size='sm'
                            variant='subtle'
                            borderRadius='full'
                            colorScheme={color}
                            // darker for variableMeasured
                            color={`${color}.${
                              property === 'variableMeasured' ? '900' : '700'
                            }`}
                            m={0.5}
                            opacity={isDisabled ? 0.65 : 1}
                          >
                            <MetadataToolTip
                              propertyName={property}
                              description={
                                isDisabled
                                  ? `No ${label.toLocaleLowerCase()} data.`
                                  : undefined
                              }
                              recordType={data?.['@type']}
                            >
                              <Flex alignItems='center'>
                                <MetadataIcon
                                  id={`indicator-${property}-${id}`}
                                  title={property}
                                  glyph={property}
                                  fill={`${color}.600`}
                                  m={0.5}
                                  boxSize={4}
                                  isDisabled={isDisabled}
                                />
                                <TagLabel lineHeight='none'>
                                  <Text fontSize='xs' m={0.5} color='inherit'>
                                    {label}
                                  </Text>
                                </TagLabel>
                              </Flex>
                            </MetadataToolTip>
                          </Tag>
                        );
                      },
                    )}
                  </Flex>
                  <Flex alignItems='center'>
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
                    minChildWidth='250px'
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
