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
    ariaLabel || (isFavorited ? 'Remove from saved' : 'Save this resource');

  return (
    <Tooltip label={label}>
      <IconButton
        aria-label={label}
        onClick={onClick}
        variant='ghost'
        isRound={true}
        borderRadius='50%'
        size='sm'
        colorPalette='blue'
        {...props}
      >
        {isFavorited ? (
          <Icon fill='link.color' asChild>
            <FaBookmark />
          </Icon>
        ) : (
          <Icon fill='page.placeholder' asChild>
            <FaRegBookmark />
          </Icon>
        )}
      </IconButton>
    </Tooltip>
  );
};
