import React from 'react';
import { SortableContext, SortingStrategy } from '@dnd-kit/sortable';
import { DragItem } from '../../types';
import { SortableCombineItem, SortableItemProps } from '../SortableCombineItem';
import { getSortingStrategy } from '../SortableWithCombine';
import { Flex, Text } from 'nde-design-system';

interface ItemContentProps extends SortableItemProps {
  data: DragItem;
  strategy?: SortingStrategy;
  dragOverlay: boolean;
  enableMovement: boolean;
}

export const ItemContent: React.FC<ItemContentProps> = React.memo(
  React.forwardRef<HTMLLIElement, ItemContentProps>(
    ({ data, dragOverlay, ...props }) => {
      const NestedContent = ({ data }: { data: DragItem[] }) => {
        if (!data || data.length === 0) {
          return <></>;
        }
        const { direction, strategy } = getSortingStrategy(
          data,
          props.enableMovement,
        );
        return (
          <Flex
            flexDirection={direction}
            alignItems={direction === 'row' ? 'center' : 'flex-start'}
          >
            <SortableContext items={data} strategy={strategy}>
              {data.map((datum, index) => {
                return (
                  <>
                    <SortableCombineItem
                      key={datum.id}
                      {...props}
                      id={datum.id}
                      index={index}
                      data={datum}
                      isMergeable={props.isMergeable}
                      style={args =>
                        props.style
                          ? props.style({
                              ...args,
                              style: {
                                ...args.style,
                                flexDirection: 'inherit',
                                alignItems: 'inherit',
                              },
                            })
                          : () => ({})
                      }
                      renderItem={renderItemProps => {
                        return (
                          <ItemContent
                            {...renderItemProps}
                            id={datum.id}
                            data={datum}
                            handle={props.handle}
                            index={index}
                          />
                        );
                      }}
                    ></SortableCombineItem>
                  </>
                );
              })}
            </SortableContext>
          </Flex>
        );
      };

      return (
        <Flex
          className='item-content'
          flex={1}
          p={2}
          userSelect='none'
          opacity={dragOverlay ? 0.5 : 1}
        >
          {data.children.length === 0 && (
            <div>
              {data.value.field && (
                <Text fontSize='12px' color='inherit'>
                  {data?.value?.field?.toUpperCase() || ''}
                  <br />
                </Text>
              )}
              <Text
                fontSize='sm'
                fontWeight='medium'
                noOfLines={3}
                color='inherit'
              >
                {data.value?.term || ''}
              </Text>
            </div>
          )}

          {data.children.length > 0 ? (
            <NestedContent data={data.children} />
          ) : (
            <></>
          )}
        </Flex>
      );
    },
  ),
);
