import { Icon, IconButton, IconButtonProps } from '@chakra-ui/react';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa6';
import Tooltip from '../tooltip';

export const BookmarkIconButton: React.FC<
  Omit<IconButtonProps, 'aria-label'> & {
    isFavorited: boolean;
    'aria-label'?: IconButtonProps['aria-label'];
  }
> = ({ isFavorited, onClick, 'aria-label': ariaLabel, ...props }) => {
  const label =
    ariaLabel ||
    (isFavorited
      ? 'Remove bookmark for this resource'
      : 'Bookmark this resource');

  return (
    <Tooltip label={label}>
      <IconButton
        icon={
          isFavorited ? (
            <Icon as={FaBookmark} fill='link.color' />
          ) : (
            <Icon as={FaRegBookmark} fill='page.placeholder' />
          )
        }
        aria-label={label}
        onClick={onClick}
        variant='ghost'
        isRound={true}
        borderRadius='50%'
        size='sm'
        colorScheme='blue'
        {...props}
      />
    </Tooltip>
  );
};
