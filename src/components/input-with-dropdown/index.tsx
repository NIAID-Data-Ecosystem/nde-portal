import React from 'react';
import { ListItemProps } from '@chakra-ui/react';
import { InputProps } from 'nde-design-system';
import { useDropdownInput } from './hooks/useDropdownInput';

interface DropdownListItemProps extends ListItemProps {
  index: number;
  value: string | number | readonly string[];
  isSelected: boolean;
}

export interface ContextProps {
  colorScheme: string;
  inputValue: string;
  cursor: number;
  cursorMax: number;
  isOpen: boolean;
  setCursor: React.Dispatch<React.SetStateAction<number>>;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  getInputProps: (props: InputProps) => InputProps;
  getListItemProps: (
    props: DropdownListItemProps,
  ) => Omit<ListItemProps, 'textUnderlineOffset'>;
}

export const defaultContext: ContextProps = {
  colorScheme: 'primary',
  cursor: -1,
  cursorMax: 0,
  inputValue: '',
  isOpen: false,
  setCursor: () => {},
  setInputValue: () => {},
  setIsOpen: () => {},
  getInputProps: () => ({}),
  getListItemProps: () => ({}),
};

const DropdownInputContext = React.createContext({
  ...defaultContext,
});
DropdownInputContext.displayName = 'DropdownInputContext';

// [Context Provider]: Input with a keyboardable dropdown list.
export const InputWithDropdown: React.FC<{
  inputValue: string;
  cursorMax: number;
  colorScheme?: string;
}> = ({ children, inputValue, colorScheme = 'primary', cursorMax }) => {
  const dropdownInput = useDropdownInput({
    colorScheme,
    cursorMax,
    inputValue: inputValue || defaultContext.inputValue,
    cursor: defaultContext.cursor,
    isOpen: defaultContext.isOpen,
  });

  const context = {
    cursorMax,
    colorScheme,
    ...dropdownInput,
  };

  return (
    <DropdownInputContext.Provider value={context}>
      {children}
    </DropdownInputContext.Provider>
  );
};

export const useDropdownContext = () => {
  const context = React.useContext(DropdownInputContext);
  if (context === undefined) {
    throw new Error(
      'useDropdownContext must be wrapped with <InputWithDropdown/>',
    );
  }
  return context;
};

export * from './components';
export * from './hooks/useDropdownInput';
