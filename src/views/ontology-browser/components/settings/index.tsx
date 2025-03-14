import React from 'react';
import {
  Button,
  ButtonProps,
  Flex,
  FlexProps,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  Text,
} from '@chakra-ui/react';
import { FaCaretDown, FaGear } from 'react-icons/fa6';
import { ScrollContainer } from 'src/components/scroll-container';
import { OntologyViewSettings } from './components/ontology-view-settings';

/**
 * OntologyBrowserSettings
 *
 * A popover component for configuring the ontology browser view.
 * It provides a dropdown menu with options to enable or disable a condensed view
 * and to include or exclude terms with zero datasets in the ontology tree.
 *
 * @param label - The label displayed on the trigger button of the popover.
 * @param buttonProps - Additional properties for the trigger button.
 * @param description - An optional description displayed in the popover header.
 * @param rest - Additional `Flex` container properties.
 */

interface OntologyPopoverProps extends FlexProps {
  label: string;
  buttonProps: ButtonProps;
  description?: string;
}

export const OntologyBrowserSettings: React.FC<OntologyPopoverProps> = ({
  buttonProps,
  description,
  label,
  ...rest
}) => {
  return (
    <Flex flex={{ base: 1, sm: 'unset' }} height={{ base: 'unset' }} {...rest}>
      <Popover>
        <PopoverTrigger>
          <Button
            colorScheme='primary'
            flex={1}
            fontWeight='medium'
            fontSize='inherit'
            lineHeight='shorter'
            px={4}
            leftIcon={<Icon as={FaGear} color='inherit' />}
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
            <ScrollContainer maxHeight='300px'>
              <OntologyViewSettings />
            </ScrollContainer>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Flex>
  );
};
