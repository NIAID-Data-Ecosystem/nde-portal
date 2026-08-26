import {
  ButtonProps,
  CloseButton,
  Flex,
  Icon,
  InputGroup,
  InputProps,
  Spinner,
  Textarea,
  useFieldContext,
  VisuallyHidden,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useRef } from 'react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { ReactElement } from 'react-markdown/lib/react-markdown';

import { useDropdownContext } from '..';

/*
[Component Information]: [DropdownInput] is a regular input field with a list of suggestions based on the user typing.
*/

export interface DropdownInputProps {
  id: string;
  ariaLabel: string; // input label for accessibility
  colorPalette?: InputProps['colorPalette'];
  size?: InputProps['size'];
  type: InputProps['type'];
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
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
  loading,
  size = 'sm',
  type,
  disabled,
  renderSubmitButton,
  getInputValue,
  onChange,
  onClose,
  onSubmit,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Invalid state comes from the enclosing <Field.Root invalid> when there is
  // one; undefined otherwise.
  const field = useFieldContext();
  const invalid = field?.invalid;

  const {
    colorPalette,
    cursor,
    inputValue,
    setInputValue,
    getInputProps,
    setIsOpen,
  } = useDropdownContext();

  const inputRightRef = useRef<HTMLDivElement>(null);
  const [rightElWidth, setRightElWidth] = React.useState(0);

  useEffect(() => {
    const inputRightEl = inputRightRef.current;
    if (!inputRightEl) return;

    if (typeof ResizeObserver === 'undefined') {
      setRightElWidth(inputRightEl.clientWidth);
      return;
    }

    const observer = new ResizeObserver(() => {
      setRightElWidth(inputRightEl!.clientWidth);
    });

    observer.observe(inputRightEl);
    return () => observer.disconnect();
  }, []);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    onSubmit(inputValue, cursor);
  };

  // Ensure correct height on initial render and whenever value changes externally
  useEffect(() => {
    const textareaEl = textareaRef.current;
    if (!textareaEl) return;

    if (typeof ResizeObserver === 'undefined') {
      autoResize();
      return;
    }

    const observer = new ResizeObserver(() => {
      autoResize();
    });

    observer.observe(textareaEl);
    autoResize();

    return () => observer.disconnect();
  }, [autoResize]);

  // Render the start element (spinner or search icon) based on loading state
  const startElement = loading ? (
    <Spinner
      color={`${colorPalette}.500`}
      css={{ '--spinner-track-color': 'colors.gray.200' }}
      size='sm'
    />
  ) : (
    <Icon color='gray.300'>
      <FaMagnifyingGlass />
    </Icon>
  );
  // Render the end element (close button and/or submit button) if either is provided
  const endElement = (renderSubmitButton || onClose) && (
    <>
      {onClose && inputValue.length > 0 && (
        <CloseButton
          onClick={() => {
            onClose();
            setInputValue('');
            resetHeight(); // reset height when input is cleared
          }}
          mr={2}
          size='md'
          colorPalette='primary'
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
    </>
  );

  return (
    <Flex as='form' flex={1} onSubmit={handleSubmit}>
      {/* Label for accessibility */}
      <VisuallyHidden>
        <label htmlFor={id}>{ariaLabel}</label>
      </VisuallyHidden>

      <InputGroup
        zIndex='dropdown'
        alignItems='flex-start'
        border='1px solid'
        borderColor={invalid ? 'error' : 'gray.200'}
        borderRadius='md'
        bg='white'
        startElement={startElement}
        endElement={endElement}
      >
        <Textarea
          ref={textareaRef}
          variant='unstyled'
          resize='none'
          overflow='hidden'
          _placeholder={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          // optional, make growth feel smoother
          onInput={autoResize}
          {...getInputProps({
            id,
            placeholder: placeholder || 'Search',
            tabIndex: 0,
            type,
            flex: 1,
            size,
            mr: renderSubmitButton ? { base: 24, sm: rightElWidth } : 4,
            disabled,
            onKeyDown: (
              e: React.KeyboardEvent<HTMLTextAreaElement>,
              index: number,
            ) => {
              if (index !== null && index > -1) {
                const updatedInputValue = getInputValue(index);
                updatedInputValue && setInputValue(updatedInputValue);
              }
              if (e.key === 'Enter' && !e.shiftKey) {
                handleSubmit(e);
              }
            },
            onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => {
              onChange ? onChange(e.currentTarget.value) : void 0;
            },
          })}
          rows={1}
          maxLength={2048}
          minH='3rem'
          pl='2.5rem'
          py={3}
        />
      </InputGroup>
    </Flex>
  );
};
