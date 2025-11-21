import { Icon, List, ListRootProps } from '@chakra-ui/react';
import React from 'react';
import { FaCircle } from 'react-icons/fa6';
import { getMetadataTheme } from 'src/components/metadata/helpers';

export const MetadataList = ({ children, ...props }: ListRootProps) => {
  return (
    <List.Root as='ul' {...props}>
      {children}
    </List.Root>
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
    <List.Item display='flex' alignItems='flex-start'>
      <List.Indicator color={`${getMetadataTheme(property)}.400`}>
        <Icon as={FaCircle} boxSize={1} />
      </List.Indicator>

      {children}
    </List.Item>
  );
};
