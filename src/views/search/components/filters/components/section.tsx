import React from 'react';
import {
  AccordionIcon,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Box,
  Text,
} from '@chakra-ui/react';
import Tooltip from 'src/components/tooltip';
import { SHOW_VISUAL_SUMMARY } from 'src/utils/feature-flags';
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
                <AccordionButton
                  as='span'
                  role='button'
                  px={{ base: 4, md: 3 }}
                  gap={2}
                  borderLeft='4px solid'
                  borderBottom='0.5px solid'
                  borderRadius='sm'
                  flexDirection={SHOW_VISUAL_SUMMARY ? 'row' : 'row-reverse'}
                  py={{ base: isExpanded ? 3 : 2.5, md: isExpanded ? 1.5 : 1 }}
                  bg={isExpanded ? 'secondary.50' : 'transparent'}
                  borderTopColor={isExpanded ? 'secondary.100' : 'gray.100'}
                  borderBottomColor={isExpanded ? 'transparent' : 'gray.100'}
                  borderLeftColor={isExpanded ? 'secondary.300' : 'transparent'}
                  _hover={{
                    bg: isExpanded ? 'secondary.50' : 'gray.50',
                  }}
                >
                  <Tooltip
                    label={
                      description.charAt(0).toUpperCase() + description.slice(1)
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
                  {filterId && SHOW_VISUAL_SUMMARY && (
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
                          onClick={e => {
                            e.stopPropagation(); // Prevent accordion toggle
                            onToggleViz && onToggleViz(filterId);
                          }}
                        />
                      </Box>
                    </Tooltip>
                  )}
                  <AccordionIcon />
                </AccordionButton>
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
