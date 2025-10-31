import { TagRootProps } from '@chakra-ui/react';
import React from 'react';

import {
  BaseTag,
  BaseTagWithLink,
  BaseTagWithLinkProps,
} from './components/tags';
import { TagTooltip, TagWithTooltipProps } from './components/tooltip';

export interface TagProps extends TagRootProps {
  leftIcon?: React.ReactNode;
  tooltipProps?: TagWithTooltipProps;
  linkProps?: BaseTagWithLinkProps['linkProps'];
}

//  A tag component that includes an optional tooltip and handles optional links
export const Tag = ({
  borderRadius = 'full',
  size = 'md',
  variant = 'surface',
  linkProps,
  tooltipProps,
  ...props
}: TagProps) => {
  return (
    <TagTooltip {...tooltipProps}>
      {linkProps?.href ? (
        <BaseTagWithLink
          borderRadius={borderRadius}
          size={size}
          variant={variant}
          linkProps={linkProps}
          {...props}
        />
      ) : (
        <BaseTag
          borderRadius={borderRadius}
          size={size}
          variant={variant}
          {...props}
        />
      )}
    </TagTooltip>
  );
};
