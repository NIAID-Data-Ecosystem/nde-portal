import React from 'react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import {
  Divider,
  Icon,
  StackProps,
  Text,
  TextProps,
  VStack,
} from '@chakra-ui/react';
import { defaultStyles } from '@visx/tooltip';

export interface TooltipWrapperProps extends StackProps {
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
  ...props
}: TooltipWrapperProps) => {
  return (
    <VStack
      spacing={2}
      alignItems='flex-start'
      fontSize='sm'
      lineHeight='short'
      {...props}
    >
      <VStack alignItems='flex-start' spacing={0.5}>
        {children}
      </VStack>
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

const baseTooltipText = {
  fontSize: 'xs',
  lineHeight: 'shorter',
};

export const TooltipTitle: React.FC<TextProps> = ({ children, ...props }) => {
  return (
    <Text
      fontWeight='semibold'
      color='text.heading'
      {...baseTooltipText}
      {...props}
    >
      {children}
    </Text>
  );
};

export const TooltipSubtitle: React.FC<TextProps> = ({
  children,
  ...props
}) => {
  return (
    <Text fontWeight='normal' {...baseTooltipText} {...props}>
      {children}
    </Text>
  );
};

export const TooltipBody: React.FC<TextProps> = ({ children, ...props }) => {
  return (
    <Text fontWeight='normal' mt={1} {...baseTooltipText} {...props}>
      {children}
    </Text>
  );
};
