import React from 'react';
import { ListProps, UnorderedList } from '@chakra-ui/react';
import { useDropdownContext } from '..';

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
