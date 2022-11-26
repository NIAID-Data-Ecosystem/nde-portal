import React, { useRef } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import {
  Box,
  Button,
  ButtonProps,
  IconButton,
  IconButtonProps,
  Input,
  InputGroup,
  InputProps,
  InputRightElement,
  useOutsideClick,
  VisuallyHidden,
} from 'nde-design-system';
import { UseDisclosureProps } from '@chakra-ui/react';

export const SelectIcon = ({ size, onClick, ...rest }: IconButtonProps) => {
  return (
    <IconButton
      onClick={onClick}
      variant='ghost'
      size={size}
      icon={<FaChevronDown />}
      {...rest}
    />
  );
};

export const SelectWrapper: React.FC<{
  handleOnClickOutside?: () => void;
  isOpen?: boolean;
  onClose: (() => void) | undefined;
  renderList: () => React.ReactNode;
}> = ({ children, handleOnClickOutside, isOpen, onClose, renderList }) => {
  // Handles when the user clicks outside the select dropdown.
  const ref = useRef(null);
  useOutsideClick({
    ref: ref,
    handler: () => {
      handleOnClickOutside && handleOnClickOutside();
      onClose && onClose();
    },
  });

  return (
    <Box ref={ref} position='relative' mr={1}>
      {children}
      {isOpen ? renderList() : <></>}
    </Box>
  );
};

interface SelectProps extends UseDisclosureProps {
  id: string;
  ariaLabel: string;
  handleOnClickOutside?: () => void;
  isDisabled?: boolean;
  renderButton?: (props: IconButtonProps) => React.ReactElement;
  onToggle: () => void;
}

interface SelectWithInputProps extends Omit<InputProps, 'id'>, SelectProps {}

export const SelectWithInput: React.FC<SelectWithInputProps> = ({
  id,
  ariaLabel,
  size = 'md',
  isDisabled,
  children,
  colorScheme,
  handleOnClickOutside,
  renderButton,
  isOpen,
  onToggle,
  onClose,
  onOpen,
  ...props
}) => {
  return (
    <SelectWrapper
      handleOnClickOutside={handleOnClickOutside}
      isOpen={isOpen}
      onClose={onClose}
      renderList={() => children}
    >
      <VisuallyHidden>
        <label htmlFor={id}>{ariaLabel}</label>
      </VisuallyHidden>
      <InputGroup size={size}>
        <Input
          id={id}
          onClick={onOpen} // open dropdown options when clicking in input box.
          isDisabled={isDisabled}
          colorScheme={colorScheme}
          {...props}
        />
        <InputRightElement p={1} w='unset'>
          {renderButton ? (
            renderButton({
              'aria-label': ariaLabel,
              onClick: onToggle,
              colorScheme,
              size,
            })
          ) : (
            <SelectIcon
              onClick={onToggle}
              variant='ghost'
              colorScheme={colorScheme}
              size={size}
              aria-label={ariaLabel}
              icon={<FaChevronDown />}
            />
          )}
        </InputRightElement>
      </InputGroup>
    </SelectWrapper>
  );
};

interface SelectWithButtonProps extends Omit<ButtonProps, 'id'>, SelectProps {}

export const SelectWithButton: React.FC<SelectWithButtonProps> = ({
  children,
  handleOnClickOutside,
  isOpen,
  onToggle,
  onClose,
  name,
  // onOpen,
  ...props
}) => {
  return (
    <SelectWrapper
      handleOnClickOutside={handleOnClickOutside}
      isOpen={isOpen}
      onClose={onClose}
      renderList={() => children}
    >
      <Button rightIcon={<FaChevronDown />} onClick={onToggle} {...props}>
        {name}
      </Button>
    </SelectWrapper>
  );
};
