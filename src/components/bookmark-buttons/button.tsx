import { Button, ButtonProps, Icon } from '@chakra-ui/react';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa6';

export const BookmarkButton: React.FC<
  ButtonProps & {
    isFavorited: boolean;
  }
> = ({ children, colorScheme = 'primary', isFavorited, onClick, ...rest }) => {
  return (
    <Button
      colorScheme={colorScheme}
      leftIcon={
        isFavorited ? (
          <Icon as={FaBookmark} w='inherit' />
        ) : (
          <Icon as={FaRegBookmark} w='inherit' />
        )
      }
      onClick={onClick}
      variant='ghost'
      size='sm'
      {...rest}
    >
      {children || (isFavorited ? 'Saved' : 'Save')}
    </Button>
  );
};
