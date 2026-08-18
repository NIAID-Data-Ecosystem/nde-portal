import React from 'react';
import { Checkbox, Flex, Icon, IconButton, Text } from '@chakra-ui/react';
import { Tooltip } from '@/components/ui/tooltip';
import { FaAngleDown, FaAngleUp, FaGripVertical } from 'react-icons/fa6';
import { useSortable } from '@dnd-kit/sortable';
import { PopoverItem } from '../types';

interface PopoverListItemProps {
  item: PopoverItem;
  isChecked: boolean;
  /** When true the item is always checked and cannot be reordered. */
  isRequired?: boolean;
  /** Whether to show the drag handle and up/down arrows. */
  enableOrdering?: boolean;
  /** Whether a search is currently active (disables drag while searching). */
  isSearching?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  onCheck: (id: string, checked: boolean) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
}

/**
 * A single row inside a selectable (and optionally orderable) popover list.
 */
export const PopoverListItem = ({
  item,
  isChecked,
  isRequired = false,
  enableOrdering = false,
  isSearching = false,
  isFirst = false,
  isLast = false,
  onCheck,
  onMoveUp,
  onMoveDown,
}: PopoverListItemProps) => {
  const dragDisabled = isRequired || isSearching || !enableOrdering;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: dragDisabled });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0) scaleX(${transform.scaleX}) scaleY(${transform.scaleY})`
      : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
    position: 'relative',
  };

  const dragTooltip = isRequired
    ? 'Required — cannot be reordered'
    : isSearching
    ? 'Clear search to reorder'
    : 'Drag to reorder';

  return (
    <Flex
      ref={setNodeRef}
      style={style}
      align='center'
      px={2}
      py={0.5}
      borderRadius='sm'
      gap={1}
      _hover={{ bg: isRequired ? undefined : 'secondary.50' }}
      bg={isDragging ? 'secondary.50' : undefined}
      role='group'
    >
      {/* Drag handle, which is rendered only when ordering is enabled */}
      {enableOrdering && (
        <Tooltip
          content={dragTooltip}
          showArrow
          openDelay={400}
          positioning={{
            placement: 'left',
          }}
        >
          <Flex
            {...(dragDisabled ? {} : { ...attributes, ...listeners })}
            cursor={dragDisabled ? 'not-allowed' : 'grab'}
            color={dragDisabled ? 'gray.300' : 'gray.400'}
            _hover={{ color: dragDisabled ? 'gray.300' : 'gray.600' }}
            align='center'
            px={0.5}
            flexShrink={0}
          >
            <Icon boxSize={3} asChild>
              <FaGripVertical />
            </Icon>
          </Flex>
        </Tooltip>
      )}
      {/* Checkbox */}
      <Checkbox.Root
        value={item.id}
        disabled={isRequired}
        onCheckedChange={e => onCheck(item.id, e.target.checked)}
        flex={1}
        minW={0}
        checked={isChecked}
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Checkbox.Label>
          <Text ml={1} fontSize='xs' lineClamp={1} title={item.title}>
            {item.title}
          </Text>
        </Checkbox.Label>
      </Checkbox.Root>
      {/* Up/down buttons, which is rendered only when ordering is enabled and not searching */}
      {enableOrdering && !isSearching && (
        <Flex
          gap={0.5}
          flexShrink={0}
          opacity={0}
          _groupHover={{ opacity: isRequired ? 0 : 1 }}
          transition='opacity 0.15s'
        >
          <IconButton
            aria-label={`Move ${item.title} up`}
            size='xs'
            variant='ghost'
            colorPalette='gray'
            disabled={isRequired || isFirst}
            onClick={() => onMoveUp?.(item.id)}
          >
            <Icon asChild>
              <FaAngleUp />
            </Icon>
          </IconButton>
          <IconButton
            aria-label={`Move ${item.title} down`}
            size='xs'
            variant='ghost'
            colorPalette='gray'
            disabled={isRequired || isLast}
            onClick={() => onMoveDown?.(item.id)}
          >
            <Icon asChild>
              <FaAngleDown />
            </Icon>
          </IconButton>
        </Flex>
      )}
    </Flex>
  );
};
