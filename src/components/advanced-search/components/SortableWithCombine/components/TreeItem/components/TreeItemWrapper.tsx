import React, { useMemo } from 'react';
import { Box, BoxProps } from 'nde-design-system';
import { getUnionTheme } from 'src/components/advanced-search/utils/query-helpers';
import { TreeItemComponentProps } from '..';
import { FlattenedItem } from '../../../types';

interface WrapperProps
  extends Pick<
    TreeItemComponentProps,
    | 'id'
    | 'childCount'
    | 'clone'
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

interface ItemProps extends WrapperProps {
  parentItem: FlattenedItem;
}

const Item = React.memo(
  ({
    id,
    childCount,
    disableInteraction,
    children,
    indentationWidth,
    parentItem,
  }: ItemProps) => {
    const isFirstChild = parentItem.children[0].id === id;

    const isLastChild = useMemo(() => {
      return (
        !childCount &&
        parentItem.children[parentItem.children.length - 1].id === id
      );
    }, [childCount, id, parentItem.children]);

    const styles = useMemo(() => {
      return isLastChild
        ? {
            borderBottom: isLastChild ? '1px solid' : 'none',
            borderBottomColor: isLastChild ? 'gray.200' : 'none',
            pb: disableInteraction ? 0 : 4,
            boxShadow: 'base',
          }
        : {};
    }, [isLastChild, disableInteraction]);

    return (
      <StyledWrapper
        pl={`${indentationWidth}px`}
        pr={`${indentationWidth / 2}px`}
        pt={isFirstChild ? 4 : 0}
        position='relative'
        bg='#fff'
        borderLeftColor={
          parentItem.value.union
            ? `${getUnionTheme(parentItem.value.union).colorScheme}.300`
            : 'transparent'
        }
        {...styles}
      >
        {children}
      </StyledWrapper>
    );
  },
);

export const Wrapper = React.memo((props: WrapperProps) => {
  const { children, getParentItem, parentId } = props;

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
      <Item parentItem={parentItem} {...props} />
    </Wrapper>
  ) : (
    <Item parentItem={parentItem} {...props} />
  );
});
