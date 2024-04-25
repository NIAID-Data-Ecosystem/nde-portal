import React from 'react';
import {
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Flex,
  Heading,
} from '@chakra-ui/react';
import { FaMinus, FaPlus } from 'react-icons/fa6';
import { MetadataIcon } from 'src/components/icon';
import { getMetadataColor } from 'src/components/icon/helpers';
import Tooltip from 'src/components/tooltip';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import { SchemaDefinitions } from 'scripts/generate-schema-definitions/types';
/*
[COMPONENT INFO]:
Filter drawer corresponding to a filter facet.
*/

interface FiltersSectionProps {
  name: string;
  property: string;
  icon?: string;
  children: React.ReactNode;
}

export const FiltersSection: React.FC<FiltersSectionProps> = React.memo(
  ({ name, icon, property, children }) => {
    const schema = SCHEMA_DEFINITIONS as SchemaDefinitions;
    const schemaProperty = schema[property];
    const description =
      schemaProperty?.abstract?.['Dataset'] ||
      schemaProperty?.description?.['Dataset'] ||
      '';

    return (
      <AccordionItem borderColor='page.alt' borderTopWidth='2px'>
        {({ isExpanded }) => {
          return (
            <>
              <h3>
                {/* Toggle expand panel open. */}
                <AccordionButton
                  borderLeft='4px solid'
                  borderColor='gray.200'
                  py={4}
                  transition='all 0.2s linear'
                  _expanded={{
                    borderColor: 'acccent.400',
                    py: 2,
                    transition: 'all 0.2s linear',
                  }}
                >
                  {/* Filter Name */}
                  <Flex
                    flex='1'
                    textAlign='left'
                    justifyContent='space-between'
                    alignItems='center'
                  >
                    <Heading as='span' size='sm' fontWeight='semibold'>
                      {name}
                    </Heading>

                    {/* Icon tooltip with property definition. */}
                    {icon && (
                      <Tooltip
                        label={`${schemaProperty.name}${
                          description &&
                          `: ${description
                            .charAt(0)
                            .toUpperCase()}${description.slice(1)}`
                        }`}
                      >
                        <MetadataIcon
                          id={`filter-${property}`}
                          glyph={icon}
                          title={property}
                          fill={getMetadataColor(icon)}
                          mx={2}
                        />
                      </Tooltip>
                    )}
                  </Flex>
                  {isExpanded ? (
                    <FaMinus fontSize='12px' />
                  ) : (
                    <FaPlus fontSize='12px' />
                  )}
                </AccordionButton>
              </h3>
              <AccordionPanel
                p={4}
                borderLeft='4px solid'
                borderColor='accent.400'
              >
                {isExpanded ? children : <></>}
              </AccordionPanel>
            </>
          );
        }}
      </AccordionItem>
    );
  },
);
