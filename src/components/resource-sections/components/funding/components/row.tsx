import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Flex,
  FlexProps,
  Icon,
  Text,
} from '@chakra-ui/react';
import { FaMinus, FaPlus } from 'react-icons/fa6';

// Row component - represents a row in the table, containing multiple cells.
export const Row = React.memo(({ children, ...props }: FlexProps) => {
  return (
    <Flex as='tr' role='row' display='flex' {...props}>
      {children}
    </Flex>
  );
});

export const RowWithDrawer = React.memo(
  ({ children }: { children: React.ReactNode }) => {
    return (
      <Flex
        as='tr'
        role='row'
        borderBottom='0.15px solid'
        borderColor='gray.200'
        bg='page.alt'
        flex={1}
      >
        <Flex as='td' py={0} flexDirection='column' flex={1}>
          <Accordion allowToggle>
            <AccordionItem border='none'>
              {({ isExpanded }) => (
                <>
                  <h2>
                    <AccordionButton px={4} py={1} bg='white'>
                      <Flex alignItems='center'>
                        <Text fontSize='xs'>
                          {isExpanded ? 'Less' : 'More'}
                        </Text>
                        <Icon
                          as={isExpanded ? FaMinus : FaPlus}
                          boxSize={2}
                          mx={1}
                        />
                      </Flex>
                    </AccordionButton>
                  </h2>
                  <AccordionPanel py={4}>
                    {isExpanded && children}
                  </AccordionPanel>
                </>
              )}
            </AccordionItem>
          </Accordion>
        </Flex>
      </Flex>
    );
  },
);
