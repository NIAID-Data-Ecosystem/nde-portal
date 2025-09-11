import React from 'react';
import {
  ButtonProps,
  CloseButton,
  Flex,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputProps,
  Spinner,
  VisuallyHidden,
} from '@chakra-ui/react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { useDropdownContext } from '..';
import { ReactElement } from 'react-markdown/lib/react-markdown';
import { system } from 'src/theme';

/*
[Component Information]: [DropdownInput] is a regular input field with a list of suggestions based on the user typing.
*/
export interface DropdownInputProps
  extends Omit<InputProps, 'onChange' | 'onSubmit'> {
  id: string;
  ariaLabel: string; // input label for accessibility
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

// Extracts size keys from a recipe
function getSizeOptions<T extends { variants: { size: Record<string, any> } }>(
  recipe: T,
) {
  return Object.keys(recipe.variants.size) as (keyof T['variants']['size'])[];
}

// Get the size down for the action button in the input. Ex: button size "sm" for input size "md"
const getButtonSize = (
  size: DropdownInputProps['size'],
  sizeOptions: any[],
) => {
  const inputSizeOptions = getSizeOptions(system.getRecipe('input'));
  const sizeIndex = inputSizeOptions.findIndex(option => option === size);
  if (sizeIndex > 0 && sizeIndex < sizeOptions.length) {
    return sizeOptions[sizeIndex - 1];
  } else if (sizeIndex >= sizeOptions.length) {
    return sizeOptions[sizeOptions.length - 1];
  }
  return sizeOptions[0];
};

/*
  [Component Information]: [DropdownInput] is a regular input field with a list of suggestions based on the user typing.
*/
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
  const [endElementSize, setEndElementSize] = React.useState({
    width: 0,
    height: 0,
  });
  const inputEndElement = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!inputEndElement.current) return;

    const handleResize = () => {
      if (inputEndElement.current) {
        setEndElementSize({
          width: inputEndElement.current.clientWidth,
          height: inputEndElement.current.clientHeight,
        });
      }
    };
    handleResize();

    const observer = new ResizeObserver(handleResize);

    observer.observe(inputEndElement.current);

    return () => {
      observer.disconnect();
    };
  }, [renderSubmitButton, onClose, size, isLoading]);

  const {
    colorPalette,
    cursor,
    inputValue,
    setInputValue,
    getInputProps,
    setIsOpen,
  } = useDropdownContext();

  const endElement = (onClose || renderSubmitButton) && (
    <HStack
      ref={inputEndElement}
      gap={1}
      px={2}
      py={1}
      alignItems='center'
      height='100%'
    >
      {onClose && inputValue ? (
        <CloseButton
          colorPalette={colorPalette}
          size={size}
          h='100%'
          onClick={() => {
            onClose();
            setInputValue('');
          }}
          aria-label='Clear search input'
        />
      ) : undefined}
      {/* Optional submit button. */}
      {renderSubmitButton &&
        renderSubmitButton({
          type: 'submit',
          size: size,
          h: '100%',
          py: 0,
          colorPalette,
        })}
    </HStack>
  );

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
      <InputGroup
        w='full'
        zIndex='dropdown'
        startElement={
          isLoading ? (
            <Spinner
              color={`${colorPalette}.500`}
              size={getButtonSize(
                size,
                getSizeOptions(system.getRecipe('spinner')),
              )}
            />
          ) : (
            <Icon as={FaMagnifyingGlass} color='gray.300' />
          )
        }
        endElementProps={{ px: 0 }}
        endElement={endElement}
        // Chakra only applies endOffset if there is an end element.
        endOffset={`var(--input-height) + ${endElementSize.width}px`}
      >
        <Input
          {...getInputProps({
            id,
            placeholder: placeholder || 'Search',
            tabIndex: 0,
            flex: 1,
            size,
            type,
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
      </InputGroup>
    </Flex>
  );
};
