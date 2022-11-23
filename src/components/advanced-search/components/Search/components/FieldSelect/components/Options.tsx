import {
  Heading,
  ListItem,
  Text,
  UnorderedList,
  useDisclosure,
} from 'nde-design-system';

export const OptionsList: React.FC = ({ children }) => {
  return (
    <UnorderedList
      maxH='200px'
      overflowX='hidden'
      overflowY='auto'
      boxShadow='base'
      borderRadius='semi'
      w='100%'
      ml={0}
      py={2}
    >
      {children}
    </UnorderedList>
  );
};

interface OptionProps {
  name: string;
  description?: string;
  onClick: React.MouseEventHandler<HTMLLIElement>;
}

export const OptionItem: React.FC<OptionProps> = ({
  name,
  description,
  onClick,
}) => {
  const { isOpen: showDescription, onClose, onOpen } = useDisclosure();
  return (
    <ListItem
      px={2}
      py={2}
      cursor='pointer'
      _hover={{ bg: 'gray.100' }}
      onClick={onClick}
      onMouseOver={onOpen}
      onMouseLeave={onClose}
    >
      <Heading
        size='xs'
        fontWeight='medium'
        lineHeight='short'
        textTransform='capitalize'
      >
        {name}
      </Heading>
      {showDescription && description && (
        <Text
          fontSize='xs'
          lineHeight='shorter'
          fontWeight='medium'
          color='gray.600'
          opacity={showDescription ? 1 : 0}
          transition='0.2s linear'
          maxW={350}
          noOfLines={2} //truncate after 2 lines
        >
          {description.charAt(0).toUpperCase() + description.slice(1)}
        </Text>
      )}
    </ListItem>
  );
};
