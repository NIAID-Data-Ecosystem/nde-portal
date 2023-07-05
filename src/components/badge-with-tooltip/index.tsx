import React, { useRef } from 'react';
import { Badge, BadgeProps, Box, Icon } from 'nde-design-system';
import BadgesConfig from 'src/components/badge-with-tooltip/badges.json';
import Tooltip from 'src/components/tooltip';
import { IconType } from 'react-icons';

// Component Info: Badge displaying the level of access from the dataset
interface BadgeWithTooltipProps extends BadgeProps {
  icon?: IconType;
  tooltipLabel?: string;
}

export const BadgeWithTooltip: React.FC<BadgeWithTooltipProps> = ({
  icon,
  children,
  tooltipLabel,
  colorScheme,
  ...props
}) => {
  const ref = useRef(null);

  if (!children) {
    return <></>;
  }

  return (
    <Tooltip label={tooltipLabel}>
      <Box ref={ref} cursor='default'>
        <Badge
          colorScheme={colorScheme}
          display='flex'
          alignItems='center'
          {...props}
        >
          {icon && <Icon mr={2} as={icon} />}
          {typeof children === 'string'
            ? children.charAt(0).toUpperCase() + children.slice(1)
            : children}
        </Badge>
      </Box>
    </Tooltip>
  );
};

export const badgesConfig = BadgesConfig;
export * from './helpers';
