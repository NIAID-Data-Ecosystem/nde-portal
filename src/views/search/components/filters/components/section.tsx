import { Accordion, Box, Flex, Text } from '@chakra-ui/react';
import React from 'react';
import Tooltip from 'src/components/tooltip';

import { FiltersChartToggle } from './filters-chart-toggle';

interface FiltersSectionProps {
  id: string;
  name: string;
  description: string;
  children: React.ReactNode;
  // Optional visualization properties
  filterId?: string;
  isVizActive?: boolean;
  onToggleViz?: (filterId: string) => void;
}

/*
[COMPONENT INFO]:
Filter drawer corresponding to a filter facet.
*/
export const FiltersSection: React.FC<FiltersSectionProps> = React.memo(
  ({ id, name, description, children, filterId, isVizActive, onToggleViz }) => {
    return (
      <Accordion.Item
        bg='#fff'
        my={0.5}
        border='1px solid'
        borderRadius='md'
        borderColor='blackAlpha.200'
        value={id}
      >
        <Accordion.ItemContext>
          {({ expanded }) => {
            return (
              <>
                <h2>
                  <Flex
                    alignItems='center'
                    borderLeft='4px solid'
                    borderBottom='0.5px solid'
                    borderRadius='sm'
                    pr={{ base: 4, md: 3 }}
                    bg={expanded ? 'secondary.50' : 'transparent'}
                    borderTopColor={expanded ? 'secondary.100' : 'gray.100'}
                    borderBottomColor={expanded ? 'transparent' : 'gray.100'}
                    borderLeftColor={expanded ? 'secondary.300' : 'transparent'}
                    _hover={{
                      bg: expanded ? 'secondary.50' : 'gray.50',
                    }}
                  >
                    <Accordion.ItemTrigger
                      flex={1}
                      bg='transparent'
                      _hover={{ bg: 'transparent' }}
                      px={{ base: 4, md: 3 }}
                      gap={2}
                      borderRadius='sm'
                      flexDirection='row'
                      py={{
                        base: expanded ? 3 : 2.5,
                        md: expanded ? 1.5 : 1,
                      }}
                    >
                      <Tooltip
                        content={
                          description.charAt(0).toUpperCase() +
                          description.slice(1)
                        }
                      >
                        <Text
                          as='span'
                          flex={1}
                          textAlign='left'
                          fontSize='sm'
                          color='gray.800'
                          mr={2}
                          fontWeight='medium'
                        >
                          {name}
                        </Text>
                      </Tooltip>
                      <Accordion.ItemIndicator />
                    </Accordion.ItemTrigger>
                    {filterId && (
                      <Tooltip
                        content={
                          isVizActive
                            ? `Remove ${name} visualisation chart`
                            : `Add ${name} visualisation chart`
                        }
                      >
                        <Box>
                          <FiltersChartToggle
                            isActive={!!isVizActive}
                            name={name}
                            onClick={() => {
                              onToggleViz && onToggleViz(filterId);
                            }}
                          />
                        </Box>
                      </Tooltip>
                    )}
                  </Flex>
                </h2>
                {expanded ? (
                  <Accordion.ItemContent
                    p={0}
                    borderLeft='4px solid'
                    borderLeftColor='secondary.200'
                    borderBottom='0.25px solid'
                    borderBottomColor='gray.100'
                  >
                    <Accordion.ItemBody>{children}</Accordion.ItemBody>
                  </Accordion.ItemContent>
                ) : (
                  <></>
                )}
              </>
            );
          }}
        </Accordion.ItemContext>
      </Accordion.Item>
    );
  },
);
