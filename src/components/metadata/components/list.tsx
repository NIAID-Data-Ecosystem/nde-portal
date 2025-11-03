import { Icon, List, ListRootProps } from '@chakra-ui/react';
import React from 'react';
import { FaCircle } from 'react-icons/fa6';
import { getMetadataTheme } from 'src/components/icon/helpers';

export const MetadataList = ({ children, ...props }: ListRootProps) => {
  return (
    <List.Root
      as='ul'
      ml={0}
      my={1.5}
      display='flex'
      flexDirection='column'
      {...props}
    >
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
    <List.Item mb={3} display='flex' fontSize='xs' lineHeight='short' w='100%'>
      <List.Indicator asChild>
        <Icon
          as={FaCircle}
          m={2}
          mx={1}
          boxSize={1}
          fill={`${getMetadataTheme(property)}.400`}
        />
      </List.Indicator>
      {children}
    </List.Item>
  );
};
