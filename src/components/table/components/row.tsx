import { Accordion, Box, Flex, FlexProps, Icon, Text } from '@chakra-ui/react';
import React from 'react';
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
        {/*
        `lazyMount` + `unmountOnExit` keep the drawer's children out of the DOM
        while it is closed, but unmount them only once the collapse animation
        has finished. Gating them on `expanded` instead removed them the moment
        it started, so the panel went blank and dropped to its padding.
        */}
        <Accordion.Root collapsible lazyMount unmountOnExit>
          <Accordion.Item border='none' value='item-0'>
            <Accordion.ItemContext>
              {({ expanded }) => (
                <Box bg='bg.alt'>
                  <h2>
                    <Accordion.ItemTrigger px={4} py={1} bg='white'>
                      <Flex alignItems='center'>
                        <Text fontSize='xs'>
                          {expanded ? 'Less Information' : 'More Information'}
                        </Text>
                        <Icon
                          as={expanded ? FaMinus : FaPlus}
                          boxSize={2}
                          mx={1}
                        />
                      </Flex>
                    </Accordion.ItemTrigger>
                  </h2>
                  {/*
                  The padding sits on the body rather than the content, whose
                  height is what animates: under `border-box` the content's
                  own padding kept it from shrinking below 2rem, so it paused
                  there on open and snapped the last 2rem away on close. The
                  values are that padding plus the recipe's own body padding.
                  */}
                  <Accordion.ItemContent bg='bg.alt'>
                    <Accordion.ItemBody pt={6} pb={8}>
                      {children}
                    </Accordion.ItemBody>
                  </Accordion.ItemContent>
                </Box>
              )}
            </Accordion.ItemContext>
          </Accordion.Item>
        </Accordion.Root>
      </Flex>
    </Flex>
  );
});
