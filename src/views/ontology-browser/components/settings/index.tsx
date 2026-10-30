import {
  Button,
  ButtonProps,
  CloseButton,
  Flex,
  FlexProps,
  Icon,
  Popover,
  Portal,
  Separator,
  Text,
} from '@chakra-ui/react';
import React from 'react';
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
            variant='outline'
            bg='white'
            {...buttonProps}
          >
            <Icon color='inherit'>
              <FaGear />
            </Icon>
            {buttonProps?.children || label}
            <FaCaretDown />
          </Button>
        </Popover.Trigger>
        <Portal>
          <Popover.Positioner>
            <Popover.Content>
              <Popover.Arrow>
                <Popover.ArrowTip />
              </Popover.Arrow>
              <Popover.Header pb={2}>
                <Flex alignItems='center'>
                  <Flex flexDirection='column' flex={1}>
                    <Popover.Title
                      fontWeight='semibold'
                      lineHeight='normal'
                      my={1}
                    >
                      {label}
                    </Popover.Title>
                    {description && (
                      <Text
                        color='text.placeholder'
                        fontSize='sm'
                        fontStyle='italic'
                        fontWeight='normal'
                        lineHeight='moderate'
                        mt={1.5}
                      >
                        {description}
                      </Text>
                    )}
                  </Flex>
                  {/* A bare CloseTrigger renders an empty, unlabelled button. */}
                  <Popover.CloseTrigger asChild>
                    <CloseButton size='xs' />
                  </Popover.CloseTrigger>
                </Flex>
              </Popover.Header>
              <Separator />
              <Popover.Body>
                <ScrollContainer maxHeight='300px'>
                  <OntologyViewSettings settings={settings} />
                </ScrollContainer>
              </Popover.Body>
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover.Root>
    </Flex>
  );
};
