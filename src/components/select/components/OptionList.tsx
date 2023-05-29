import { ListProps } from '@chakra-ui/react';
import { UnorderedList } from '@candicecz/test-design-system';

export const OptionsList: React.FC<ListProps> = ({ children, ...props }) => {
  return (
    <UnorderedList
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
    </UnorderedList>
  );
};
