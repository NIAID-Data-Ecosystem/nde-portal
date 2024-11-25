import React from 'react';
import {
  Button,
  Flex,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  Text,
  FlexProps,
  ButtonProps,
} from '@chakra-ui/react';
import { FaCaretDown } from 'react-icons/fa6';
import { ScrollContainer } from 'src/components/scroll-container';

interface ConfigureViewProps extends FlexProps {
  label: string;
  buttonProps: ButtonProps;
  description?: string;
}
export const ConfigureView: React.FC<ConfigureViewProps> = ({
  buttonProps,
  children,
  description,
  label,
  ...rest
}) => {
  return (
    <Flex flex={{ base: 1, sm: 'unset' }} height={{ base: 'unset' }} {...rest}>
      <Popover>
        <PopoverTrigger>
          <Button
            colorScheme='gray'
            flex={1}
            fontWeight='medium'
            fontSize='inherit'
            lineHeight='shorter'
            px={4}
            rightIcon={<FaCaretDown />}
            variant='outline'
            justifyContent='space-between'
            {...buttonProps}
          >
            {buttonProps?.children || label}
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>
            <Text fontWeight='semibold' lineHeight='normal' my={1}>
              {label}
            </Text>
            {description && (
              <Text
                color='niaid.placeholder'
                fontSize='sm'
                fontStyle='italic'
                fontWeight='normal'
                lineHeight='short'
                mt={1.5}
              >
                {description}
              </Text>
            )}
          </PopoverHeader>
          <PopoverBody>
            <ScrollContainer maxHeight='300px'>{children}</ScrollContainer>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Flex>
  );
};
