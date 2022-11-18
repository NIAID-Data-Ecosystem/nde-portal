import React from 'react';
import { SortableContext, SortingStrategy } from '@dnd-kit/sortable';
import { DragItem } from '../../types';
import { SortableCombineItem, SortableItemProps } from '../SortableCombineItem';
import { getSortingStrategy } from '../SortableWithCombine';

interface ItemContentProps extends SortableItemProps {
  data: DragItem;
  strategy?: SortingStrategy;
}

export const ItemContent: React.FC<ItemContentProps> = React.memo(
  React.forwardRef<HTMLLIElement, ItemContentProps>(({ data, ...props }) => {
    const NestedContent = ({ data }: { data: DragItem[] }) => {
      if (!data || data.length === 0) {
        return <></>;
      }
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: getSortingStrategy(data).direction,
            flexWrap: 'wrap',
          }}
        >
          <SortableContext
            items={data}
            strategy={getSortingStrategy(data).strategy}
          >
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
        </div>
      );
    };

    return (
      <div
        id='item-content'
        style={{
          display: 'flex',
          flex: 1,
          padding: '0.5rem',
          userSelect: 'none',
        }}
      >
        {data.children.length === 0 && (
          <div>
            {data.value.field && (
              <p
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  fontSize: '10px',
                }}
              >
                {data?.value?.field?.toUpperCase() || ''}
                <br />
              </p>
            )}
            <p>{data.value?.term || ''}</p>
          </div>
        )}

        {data.children.length > 0 ? (
          <NestedContent data={data.children} />
        ) : (
          <></>
        )}
      </div>
    );
  }),
);
