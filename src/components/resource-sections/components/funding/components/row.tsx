import { Accordion, Flex, FlexProps, Icon, Text } from '@chakra-ui/react';
import React from 'react';
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
        bg='bg.alt'
        flex={1}
      >
        <Flex as='td' py={0} flexDirection='column' flex={1}>
          <Accordion.Root collapsible>
            <Accordion.Item border='none' value='item-0'>
              <Accordion.ItemContext>
                {({ expanded }) => (
                  <>
                    <h2>
                      <Accordion.ItemTrigger px={4} py={1} bg='white'>
                        <Flex alignItems='center'>
                          <Text fontSize='xs'>
                            {expanded ? 'Less' : 'More'}
                          </Text>
                          <Icon
                            as={expanded ? FaMinus : FaPlus}
                            boxSize={2}
                            mx={1}
                          />
                        </Flex>
                      </Accordion.ItemTrigger>
                    </h2>
                    <Accordion.ItemContent py={4}>
                      <Accordion.ItemBody>
                        {expanded && children}
                      </Accordion.ItemBody>
                    </Accordion.ItemContent>
                  </>
                )}
              </Accordion.ItemContext>
            </Accordion.Item>
          </Accordion.Root>
        </Flex>
      </Flex>
    );
  },
);
