import React, { useRef } from 'react';
import { Badge, Box, BoxProps, Icon, Tooltip } from 'nde-design-system';
import { FormattedResource } from 'src/utils/api/types';
import { FaLockOpen, FaLock } from 'react-icons/fa';
import AccessConfig from './access.json';

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
  const ref = useRef(null);

  if (!conditionsOfAccess) {
    return <></>;
  }

  const config = AccessConfig as { [key: string]: { [key: string]: string } };

  const { colorScheme, tooltip } =
    config[conditionsOfAccess.toLowerCase()] || '';
  let iconType;

  if (conditionsOfAccess.toLowerCase().includes('open')) {
    iconType = FaLockOpen;
  } else if (conditionsOfAccess.toLowerCase().includes('controlled')) {
    iconType = FaLock;
  } else if (conditionsOfAccess.toLowerCase().includes('embargo')) {
    iconType = FaLock;
  }

  return (
    <Tooltip label={tooltip}>
      <Box ref={ref}>
        <Badge colorScheme={colorScheme} {...props}>
          {iconType && <Icon mr={2} as={iconType} />}
          {typeof children === 'string' &&
            children.charAt(0).toUpperCase() + children.slice(1)}
        </Badge>
      </Box>
    </Tooltip>
  );
};

export default AccessBadge;
