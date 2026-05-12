import React from 'react';
import { Button, ButtonProps } from '@chakra-ui/react';
import { useAuth } from 'src/hooks/useAuth';
import { NavDropdownItem } from './nav-dropdown-item';
import { NavDropdown, NavDropdownTrigger } from './nav-desktop-dropdown';
import { ENABLE_AUTH } from 'src/utils/feature-flags';
import { MobileNavItem } from './nav-mobile-item';
import { FaCircleUser } from 'react-icons/fa6';

const ACCOUNTS_CONFIG = {
  default: 'Account',
  login: 'Log In',
  logout: 'Log Out',
  routes: [
    {
      label: 'Account Settings',
      description: 'Set site preferences',
      href: '/settings',
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
      onClick={() => onLogin()}
      size='sm'
      ml={2}
    >
      {ACCOUNTS_CONFIG.login}
    </Button>
  );
};

const LogoutButton = ({
  onLogout,
  ...buttonProps
}: ButtonProps & { onLogout: () => void }) => {
  return (
    <Button
      size='sm'
      colorScheme='red'
      color='red.500'
      onClick={onLogout}
      variant='ghost'
      justifyContent='flex-start'
      fontWeight='semibold'
      px={2}
      {...buttonProps}
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
    <NavDropdownTrigger
      label={isLoading ? ACCOUNTS_CONFIG.default : displayName}
      icon={FaCircleUser}
      isLoading={isLoading}
      isDisabled={isLoading}
    >
      {!isLoading && (
        <NavDropdown>
          {ACCOUNTS_CONFIG['routes'].map(route => (
            <NavDropdownItem key={`${route.href ?? route.label}`} {...route} />
          ))}
          <LogoutButton onLogout={onLogout} />
        </NavDropdown>
      )}
    </NavDropdownTrigger>
  );
};

const MobileLoadingAction = () => {
  return (
    <Button
      isLoading={true}
      size='sm'
      w='100%'
      colorScheme='niaid'
      variant='ghost'
    >
      Loading
    </Button>
  );
};

const MobileLoginAction = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <Button size='sm' w='100%' colorScheme='niaid' onClick={() => onLogin()}>
      {ACCOUNTS_CONFIG.login}
    </Button>
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
    <>
      <MobileNavItem
        label={displayName}
        icon={FaCircleUser}
        routes={ACCOUNTS_CONFIG['routes']}
      />

      <LogoutButton onLogout={onLogout} width='100%' />
    </>
  );
};

export const DesktopAuthAction = () => {
  const { displayName, isAuthenticated, isLoading, login, logout } =
    useAuthActionData();

  if (!ENABLE_AUTH) return null;

  if (isLoading) {
    return <DesktopLoginAction isLoading={false} onLogin={login} />;
  }

  if (isAuthenticated) {
    return (
      <DesktopAccountAction
        isLoading={isLoading}
        displayName={displayName ?? ACCOUNTS_CONFIG.default}
        onLogout={logout}
      />
    );
  }

  return <DesktopLoginAction isLoading={isLoading} onLogin={login} />;
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
