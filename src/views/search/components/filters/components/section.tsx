import React from 'react';
import {
  AccordionIcon,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Box,
  Flex,
  Text,
} from '@chakra-ui/react';
import Tooltip from 'src/components/tooltip';
import { FiltersChartToggle } from './filters-chart-toggle';

interface FiltersSectionProps {
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
  ({ name, description, children, filterId, isVizActive, onToggleViz }) => {
    return (
      <AccordionItem
        bg='#fff'
        my={0.5}
        border='1px solid'
        borderRadius='md'
        borderColor='blackAlpha.200'
      >
        {({ isExpanded }) => {
          return (
            <>
              <h2>
                <Flex
                  alignItems='center'
                  borderLeft='4px solid'
                  borderBottom='0.5px solid'
                  borderRadius='sm'
                  pr={{ base: 4, md: 3 }}
                  bg={isExpanded ? 'secondary.50' : 'transparent'}
                  borderTopColor={isExpanded ? 'secondary.100' : 'gray.100'}
                  borderBottomColor={isExpanded ? 'transparent' : 'gray.100'}
                  borderLeftColor={isExpanded ? 'secondary.300' : 'transparent'}
                  _hover={{
                    bg: isExpanded ? 'secondary.50' : 'gray.50',
                  }}
                >
                  <AccordionButton
                    flex={1}
                    bg='transparent'
                    _hover={{ bg: 'transparent' }}
                    px={{ base: 4, md: 3 }}
                    gap={2}
                    borderRadius='sm'
                    flexDirection='row'
                    py={{
                      base: isExpanded ? 3 : 2.5,
                      md: isExpanded ? 1.5 : 1,
                    }}
                  >
                    <Tooltip
                      label={
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
                    <AccordionIcon />
                  </AccordionButton>
                  {filterId && (
                    <Tooltip
                      label={
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
              {isExpanded ? (
                <AccordionPanel
                  p={0}
                  borderLeft='4px solid'
                  borderLeftColor='secondary.200'
                  borderBottom='0.25px solid'
                  borderBottomColor='gray.100'
                >
                  {children}
                </AccordionPanel>
              ) : (
                <></>
              )}
            </>
          );
        }}
      </AccordionItem>
    );
  },
);
