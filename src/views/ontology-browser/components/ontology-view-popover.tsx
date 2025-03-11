import React from 'react';
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  Switch,
  Text,
  VStack,
  FlexProps,
  ButtonProps,
} from '@chakra-ui/react';
import { FaCaretDown } from 'react-icons/fa6';
import { ScrollContainer } from 'src/components/scroll-container';
import { LocalStorageConfig } from '../types';

interface OntologyPopoverProps extends FlexProps {
  label: string;
  buttonProps: ButtonProps;
  description?: string;
  viewConfig: LocalStorageConfig;
  setViewConfig: React.Dispatch<React.SetStateAction<LocalStorageConfig>>;
}

/**
 * OntologyViewPopover
 *
 * A popover component for configuring the ontology browser view.
 * It provides a dropdown menu with options to enable or disable a condensed view
 * and to include or exclude terms with zero datasets in the ontology tree.
 *
 * @param label - The label displayed on the trigger button of the popover.
 * @param buttonProps - Additional properties for the trigger button.
 * @param description - An optional description displayed in the popover header.
 * @param viewConfig - The current view configuration.
 * @param setViewConfig - A function to update the view configuration state.
 * @param rest - Additional `Flex` container properties.
 */
export const OntologyViewPopover: React.FC<OntologyPopoverProps> = ({
  buttonProps,
  description,
  label,
  viewConfig,
  setViewConfig,
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
            <ScrollContainer maxHeight='300px'>
              <OntologyBrowserSettings
                viewConfig={viewConfig}
                setViewConfig={setViewConfig}
              />
            </ScrollContainer>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Flex>
  );
};

/**
 * OntologyBrowserSettings
 *
 * A settings panel for configuring the ontology browser view.
 * Allows toggling between a condensed view and hiding terms with zero datasets.
 *
 * @param viewConfig - The current view configuration state.
 * @param setViewConfig - A function to update the view configuration state.
 */
const OntologyBrowserSettings = ({
  viewConfig,
  setViewConfig,
}: {
  viewConfig: OntologyPopoverProps['viewConfig'];
  setViewConfig: OntologyPopoverProps['setViewConfig'];
}) => {
  return (
    <VStack lineHeight='shorter' spacing={4}>
      <FormControl
        display='flex'
        alignItems='center'
        justifyContent='space-between'
        mt={1}
      >
        <FormLabel htmlFor='condensed-view' mb='0' fontSize='sm'>
          Enable condensed view?
        </FormLabel>
        <Switch
          id='condensed-view'
          colorScheme='primary'
          isChecked={viewConfig.isCondensed === true}
          onChange={() =>
            setViewConfig(() => {
              return {
                ...viewConfig,
                isCondensed: !viewConfig.isCondensed,
              };
            })
          }
        />
      </FormControl>
      <FormControl
        display='flex'
        alignItems='center'
        justifyContent='space-between'
        mt={1}
      >
        <FormLabel htmlFor='include-empty-counts' mb='0' fontSize='sm'>
          Hide terms with 0 datasets?
        </FormLabel>
        <Switch
          id='include-empty-counts'
          colorScheme='primary'
          isChecked={viewConfig.includeEmptyCounts === false}
          onChange={() =>
            setViewConfig(() => {
              return {
                ...viewConfig,
                includeEmptyCounts: !viewConfig.includeEmptyCounts,
              };
            })
          }
        />
      </FormControl>
    </VStack>
  );
};
