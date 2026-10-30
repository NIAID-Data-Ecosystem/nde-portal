import { Icon, IconProps } from '@chakra-ui/react';
import { KNOWN_PROVIDERS } from 'src/utils/auth/config';

interface ProviderIconProps extends IconProps {
  providerId: string;
}

export const ProviderIcon = ({ providerId, ...props }: ProviderIconProps) => {
  const icon = KNOWN_PROVIDERS[providerId.toLowerCase()]?.icon;

  if (!icon) return null;

  return (
    <Icon
      as={icon.as}
      color={icon.color}
      boxSize={5}
      aria-hidden='true'
      {...props}
    />
  );
};
