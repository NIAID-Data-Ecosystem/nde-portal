import React, { useMemo } from 'react';
import { Box, BoxProps } from '@chakra-ui/react';
import { TreeItemComponentProps } from '..';
import { getItemStyles } from './styles';

export interface WrapperProps
  extends Pick<
    TreeItemComponentProps,
    | 'id'
    | 'childCount'
    | 'clone'
    | 'collapsed'
    | 'depth'
    | 'indentationWidth'
    | 'getParentItem'
    | 'ghost'
    | 'parentId'
  > {
  children: React.ReactNode;
  disableInteraction?: boolean;
}

export const StyledWrapper: React.FC<BoxProps> = React.memo(
  ({ children, ...props }) => {
    return (
      <Box
        flex={1}
        border={props.border}
        borderColor={props.borderColor}
        borderLeft='4px solid'
        borderLeftColor={props.borderLeftColor || 'transparent'}
        borderRight='1px solid'
        borderRightColor='gray.200'
        {...props}
      >
        {children}
      </Box>
    );
  },
);

export const Wrapper = React.memo((props: WrapperProps) => {
  const {
    id,
    childCount,
    collapsed,
    disableInteraction,
    indentationWidth,
    children,
    getParentItem,
    parentId,
  } = props;

  // get parent item to wrap the children in a border
  const parentItem = useMemo(() => {
    // don't use parent borders on active items.
    if (!parentId || props.clone || props.ghost) return null;
    return getParentItem && getParentItem(parentId);
  }, [parentId, props.clone, props.ghost, getParentItem]);

  if (!parentItem) {
    return <>{children}</>;
  }

  return parentItem.parentId ? (
    <Wrapper {...props} parentId={parentItem.parentId}>
      <StyledWrapper
        {...getItemStyles({
          id,
          childCount,
          collapsed,
          disableInteraction,
          indentationWidth,
          parentItem,
        })}
      >
        {children}
      </StyledWrapper>
    </Wrapper>
  ) : (
    <StyledWrapper
      {...getItemStyles({
        id,
        childCount,
        collapsed,
        disableInteraction,
        indentationWidth,
        parentItem,
      })}
    >
      {children}
    </StyledWrapper>
  );
});
