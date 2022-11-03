import React, { useRef } from 'react';
import {
  ButtonProps,
  Flex,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputProps,
  InputRightElement,
  Spinner,
  VisuallyHidden,
} from 'nde-design-system';
import { FaSearch } from 'react-icons/fa';
import { useDropdownContext } from '..';
import { ReactElement } from 'react-markdown/lib/react-markdown';

/*
[Component Information]: [DropdownInput] is a regular input field with a list of suggestions based on the user typing.
*/

const SIZE_CONFIG: any = {
  xs: {
    width: 5,
    h: 1.75,
  },
  sm: {
    width: 5.5,
    h: 2,
  },
  md: {
    width: 5.5,
    h: 2.5,
  },
  lg: {
    width: 6.5,
    h: 3,
  },
};

interface DropdownInputProps {
  ariaLabel: string; // input label for accessibility
  colorScheme?: InputProps['colorScheme'];
  size?: InputProps['size'];
  placeholder?: string;
  isLoading?: boolean;
  getInputValue: (arg: number) => string;
  renderSubmitButton?: (props: ButtonProps) => ReactElement;
  onChange?: (value: string) => void;
  onSubmit: (inputValue: string, id: number) => void; // triggered when suggestion item from list is clicked / press enters.
}

export const DropdownInput: React.FC<DropdownInputProps> = ({
  ariaLabel,
  placeholder,
  isLoading,
  size = 'sm',
  renderSubmitButton,
  getInputValue,
  onChange,
  onSubmit,
}) => {
  const inputRightRef = useRef<HTMLDivElement>(null);
  const {
    colorScheme,
    cursor,
    inputValue,
    setInputValue,
    getInputProps,
    setIsOpen,
  } = useDropdownContext();

  return (
    <Flex
      as='form'
      onSubmit={e => {
        e.preventDefault();
        setIsOpen(false);
        onSubmit(inputValue, cursor);
      }}
    >
      {/* Label for accessibility */}
      <VisuallyHidden>
        <label htmlFor={ariaLabel}>{ariaLabel}</label>
      </VisuallyHidden>

      {/* Search input */}
      <InputGroup size={size}>
        {/* Loading spinner/Search icon */}
        <InputLeftElement
          pointerEvents='none'
          // eslint-disable-next-line react/no-children-prop
          children={
            isLoading ? (
              <Spinner
                color={`${colorScheme}.500`}
                emptyColor='gray.200'
                label='loading'
                size='sm'
              />
            ) : (
              <Icon as={FaSearch} color='gray.300' />
            )
          }
        />

        <Input
          {...getInputProps({
            placeholder: placeholder || 'Search',
            tabIndex: 0,
            pr: inputRightRef?.current?.clientWidth || 4,
            onKeyDown: (
              _: React.KeyboardEvent<HTMLInputElement>,
              index: number,
            ) => {
              if (index > -1) {
                const updatedInputValue = getInputValue(index);
                updatedInputValue && setInputValue(updatedInputValue);
              }
            },
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              onChange ? onChange(e.currentTarget.value) : void 0,
          })}
        />
        {/* Optional submit button. */}
        {renderSubmitButton && (
          <InputRightElement
            ref={inputRightRef}
            p={1}
            w='unset'
            zIndex='sticky'
          >
            {renderSubmitButton({
              type: 'submit',
              w: '100%',
              h: '100%',
              // set padding top and bottom for safari, do not remove.
              py: 0,
            })}
          </InputRightElement>
        )}
      </InputGroup>
    </Flex>
  );
};
