import React from 'react';
import { Divider, FlexProps, Icon, Text, VStack } from '@chakra-ui/react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { defaultStyles } from '@visx/tooltip';

export interface TooltipWrapperProps extends FlexProps {
  showsSearchHint?: boolean;
  searchHintText?: string;
}

export const customTooltipStyles = {
  ...defaultStyles,
  backdropFilter: 'blur(4px)',
  background: 'hsl(0deg 0% 100% / 90%)',
  borderTop: '0.25rem solid',
  borderRadius: '0.25rem',
  maxWidth: 200,
  padding: '0.5rem',
};

export const TooltipWrapper = ({
  children,
  showsSearchHint,
  searchHintText = 'Click to find related search results in the portal.',
}: TooltipWrapperProps) => {
  return (
    <VStack
      spacing={2}
      alignItems='flex-start'
      fontSize='sm'
      lineHeight='short'
    >
      {children}
      {/* Show note that item links to search */}
      {showsSearchHint && (
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
            {searchHintText}
          </Text>
        </>
      )}
    </VStack>
  );
};
