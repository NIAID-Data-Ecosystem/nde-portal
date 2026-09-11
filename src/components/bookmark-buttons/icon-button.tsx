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
    <Tooltip content={label}>
      <IconButton
        aria-label={label}
        onClick={onClick}
        variant='ghost'
        size='xs'
        colorPalette='niaid'
        rounded='full'
        {...props}
      >
        <Icon fill={isFavorited ? 'link' : 'text.placeholder'} p={0.25}>
          {isFavorited ? <FaBookmark /> : <FaRegBookmark />}
        </Icon>
      </IconButton>
    </Tooltip>
  );
};
