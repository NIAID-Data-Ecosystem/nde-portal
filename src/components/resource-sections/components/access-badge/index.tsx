import React from 'react';
import { Badge, BoxProps, Icon } from 'nde-design-system';
import { FormattedResource } from 'src/utils/api/types';
import { FaLockOpen, FaLock } from 'react-icons/fa';

// Component Info: Badge displaying the level of access from the dataset

interface AccessBadgeProps extends BoxProps {
  conditionsOfAccess?: FormattedResource['conditionsOfAccess'];
  children: React.ReactNode;
}

const AccessBadge: React.FC<AccessBadgeProps> = ({
  conditionsOfAccess,
  children,
  ...props
}) => {
  if (!conditionsOfAccess) {
    return <></>;
  }
  let colorScheme;
  let iconType;

  if (conditionsOfAccess.toLowerCase().includes('open')) {
    colorScheme = 'success';
    iconType = FaLockOpen;
  }

  if (
    conditionsOfAccess.toLowerCase().includes('closed') ||
    conditionsOfAccess.toLowerCase().includes('restricted')
  ) {
    colorScheme = 'negative';
    iconType = FaLock;
  }

  if (conditionsOfAccess.toLowerCase().includes('embargo')) {
    colorScheme = 'warning';
    iconType = FaLock;
  }

  return (
    <Badge colorScheme={colorScheme} {...props}>
      {iconType && <Icon mr={2} as={iconType} />}
      {typeof children === 'string' &&
        children.charAt(0).toUpperCase() + children.slice(1)}
    </Badge>
  );
};

export default AccessBadge;
