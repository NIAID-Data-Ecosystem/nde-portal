import React, { useRef } from 'react';
import {
  ButtonProps,
  CloseButton,
  Flex,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputProps,
  InputRightElement,
  Spinner,
  VisuallyHidden,
} from '@chakra-ui/react';
import { theme } from 'src/theme';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { useDropdownContext } from '..';
import { ReactElement } from 'react-markdown/lib/react-markdown';

/*
[Component Information]: [DropdownInput] is a regular input field with a list of suggestions based on the user typing.
*/

export interface DropdownInputProps {
  id: string;
  ariaLabel: string; // input label for accessibility
  colorScheme?: InputProps['colorScheme'];
  size?: InputProps['size'];
  type: InputProps['type'];
  placeholder?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  isLoading?: boolean;
  getInputValue: (arg: number) => string;
  renderSubmitButton?: (props: ButtonProps) => ReactElement;
  onChange?: (value: string) => void;
  onClose?: () => void;
  onSubmit: (inputValue: string, id: number) => void; // triggered when suggestion item from list is clicked / press enters.
}

export const DropdownInput: React.FC<DropdownInputProps> = ({
  id,
  ariaLabel,
  placeholder,
  isLoading,
  size = 'sm',
  type,
  isDisabled,
  isInvalid,
  renderSubmitButton,
  getInputValue,
  onChange,
  onClose,
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
      flex={1}
      onSubmit={e => {
        e.preventDefault();
        setIsOpen(false);
        onSubmit(inputValue, cursor);
      }}
    >
      {/* Label for accessibility */}
      <VisuallyHidden>
        <label htmlFor={id}>{ariaLabel}</label>
      </VisuallyHidden>

      {/* Search input */}
      <InputGroup size={size} zIndex='dropdown'>
        {/* Loading spinner/Search icon */}
        <InputLeftElement
          pointerEvents='none'
          h='100%'
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
              <Icon as={FaMagnifyingGlass} color='gray.300' />
            )
          }
        />

        <Input
          {...getInputProps({
            id,
            placeholder: placeholder || 'Search',
            tabIndex: 0,
            type,
            pr: renderSubmitButton ? inputRightRef?.current?.clientWidth : 4,
            isDisabled,
            isInvalid,
            onKeyDown: (
              _: React.KeyboardEvent<HTMLInputElement>,
              index: number,
            ) => {
              if (index > -1) {
                const updatedInputValue = getInputValue(index);
                updatedInputValue && setInputValue(updatedInputValue);
              }
            },
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              onChange ? onChange(e.currentTarget.value) : void 0;
            },
          })}
        />
        {/* Optional submit button. */}

        {(renderSubmitButton || onClose) && (
          <InputRightElement
            ref={inputRightRef}
            p={1}
            w='unset'
            h='100%'
            zIndex={theme.zIndices['dropdown']}
          >
            {onClose && inputValue.length > 0 && (
              <CloseButton
                onClick={() => {
                  onClose();
                  setInputValue('');
                }}
                mr={2}
                size='md'
                colorScheme='primary'
                aria-label='Clear search input'
              />
            )}
            {renderSubmitButton &&
              renderSubmitButton({
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
