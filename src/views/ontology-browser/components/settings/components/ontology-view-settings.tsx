import { Field, Switch, VStack } from '@chakra-ui/react';
import React from 'react';
import { useLocalStorage } from 'usehooks-ts';

import {
  LocalStorageConfig,
  transformSettingsToLocalStorageConfig,
} from '../helpers';
import { BrowserSettings } from '../index';

/**
 * OntologyViewSettings
 *
 * A settings panel for configuring the ontology browser view.
 * Allows toggling between a condensed view and hiding terms with zero datasets.
 *
 */

// Derive LocalStorageConfig based on the structure of `settings`

export const OntologyViewSettings = ({
  settings: defaultSettings,
}: {
  settings: BrowserSettings;
}) => {
  // Store the view configuration in local storage.
  const [viewSettings, setViewSettings] = useLocalStorage<LocalStorageConfig>(
    'ontology-browser-view',
    () => transformSettingsToLocalStorageConfig(defaultSettings),
    { initializeWithValue: false },
  );

  return (
    <VStack lineHeight='shorter' gap={4}>
      {Object.entries(defaultSettings).map(([key, setting]) => (
        <Field.Root
          key={key}
          display='flex'
          alignItems='center'
          justifyContent='space-between'
          mt={1}
          cursor='pointer'
        >
          <Field.Label htmlFor={`switch-${key}`} mb='0' fontSize='sm'>
            {setting.label}
          </Field.Label>

          <Switch.Root
            id={`switch-${key}`}
            colorPalette='primary'
            checked={viewSettings[key as keyof LocalStorageConfig]}
            onCheckedChange={() =>
              setViewSettings({
                ...viewSettings,
                [key]: !viewSettings[key as keyof LocalStorageConfig],
              })
            }
          >
            <Switch.HiddenInput />
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            <Switch.Label />
          </Switch.Root>
        </Field.Root>
      ))}
    </VStack>
  );
};
