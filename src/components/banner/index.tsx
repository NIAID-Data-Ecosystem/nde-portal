import { Alert, AlertRootProps } from '@chakra-ui/react';
import React from 'react';

interface BannerProps extends AlertRootProps {
  description?: string;
}

// [COMPONENT INFO]: Banner Element to notice user. NIAID design specs: https://designsystem.niaid.nih.gov/components/molecules
const Banner: React.FC<BannerProps> = ({
  children,
  status,
  title,
  description,
  variant = 'surface',
  ...rest
}) => {
  return (
    <Alert.Root size='md' status={status} variant={variant} {...rest}>
      <Alert.Indicator />
      <Alert.Content lineHeight='short'>
        {title && <Alert.Title lineHeight='inherit'>{title}</Alert.Title>}
        {description && (
          <Alert.Description lineHeight='inherit'>
            {description}
          </Alert.Description>
        )}
        {children}
      </Alert.Content>
    </Alert.Root>
  );
};

export default Banner;
