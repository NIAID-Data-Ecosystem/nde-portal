import React from 'react';
import { FormControl, FormLabel, Switch, VStack } from '@chakra-ui/react';
import { useLocalStorage } from 'usehooks-ts';
import { LocalStorageConfig } from 'src/views/ontology-browser/types';

/**
 * OntologyViewSettings
 *
 * A settings panel for configuring the ontology browser view.
 * Allows toggling between a condensed view and hiding terms with zero datasets.
 *
 */
export const DEFAULT_ONTOLOGY_BROWSER_SETTINGS = {
  isCondensed: true,
  includeEmptyCounts: true,
  isMenuOpen: false,
};

export const OntologyViewSettings = () => {
  // Store the view configuration in local storage.
  // [isCondensed]: Show only the selected node and its immediate parent/children.
  // [includeEmptyCounts]: Include items without datasets in the view.
  const [viewConfig, setViewConfig] = useLocalStorage<LocalStorageConfig>(
    'ontology-browser-view',
    () => DEFAULT_ONTOLOGY_BROWSER_SETTINGS,
  );

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
