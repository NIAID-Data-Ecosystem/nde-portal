import React, { useRef, useCallback, useEffect } from 'react';
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
  Textarea,
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    colorScheme,
    cursor,
    inputValue,
    setInputValue,
    getInputProps,
    setIsOpen,
  } = useDropdownContext();

  // Auto-resize logic: reset to 3rem, then expand to scrollHeight
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;

    // reset height to shrink if text is deleted
    el.style.height = 'auto';

    // compute line height
    const lineHeight = parseFloat(
      window.getComputedStyle(el).lineHeight || '20',
    );
    const maxHeight = lineHeight * 4; // cap at 4 rows

    // adjust height up to max
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;

    // show scroll if exceeding max
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, []);

  // reset height to base size (used when clearing input)
  const resetHeight = useCallback(() => {
    const el = textareaRef.current;
    if (el) el.style.height = '3rem';
  }, []);

  // Ensure correct height on initial render and whenever value changes externally
  useEffect(() => {
    autoResize();
  }, [inputValue, autoResize]);

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
      {/* Loading spinner/Search icon */}
      <InputGroup
        size={size}
        zIndex='dropdown'
        alignItems='flex-start'
        border='1px solid'
        borderColor='gray.200'
        borderRadius='md'
        bg='white'
      >
        <InputLeftElement
          pointerEvents='none'
          my={1}
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

        <Textarea
          ref={textareaRef}
          variant='unstyled'
          resize='none'
          overflow='hidden'
          // optional, make growth feel smoother
          onInput={autoResize}
          {...getInputProps({
            id,
            placeholder: placeholder || 'Search',
            tabIndex: 0,
            type,
            flex: 1,
            size,
            mr: renderSubmitButton ? inputRightRef?.current?.clientWidth : 4,
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
          rows={1}
          maxLength={2048}
          minH='3rem'
          pl='2.5rem'
          py={3}
        />

        {/* Optional submit button. */}
        {(renderSubmitButton || onClose) && (
          <InputRightElement
            ref={inputRightRef}
            p={1}
            w='unset'
            h='100%'
            zIndex={theme.zIndices['dropdown']}
            alignItems='flex-start'
          >
            {onClose && inputValue.length > 0 && (
              <CloseButton
                onClick={() => {
                  onClose();
                  setInputValue('');
                  resetHeight(); // reset height when input is cleared
                }}
                mr={2}
                size='md'
                colorScheme='primary'
                aria-label='Clear search input'
                my={1}
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
