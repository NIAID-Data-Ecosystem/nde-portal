import {
  Alert as ChakraAlert,
  AlertRootProps,
  Button,
  CloseButton,
  HStack,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import {
  ALERT_CLOSE_TRIGGER_OFFSET,
  ALERT_TRIGGER_SIZE,
  AlertSize,
} from 'src/theme/slot-recipes/alert.slot-recipe';
import { useLocalStorage } from 'usehooks-ts';

export interface AlertProps extends Omit<AlertRootProps, 'size'> {
  size?: AlertSize;
  onClose?: () => void;
}

export const Alert = ({
  id,
  title,
  status,
  size = 'md',
  onClose,
  children,
}: AlertProps) => {
  const [isOpen, setOpen] = useLocalStorage(`${id}`, true);
  const [isMounted, setIsMounted] = useState(false); // for SSR

  const toggleWarning = () => {
    setOpen(!isOpen);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <ChakraAlert.Root
      status={status}
      size={size}
      flexDirection={{ base: 'column', sm: 'row' }}
      alignItems={{ base: 'flex-start', sm: 'center' }}
      pe={onClose ? ALERT_CLOSE_TRIGGER_OFFSET[size].rootPe : undefined}
    >
      <HStack alignItems='flex-start' flex={1}>
        <ChakraAlert.Indicator />
        <ChakraAlert.Content>
          {title && <ChakraAlert.Title>{title} </ChakraAlert.Title>}
          {isMounted && isOpen && children && (
            <ChakraAlert.Description>{children}</ChakraAlert.Description>
          )}
        </ChakraAlert.Content>
      </HStack>
      {children && (
        <Button
          onClick={toggleWarning}
          status={status}
          size={ALERT_TRIGGER_SIZE[size]}
          variant='unstyled'
          color='inherit'
          underline
        >
          {isMounted && isOpen ? 'Read Less' : 'Read More'}
        </Button>
      )}

      {onClose && (
        <CloseButton
          onClick={onClose}
          status={status}
          size={ALERT_TRIGGER_SIZE[size]}
          color='inherit'
          // ghost's default hover bg is `colorPalette.subtle`, the alert's own bg.
          _hover={{ bg: 'colorPalette.muted' }}
          pos='absolute'
          top={ALERT_CLOSE_TRIGGER_OFFSET[size].top}
          insetEnd={ALERT_CLOSE_TRIGGER_OFFSET[size].insetEnd}
        />
      )}
    </ChakraAlert.Root>
  );
};
