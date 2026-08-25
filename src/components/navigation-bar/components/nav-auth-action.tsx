import { Button, ButtonProps } from '@chakra-ui/react';
import React from 'react';
import { FaCircleUser } from 'react-icons/fa6';
import { useAuth } from 'src/hooks/useAuth';
import { ENABLE_AUTH } from 'src/utils/feature-flags';

import { NavDropdown, NavDropdownTrigger } from './nav-desktop-dropdown';
import { NavDropdownItem } from './nav-dropdown-item';
import { MobileNavItem } from './nav-mobile-item';

const ACCOUNTS_CONFIG = {
  default: 'Account',
  login: 'Log In',
  logout: 'Log Out',
  routes: [
    {
      label: 'Saved Searches',
      description: 'View your saved resources and queries',
      href: '/saved',
    },
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
  const { user, isAuthenticated, loading, login, logout } = useAuth();

  return {
    displayName: getDisplayName(user?.name, user?.username),
    isAuthenticated,
    loading,
    login,
    logout,
  };
};

const DesktopLoginAction = ({
  loading,
  onLogin,
}: {
  loading?: boolean;
  onLogin: () => void;
}) => {
  return (
    <Button
      loading={loading}
      variant='outline'
      colorPalette='white'
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
      colorPalette='red'
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
  loading,
  onLogout,
}: {
  displayName: string;
  loading: boolean;
  onLogout: () => void;
}) => {
  return (
    <NavDropdownTrigger
      label={loading ? ACCOUNTS_CONFIG.default : displayName}
      icon={FaCircleUser}
      loading={loading}
      disabled={loading}
    >
      {!loading && (
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
      loading={true}
      size='sm'
      w='100%'
      colorPalette='niaid'
      variant='ghost'
    >
      Loading
    </Button>
  );
};

const MobileLoginAction = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <Button size='sm' w='100%' colorPalette='niaid' onClick={() => onLogin()}>
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
  const { displayName, isAuthenticated, loading, login, logout } =
    useAuthActionData();

  if (!ENABLE_AUTH) return null;

  if (loading) {
    return <DesktopLoginAction loading={false} onLogin={login} />;
  }

  if (isAuthenticated) {
    return (
      <DesktopAccountAction
        loading={loading}
        displayName={displayName ?? ACCOUNTS_CONFIG.default}
        onLogout={logout}
      />
    );
  }

  return <DesktopLoginAction loading={loading} onLogin={login} />;
};

export const MobileAuthAction = () => {
  const { displayName, isAuthenticated, loading, login, logout } =
    useAuthActionData();
  if (!ENABLE_AUTH) return null;

  if (loading) {
    return <MobileLoadingAction />;
  }

  if (!isAuthenticated) {
    return <MobileLoginAction onLogin={login} />;
  }

  return <MobileAccountAction displayName={displayName} onLogout={logout} />;
};
