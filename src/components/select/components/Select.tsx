import React, { useRef } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import {
  Box,
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

interface SelectWithInputProps extends InputProps, UseDisclosureProps {
  id: string;
  ariaLabel: string;
  handleOnClickOutside?: () => void;
  isDisabled?: boolean;
  renderButton?: (props: IconButtonProps) => React.ReactElement;
  onToggle: () => void;
}

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
      <>
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

        {isOpen ? children : <></>}
      </>
    </Box>
  );
};
