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

  const sizeConfig: {
    [key in SizeOptions]: { width: string; height: string };
  } = {
    xs: {
      width: '4rem',
      height: '1.25rem',
    },
    sm: {
      width: '5.5rem',
      height: '1.75rem',
    },
    md: {
      width: '5.5rem',
      height: '2.5rem',
    },
    lg: {
      width: '6.5rem',
      height: '3rem',
    },
  };

  const startElement = (
    <Icon color='page.placeholder' boxSize={4} asChild>
      <FaMagnifyingGlass />
    </Icon>
  );

  const endElement = (onClose || handleSubmit) && (
    <Flex p={1} height={sizeConfig[size].height}>
      {onClose && props.value && (
        <CloseButton onClick={onClose} size={size} colorPalette='primary' />
      )}
      {handleSubmit && (
        <Button
          size={size}
          colorPalette={colorPalette}
          loading={loading}
          aria-label='search'
          type='submit'
          display='flex'
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
      position='relative'
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
      >
        <Input
          id={ariaLabel}
          type='text'
          variant='shadow'
          size={size}
          onChange={e => handleChange(e)}
          colorPalette={colorPalette}
          pr={handleSubmit ? sizeConfig[size].width : 0}
          bg={bg}
          height={sizeConfig[size].height}
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
