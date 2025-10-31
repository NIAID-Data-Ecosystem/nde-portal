import React from 'react';
import { Tooltip, TooltipProps } from 'src/components/tooltip';

export interface TagWithTooltipProps extends Omit<TooltipProps, 'content'> {
  content?: TooltipProps['content'];
}

export const TagTooltip = ({
  children,
  content,
  ...props
}: TagWithTooltipProps) => {
  // If there is no tooltip content, just return the children directly.
  if (!content) {
    return children;
  }
  return (
    <Tooltip content={content} showArrow {...props}>
      {children}
    </Tooltip>
  );
};
