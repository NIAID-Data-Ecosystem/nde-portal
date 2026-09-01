import React from 'react';
import {
  Button,
  ButtonProps,
  Flex,
  FlexProps,
  Icon,
  Popover,
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

export const DEFAULT_ONTOLOGY_BROWSER_SETTINGS = {
  // [isCondensed]: Show only the selected node and its immediate parent/children.
  ['isCondensed']: {
    label: 'Enable condensed view?',
    value: true,
  },
  // [hideEmptyCounts]: Include items without datasets in the view.
  ['hideEmptyCounts']: {
    label: 'Hide terms with 0 datasets?',
    value: true,
  },
} as const;

export type BrowserSettings = {
  [key in keyof typeof DEFAULT_ONTOLOGY_BROWSER_SETTINGS]: {
    label: string;
    value: boolean;
  };
};

export type OntologyPopoverProps = FlexProps & {
  label: string;
  buttonProps: ButtonProps;
  description?: string;
  settings?: BrowserSettings;
};

export const OntologyBrowserSettings: React.FC<OntologyPopoverProps> = ({
  buttonProps,
  description,
  label,
  settings = DEFAULT_ONTOLOGY_BROWSER_SETTINGS,
  ...rest
}) => {
  return (
    <Flex flex={{ base: 1, sm: 'unset' }} height={{ base: 'unset' }} {...rest}>
      <Popover.Root>
        <Popover.Trigger asChild>
          <Button
            colorPalette='primary'
            flex={1}
            fontWeight='medium'
            fontSize='inherit'
            lineHeight='shorter'
            px={4}
            variant='outline'
            justifyContent='space-between'
            {...buttonProps}
          >
            <Icon color='inherit'>
              <FaGear />
            </Icon>
            {buttonProps?.children || label}
            <FaCaretDown />
          </Button>
        </Popover.Trigger>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow />
            <Popover.CloseTrigger />
            <Popover.Title>
              <Text fontWeight='semibold' lineHeight='normal' my={1}>
                {label}
              </Text>
              {description && (
                <Text
                  color='text.placeholder'
                  fontSize='sm'
                  fontStyle='italic'
                  fontWeight='normal'
                  lineHeight='short'
                  mt={1.5}
                >
                  {description}
                </Text>
              )}
            </Popover.Title>
            <Popover.Body>
              <ScrollContainer maxHeight='300px'>
                <OntologyViewSettings settings={settings} />
              </ScrollContainer>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Root>
    </Flex>
  );
};
