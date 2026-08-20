import { Box, Button, ButtonProps, UseDisclosureProps } from '@chakra-ui/react';
import React, { useRef } from 'react';
import { FaAngleDown } from 'react-icons/fa6';
import { useOnClickOutside } from 'usehooks-ts';

interface SelectWrapperProps
  extends Pick<UseDisclosureProps, 'open' | 'onClose'> {
  /** Called alongside `onClose` when the user clicks outside the select. */
  handleOnClickOutside?: () => void;
  /** The trigger, rendered above the dropdown list. */
  children: React.ReactNode;
  /** The dropdown list, only rendered while `open`. */
  renderList: () => React.ReactNode;
}

export const SelectWrapper = ({
  children,
  handleOnClickOutside,
  open,
  onClose,
  renderList,
}: SelectWrapperProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useOnClickOutside(ref, () => {
    handleOnClickOutside?.();
    onClose?.();
  });

  return (
    <Box ref={ref} position='relative' mr={1}>
      {children}
      {open && renderList()}
    </Box>
  );
};

interface SelectWithButtonProps
  extends ButtonProps,
    Omit<SelectWrapperProps, 'renderList' | 'children'> {
  id: string;
  onToggle: () => void;
  label: string;
}

/** A `SelectWrapper` whose trigger is a button labelled with `name`. */
export const SelectWithButton = ({
  children,
  handleOnClickOutside,
  open,
  onToggle,
  onClose,
  label,
  ...props
}: SelectWithButtonProps) => (
  <SelectWrapper
    handleOnClickOutside={handleOnClickOutside}
    open={open}
    onClose={onClose}
    renderList={() => children}
  >
    <Button onClick={onToggle} {...props}>
      {label}
      <FaAngleDown />
    </Button>
  </SelectWrapper>
);
