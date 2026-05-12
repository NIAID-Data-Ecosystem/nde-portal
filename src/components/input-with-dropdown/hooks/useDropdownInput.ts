import React, { useCallback, useEffect, useState } from 'react';
import { InputProps, ListItemProps } from '@chakra-ui/react';
import { callAllHandlers } from 'src/utils/functions';
import { ContextProps } from '../index';

interface DropdownInputProps extends Omit<InputProps, 'onKeyDown'> {
  onKeyDown?: (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number | null,
  ) => void;
}

interface DropdownListItemProps extends ListItemProps {
  index: number;
  value: string | number | readonly string[];
  isSelected: boolean;
}

export const useDropdownInput = ({
  cursor: initialCursor,
  cursorMax,
  inputValue: initialInputValue,
  isOpen: initialIsOpen,
  colorScheme,
}: {
  cursor: ContextProps['cursor'];
  cursorMax: ContextProps['cursorMax'];
  inputValue: ContextProps['inputValue'];
  isOpen: ContextProps['isOpen'];
  colorScheme?: ContextProps['colorScheme'];
}) => {
  const [inputValue, setInputValue] = useState(initialInputValue);
  const [cursor, setCursor] = useState(initialCursor);
  const [isOpen, setIsOpen] = useState(initialIsOpen);

  /* [Input Component]: props + handlers */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsOpen(true);
      setInputValue(e.currentTarget.value);
    },
    [],
  );

  const handleInputKeyDown = useCallback(
    (
      e: React.KeyboardEvent<HTMLInputElement>,
      onKeyDown: DropdownInputProps['onKeyDown'],
    ) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        let idx = cursor;
        if (e.key === 'ArrowDown') idx++;
        if (e.key === 'ArrowUp') idx--;

        // if the user presses the down arrow we update the current selection [cursor]
        idx !== cursor && setCursor(idx);

        // Call custom keydown function if exists.
        onKeyDown && onKeyDown(e, idx);

        // Move cursor to end of input field.
        let input = e.currentTarget;
        if (input) {
          setTimeout(function () {
            input.selectionStart = input.selectionEnd = 10000;
          }, 0);
        }
      } else {
        // Call custom keydown function if exists.
        onKeyDown && onKeyDown(e, null);
      }
    },
    [cursor],
  );

  const getInputProps = ({
    onChange,
    onKeyDown,
    ...props
  }: DropdownInputProps) => ({
    colorScheme: props.isInvalid ? 'red' : colorScheme,
    borderColor: props.isInvalid ? 'status.error' : 'gray.200',
    _focus: { borderColor: props.isInvalid ? 'status.error' : 'inherit' },
    bg: 'white',
    type: 'search',
    value: inputValue,
    onChange: callAllHandlers(handleInputChange, onChange),
    onKeyDown: callAllHandlers(e => handleInputKeyDown(e, onKeyDown)),
    ...props,
  });

  /* [Dropdown List Item Component]: props + handlers */
  const handleListItemClick = (value: DropdownListItemProps['value']) => {
    setIsOpen(false);
  };

  const getListItemProps = ({
    index,
    value,
    isSelected,
    onClick,
    onMouseOver,
    ...props
  }: DropdownListItemProps) => {
    return {
      id: `li-${index}`,
      bg: isSelected ? `${colorScheme}.100` : `${colorScheme}.50`,
      color: isSelected ? 'text.heading' : 'text.body',
      onClick: callAllHandlers(
        (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
          e.stopPropagation();
          onClick && onClick(e);
        },
        () => handleListItemClick(value),
      ),
      onMouseOver: callAllHandlers(e => {
        e.stopPropagation();
        index !== cursor && setCursor(index);
      }, onMouseOver),
      ...props,
    };
  };

  // Update the suggested list scroll position so that currently selected element is always in view. Important for keydown.
  useEffect(() => {
    const el = document.getElementById(`li-${cursor}`);
    if (el) {
      el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }, [cursor]);

  // If cursor has an index of -1 we set the inputValue to the initial searched for string.
  useEffect(() => {
    if (cursor === -1) {
      setInputValue(initialInputValue);
    }
  }, [cursor, initialInputValue]);

  // cycle through cursor indices using the max value of the cursor.
  useEffect(() => {
    setCursor(prev => {
      if (cursor >= cursorMax) {
        return -1;
      } else if (cursor < -1) {
        return cursorMax - 1;
      }
      return prev;
    });
  }, [cursorMax, cursor, setCursor]);

  return {
    cursor,
    inputValue,
    isOpen,
    setCursor,
    setInputValue,
    setIsOpen,
    getInputProps,
    // getListProps,
    getListItemProps,
  };
};
export const useInput = () => {
  return {};
};
