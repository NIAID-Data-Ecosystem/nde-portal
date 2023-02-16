// import React, { forwardRef, HTMLAttributes, useMemo } from 'react';
// import MetadataFieldsConfig from 'configs/resource-fields.json';
// import { Box, Flex, Icon, ListItem, Text } from 'nde-design-system';
// import { getUnionTheme } from 'src/components/advanced-search/utils';
// import { ListItemProps } from '@chakra-ui/react';
// import { UniqueIdentifier } from '@dnd-kit/core';
// import {
//   FlattenedItem,
//   UnionTypes,
// } from 'src/components/advanced-search/components/SortableWithCombine/types';
// import { ItemContent } from '../../../ItemContent';
// import { TreeItemActions, UnionButton } from './components';
// import { Handle } from './components/Actions';

// type MetadataField = typeof MetadataFieldsConfig[number];

// export interface TreeItemProps
//   extends Omit<HTMLAttributes<HTMLLIElement>, 'id'> {
//   childCount?: number;
//   clone?: boolean;
//   collapsed?: boolean;
//   depth: number;
//   disableInteraction?: boolean;
//   disableSelection?: boolean;
//   ghost?: boolean;
//   handleProps?: any;
//   id: FlattenedItem['id'];
//   index: FlattenedItem['index'];
//   indicator?: boolean;
//   indentationWidth: number;
//   field: FlattenedItem['value']['field'];
//   parentList: FlattenedItem['parentList'];
//   term: FlattenedItem['value']['term'];
//   union: FlattenedItem['value']['union'];
//   onUpdate?(id: UniqueIdentifier, union: UnionTypes): void;
//   onCollapse?(id: UniqueIdentifier): void;
//   onRemove?(id: UniqueIdentifier): void;
//   wrapperRef?(node: HTMLLIElement): void;
// }

// export const TreeItem = React.memo(
//   forwardRef<HTMLDivElement, TreeItemProps>((props, ref) => {
//     const {
//       id,
//       childCount,
//       clone,
//       collapsed,
//       depth,
//       disableSelection,
//       disableInteraction,
//       field,
//       ghost,
//       handleProps,
//       indentationWidth,
//       index,
//       indicator,
//       parentList,
//       style,
//       term,
//       union,
//       onCollapse,
//       onRemove,
//       onUpdate,
//       wrapperRef,
//       ...rest
//     } = props;

//     const styles = useMemo((): Omit<ListItemProps, 'textUnderlineOffset'> => {
//       let styles = {
//         pointerEvents: disableInteraction ? 'none' : 'inherit',
//         sx: {
//           ['.tree-item']: {
//             position: 'relative',
//             display: 'flex',
//             alignItems: 'center',
//             padding: '10px',
//             backgroundColor: '#fff',
//             border: '1px solid #dedede',
//             color: '#222',
//             boxSizing: 'border-box',
//           },
//         },
//       } as Omit<ListItemProps, 'textUnderlineOffset'>;

//       if (clone) {
//         styles = {
//           ...styles,
//           display: 'inline-block',
//           zIndex: 10000,
//           w: '100%',
//           pointerEvents: 'none',
//           p: 0,
//           pl: '10px',
//           pt: '5px',
//         };
//       }

//       if (ghost) {
//         if (indicator) {
//           return {
//             ...styles,
//             opacity: 1,
//             position: 'relative',
//             zIndex: 1,
//             mb: '-1px',

//             sx: {
//               ['.tree-item']: {
//                 position: 'relative',
//                 padding: 0,
//                 height: '8px',
//                 borderColor: '#2389ff',
//                 bg: '#56a1f8',
//                 '&:before': {
//                   position: 'absolute',
//                   left: '-8px',
//                   top: '-4px',
//                   display: 'block',
//                   content: "''",
//                   width: '12px',
//                   height: '12px',
//                   borderRadius: '50%',
//                   border: '1px solid #2389ff',
//                   bg: '#ffffff',
//                 },
//                 '> *': {
//                   /* Items are hidden using height and opacity to retain focus */
//                   opacity: 0,
//                   height: 0,
//                 },
//               },
//             },
//           };
//         }
//         return {
//           ...styles,
//           opacity: !indicator ? 0.5 : 1,
//           sx: {
//             ['.tree-item']: {
//               '> *': {
//                 bg: 'transparent',
//                 // boxShadow: 'none',
//               },
//             },
//           },
//         };
//       }
//       return styles;
//     }, [clone, disableInteraction, ghost, indicator]);

//     // const memoHandleProps = useMemo(() => handleProps, [handleProps]);
//     // const content = useMemo(() => {
//     //   return (
//     //     <Flex className='tree-item' flex={1}>
//     //       <TreeItemContent
//     //         childCount={childCount}
//     //         clone={clone}
//     //         disableSelection={disableSelection}
//     //         term={term}
//     //       />

//     //       {/* number of items badge */}
//     //       {clone && childCount && childCount > 1 ? (
//     //         <Flex
//     //           as='span'
//     //           position='absolute'
//     //           top='-10px'
//     //           right='-10px'
//     //           display='flex'
//     //           alignItems='center'
//     //           justifyContent='center'
//     //           width='24px'
//     //           height='24px'
//     //           borderRadius='50%'
//     //           bg='#2389ff'
//     //           fontSize='0.8rem'
//     //           fontWeight='600'
//     //           color='#fff'
//     //         >
//     //           {childCount}
//     //         </Flex>
//     //       ) : null}
//     //     </Flex>
//     //   );
//     // }, [
//     //   childCount,
//     //   clone,
//     //   collapseIcon,
//     //   disableSelection,
//     //   id,
//     //   onCollapse,
//     //   onRemove,
//     //   term,
//     // ]);
//     return (
//       <ListItem className='list-item' ref={wrapperRef} {...styles} {...rest}>
//         <Flex ref={ref} style={style} w='100%'>
//           <ParentListWrapper
//             indentationWidth={indentationWidth}
//             parentList={parentList}
//           >
//             <Flex flexDirection='column' flex={1}>
//               {/* Union dropdown button */}
//               <Box flex={1} pl={`${indentationWidth * depth}px`}>
//                 {index !== 0 && !clone && !ghost && union && (
//                   <Box p={2}>
//                     <UnionButton
//                       id={id}
//                       colorScheme={
//                         union ? getUnionTheme(union).colorScheme : 'primary'
//                       }
//                       selectedOption={union}
//                       setSelectedOption={onUpdate}
//                     />
//                   </Box>
//                 )}
//               </Box>

//               <TreeItemActions
//                 clone={clone}
//                 collapsed={collapsed}
//                 handleProps={handleProps}
//                 id={id}
//                 onCollapse={onCollapse}
//                 onRemove={onRemove}
//               >
//                 <ItemContent id={id} index={index} />
//               </TreeItemActions>
//             </Flex>
//           </ParentListWrapper>
//         </Flex>
//       </ListItem>
//     );
//   }),
// );

// // interface TreeItemContentProps extends Partial<TreeItemProps> {}

// // // Contains the metadata properties of item.
// // export const TreeItemContent = React.memo(
// //   ({ childCount, clone, disableSelection, term }: TreeItemContentProps) => {
// //     return (
// //       <Flex flex={1}>
// //         <Text
// //           as='span'
// //           className='text'
// //           fontStyle={childCount && childCount > 0 ? 'italic' : 'normal'}
// //           userSelect={disableSelection || clone ? 'none' : 'auto'}
// //         >
// //           {term}
// //         </Text>
// //       </Flex>
// //     );
// //   },
// // );

// const Wrapper = React.memo(
//   ({
//     children,
//     union,
//     indentationWidth,
//   }: {
//     children: React.ReactNode;
//     union: FlattenedItem['value']['union'];
//     indentationWidth: number;
//   }) => {
//     return (
//       <Flex
//         className='tree-item-wrapper'
//         borderLeft='5px solid'
//         borderLeftColor={union ? getUnionTheme(union).bg : 'transparent'}
//         pl={indentationWidth - 5}
//         flex={1}
//         bg='#fff'
//       >
//         {children}
//       </Flex>
//     );
//   },
// );

// const ParentListWrapper = React.memo(
//   ({
//     parentList = [],
//     indentationWidth,
//     index = 0,
//     children,
//   }: {
//     indentationWidth: number;
//     index?: number;
//     parentList: FlattenedItem['parentList'];
//     children: React.ReactNode;
//   }) => {
//     console.log('PARENTLIST');
//     const parentItem = parentList[index];
//     if (!parentItem) {
//       return <>{children}</>;
//     }
//     return (
//       <Wrapper
//         union={parentItem.value.union}
//         indentationWidth={indentationWidth}
//       >
//         <ParentListWrapper
//           parentList={parentList}
//           index={index + 1}
//           indentationWidth={indentationWidth}
//         >
//           {children}
//         </ParentListWrapper>
//       </Wrapper>
//     );
//   },
//   (prevProps, nextProps) => {
//     if (
//       JSON.stringify(prevProps.parentList) ===
//       JSON.stringify(nextProps.parentList)
//     ) {
//       return true;
//     } else {
//       return false;
//     }
//   },
// );

import React, { forwardRef, HTMLAttributes, useMemo } from 'react';
import MetadataFieldsConfig from 'configs/resource-fields.json';
import { Box, Flex, Icon, ListItem, Text } from 'nde-design-system';
import { FaChevronDown } from 'react-icons/fa';
import { Action, Handle, Remove } from './components/Actions';
import {
  FlattenedItem,
  UnionTypes,
} from 'src/components/advanced-search/components/SortableWithCombine/types';
import { TreeItemActions, UnionButton } from './components';
import {
  getUnionTheme,
  unionOptions,
} from 'src/components/advanced-search/utils';
import {
  DropdownButton,
  DropdownButtonProps,
} from 'src/components/dropdown-button';
import { ListItemProps } from '@chakra-ui/react';
import { UniqueIdentifier } from '@dnd-kit/core';

type MetadataField = (typeof MetadataFieldsConfig)[number];

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
  field: FlattenedItem['value']['field'];
  parentList: FlattenedItem['parentList'];
  term: FlattenedItem['value']['term'];
  union: FlattenedItem['value']['union'];
  onUpdate?(id: UniqueIdentifier, union: UnionTypes): void;
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
      field,
      ghost,
      handleProps,
      indentationWidth,
      index,
      indicator,
      parentList,
      style,
      term,
      union,
      onCollapse,
      onRemove,
      onUpdate,
      wrapperRef,
      ...rest
    } = props;

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
            border: '1px solid #dedede',
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
          w: '100%',
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
    }, [clone, disableInteraction, ghost, indicator]);
    // const field = MetadataFieldsConfig.find(
    //   field => field.property === data?.field,
    // ) as MetadataField;
    // const list = useMemo(
    //   () => [{ id, value: { union, term } }],
    //   [id, term, union],
    // );

    const collapseIcon = useMemo(
      () => (
        <Icon
          as={FaChevronDown}
          boxSize={3}
          transition='transform 250ms ease'
          transform={collapsed ? `rotate(-90deg)` : `rotate(0deg)`}
        />
      ),
      [collapsed],
    );

    const memoHandleProps = useMemo(() => handleProps, [handleProps]);

    const content = useMemo(() => {
      return (
        <>
          {/* Drag handle used to move item */}
          <Handle
            {...handleProps}
            aria-label='drag item'
            className='tree-item-handle'
            color='niaid.placeholder'
          />

          {/* Collapse children items */}
          {!clone && onCollapse && (
            <Action
              id={id}
              aria-label='collapse items'
              handleClick={onCollapse}
              colorScheme='gray'
              variant='ghost'
              color='niaid.placeholder'
              mx={1}
              pl={1}
              pr={1}
              icon={collapseIcon}
            />
          )}

          <TreeItemContent
            childCount={childCount}
            clone={clone}
            disableSelection={disableSelection}
            term={term}
            index={index}
          />

          {/* Button to delete item. */}
          {!clone && onRemove && (
            <Remove
              id={id}
              className='remove'
              handleClick={onRemove}
              aria-label='remove item'
            />
          )}

          {/* number of items badge */}
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
        </>
      );
    }, [
      childCount,
      clone,
      collapseIcon,
      disableSelection,
      id,
      index,
      onCollapse,
      onRemove,
      term,
      memoHandleProps,
    ]);

    return (
      <ListItem ref={wrapperRef} {...styles} {...rest}>
        <Flex ref={ref} style={style} w='100%'>
          <TreeItemWrapper
            position={index}
            indentationWidth={ghost ? 0 : indentationWidth}
            parentList={parentList}
          >
            <Box flex={1}>
              {/* Union dropdown button */}
              {index !== 0 && !clone && !ghost && union && (
                <Box p={2}>
                  <UnionButton
                    id={id}
                    colorScheme={
                      union ? getUnionTheme(union).colorScheme : 'primary'
                    }
                    selectedOption={union}
                    setSelectedOption={onUpdate}
                  />
                </Box>
              )}
              <Flex
                className='tree-item'
                flex={1}
                ml={ghost ? `${indentationWidth * depth}px` : 0}
              >
                {content}
              </Flex>
            </Box>
          </TreeItemWrapper>
        </Flex>
      </ListItem>
    );
  }),
);

interface TreeItemContentProps extends Partial<TreeItemProps> {}

// Contains the metadata properties of item.
export const TreeItemContent = React.memo(
  ({
    childCount,
    clone,
    disableSelection,
    index,
    term,
  }: TreeItemContentProps) => {
    return (
      <Flex flex={1}>
        <Text
          as='span'
          className='text'
          fontStyle={childCount && childCount > 0 ? 'italic' : 'normal'}
          userSelect={disableSelection || clone ? 'none' : 'auto'}
        >
          {index} {term}
        </Text>
      </Flex>
    );
  },
);

const Wrapper = React.memo(
  ({
    children,
    union,
    indentationWidth,
  }: {
    children: React.ReactNode;
    union: FlattenedItem['value']['union'];
    indentationWidth: number;
  }) => {
    return (
      <Flex
        className='wrapper'
        borderLeft='5px solid'
        borderLeftColor={getUnionTheme(union).bg}
        pl={indentationWidth - 5}
        flex={1}
        bg='#fff'
      >
        {children}
      </Flex>
    );
  },
);

const TreeItemWrapper = React.memo(
  ({
    children,
    parentIndex = 0,
    parentList = [],
    position,
    indentationWidth,
  }: {
    children: React.ReactNode;
    parentIndex?: number;
    parentList: FlattenedItem['parentList'];
    position: number;
    indentationWidth: number;
  }) => {
    console.log('TREEITEMWRAPPER');
    const parentItem = parentList[parentIndex];
    if (!parentItem) {
      return <>{children}</>;
    }
    return (
      <Wrapper
        union={parentItem.value.union}
        indentationWidth={indentationWidth}
      >
        <TreeItemWrapper
          position={position}
          parentList={parentList}
          parentIndex={parentIndex + 1}
          indentationWidth={indentationWidth}
        >
          {children}
        </TreeItemWrapper>
      </Wrapper>
    );
  },
  (prevProps, nextProps) => {
    if (
      prevProps.indentationWidth === nextProps.indentationWidth &&
      prevProps.parentIndex === nextProps.parentIndex &&
      prevProps.position === nextProps.position &&
      JSON.stringify(prevProps.parentList) ===
        JSON.stringify(nextProps.parentList)
    ) {
      return true;
    } else {
      return false;
    }
  },
);
