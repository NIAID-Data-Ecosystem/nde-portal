import React from 'react';
import { Switch, VStack, Field } from '@chakra-ui/react';
import { useLocalStorage } from 'usehooks-ts';
import { BrowserSettings } from '../index';
import {
  LocalStorageConfig,
  transformSettingsToLocalStorageConfig,
} from '../helpers';

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
          <Switch
            id={`switch-${key}`}
            colorPalette='primary'
            checked={viewSettings[key as keyof LocalStorageConfig]}
            onValueChange={() =>
              setViewSettings({
                ...viewSettings,
                [key]: !viewSettings[key as keyof LocalStorageConfig],
              })
            }
          />
        </Field.Root>
      ))}
    </VStack>
  );
};
