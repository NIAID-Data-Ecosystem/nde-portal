import React from 'react';
import {
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Text,
} from '@chakra-ui/react';
import { FaMinus, FaPlus } from 'react-icons/fa6';
import Tooltip from 'src/components/tooltip';

interface FiltersSectionProps {
  name: string;
  description: string;
  children: React.ReactNode;
}

/*
[COMPONENT INFO]:
Filter drawer corresponding to a filter facet.
*/
export const FiltersSection: React.FC<FiltersSectionProps> = React.memo(
  ({ name, description, children }) => {
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
                  borderTop='0.5px solid'
                  borderRadius='sm'
                  borderColor={isExpanded ? 'secondary.100' : 'gray.100'}
                  borderLeftColor={isExpanded ? 'secondary.300' : 'transparent'}
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
                      fontSize='xs'
                      color='gray.800'
                      textTransform='uppercase'
                      fontWeight='bold'
                      mr={2}
                    >
                      {name}
                    </Text>
                  </Tooltip>
                  {isExpanded ? (
                    <FaMinus fontSize='12px' />
                  ) : (
                    <FaPlus fontSize='12px' />
                  )}
                </AccordionButton>
              </h2>
              <AccordionPanel
                p={0}
                borderLeft='4px solid'
                borderColor='secondary.200'
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
