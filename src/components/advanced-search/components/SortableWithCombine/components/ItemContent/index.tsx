import React from 'react';
import { Box, Flex, Text } from 'nde-design-system';
import { SortableContext, SortingStrategy } from '@dnd-kit/sortable';
import { SortableCombineItem, SortableItemProps } from '../SortableCombineItem';
import MetadataFieldsConfig from 'configs/resource-fields.json';
import { getSortingStrategy, DragItem } from '../../index';
import { getTypeLabel } from './helpers';

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
            as='ul'
            flexDirection={direction}
            alignItems={direction === 'row' ? 'center' : 'flex-start'}
          >
            <SortableContext items={data} strategy={strategy}>
              {data.map((datum, index) => {
                return (
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
                  />
                );
              })}
            </SortableContext>
          </Flex>
        );
      };

      type MetadataField = typeof MetadataFieldsConfig[number];
      const field = MetadataFieldsConfig.find(
        field => field.property === data.value.field,
      ) as MetadataField;

      const getDisplayTerm = (value: DragItem['value']) => {
        if (value.field === '_exists_' || value.field === '-_exists_') {
          const fieldName = MetadataFieldsConfig.find(
            field => field.property === data.value.term,
          );
          return (
            <span>
              Must contain{' '}
              <Text as='span' fontWeight='extrabold'>
                {fieldName?.name}
              </Text>{' '}
              field.
            </span>
          );
        }
        return <span>{value.term}</span>;
      };

      return (
        <Flex
          className='item-content'
          flex={1}
          py={2}
          px={1}
          w='100%'
          userSelect='none'
          opacity={dragOverlay ? 0.5 : 1}
        >
          {data.children.length === 0 && (
            <div>
              <Box w='100%'>
                {/* Don't show field if it's an exists type */}
                {data.value.field && !data.value.field.includes('exists') && (
                  <Text
                    fontWeight='semibold'
                    fontFamily='heading'
                    fontSize='xs'
                    color='inherit'
                  >
                    {field.name}
                    <br />
                  </Text>
                )}
                <Text
                  fontWeight='semibold'
                  fontFamily='heading'
                  fontSize='10px'
                  textTransform='uppercase'
                >
                  {getTypeLabel(data.value)}
                </Text>
              </Box>
              <Text
                fontSize='sm'
                fontWeight='medium'
                noOfLines={3}
                color='inherit'
                mt={1}
              >
                {getDisplayTerm(data.value)}
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
