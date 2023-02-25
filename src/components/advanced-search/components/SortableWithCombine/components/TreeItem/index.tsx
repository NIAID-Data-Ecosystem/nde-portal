import React, { forwardRef, HTMLAttributes, useMemo, useState } from 'react';
import { Box, Flex, ListItem } from 'nde-design-system';
import { FlattenedItem } from '../../types';
import { getStyles } from './styles';
import { ListItemProps } from '@chakra-ui/react';
import { StyledWrapper, Wrapper } from './components/TreeItemWrapper';
import { getUnionTheme } from 'src/components/advanced-search/utils/query-helpers';
import { UnionButton } from './components/UnionButton';
import { TreeItemActions } from './components/TreeItemActions';
import { EditableContent } from './components/EditableContent';
import { TreeItemContent } from './components/TreeItemContent';
import {
  SearchTypesConfigProps,
  SEARCH_TYPES_CONFIG,
} from 'src/components/advanced-search/components/Search/search-types-config';

export interface TreeItemComponentProps
  extends Omit<HTMLAttributes<HTMLLIElement>, 'id'> {
  childCount?: number;
  clone?: boolean;
  depth: number;
  collapsed?: boolean;
  disableInteraction?: boolean;
  disableSelection?: boolean;
  ghost?: boolean;
  handleProps?: any;
  id: FlattenedItem['id'];
  index: FlattenedItem['index'];
  indicator?: boolean;
  indentationWidth: number;
  parentId: FlattenedItem['parentId'];

  value: FlattenedItem['value'];
  getParentItem: (id: FlattenedItem['parentId']) => FlattenedItem | undefined;
  onUpdate?(
    id: FlattenedItem['id'],
    value: Partial<FlattenedItem['value']>,
  ): void;
  onCollapse?(id: FlattenedItem['id']): void;
  onRemove?(id: FlattenedItem['id']): void;
  wrapperRef?(node: HTMLLIElement): void;
}

export const TreeItem = React.memo(
  forwardRef<HTMLDivElement, TreeItemComponentProps>((props, ref) => {
    const {
      id,
      childCount,
      clone,
      collapsed,
      depth,
      disableSelection,
      disableInteraction,
      getParentItem,
      ghost,
      handleProps,
      indentationWidth,
      index,
      indicator,
      style,
      onCollapse,
      onRemove,
      onUpdate,
      parentId,
      wrapperRef,
      value,
      ...rest
    } = props;

    const styles = useMemo(() => {
      return getStyles({
        clone,
        depth,
        disableInteraction,
        ghost,
        indicator,
      }) as Omit<ListItemProps, 'textUnderlineOffset'>;
    }, [clone, depth, disableInteraction, ghost, indicator]);

    const [isEditMode, setIsEditMode] = useState(false);

    const SEARCH_OPTIONS = useMemo(
      () =>
        SEARCH_TYPES_CONFIG.reduce((r, option) => {
          if (option.options) {
            option.options.map(subOption => {
              r.push(subOption);
            });
          } else {
            r.push(option);
          }
          return r;
        }, [] as SearchTypesConfigProps[]),
      [],
    );

    return (
      <ListItem ref={wrapperRef} {...styles} {...rest}>
        <Flex
          ref={ref}
          style={style}
          className='item'
          w='100%'
          pl={ghost ? `${indentationWidth * depth}px` : 0}
        >
          <Wrapper
            id={id}
            depth={depth}
            parentId={parentId}
            getParentItem={getParentItem}
            indentationWidth={indentationWidth}
            childCount={childCount}
            clone={clone}
            ghost={ghost}
            disableInteraction={disableInteraction}
            collapsed={collapsed}
          >
            <Box flex={1}>
              {/* Union dropdown button */}
              {index !== 0 && !clone && !ghost && value.union && (
                <Box p={1} py={2} maxW='100px'>
                  <UnionButton
                    id={id}
                    colorScheme={
                      value.union
                        ? getUnionTheme(value.union).colorScheme
                        : 'primary'
                    }
                    selectedOption={value.union}
                    setSelectedOption={(id, union) => {
                      onUpdate && onUpdate(id, { union });
                    }}
                  />
                </Box>
              )}
              <StyledWrapper
                borderRadius='base'
                bg={childCount ? 'whiteAlpha.800' : '#fff'}
                border='1px solid'
                borderColor='gray.200'
                borderLeftColor={
                  !ghost && value.union
                    ? `${getUnionTheme(value.union).colorScheme}.300`
                    : 'gray.200'
                }
              >
                <Flex className='tree-item' flex={1}>
                  {isEditMode ? (
                    <EditableContent
                      id={id}
                      childCount={childCount}
                      field={value.field}
                      term={value.term}
                      querystring={value.querystring}
                      union={value.union}
                      setIsEditMode={setIsEditMode}
                      searchOptions={SEARCH_OPTIONS}
                      onUpdate={onUpdate}
                    />
                  ) : (
                    <TreeItemActions
                      clone={clone}
                      collapsed={collapsed}
                      handleProps={handleProps}
                      id={id}
                      onCollapse={onCollapse}
                      onRemove={onRemove}
                      onUpdate={
                        // only allow editing if there are no children
                        childCount === 0
                          ? () => {
                              setIsEditMode(true);
                            }
                          : undefined
                      }
                    >
                      <TreeItemContent
                        field={value.field}
                        term={value.term}
                        querystring={value.querystring}
                        union={value.union}
                        childCount={childCount}
                        searchOptionsList={SEARCH_OPTIONS}
                      />
                    </TreeItemActions>
                  )}

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
              </StyledWrapper>
            </Box>
          </Wrapper>
        </Flex>
      </ListItem>
    );
  }),
);
