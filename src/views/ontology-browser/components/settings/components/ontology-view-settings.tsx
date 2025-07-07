import React from 'react';
import { FormControl, FormLabel, Switch, VStack } from '@chakra-ui/react';
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
  );

  return (
    <VStack lineHeight='shorter' spacing={4}>
      {Object.entries(defaultSettings).map(([key, setting]) => (
        <FormControl
          key={key}
          display='flex'
          alignItems='center'
          justifyContent='space-between'
          mt={1}
          cursor='pointer'
        >
          <FormLabel htmlFor={`switch-${key}`} mb='0' fontSize='sm'>
            {setting.label}
          </FormLabel>
          <Switch
            id={`switch-${key}`}
            colorScheme='primary'
            isChecked={viewSettings[key as keyof LocalStorageConfig]}
            onChange={() =>
              setViewSettings({
                ...viewSettings,
                [key]: !viewSettings[key as keyof LocalStorageConfig],
              })
            }
          />
        </FormControl>
      ))}
    </VStack>
  );
};
