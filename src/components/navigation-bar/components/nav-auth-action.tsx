import React from 'react';
import { Box, Button, Stack, Text } from '@chakra-ui/react';
import { useAuth } from 'src/hooks/useAuth';
import { NavDropdownItem } from './nav-dropdown-item';
import { NavDropdown, NavDropdownTrigger } from './nav-desktop-dropdown';
import { ENABLE_AUTH } from 'src/utils/feature-flags';

const ACCOUNTS_CONFIG = {
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
  return ACCOUNTS_CONFIG.default;
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

const DesktopLoginAction = ({
  isLoading,
  onLogin,
}: {
  isLoading?: boolean;
  onLogin: () => void;
}) => {
  return (
    <Button
      isLoading={isLoading}
      variant='outline'
      colorScheme='white'
      bg='transparent'
      alignSelf='center'
      _hover={{ bg: 'whiteAlpha.300' }}
      onClick={onLogin}
      size='sm'
      ml={2}
    >
      {ACCOUNTS_CONFIG.login}
    </Button>
  );
};

const DesktopLogoutAction = ({ onLogout }: { onLogout: () => void }) => {
  return (
    <Button
      size='sm'
      colorScheme='red'
      color='red.500'
      variant='ghost'
      px={2}
      onClick={onLogout}
      justifyContent='flex-start'
      fontWeight='semibold'
    >
      {ACCOUNTS_CONFIG.logout}
    </Button>
  );
};

const DesktopAccountAction = ({
  displayName,
  isLoading,
  onLogout,
}: {
  displayName: string;
  isLoading: boolean;
  onLogout: () => void;
}) => {
  return (
    <NavDropdownTrigger label={displayName} isLoading={isLoading}>
      <NavDropdown>
        {ACCOUNTS_CONFIG['routes'].map(route => (
          <NavDropdownItem key={`${route.href ?? route.label}`} {...route} />
        ))}
        <DesktopLogoutAction onLogout={onLogout} />
      </NavDropdown>
    </NavDropdownTrigger>
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
        {ACCOUNTS_CONFIG.login}
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
          {ACCOUNTS_CONFIG.logout}
        </Button>
      </Stack>
    </MobileActionContainer>
  );
};

export const DesktopAuthAction = () => {
  const { displayName, isAuthenticated, isLoading, login, logout } =
    useAuthActionData();

  if (!ENABLE_AUTH) return null;

  if (!isAuthenticated) {
    return <DesktopLoginAction isLoading={isLoading} onLogin={() => login()} />;
  }

  return (
    <DesktopAccountAction
      isLoading={isLoading}
      displayName={displayName}
      onLogout={logout}
    />
  );
};

export const MobileAuthAction = () => {
  const { displayName, isAuthenticated, isLoading, login, logout } =
    useAuthActionData();
  if (!ENABLE_AUTH) return null;
  if (isLoading) {
    return <MobileLoadingAction />;
  }

  if (!isAuthenticated) {
    return <MobileLoginAction onLogin={login} />;
  }

  return <MobileAccountAction displayName={displayName} onLogout={logout} />;
};
