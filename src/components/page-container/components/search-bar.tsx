import React from 'react';
import {PageContent} from './content';
import {SearchInput} from 'nde-design-system';

export const SearchBar = ({...props}) => {
  return (
    <PageContent bg='white' minH={'unset'}>
      {/* Search bar */}
      {/* [TO DO]:
          [] handle change / handleSubmit
      */}
      <SearchInput
        ariaLabel='Search for datasets'
        colorScheme='primary'
        handleChange={() => {}}
        handleSubmit={() => {}}
        w='100%'
        defaultValue={''}
        {...props}
      />
    </PageContent>
  );
};
