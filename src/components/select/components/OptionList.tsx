import { ListProps, List } from '@chakra-ui/react';

export const OptionsList: React.FC<ListProps> = ({ children, ...props }) => {
  return (
    <List.Root
      as='ul'
      position='absolute'
      maxH='300px'
      overflowX='hidden'
      overflowY='auto'
      boxShadow='base'
      borderRadius='semi'
      w='100%'
      ml={0}
      py={2}
      bg='white'
      zIndex='dropdown'
      {...props}
    >
      {children}
    </List.Root>
  );
};
