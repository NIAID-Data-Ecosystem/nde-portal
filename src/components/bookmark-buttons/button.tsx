import { Button, ButtonProps, Icon } from '@chakra-ui/react';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa6';

export const BookmarkButton: React.FC<
  ButtonProps & {
    isFavorited: boolean;
  }
> = ({ children, colorPalette = 'primary', isFavorited, onClick, ...rest }) => {
  return (
    <Button
      colorPalette={colorPalette}
      onClick={onClick}
      variant='ghost'
      size='sm'
      {...rest}
    >
      {isFavorited ? (
        <Icon w='inherit'>
          <FaBookmark />
        </Icon>
      ) : (
        <Icon w='inherit'>
          <FaRegBookmark />
        </Icon>
      )}
      {children || (isFavorited ? 'Saved' : 'Save')}
    </Button>
  );
};
