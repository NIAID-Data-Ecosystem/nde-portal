import React from 'react';
import {
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Flex,
  Heading,
  Text,
} from '@chakra-ui/react';
import { FaMinus, FaPlus } from 'react-icons/fa6';
import Tooltip from 'src/components/tooltip';
/*
[COMPONENT INFO]:
Filter drawer corresponding to a filter facet.
*/

interface FiltersSectionProps {
  name: string;
  description: string;
  children: React.ReactNode;
}

export const FiltersSection: React.FC<FiltersSectionProps> = React.memo(
  ({ name, description, children }) => {
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
                  py={3}
                  transition='all 0.2s linear'
                  _expanded={{
                    borderColor: 'accent.400',
                    py: 2,
                    color: 'text.heading',
                    transition: 'all 0.2s linear',
                  }}
                >
                  {/* Filter Name */}
                  <Tooltip
                    label={
                      description.charAt(0).toUpperCase() + description.slice(1)
                    }
                  >
                    <Text as='span' fontSize='sm' flex={1} textAlign='left'>
                      {name}
                    </Text>
                  </Tooltip>
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
