import React, { useEffect, useMemo } from 'react';
import { UnorderedList } from '@candicecz/test-design-system';
import { useDropdownContext } from '..';
import { ListProps } from '@chakra-ui/react';

interface DropdownListProps extends ListProps {}

// List wrapper that open when an input is entered.
export const DropdownList: React.FC<DropdownListProps> = ({
  children,
  ...props
}) => {
  const { isOpen } = useDropdownContext();

  if (!isOpen || !React.Children.count(children)) {
    return <></>;
  }

  return (
    <UnorderedList ml={0} {...props}>
      {children}
    </UnorderedList>
  );
};
