import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Box,
  Flex,
  FlexProps,
  Icon,
  Text,
} from '@chakra-ui/react';
import { FaMinus, FaPlus } from 'react-icons/fa6';

// Row component - represents a row in the table, containing multiple cells.
export const Row = React.memo(({ children, ...props }: FlexProps) => {
  return (
    <Flex
      as='tr'
      role='row'
      display='flex'
      borderBottom='0.15px solid'
      borderColor='gray.200'
      {...props}
    >
      {children}
    </Flex>
  );
});

export const RowWithDrawer = React.memo(({ children, ...props }: FlexProps) => {
  return (
    <Flex flex={1} {...props}>
      <Flex py={0} flexDirection='column' flex={1}>
        <Accordion allowToggle>
          <AccordionItem border='none'>
            {({ isExpanded }) => (
              <Box bg='page.alt'>
                <h2>
                  <AccordionButton px={4} py={1} bg='white'>
                    <Flex alignItems='center'>
                      <Text fontSize='xs'>{isExpanded ? 'Less' : 'More'}</Text>
                      <Icon
                        as={isExpanded ? FaMinus : FaPlus}
                        boxSize={2}
                        mx={1}
                      />
                    </Flex>
                  </AccordionButton>
                </h2>
                <AccordionPanel py={4} bg='page.alt'>
                  {isExpanded && children}
                </AccordionPanel>
              </Box>
            )}
          </AccordionItem>
        </Accordion>
      </Flex>
    </Flex>
  );
});
