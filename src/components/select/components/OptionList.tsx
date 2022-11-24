import { UnorderedList } from 'nde-design-system';

export const OptionsList: React.FC = ({ children }) => {
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
    >
      {children}
    </UnorderedList>
  );
};
