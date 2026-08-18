import React, { useRef } from 'react';
import { useOnClickOutside } from 'usehooks-ts';
import { FaAngleDown } from 'react-icons/fa6';
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
  UseDisclosureProps,
  VisuallyHidden,
} from '@chakra-ui/react';

export const SelectIcon = ({ size, onClick, ...rest }: IconButtonProps) => {
  return (
    <IconButton onClick={onClick} variant='ghost' size={size} {...rest}>
      <FaAngleDown />
    </IconButton>
  );
};

export const SelectWrapper: React.FC<{
  handleOnClickOutside?: () => void;
  isOpen?: boolean;
  onClose: (() => void) | undefined;
  renderList: () => React.ReactNode;
  children: React.ReactNode;
}> = ({ children, handleOnClickOutside, isOpen, onClose, renderList }) => {
  // Handles when the user clicks outside the select dropdown.
  const ref = useRef(null);
  useOnClickOutside(ref, () => {
    handleOnClickOutside && handleOnClickOutside();
    onClose && onClose();
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
  handleOnClickOutside?: () => void;
  isDisabled?: boolean;
  renderButton?: (props: IconButtonProps) => React.ReactElement;
  onToggle: () => void;
}

interface SelectWithInputProps
  extends Omit<InputProps, 'id' | 'onToggle'>,
    SelectProps {
  ariaLabel: string;
}

export const SelectWithInput: React.FC<SelectWithInputProps> = ({
  id,
  ariaLabel,
  size = 'md',
  isDisabled,
  children,
  colorPalette,
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
          disabled={isDisabled}
          colorPalette={colorPalette}
          {...props}
        />
        <InputRightElement p={1} w='unset'>
          {renderButton ? (
            renderButton({
              'aria-label': ariaLabel,
              onClick: onToggle,
              colorPalette,
              size,
            })
          ) : (
            <SelectIcon
              onClick={onToggle}
              variant='ghost'
              colorPalette={colorPalette}
              size={size}
              aria-label={ariaLabel}
              icon={<FaAngleDown />}
            />
          )}
        </InputRightElement>
      </InputGroup>
    </SelectWrapper>
  );
};

interface SelectWithButtonProps
  extends Omit<ButtonProps, 'id' | 'onToggle'>,
    SelectProps {}

export const SelectWithButton: React.FC<SelectWithButtonProps> = ({
  children,
  handleOnClickOutside,
  isOpen,
  onToggle,
  onClose,
  name,
  ...props
}) => {
  return (
    <SelectWrapper
      handleOnClickOutside={handleOnClickOutside}
      isOpen={isOpen}
      onClose={onClose}
      renderList={() => children}
    >
      <Button onClick={onToggle} {...props}>
        {name}
        <FaAngleDown />
      </Button>
    </SelectWrapper>
  );
};
