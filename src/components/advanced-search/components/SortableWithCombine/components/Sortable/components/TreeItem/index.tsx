import React, { forwardRef, HTMLAttributes, useMemo } from 'react';
import { Box, Flex, FlexProps, ListItem, Text } from 'nde-design-system';
import {
  FlattenedItem,
  UnionTypes,
} from 'src/components/advanced-search/components/SortableWithCombine/types';
import { TreeItemActions, UnionButton } from './components';
import { getUnionTheme } from 'src/components/advanced-search/utils/query-helpers';
import { ListItemProps } from '@chakra-ui/react';
import { UniqueIdentifier } from '@dnd-kit/core';
import { ItemContent } from '../../../ItemContent';

export interface TreeItemProps
  extends Omit<HTMLAttributes<HTMLLIElement>, 'id'> {
  childCount?: number;
  clone?: boolean;
  collapsed?: boolean;
  depth: number;
  disableInteraction?: boolean;
  disableSelection?: boolean;
  ghost?: boolean;
  handleProps?: any;
  id: FlattenedItem['id'];
  index: FlattenedItem['index'];
  indicator?: boolean;
  indentationWidth: number;
  parentList: FlattenedItem['parentList'];
  value: FlattenedItem['value'];
  onUpdate?(id: UniqueIdentifier, value: TreeItem['value']): void;
  onCollapse?(id: UniqueIdentifier): void;
  onRemove?(id: UniqueIdentifier): void;
  wrapperRef?(node: HTMLLIElement): void;
}

export const TreeItem = React.memo(
  forwardRef<HTMLDivElement, TreeItemProps>((props, ref) => {
    const {
      id,
      childCount,
      clone,
      collapsed,
      depth,
      disableSelection,
      disableInteraction,
      ghost,
      handleProps,
      indentationWidth,
      index,
      indicator,
      parentList,
      style,
      onCollapse,
      onRemove,
      onUpdate,
      wrapperRef,
      value,
      ...rest
    } = props;
    const { union } = value;

    const styles = useMemo((): Omit<ListItemProps, 'textUnderlineOffset'> => {
      let styles = {
        pointerEvents: disableInteraction ? 'none' : 'inherit',
        sx: {
          ['.tree-item']: {
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            padding: '10px',
            backgroundColor: '#fff',
            color: '#222',
            boxSizing: 'border-box',
          },
        },
      } as Omit<ListItemProps, 'textUnderlineOffset'>;

      if (clone) {
        styles = {
          ...styles,
          display: 'inline-block',
          zIndex: 10000,
          pointerEvents: 'none',
          p: 0,
          pl: '10px',
          pt: '5px',
        };
      }

      if (ghost) {
        if (indicator) {
          return {
            ...styles,
            opacity: 1,
            position: 'relative',
            zIndex: 1,
            mb: '-1px',

            sx: {
              ['.item']: {
                bg: depth === 0 ? 'whiteAlpha.600' : 'whiteAlpha.800',
                py: 3,
              },
              ['.wrapper']: {
                bg: 'transparent',
                border: 'none',
                padding: 0,
              },
              ['.tree-item']: {
                position: 'relative',
                padding: 0,
                height: '8px',
                borderColor: '#2389ff',
                bg: '#56a1f8',

                '&:before': {
                  position: 'absolute',
                  left: '-8px',
                  top: '-4px',
                  display: 'block',
                  content: "''",
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  border: '1px solid #2389ff',
                  bg: '#ffffff',
                },

                '> *': {
                  /* Items are hidden using height and opacity to retain focus */
                  opacity: 0,
                  height: 0,
                },
              },
            },
          };
        }
        return {
          ...styles,
          opacity: !indicator ? 0.5 : 1,
          sx: {
            ['.tree-item']: {
              '> *': {
                bg: 'transparent',
                // boxShadow: 'none',
              },
            },
          },
        };
      }
      return styles;
    }, [clone, depth, disableInteraction, ghost, indicator]);

    return (
      <ListItem ref={wrapperRef} {...styles} {...rest}>
        <Flex
          ref={ref}
          style={style}
          className='item'
          w='100%'
          pl={ghost ? `${indentationWidth * depth}px` : 0}
        >
          <TreeItemWrapper
            indentationWidth={ghost ? 0 : indentationWidth}
            parentList={parentList}
            mb={disableInteraction ? 0 : undefined}
          >
            <Box flex={1}>
              {/* Union dropdown button */}
              {index !== 0 && !clone && !ghost && union && (
                <Box p={1} py={2} maxW='100px'>
                  <UnionButton
                    id={id}
                    colorScheme={
                      union ? getUnionTheme(union).colorScheme : 'primary'
                    }
                    selectedOption={union}
                    setSelectedOption={(id, union) => {
                      onUpdate && onUpdate(id, { union });
                    }}
                  />
                </Box>
              )}

              <Wrapper
                union={union}
                borderRadius='semi'
                overflow={ghost || clone ? 'unset' : 'hidden'}
                mr='-1px'
                mb={disableInteraction ? 0 : undefined}
              >
                <Flex
                  className='tree-item'
                  flex={1}
                  border='1px solid'
                  borderColor='gray.200'
                  borderRightRadius='semi'
                >
                  <TreeItemActions
                    clone={clone}
                    collapsed={collapsed}
                    handleProps={handleProps}
                    id={id}
                    onCollapse={onCollapse}
                    onRemove={onRemove}
                  >
                    <ItemContent
                      index={index}
                      id={id}
                      childCount={childCount}
                      value={value}
                      onUpdate={onUpdate}
                    />
                  </TreeItemActions>

                  {/* number of items when dragging  indicator*/}
                  {clone && childCount && childCount > 1 ? (
                    <Flex
                      as='span'
                      position='absolute'
                      top='-10px'
                      right='-10px'
                      display='flex'
                      alignItems='center'
                      justifyContent='center'
                      width='24px'
                      height='24px'
                      borderRadius='50%'
                      bg='#2389ff'
                      fontSize='0.8rem'
                      fontWeight='600'
                      color='#fff'
                    >
                      {childCount}
                    </Flex>
                  ) : null}
                </Flex>
              </Wrapper>
            </Box>
          </TreeItemWrapper>
        </Flex>
      </ListItem>
    );
  }),
);

interface WrapperProps extends FlexProps {
  children: React.ReactNode;
  union: FlattenedItem['value']['union'];
}

export const Wrapper = React.memo(
  ({ children, union, ...props }: WrapperProps) => {
    return (
      <Flex
        className='wrapper'
        borderLeft='5px solid'
        borderLeftColor={union ? getUnionTheme(union).bg : 'gray.200'}
        flex={1}
        bg='whiteAlpha.800'
        {...props}
      >
        {children}
      </Flex>
    );
  },
);

interface TreeItemWrapperProps extends FlexProps {
  children: React.ReactNode;
  parentIndex?: number;
  parentList: FlattenedItem['parentList'];
  indentationWidth: number;
}

const TreeItemWrapper = React.memo(
  ({
    children,
    parentIndex = 0,
    parentList = [],
    indentationWidth,
    ...props
  }: TreeItemWrapperProps) => {
    const parentItem = parentList[parentIndex];
    if (!parentItem) {
      return <>{children}</>;
    }
    return (
      <Wrapper
        union={parentItem.value.union}
        boxShadow={parentItem.isLastChild ? 'lg' : 'none'}
        pb={
          parentIndex === parentList.length - 1 && parentItem.isLastChild
            ? 2
            : 0
        }
        pl={indentationWidth - 5}
        borderLeftColor={
          parentItem.value.union
            ? `${getUnionTheme(parentItem.value.union).colorScheme}.300`
            : 'transparent'
        }
        borderRight='1px solid #dedede'
        {...props}
      >
        <TreeItemWrapper
          parentList={parentList}
          parentIndex={parentIndex + 1}
          indentationWidth={indentationWidth}
        >
          {children}
        </TreeItemWrapper>
      </Wrapper>
    );
  },
);
