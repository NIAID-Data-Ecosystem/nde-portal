import { Button, ButtonProps, Icon } from '@chakra-ui/react';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa6';

export const BookmarkButton: React.FC<
  ButtonProps & {
    isFavorited: boolean;
  }
> = ({ children, colorScheme = 'primary', isFavorited, onClick, ...rest }) => {
  return (
    <Button
      colorPalette={colorScheme}
      onClick={onClick}
      variant='ghost'
      size='sm'
      {...rest}
    >
      {isFavorited ? (
        <Icon w='inherit' asChild>
          <FaBookmark />
        </Icon>
      ) : (
        <Icon w='inherit' asChild>
          <FaRegBookmark />
        </Icon>
      )}
      {children || (isFavorited ? 'Saved' : 'Save')}
    </Button>
  );
};
