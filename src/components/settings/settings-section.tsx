import { ReactNode } from 'react';
import { Heading, Text, VStack } from '@chakra-ui/react';

export interface SettingsSectionProps {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
}

/** Heading + optional subtitle + content, with consistent spacing. */
export function SettingsSection({
  title,
  subtitle,
  children,
}: SettingsSectionProps) {
  return (
    <VStack alignItems='start' gap={0} w='full' mb={8}>
      <Heading as='h2' size='md' fontWeight='semibold' mb={subtitle ? 1 : 2}>
        {title}
      </Heading>
      {subtitle && (
        <Text color='gray.800' fontSize='sm' mb={2}>
          {subtitle}
        </Text>
      )}
      {children}
    </VStack>
  );
}
