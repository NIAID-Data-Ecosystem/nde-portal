import { Icon, IconProps } from '@chakra-ui/react';
import { KNOWN_PROVIDERS } from 'src/utils/auth/config';

export const ProviderIcon = ({
  providerId,
  ...props
}: IconProps & { providerId: string }) => {
  const icon = KNOWN_PROVIDERS[providerId.toLowerCase()]?.icon;

  if (icon) {
    return (
      <Icon
        as={icon.component}
        color={icon.color}
        boxSize={5}
        aria-hidden='true'
        {...props}
      />
    );
  }

  return <></>;
};
