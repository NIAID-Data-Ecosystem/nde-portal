import React from 'react';
import { ListItem, UnorderedList, ListIcon, ListProps } from '@chakra-ui/react';
import { FaCircle } from 'react-icons/fa6';
import { getMetadataTheme } from 'src/components/icon/helpers';

export const MetadataList = ({ children, ...props }: ListProps) => {
  return (
    <UnorderedList
      ml={0}
      my={1.5}
      display='flex'
      flexDirection='column'
      {...props}
    >
      {children}
    </UnorderedList>
  );
};

export const MetadataListItem = ({
  children,
  property,
}: {
  children: React.ReactNode;
  property: string;
}) => {
  return (
    <ListItem mb={3} display='flex' fontSize='xs' lineHeight='short' w='100%'>
      <ListIcon
        as={FaCircle}
        m={2}
        mx={1}
        boxSize={1}
        fill={`${getMetadataTheme(property)}.400`}
      />
      {children}
    </ListItem>
  );
};
