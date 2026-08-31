import {
  ButtonProps,
  CloseButton,
  Flex,
  Group,
  HStack,
  Icon,
  IconProps,
  InputProps,
  Spinner,
  SpinnerProps,
  Textarea,
  useFieldContext,
  VisuallyHidden,
} from '@chakra-ui/react';
import React from 'react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { ReactElement } from 'react-markdown/lib/react-markdown';
import {
  DEFAULT_INPUT_SIZE,
  INPUT_HEIGHTS,
} from 'src/theme/recipes/input.recipe';

import { useDropdownContext } from '..';

/*
[Component Information]: [DropdownInput] is a regular input field with a list of suggestions based on the user typing.
*/

/*
`--input-height` is declared by the `input` recipe's size variants only; the
`textarea` recipe never sets it. Since InputGroup derives the start/end element
padding from it (`ps: calc(var(--input-height) - startOffset)`), it has to be
declared on the group so the Textarea inherits it. Same approach Chakra's own
combobox/tags-input recipes take. The scale itself lives with the recipe that
publishes the var, so there is only one place to change an input's height.
*/
const isInputSize = (size: unknown): size is keyof typeof INPUT_HEIGHTS =>
  typeof size === 'string' && size in INPUT_HEIGHTS;

// `size` is a ConditionalValue, so responsive objects fall back to the default.
const getInputHeight = (size: DropdownInputProps['size']) =>
  INPUT_HEIGHTS[isInputSize(size) ? size : DEFAULT_INPUT_SIZE];

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
  size = DEFAULT_INPUT_SIZE,
  type,
  disabled,
  renderSubmitButton,
  getInputValue,
  onChange,
  onClose,
  onSubmit,
}) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    onSubmit(inputValue, cursor);
  };

  // Render the start element (spinner or search icon) based on loading state
  const startElement = loading ? (
    <Spinner
      color={`${colorPalette}.500`}
      css={{ '--spinner-track-color': 'colors.gray.200' }}
      size={size as SpinnerProps['size']}
    />
  ) : (
    <Icon color='gray.300' pl={1} size={size as IconProps['size']}>
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
          }}
          size={size}
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
    </>
  );

  return (
    <Flex as='form' flex={1} onSubmit={handleSubmit}>
      {/* Label for accessibility */}
      <VisuallyHidden>
        <label htmlFor={id}>{ariaLabel}</label>
      </VisuallyHidden>
      <Group
        w='100%'
        gap={1}
        bg='white'
        alignItems='center'
        border='1px solid'
        borderColor={invalid ? 'error' : 'gray.200'}
        borderRadius='md'
        css={{ '--input-height': getInputHeight(size) }}
        px={1}
        zIndex='popover'
      >
        <Flex alignItems='center' height='100%'>
          {startElement}
        </Flex>
        <Textarea
          resize='none'
          autoresize
          maxLength={2048}
          rows={1}
          border='none'
          outline='none'
          boxShadow='none'
          /*
          `autoresize` grows the field to its scrollHeight, and a textarea's
          placeholder counts towards scrollHeight. Left to wrap, a placeholder
          that is too long for a narrow (mobile) field measures as two rows and
          renders the input taller there than on desktop, so clip it to one
          line instead.
          */
          _placeholder={{
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          }}
          // Cap growth at 4 rows; `autoresize` respects max-height and switches
          // to a scrollbar past it. Includes the field's 1rem of vertical
          // padding, since the textarea is border-box.
          maxH='calc(4lh + 1rem)'
          {...getInputProps({
            id,
            placeholder: placeholder || 'Search',
            tabIndex: 0,
            type,
            flex: 1,
            size,
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
        />
        <HStack height={'var(--input-height)'} my={0.5} alignSelf='flex-end'>
          {endElement}
        </HStack>
      </Group>
    </Flex>
  );
};
