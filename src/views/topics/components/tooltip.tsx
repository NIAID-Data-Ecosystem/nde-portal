import React from 'react';
import { Divider, Flex, FlexProps, Icon, Text, VStack } from '@chakra-ui/react';
import { FaMagnifyingGlass } from 'react-icons/fa6';

export interface TooltipWrapperProps extends FlexProps {
  isClickSearchable?: boolean;
}

export const TooltipWrapper = ({
  children,
  isClickSearchable,
  ...props
}: TooltipWrapperProps) => {
  return (
    <Flex
      backdropFilter='blur(4px)'
      backgroundColor='rgba(255, 255, 255, 0.9)!important'
      borderTop='0.25rem solid'
      borderRadius='base'
      boxShadow='0 1px 2px rgba(33,33,33,0.2)'
      maxWidth={200}
      px={2}
      py={2}
      {...props}
    >
      <VStack
        spacing={2}
        alignItems='flex-start'
        fontSize='sm'
        lineHeight='short'
      >
        {children}
        {/* Show note that item links to search */}
        {isClickSearchable && (
          <>
            <Divider />
            <Text
              lineHeight='normal'
              color='text.body'
              width='100%'
              fontSize='xs'
            >
              <Icon
                as={FaMagnifyingGlass}
                color='gray.500'
                mr={0.5}
                boxSize={3}
              ></Icon>{' '}
              Click to find search results related this type.
            </Text>
          </>
        )}
      </VStack>
    </Flex>
  );
};
