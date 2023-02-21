import { ListItemProps } from '@chakra-ui/react';
import { Heading, ListItem, Text, useDisclosure } from 'nde-design-system';

interface OptionProps extends Omit<ListItemProps, 'textUnderlineOffset'> {
  name: string;
  description?: string;
  onClick: React.MouseEventHandler<HTMLLIElement>;
}

export const OptionItem: React.FC<OptionProps> = ({
  name,
  description,
  onClick,
  ...props
}) => {
  const { isOpen: showDescription, onClose, onOpen } = useDisclosure();
  return (
    <ListItem
      px={3}
      py={2}
      cursor='pointer'
      _hover={{ bg: 'gray.100' }}
      onClick={onClick}
      onMouseOver={onOpen}
      onMouseLeave={onClose}
      {...props}
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
