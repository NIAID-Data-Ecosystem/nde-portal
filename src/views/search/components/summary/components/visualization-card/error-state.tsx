import { VStack, Alert, Text, Button, Icon } from '@chakra-ui/react';
import { FaRotateRight } from 'react-icons/fa6';

interface ErrorStateProps {
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ onRetry }) => {
  return (
    <VStack
      gap={3}
      h='clamp(180px, 30vh, 250px)'
      justify='center'
      align='center'
    >
      <Alert.Root status='error' borderRadius='md' variant='subtle'>
        <Alert.Indicator />
        <Text fontSize='sm'>Failed to load chart data.</Text>
      </Alert.Root>
      <Button size='sm' onClick={onRetry} variant='outline' colorPalette='gray'>
        <Icon>
          <FaRotateRight />
        </Icon>
        Retry
      </Button>
    </VStack>
  );
};
