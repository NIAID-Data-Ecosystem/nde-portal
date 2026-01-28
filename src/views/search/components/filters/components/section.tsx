import React from 'react';
import {
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Button,
  Text,
  IconButton,
} from '@chakra-ui/react';
import { FaChartPie, FaMinus, FaPlus } from 'react-icons/fa6';
import Tooltip from 'src/components/tooltip';

interface FiltersSectionProps {
  name: string;
  description: string;
  children: React.ReactNode;
  // Optional visualization properties
  vizId?: string;
  isVizActive?: boolean;
  onToggleViz?: (vizId: string) => void;
}

/*
[COMPONENT INFO]:
Filter drawer corresponding to a filter facet.
*/
export const FiltersSection: React.FC<FiltersSectionProps> = React.memo(
  ({ name, description, children, vizId, isVizActive, onToggleViz }) => {
    return (
      <AccordionItem border='none'>
        {({ isExpanded }) => {
          return (
            <>
              <h2>
                <AccordionButton
                  p={4}
                  py={isExpanded ? 1.5 : 2}
                  bg={isExpanded ? 'secondary.50' : 'transparent'}
                  borderLeft='4px solid'
                  borderBottom='0.5px solid'
                  borderRadius='sm'
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
                  {vizId && (
                    <Tooltip
                      label={
                        isVizActive
                          ? `Remove ${name} visualisation chart`
                          : `Add ${name} visualisation chart`
                      }
                    >
                      <IconButton
                        aria-label={
                          isVizActive
                            ? `Remove ${name} visualisation chart`
                            : `Add ${name} visualisation chart`
                        }
                        variant='ghost'
                        size='xs'
                        colorScheme={isVizActive ? 'secondary' : 'gray'}
                        mr={2}
                        onClick={e => {
                          e.stopPropagation();
                          if (vizId && onToggleViz) onToggleViz(vizId);
                        }}
                        color={isVizActive ? 'secondary.500' : 'gray.500'}
                        _hover={{
                          '>svg': {
                            color: isVizActive ? 'secondary.400' : 'gray.400',
                          },
                        }}
                      >
                        <FaChartPie />
                      </IconButton>
                    </Tooltip>
                  )}
                  {isExpanded ? (
                    <FaMinus data-testid='minus-icon' fontSize='12px' />
                  ) : (
                    <FaPlus data-testid='plus-icon' fontSize='12px' />
                  )}
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
