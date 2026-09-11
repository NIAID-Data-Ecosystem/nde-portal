import {
  Alert as ChakraAlert,
  AlertRootProps,
  Button,
  HStack,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import {
  ALERT_TRIGGER_SIZE,
  AlertSize,
} from 'src/theme/slot-recipes/alert.slot-recipe';
import { useLocalStorage } from 'usehooks-ts';

export interface AlertProps extends Omit<AlertRootProps, 'size'> {
  size?: AlertSize;
}

export const Alert = ({
  id,
  title,
  status,
  size = 'md',
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
    >
      <HStack alignItems='flex-start' flex={1}>
        <ChakraAlert.Indicator />
        <ChakraAlert.Content>
          <ChakraAlert.Title>{title} </ChakraAlert.Title>
          {isMounted && isOpen && children && (
            <ChakraAlert.Description>{children}</ChakraAlert.Description>
          )}
        </ChakraAlert.Content>
      </HStack>
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
    </ChakraAlert.Root>
  );
};
