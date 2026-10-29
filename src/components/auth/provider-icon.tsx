import { Box, Icon } from '@chakra-ui/react';
import { FaGithub, FaGoogle, FaMicrosoft, FaOrcid } from 'react-icons/fa6';

export const ProviderIcon = ({ providerId }: { providerId: string }) => {
  if (providerId.toLowerCase() === 'orcid') {
    return <Icon as={FaOrcid} color='#A6CE39' boxSize={5} aria-hidden='true' />;
  }

  if (providerId.toLowerCase() === 'github') {
    return (
      <Icon as={FaGithub} color='#24292e ' boxSize={5} aria-hidden='true' />
    );
  }

  if (providerId.toLowerCase() === 'google') {
    return (
      <Icon as={FaGoogle} color='#4285F4' boxSize={5} aria-hidden='true' />
    );
  }

  if (providerId.toLowerCase() === 'microsoft') {
    return (
      <Icon as={FaMicrosoft} color='#00A4EF' boxSize={5} aria-hidden='true' />
    );
  }

  return (
    <Box
      aria-hidden='true'
      boxSize='16px'
      borderRadius='full'
      bg='gray.400'
      display='inline-block'
    />
  );
};
