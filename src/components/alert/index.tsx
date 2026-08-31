import {
  Alert as ChakraAlert,
  AlertRootProps,
  Button,
  HStack,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';

export const Alert = ({ id, title, status, children }: AlertRootProps) => {
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
      size='sm'
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
      <Button onClick={toggleWarning} status={status} size='2xs' variant='link'>
        {isMounted && isOpen ? 'Read Less' : 'Read More'}
      </Button>
    </ChakraAlert.Root>
  );
};
