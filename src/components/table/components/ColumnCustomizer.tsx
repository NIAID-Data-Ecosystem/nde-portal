import { Button, Flex, Switch, Text } from '@chakra-ui/react';
import React, { useMemo } from 'react';
import {
  SelectAndSortPopoverCopy,
  SelectAndSortPopoverView,
} from 'src/components/select-and-order-popover';

import type { ColumnPreferences } from '../hooks/useColumnPreferences';
import type { ColumnDef } from '../types';

export interface ColumnCustomizerProps {
  columns: Pick<ColumnDef<any>, 'id' | 'header'>[];
  preferences: ColumnPreferences;
  /** Drag-and-drop and Move up/down. Off by default. */
  allowReorder?: boolean;
  /** A "Pin first column" switch (shown from `md` up). Off by default. */
  allowPinning?: boolean;
  copy?: SelectAndSortPopoverCopy;
}

/**
 * The shared "Customize Columns" popover. Stateless: it shows and changes the
 * table's `useColumnPreferences`, so it can never disagree with the table.
 */
export const ColumnCustomizer = ({
  columns,
  preferences,
  allowReorder = false,
  allowPinning = false,
  copy,
}: ColumnCustomizerProps) => {
  const items = useMemo(() => {
    const byId = new Map(columns.map(c => [c.id, c]));
    return preferences.order
      .map(id => byId.get(id))
      .filter((c): c is (typeof columns)[number] => Boolean(c))
      .map(c => ({ id: c.id, title: c.header }));
  }, [columns, preferences.order]);

  const { move } = preferences;
  const handleDragEnd = useMemo(
    () =>
      ({
        active,
        over,
      }: {
        active: { id: string | number };
        over: { id: string | number } | null;
      }) => {
        if (over) move(String(active.id), String(over.id));
      },
    [move],
  );

  const footer = (
    <Flex
      width='100%'
      alignItems='center'
      justifyContent='space-between'
      gap={2}
    >
      {allowPinning && (
        // Pinning only applies from `md` up, so the switch is hidden below it.
        <Switch.Root
          size='sm'
          colorPalette='primary'
          checked={preferences.pinned}
          onCheckedChange={({ checked }) => preferences.setPinned(checked)}
          display={{ base: 'none', md: 'inline-flex' }}
        >
          <Switch.HiddenInput />
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Switch.Label>
            <Text as='span' fontSize='xs'>
              Pin first column
            </Text>
          </Switch.Label>
        </Switch.Root>
      )}
      <Button
        size='xs'
        variant='plain'
        underline
        colorPalette='black'
        ms='auto'
        onClick={preferences.reset}
      >
        Reset to defaults
      </Button>
    </Flex>
  );

  return (
    <SelectAndSortPopoverView
      items={items}
      selectedIds={preferences.visibleIds}
      requiredIds={preferences.requiredIds}
      fallbackIds={preferences.fallbackIds}
      enableOrdering={allowReorder}
      onCheck={preferences.setVisible}
      onToggleAll={preferences.toggleAll}
      onMoveUp={preferences.moveUp}
      onMoveDown={preferences.moveDown}
      onDragEnd={handleDragEnd}
      footer={footer}
      copy={{
        button: 'Customize Columns',
        header: 'Customize Columns',
        description: allowReorder
          ? 'Select and reorder columns to display.'
          : 'Select columns to display.',
        searchPlaceholder: 'Search columns',
        noItemsFound: 'No columns found',
        ...copy,
      }}
    />
  );
};
