import { Button, ButtonProps } from '@chakra-ui/react';
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
      size='sm'
      variant='ghost'
      {...rest}
    >
      {isFavorited ? <FaBookmark /> : <FaRegBookmark />}
      {children || (isFavorited ? 'Saved' : 'Save')}
    </Button>
  );
};
