import { Icon, IconButton, IconButtonProps } from '@chakra-ui/react';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa6';

export const BookmarkIconButton: React.FC<
  Omit<IconButtonProps, 'aria-label'> & {
    isFavorited: boolean;
    'aria-label'?: IconButtonProps['aria-label'];
  }
> = ({ isFavorited, onClick, 'aria-label': ariaLabel, ...rest }) => {
  return (
    <IconButton
      icon={
        isFavorited ? (
          <Icon as={FaBookmark} fill='link.color' />
        ) : (
          <Icon as={FaRegBookmark} fill='page.placeholder' />
        )
      }
      aria-label={
        ariaLabel ||
        (isFavorited ? 'Remove bookmark for this query' : 'Bookmark this query')
      }
      onClick={onClick}
      variant='ghost'
      isRound={true}
      borderRadius='50%'
      size='sm'
      {...rest}
    />
  );
};
