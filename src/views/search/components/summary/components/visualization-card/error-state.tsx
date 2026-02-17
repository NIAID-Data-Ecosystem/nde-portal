import { VStack, Alert, AlertIcon, Text, Button, Icon } from '@chakra-ui/react';
import { FaRotateRight } from 'react-icons/fa6';

interface ErrorStateProps {
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ onRetry }) => {
  return (
    <VStack
      spacing={3}
      h='clamp(180px, 30vh, 250px)'
      justify='center'
      align='center'
    >
      <Alert status='error' borderRadius='md' variant='subtle'>
        <AlertIcon />
        <Text fontSize='sm'>Failed to load chart data.</Text>
      </Alert>
      <Button
        size='sm'
        leftIcon={<Icon as={FaRotateRight} />}
        onClick={onRetry}
        variant='outline'
        colorScheme='gray'
      >
        Retry
      </Button>
    </VStack>
  );
};
