import { Switch, VStack } from '@chakra-ui/react';
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
    <VStack lineHeight='shorter' gap={4} alignItems='stretch' p={1}>
      {/* Switch.Root is itself the <label>, so the text sits in Switch.Label
          (ahead of the control, as v2's FormLabel did) rather than in a
          separate Field.Label pointing at the wrong id. */}
      {Object.entries(defaultSettings).map(([key, setting]) => (
        <Switch.Root
          key={key}
          colorPalette='primary'
          justifyContent='space-between'
          mt={1}
          checked={viewSettings[key as keyof LocalStorageConfig]}
          onCheckedChange={() =>
            setViewSettings({
              ...viewSettings,
              [key]: !viewSettings[key as keyof LocalStorageConfig],
            })
          }
        >
          <Switch.HiddenInput />
          <Switch.Label fontSize='sm' fontWeight='medium'>
            {setting.label}
          </Switch.Label>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
        </Switch.Root>
      ))}
    </VStack>
  );
};
