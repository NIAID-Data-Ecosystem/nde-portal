import React from 'react';
import { ListItem, UnorderedList, ListIcon } from 'nde-design-system';
import { FaCircle } from 'react-icons/fa';
import { getMetadataTheme } from 'src/components/icon/helpers';

export const MetadataList = ({ children }: { children: React.ReactNode }) => {
  return (
    <UnorderedList ml={0} display='flex' flexDirection='column'>
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
    <ListItem my={1.5} display='flex' fontSize='xs' lineHeight='short'>
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
