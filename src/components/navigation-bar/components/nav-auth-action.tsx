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
import { DesktopNavItem } from 'src/components/navigation-bar/components/desktop-nav-item';

const ACCOUNTS_COPY = {
  default: 'Account',
  login: 'Log In',
  logout: 'Log Out',
  routes: [
    {
      label: 'Settings',
      description: 'Set site preferences',
      href: '/user-settings',
    },
  ],
};

const getDisplayName = (name?: string, username?: string) => {
  if (name && name.trim()) return name;
  if (username && username.trim()) return username;
  return ACCOUNTS_COPY.default;
};

const useAuthActionData = () => {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  return {
    displayName: getDisplayName(user?.name, user?.username),
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
};

const DesktopLoadingAction = () => {
  return (
    <Button isLoading size='sm' variant='outline' colorScheme='whiteAlpha'>
      Loading
    </Button>
  );
};

const DesktopLoginAction = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <Button
      variant='outline'
      borderColor='whiteAlpha.700'
      color='white'
      _hover={{ bg: 'whiteAlpha.300' }}
      onClick={onLogin}
      size='sm'
    >
      {ACCOUNTS_COPY.login}
    </Button>
  );
};

const DesktopAccountAction = ({
  displayName,
  onLogout,
}: {
  displayName: string;
  onLogout: () => void;
}) => {
  return <DesktopNavItem label={displayName} routes={ACCOUNTS_COPY.routes} />;
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
              onClick={onLogout}
            >
              Logout
            </Button>
          </Stack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

const MobileActionContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <Box w='100%' px={4} py={2}>
      {children}
    </Box>
  );
};

const MobileLoadingAction = () => {
  return (
    <MobileActionContainer>
      <Button isLoading size='sm' w='100%' colorScheme='niaid' variant='ghost'>
        Loading
      </Button>
    </MobileActionContainer>
  );
};

const MobileLoginAction = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <MobileActionContainer>
      <Button size='sm' w='100%' colorScheme='niaid' onClick={onLogin}>
        {ACCOUNTS_COPY.login}
      </Button>
    </MobileActionContainer>
  );
};

const MobileAccountAction = ({
  displayName,
  onLogout,
}: {
  displayName: string;
  onLogout: () => void;
}) => {
  return (
    <MobileActionContainer>
      <Stack spacing={2}>
        <Text fontWeight={600} color='niaid.700'>
          {displayName}
        </Text>
        <Button
          size='sm'
          w='100%'
          colorScheme='red'
          variant='outline'
          onClick={onLogout}
        >
          {ACCOUNTS_COPY.logout}
        </Button>
      </Stack>
    </MobileActionContainer>
  );
};

export const DesktopAuthAction = () => {
  const { displayName, isAuthenticated, isLoading, login, logout } =
    useAuthActionData();

  if (isLoading) {
    return <DesktopLoadingAction />;
  }

  if (!isAuthenticated) {
    return <DesktopLoginAction onLogin={() => login()} />;
  }

  return <DesktopAccountAction displayName={displayName} onLogout={logout} />;
};

export const MobileAuthAction = () => {
  const { displayName, isAuthenticated, isLoading, login, logout } =
    useAuthActionData();

  if (isLoading) {
    return <MobileLoadingAction />;
  }

  if (!isAuthenticated) {
    return <MobileLoginAction onLogin={login} />;
  }

  return <MobileAccountAction displayName={displayName} onLogout={logout} />;
};
