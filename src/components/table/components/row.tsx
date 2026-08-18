import React from 'react';
import { Accordion, Box, Flex, FlexProps, Icon, Text } from '@chakra-ui/react';
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
        <Accordion.Root collapsible>
          <Accordion.Item border='none' value='item-0'>
            {({ isExpanded }) => (
              <Box bg='page.alt'>
                <h2>
                  <Accordion.ItemTrigger px={4} py={1} bg='white'>
                    <Flex alignItems='center'>
                      <Text fontSize='xs'>
                        {isExpanded ? 'Less Information' : 'More Information'}
                      </Text>
                      <Icon
                        as={isExpanded ? FaMinus : FaPlus}
                        boxSize={2}
                        mx={1}
                      />
                    </Flex>
                  </Accordion.ItemTrigger>
                </h2>
                <Accordion.ItemContent py={4} bg='page.alt'>
                  <Accordion.ItemBody>
                    {isExpanded && children}
                  </Accordion.ItemBody>
                </Accordion.ItemContent>
              </Box>
            )}
          </Accordion.Item>
        </Accordion.Root>
      </Flex>
    </Flex>
  );
});
