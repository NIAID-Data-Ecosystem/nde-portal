import {
  Button,
  ButtonProps,
  CloseButton,
  Flex,
  FlexProps,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputProps,
  VisuallyHidden,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { FaMagnifyingGlass, FaXmark } from 'react-icons/fa6';

type SizeOptions = 'xs' | 'sm' | 'md' | 'lg';

export interface SearchInputProps extends Omit<InputProps, 'size'> {
  // Function fired when input is changed.
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose?: () => void;
  // Function fired button is submitted.
  handleSubmit?: (e: React.FormEvent<HTMLDivElement>) => void;
  // Variant for button
  buttonVariant?: ButtonProps['variant'];
  // Color palette for button
  // Should input resize responsively
  isResponsive?: boolean;
  // Button reflects loading state
  loading?: boolean;
  // For accessibility, we need to link label and input with identical for and id field.
  ariaLabel: string;
  size?: SizeOptions;
  flexProps?: FlexProps;
}

/**
 * Searchbar input field
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  size = 'md',
  bg = 'white',
  onClose,
  flexProps,
  handleChange,
  handleSubmit,
  isResponsive = true,
  buttonVariant,
  ariaLabel,
  colorPalette,
  loading,
  ...props
}) => {
  const [showInput, setShowInput] = useState(false);

  const startElement = (
    <Icon color='text.placeholder' boxSize={4}>
      <FaMagnifyingGlass />
    </Icon>
  );

  const endElement = (onClose || handleSubmit) && (
    <Flex py={1} alignItems='center' gap={1} height='100%'>
      {onClose && props.value && (
        <CloseButton onClick={onClose} colorPalette='primary' height='100%' />
      )}
      {handleSubmit && (
        <Button
          colorPalette={colorPalette}
          loading={loading}
          aria-label='search'
          type='submit'
          display='flex'
          height='100%'
          // set padding top and bottom for safari, do not remove.
          py={0}
        >
          Search
        </Button>
      )}
    </Flex>
  );

  return (
    <Flex
      as='form'
      alignItems='center'
      onSubmit={e => {
        e.preventDefault();
        handleSubmit && handleSubmit(e);
      }}
      {...flexProps}
    >
      <VisuallyHidden>
        <label htmlFor={ariaLabel}>{ariaLabel}</label>
      </VisuallyHidden>
      <InputGroup
        // If in 'responsive mode' we use a button to toggle the visibility of the input in mobile size.
        visibility={[
          isResponsive && !showInput ? 'hidden' : 'visible',
          'visible',
        ]}
        startElement={startElement}
        endElement={endElement}
        colorPalette={colorPalette}
      >
        <Input
          id={ariaLabel}
          type='text'
          variant='outline'
          size={size}
          onChange={e => handleChange(e)}
          colorPalette={colorPalette}
          bg={bg}
          {...props}
        />
      </InputGroup>
      {/* Button that toggles out input if in responsive mode. */}
      {isResponsive && (
        <IconButton
          display={['flex', 'none']}
          size={size}
          top={0}
          right={0}
          ml={4}
          aria-label='Open search input'
          colorPalette={colorPalette}
          variant={buttonVariant || 'outline'}
          onClick={() => setShowInput(!showInput)}
          data-active={showInput}
        >
          {showInput ? <FaXmark /> : <FaMagnifyingGlass />}
        </IconButton>
      )}
    </Flex>
  );
};
