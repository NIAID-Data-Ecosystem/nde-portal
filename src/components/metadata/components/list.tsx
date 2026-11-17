import { List } from '@chakra-ui/react';
import React from 'react';

import { getMetadataColorPalette } from '../helpers';

export const MetadataList = ({ children, ...props }: List.RootProps) => {
  return (
    <List.Root as='ul' listStyleType='disc' gap={2} paddingStart={3} {...props}>
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
    <List.Item
      w='100%'
      _marker={{ color: `${getMetadataColorPalette(property)}.400` }}
    >
      {children}
    </List.Item>
  );
};
