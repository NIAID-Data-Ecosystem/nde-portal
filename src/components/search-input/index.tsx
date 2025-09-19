import {
  Button,
  ButtonProps,
  CloseButton,
  Flex,
  FlexProps,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputProps,
  VisuallyHidden,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { FaMagnifyingGlass, FaXmark } from 'react-icons/fa6';

export interface SearchInputProps extends Omit<InputProps, 'size'> {
  // Function fired when input is changed.
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose?: () => void;
  // Function fired button is submitted.
  handleSubmit?: (e: React.FormEvent<HTMLDivElement>) => void;
  // Should input resize responsively
  isResponsive?: boolean;
  // Button reflects loading state
  isLoading?: boolean;
  // For accessibility, we need to link label and input with identical for and id field.
  ariaLabel: string;
  size?: ButtonProps['size'];
  // Props for submit button
  submitButtonProps?: ButtonProps;
  // Props for responsive button
  responsiveButtonProps?: ButtonProps;
  wrapperProps?: FlexProps;
}

/**
 * Searchbar input field
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  size = 'md',
  bg = 'white',
  onClose,
  handleChange,
  handleSubmit,
  isResponsive = true,
  ariaLabel,
  colorPalette,
  isLoading,
  submitButtonProps,
  responsiveButtonProps,
  wrapperProps,
  ...props
}) => {
  const [showInput, setShowInput] = useState(false);

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
  }, [handleSubmit, onClose, size, isLoading]);

  const startElement = (
    <Icon as={FaMagnifyingGlass} color='page.placeholder' boxSize={4} />
  );

  const endElement = (
    <HStack
      ref={inputEndElement}
      gap={1}
      px={2}
      py={1}
      alignItems='center'
      height='100%'
    >
      {(onClose || handleSubmit) && (
        <>
          {onClose && props.value && (
            <CloseButton
              colorPalette={colorPalette}
              size={size}
              h='100%'
              onClick={() => {
                onClose();
              }}
              aria-label='Clear search input'
            />
          )}
          {handleSubmit && (
            <Button
              size={size}
              colorPalette={colorPalette}
              h='100%'
              loading={isLoading}
              aria-label='search'
              type='submit'
              display='flex'
              // set padding top and bottom for safari, do not remove.
              py={0}
              {...submitButtonProps}
            >
              Search
            </Button>
          )}
        </>
      )}
    </HStack>
  );

  return (
    <Flex
      as='form'
      onSubmit={e => {
        e.preventDefault();
        handleSubmit && handleSubmit(e);
      }}
      {...wrapperProps}
    >
      <VisuallyHidden>
        <label htmlFor={ariaLabel}>{ariaLabel}</label>
      </VisuallyHidden>

      <InputGroup
        startElement={startElement}
        endElement={endElement}
        endElementProps={{ px: 0 }}
        endOffset={`var(--input-height) + ${endElementSize.width}px`}
        // If in 'responsive mode' we use a button to toggle the visibility of the input in mobile size.
        visibility={[
          isResponsive && !showInput ? 'hidden' : 'visible',
          'visible',
        ]}
      >
        <Input
          id={ariaLabel}
          type='text'
          variant='outline'
          size={size}
          onChange={e => handleChange(e)}
          colorPalette={colorPalette}
          {...props}
        />

        {/* If handle submit function is provided we show a button. */}
      </InputGroup>

      {/* Button that toggles out input if in responsive mode. */}
      {isResponsive && (
        <IconButton
          display={['flex', 'none']}
          ml={1}
          size={size}
          aria-label='Open search input'
          colorPalette={colorPalette}
          variant='outline'
          onClick={() => setShowInput(!showInput)}
          {...responsiveButtonProps}
        >
          {showInput ? <Icon as={FaXmark} /> : <Icon as={FaMagnifyingGlass} />}
        </IconButton>
      )}
    </Flex>
  );
};
