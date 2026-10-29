import { Box, Icon, IconProps } from '@chakra-ui/react';
import { FaGithub, FaGoogle, FaMicrosoft, FaOrcid } from 'react-icons/fa6';

interface ProviderIconProps extends IconProps {
  providerId: string;
}

export const ProviderIcon = ({ providerId, ...props }: ProviderIconProps) => {
  if (providerId.toLowerCase() === 'orcid') {
    return (
      <Icon
        as={FaOrcid}
        color='#A6CE39'
        boxSize={5}
        aria-hidden='true'
        {...props}
      />
    );
  }

  if (providerId.toLowerCase() === 'github') {
    return (
      <Icon
        as={FaGithub}
        color='#24292e '
        boxSize={5}
        aria-hidden='true'
        {...props}
      />
    );
  }

  if (providerId.toLowerCase() === 'google') {
    return (
      <Icon
        as={FaGoogle}
        color='#4285F4'
        boxSize={5}
        aria-hidden='true'
        {...props}
      />
    );
  }

  if (providerId.toLowerCase() === 'microsoft') {
    return (
      <Icon
        as={FaMicrosoft}
        color='#00A4EF'
        boxSize={5}
        aria-hidden='true'
        {...props}
      />
    );
  }

  return (
    <Box
      aria-hidden='true'
      boxSize='16px'
      borderRadius='full'
      bg='gray.400'
      display='inline-block'
      verticalAlign={props.verticalAlign}
    />
  );
};
