import React from 'react';
import {
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Box,
  Text,
  Icon,
} from '@chakra-ui/react';
import { FaChevronDown } from 'react-icons/fa6';
import Tooltip from 'src/components/tooltip';
import { SHOW_VISUAL_SUMMARY as SHOW_VISUAL_SUMMARY_FLAG } from 'src/utils/feature-flags';
import { useRouter } from 'next/router';
import { FiltersChartToggle } from '../../summary/components/filters-chart-toggle';

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
    const router = useRouter();
    // Determine if visual summary section should be shown based on feature flag and current route since this component is shared with /search page.
    const SHOW_VISUAL_SUMMARY =
      SHOW_VISUAL_SUMMARY_FLAG && router.pathname === '/visual-summary';
    return (
      <AccordionItem border='none'>
        {({ isExpanded }) => {
          return (
            <>
              <h2>
                <AccordionButton
                  as='span'
                  role='button'
                  p={4}
                  gap={2}
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
                  flexDirection={SHOW_VISUAL_SUMMARY ? 'row' : 'row-reverse'}
                >
                  <Icon
                    as={FaChevronDown}
                    color='gray.800'
                    data-testid='minus-icon'
                    fontSize='12px'
                    transform={isExpanded ? 'rotate(180deg)' : undefined}
                    transition='transform 0.2s ease-in-out'
                  />

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
                  {vizId && SHOW_VISUAL_SUMMARY && (
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
                            onToggleViz && onToggleViz(vizId);
                          }}
                        />
                      </Box>
                    </Tooltip>
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
