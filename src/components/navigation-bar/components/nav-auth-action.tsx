import React from 'react';
import {
  Box,
  Button,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useAuth } from 'src/hooks/useAuth';

const getDisplayName = (name?: string, username?: string) => {
  if (name && name.trim()) return name;
  if (username && username.trim()) return username;
  return 'Account';
};

export const DesktopAuthAction = () => {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  const displayName = getDisplayName(user?.name, user?.username);

  if (isLoading) {
    return (
      <Button isLoading size='sm' variant='outline' colorScheme='whiteAlpha'>
        Loading
      </Button>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button
        variant='outline'
        borderColor='whiteAlpha.700'
        color='white'
        _hover={{ bg: 'whiteAlpha.300' }}
        onClick={() => login()}
        size='sm'
      >
        Log in
      </Button>
    );
  }

  return (
    <Popover trigger='click' placement='bottom-end' closeOnEsc>
      <PopoverTrigger>
        <Button
          variant='outline'
          borderColor='whiteAlpha.700'
          color='white'
          _hover={{ bg: 'whiteAlpha.300' }}
          size='sm'
        >
          {displayName}
        </Button>
      </PopoverTrigger>
      <PopoverContent w='xs'>
        <PopoverArrow />
        <PopoverBody>
          <Stack spacing={2}>
            <Text fontWeight={600} color='niaid.700'>
              {displayName}
            </Text>
            <Button
              size='sm'
              colorScheme='red'
              variant='outline'
              onClick={logout}
            >
              Logout
            </Button>
          </Stack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export const MobileAuthAction = () => {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  const displayName = getDisplayName(user?.name, user?.username);

  if (isLoading) {
    return (
      <Box w='100%' px={4} py={2}>
        <Button
          isLoading
          size='sm'
          w='100%'
          colorScheme='niaid'
          variant='ghost'
        >
          Loading
        </Button>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box w='100%' px={4} py={2}>
        <Button size='sm' w='100%' colorScheme='niaid' onClick={() => login()}>
          Login
        </Button>
      </Box>
    );
  }

  return (
    <Box w='100%' px={4} py={2}>
      <Stack spacing={2}>
        <Text fontWeight={600} color='niaid.700'>
          {displayName}
        </Text>
        <Button
          size='sm'
          w='100%'
          colorScheme='red'
          variant='outline'
          onClick={logout}
        >
          Logout
        </Button>
      </Stack>
    </Box>
  );
};
