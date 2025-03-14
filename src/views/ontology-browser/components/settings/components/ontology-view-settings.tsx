import React from 'react';
import { FormControl, FormLabel, Switch, VStack } from '@chakra-ui/react';
import { useLocalStorage } from 'usehooks-ts';
import { BrowserSettings } from '..';

/**
 * OntologyViewSettings
 *
 * A settings panel for configuring the ontology browser view.
 * Allows toggling between a condensed view and hiding terms with zero datasets.
 *
 */

// Derive LocalStorageConfig based on the structure of `settings`
export type LocalStorageConfig = {
  [key in keyof BrowserSettings]: boolean;
};

export const OntologyViewSettings = ({
  settings,
}: {
  settings: BrowserSettings;
}) => {
  // Store the view configuration in local storage.
  const [viewConfig, setViewConfig] = useLocalStorage<LocalStorageConfig>(
    'ontology-browser-view',
    () => transformSettingsToLocalStorageConfig(settings),
  );
  return (
    <VStack lineHeight='shorter' spacing={4}>
      {Object.entries(settings).map(([key, setting]) => (
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
            isChecked={viewConfig[key as keyof LocalStorageConfig]}
            onChange={() =>
              setViewConfig({
                ...viewConfig,
                [key]: !viewConfig[key as keyof LocalStorageConfig],
              })
            }
          />
        </FormControl>
      ))}
    </VStack>
  );
};

export const transformSettingsToLocalStorageConfig = (
  settings: BrowserSettings,
): LocalStorageConfig =>
  Object.fromEntries(
    Object.entries(settings).map(([key, setting]) => [key, setting.value]),
  ) as LocalStorageConfig;
